import { RunModel, IRun } from "../models/run.model";
import { UserStatsModel } from "../models/user-stats.model";
import { UserModel } from "../models/user.model";
import { AchievementModel } from "../models/achievement.model";
import { BadgeModel } from "../models/badge.model";
import { ChallengeProgressModel } from "../models/challenge-progress.model";
import { ChallengeModel } from "../models/challenge.model";
import { NotificationModel } from "../models/notification.model";
import { HttpException } from "../exceptions/http-exception";
import mongoose from "mongoose";
import { GPSService } from "./gps.service";
import { emitToUser, emitLeaderboardUpdate } from "../socket";

const gpsService = new GPSService();

export class RunService {
    async startRun(userId: string, startLat: number, startLng: number): Promise<IRun> {
        const activeRun = await RunModel.findOne({ userId, status: { $in: ["active", "paused"] } });
        if (activeRun) {
            throw new HttpException(400, "You already have an active run. Please finish it first.");
        }

        const run = await RunModel.create({
            userId: new mongoose.Types.ObjectId(userId),
            startTime: new Date(),
            status: "active",
            route: [{ lat: startLat, lng: startLng, timestamp: new Date() }],
        });

        await gpsService.recordInitialLocation(userId, run._id.toString(), startLat, startLng);

        return run;
    }

    async getCurrentRun(userId: string): Promise<IRun | null> {
        return await RunModel.findOne({
            userId,
            status: { $in: ["active", "paused"] },
        }).sort({ startTime: -1 }).exec();
    }

    async pauseRun(userId: string, runId: string): Promise<IRun> {
        const run = await RunModel.findOne({ _id: runId, userId });
        if (!run) throw new HttpException(404, "Run not found");
        if (run.status !== "active") throw new HttpException(400, "Run is not active");

        run.status = "paused";
        run.pauseHistory.push({
            pausedAt: new Date(),
            duration: 0,
        });
        await run.save();
        return run;
    }

    async resumeRun(userId: string, runId: string): Promise<IRun> {
        const run = await RunModel.findOne({ _id: runId, userId });
        if (!run) throw new HttpException(404, "Run not found");
        if (run.status !== "paused") throw new HttpException(400, "Run is not paused");

        const lastPause = run.pauseHistory[run.pauseHistory.length - 1];
        if (lastPause && !lastPause.resumedAt) {
            const pauseDuration = (Date.now() - new Date(lastPause.pausedAt).getTime()) / 1000;
            lastPause.resumedAt = new Date();
            lastPause.duration = pauseDuration;
            run.totalPauseDuration += pauseDuration;
        }

        run.status = "active";
        await run.save();
        return run;
    }

    async addLocation(userId: string, runId: string, lat: number, lng: number, speed?: number, accuracy?: number, altitude?: number): Promise<IRun | null> {
        return await gpsService.recordLocation(userId, runId, lat, lng, speed, accuracy, altitude);
    }

    async finishRun(userId: string, runId: string, data: { distance?: number; duration?: number; avgSpeed?: number; pace?: number; calories?: number }): Promise<IRun> {
        const run = await RunModel.findOne({ _id: runId, userId });
        if (!run) throw new HttpException(404, "Run not found");
        if (run.status === "finished") throw new HttpException(400, "Run already finished");

        if (data.distance) run.distance = data.distance;
        if (data.duration) run.duration = data.duration;
        if (data.avgSpeed) run.avgSpeed = data.avgSpeed;
        if (data.pace) run.pace = data.pace;
        if (data.calories) run.calories = data.calories;

        run.status = "finished";
        run.endTime = new Date();
        run.duration = run.duration || (Date.now() - new Date(run.startTime).getTime()) / 1000 - run.totalPauseDuration;
        run.avgSpeed = run.avgSpeed || (run.duration > 0 ? (run.distance / 1000) / (run.duration / 3600) : 0);
        run.pace = run.pace || (run.distance > 0 ? (run.duration / 60) / (run.distance / 1000) : 0);
        run.calories = run.calories || gpsService.calculateCalories(run.distance);

        await run.save();

        const previousXP = await this.getUserXP(userId);
        await this.updateUserStats(userId, run);
        const newXP = await this.getUserXP(userId);
        const previousLevel = gpsService.calculateLevel(previousXP);
        const newLevel = gpsService.calculateLevel(newXP);

        if (newLevel > previousLevel) {
            await this.sendLevelUpNotification(userId, newLevel);
        }

        await this.checkAndUnlockAchievements(userId);
        await this.updateChallengeProgress(userId, run);
        await this.sendRunCompletionNotification(userId, run);
        emitLeaderboardUpdate({ userId });

        return run;
    }

    async getRunHistory(userId: string, page: number = 1, limit: number = 10, period?: string): Promise<{ data: IRun[]; total: number; page: number; totalPages: number }> {
        const filter: any = { userId };

        if (period && period !== "all") {
            const now = new Date();
            let startDate: Date;
            switch (period) {
                case "daily":
                    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    break;
                case "weekly":
                    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    break;
                case "monthly":
                    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                    break;
                default:
                    startDate = new Date(0);
            }
            filter.startTime = { $gte: startDate };
        }

        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            RunModel.find(filter).sort({ startTime: -1 }).skip(skip).limit(limit).exec(),
            RunModel.countDocuments(filter).exec(),
        ]);

        return {
            data,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }

    async getRunById(runId: string, userId: string): Promise<IRun> {
        const run = await RunModel.findOne({ _id: runId, userId }).exec();
        if (!run) throw new HttpException(404, "Run not found");
        return run;
    }

    private async updateUserStats(userId: string, run: IRun): Promise<void> {
        const stats = await UserStatsModel.findOne({ userId: new mongoose.Types.ObjectId(userId) });
        const runXP = gpsService.calculateXP(run.distance, run.calories);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (!stats) {
            await UserStatsModel.create({
                userId: new mongoose.Types.ObjectId(userId),
                totalDistance: run.distance,
                totalRuns: 1,
                caloriesBurned: run.calories,
                longestRun: run.distance,
                fastestPace: run.pace > 0 ? run.pace : 0,
                currentStreak: 1,
                bestStreak: 1,
                xp: runXP,
                level: gpsService.calculateLevel(runXP),
                lastRunDate: today,
            });
            await this.syncUserModel(userId, run, runXP, 1);
            return;
        }

        stats.totalDistance += run.distance;
        stats.totalRuns += 1;
        stats.caloriesBurned += run.calories;

        if (run.distance > stats.longestRun) {
            stats.longestRun = run.distance;
        }
        if (run.pace > 0 && (stats.fastestPace === 0 || run.pace < stats.fastestPace)) {
            stats.fastestPace = run.pace;
        }

        if (stats.lastRunDate) {
            const daysDiff = Math.floor((today.getTime() - stats.lastRunDate.getTime()) / (1000 * 60 * 60 * 24));
            if (daysDiff === 1) {
                stats.currentStreak += 1;
            } else if (daysDiff > 1) {
                stats.currentStreak = 1;
            }
        } else {
            stats.currentStreak = 1;
        }

        if (stats.currentStreak > stats.bestStreak) {
            stats.bestStreak = stats.currentStreak;
        }

        stats.xp += runXP;
        stats.level = gpsService.calculateLevel(stats.xp);
        stats.lastRunDate = today;

        await stats.save();
        await this.syncUserModel(userId, run, runXP, stats.level);
    }

    private async syncUserModel(userId: string, run: IRun, runXP: number, level: number): Promise<void> {
        const user = await UserModel.findById(userId).exec();
        if (!user) return;

        const newTotalDistance = (user.totalDistance || 0) + (run.distance || 0);
        const newTotalRuns = (user.totalRuns || 0) + 1;
        const newTotalCalories = (user.totalCalories || 0) + (run.calories || 0);
        const newLongestRun = run.distance > (user.longestRun || 0) ? run.distance : user.longestRun;
        const newFastestPace = run.pace > 0 && (user.fastestPace === 0 || run.pace < user.fastestPace) ? run.pace : user.fastestPace;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let currentStreak = user.currentStreak || 0;
        let bestStreak = user.bestStreak || 0;

        if (user.lastActive) {
            const lastActiveDate = new Date(user.lastActive);
            lastActiveDate.setHours(0, 0, 0, 0);
            const daysDiff = Math.floor((today.getTime() - lastActiveDate.getTime()) / (1000 * 60 * 60 * 24));
            if (daysDiff === 1) {
                currentStreak += 1;
            } else if (daysDiff > 1) {
                currentStreak = 1;
            }
        } else {
            currentStreak = 1;
        }

        if (currentStreak > bestStreak) {
            bestStreak = currentStreak;
        }

        const newXP = (user.xp || 0) + runXP;

        // Calculate weekly and monthly distances from actual runs in those periods
        const now = new Date();
        const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const [weeklyRuns, monthlyRuns] = await Promise.all([
            RunModel.find({
                userId,
                startTime: { $gte: startOfWeek },
                status: "finished",
            }).exec(),
            RunModel.find({
                userId,
                startTime: { $gte: startOfMonth },
                status: "finished",
            }).exec(),
        ]);

        const weeklyDistance = weeklyRuns.reduce((sum, r) => sum + (r.distance || 0), 0);
        const monthlyDistance = monthlyRuns.reduce((sum, r) => sum + (r.distance || 0), 0);

        await UserModel.findByIdAndUpdate(userId, {
            totalDistance: newTotalDistance,
            weeklyDistance,
            monthlyDistance,
            totalRuns: newTotalRuns,
            totalCalories: newTotalCalories,
            longestRun: newLongestRun,
            fastestPace: newFastestPace,
            currentStreak,
            bestStreak,
            xp: newXP,
            level,
            lastActive: new Date(),
            isOnline: true,
        }).exec();
    }

    private async getUserXP(userId: string): Promise<number> {
        const user = await UserModel.findById(userId).select("xp").exec();
        return user?.xp || 0;
    }

    private async sendLevelUpNotification(userId: string, newLevel: number): Promise<void> {
        await NotificationModel.create({
            userId: new mongoose.Types.ObjectId(userId),
            type: "level_up",
            title: "🎉 Level Up!",
            message: `Congratulations! You've reached Level ${newLevel}!`,
            data: { level: newLevel },
        });

        emitToUser(userId, "notification:new", {
            type: "level_up",
            title: "🎉 Level Up!",
            message: `Congratulations! You've reached Level ${newLevel}!`,
            data: { level: newLevel },
            read: false,
            createdAt: new Date(),
        });
    }

    private async sendRunCompletionNotification(userId: string, run: IRun): Promise<void> {
        await NotificationModel.create({
            userId: new mongoose.Types.ObjectId(userId),
            type: "run_completed",
            title: "🏃 Run Completed!",
            message: `You ran ${(run.distance / 1000).toFixed(2)} km in ${Math.floor(run.duration / 60)}:${String(Math.floor(run.duration % 60)).padStart(2, "0")}!`,
            data: { runId: run._id.toString(), distance: run.distance, duration: run.duration },
        });

        emitToUser(userId, "notification:new", {
            type: "run_completed",
            title: "🏃 Run Completed!",
            message: `You ran ${(run.distance / 1000).toFixed(2)} km in ${Math.floor(run.duration / 60)}:${String(Math.floor(run.duration % 60)).padStart(2, "0")}!`,
            data: { runId: run._id.toString(), distance: run.distance, duration: run.duration },
            read: false,
            createdAt: new Date(),
        });
    }

    private async checkAndUnlockAchievements(userId: string): Promise<void> {
        const user = await UserModel.findById(userId).exec();
        if (!user) return;

        const badges = await BadgeModel.find().exec();
        const unlockedBadges: any[] = [];

        for (const badge of badges) {
            const existing = await AchievementModel.findOne({
                userId,
                badgeId: badge._id,
            }).exec();

            if (existing?.completed) continue;

            let progress = 0;
            let completed = false;

            switch (badge.criteria.type) {
                case "distance":
                    progress = Math.min(100, Math.floor((user.totalDistance / 1000) / badge.criteria.value * 100));
                    completed = user.totalDistance / 1000 >= badge.criteria.value;
                    break;
                case "runs":
                    progress = Math.min(100, Math.floor(user.totalRuns / badge.criteria.value * 100));
                    completed = user.totalRuns >= badge.criteria.value;
                    break;
                case "territories":
                    progress = Math.min(100, Math.floor(user.territoriesCaptured / badge.criteria.value * 100));
                    completed = user.territoriesCaptured >= badge.criteria.value;
                    break;
                case "streak":
                    progress = Math.min(100, Math.floor(user.currentStreak / badge.criteria.value * 100));
                    completed = user.currentStreak >= badge.criteria.value;
                    break;
                case "speed":
                    progress = user.fastestPace > 0 ? Math.min(100, Math.floor(badge.criteria.value / user.fastestPace * 100)) : 0;
                    completed = user.fastestPace > 0 && user.fastestPace <= badge.criteria.value;
                    break;
                case "calories":
                    progress = Math.min(100, Math.floor(user.totalCalories / badge.criteria.value * 100));
                    completed = user.totalCalories >= badge.criteria.value;
                    break;
            }

            if (existing) {
                existing.progress = progress;
                if (completed && !existing.completed) {
                    existing.completed = true;
                    existing.completedAt = new Date();
                    await existing.save();

                    await UserModel.findByIdAndUpdate(userId, {
                        $addToSet: { badges: badge._id, achievements: badge._id },
                        $inc: { xp: badge.xpReward, coins: badge.coinReward },
                    }).exec();

                    unlockedBadges.push({ achievement: existing, badge });
                }
            } else {
                const achievement = await AchievementModel.create({
                    userId: new mongoose.Types.ObjectId(userId),
                    badgeId: badge._id,
                    progress,
                    completed,
                    completedAt: completed ? new Date() : undefined,
                });

                if (completed) {
                    await UserModel.findByIdAndUpdate(userId, {
                        $addToSet: { badges: badge._id, achievements: badge._id },
                        $inc: { xp: badge.xpReward, coins: badge.coinReward },
                    }).exec();

                    unlockedBadges.push({ achievement, badge });
                }
            }
        }

        for (const { badge } of unlockedBadges) {
            await NotificationModel.create({
                userId: new mongoose.Types.ObjectId(userId),
                type: "achievement_unlocked",
                title: "🏅 Achievement Unlocked!",
                message: `You've earned the "${badge.name}" badge!`,
                data: { badgeId: badge._id.toString(), badgeName: badge.name, xpReward: badge.xpReward, coinReward: badge.coinReward },
            });

            emitToUser(userId, "achievement:unlocked", {
                badgeId: badge._id.toString(),
                badgeName: badge.name,
                icon: badge.icon,
                rarity: badge.rarity,
                xpReward: badge.xpReward,
                coinReward: badge.coinReward,
            });
        }
    }

    private async updateChallengeProgress(userId: string, run: IRun): Promise<void> {
        const activeChallenges = await ChallengeProgressModel.find({
            userId: new mongoose.Types.ObjectId(userId),
            completed: false,
        })
            .populate("challengeId")
            .exec();

        for (const progress of activeChallenges) {
            const challenge = progress.challengeId as any;
            if (!challenge || !challenge.isActive) continue;

            let increment = 0;
            switch (challenge.type) {
                case "distance":
                    increment = run.distance / 1000;
                    break;
                case "runs":
                    increment = 1;
                    break;
                case "calories":
                    increment = run.calories;
                    break;
                case "speed":
                    if (run.pace > 0 && run.pace <= challenge.goal) {
                        increment = challenge.goal;
                    }
                    break;
            }

            if (increment > 0) {
                progress.progress = Math.min(challenge.goal, (progress.progress || 0) + increment);

                if (progress.progress >= challenge.goal && !progress.completed) {
                    progress.completed = true;
                    progress.completedAt = new Date();

                    await UserModel.findByIdAndUpdate(userId, {
                        $inc: {
                            xp: challenge.reward.xp,
                            coins: challenge.reward.coins,
                        },
                    }).exec();

                    if (challenge.reward.badgeId) {
                        await UserModel.findByIdAndUpdate(userId, {
                            $addToSet: { badges: challenge.reward.badgeId },
                        }).exec();
                    }

                    await NotificationModel.create({
                        userId: new mongoose.Types.ObjectId(userId),
                        type: "challenge_completed",
                        title: "🎯 Challenge Completed!",
                        message: `You've completed "${challenge.title}" and earned ${challenge.reward.xp} XP and ${challenge.reward.coins} coins!`,
                        data: { challengeId: challenge._id.toString(), challengeTitle: challenge.title, xpReward: challenge.reward.xp, coinReward: challenge.reward.coins },
                    });

                    emitToUser(userId, "challenge:completed", {
                        challengeId: challenge._id.toString(),
                        title: challenge.title,
                        xpReward: challenge.reward.xp,
                        coinReward: challenge.reward.coins,
                    });
                }

                await progress.save();
            }
        }
    }
}