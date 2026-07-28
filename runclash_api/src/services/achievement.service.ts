import { AchievementModel } from "../models/achievement.model";
import { BadgeModel, IBadge } from "../models/badge.model";
import { UserModel, IUser } from "../models/user.model";
import { NotificationModel } from "../models/notification.model";
import { HttpException } from "../exceptions/http-exception";
import mongoose from "mongoose";
import { emitToUser } from "../socket";

export class AchievementService {
    async createBadge(data: {
        name: string;
        description: string;
        icon: string;
        criteria: { type: IBadge["criteria"]["type"]; value: number };
        rarity: IBadge["rarity"];
        color?: string;
        xpReward?: number;
        coinReward?: number;
    }) {
        const badge = await BadgeModel.create(data);
        return badge;
    }

    async getAllBadges(): Promise<IBadge[]> {
        return await BadgeModel.find().exec();
    }

    async getUserAchievements(userId: string): Promise<any[]> {
        const achievements = await AchievementModel.find({ userId })
            .populate("badgeId")
            .sort({ createdAt: -1 })
            .exec();

        return achievements.map((a: any) => ({
            ...a.toObject(),
            badge: a.badgeId,
        }));
    }

    async getUserBadges(userId: string): Promise<IBadge[]> {
        const user = await UserModel.findById(userId)
            .populate("badges")
            .exec();

        if (!user) throw new HttpException(404, "User not found");
        return user.badges as unknown as IBadge[];
    }

    async checkAndUnlock(userId: string): Promise<any[]> {
        const user = await UserModel.findById(userId).exec();
        if (!user) throw new HttpException(404, "User not found");

        const badges = await BadgeModel.find().exec();
        const unlocked: any[] = [];

        for (const badge of badges) {
            // Check if already achieved
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
                }
                await existing.save();
                if (completed) {
                    unlocked.push({ achievement: existing, badge });
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
                    unlocked.push({ achievement, badge });
                }
            }

            if (completed && !existing?.completed) {
                // Add badge to user and give rewards
                await UserModel.findByIdAndUpdate(userId, {
                    $addToSet: { badges: badge._id, achievements: badge._id },
                    $inc: { xp: badge.xpReward, coins: badge.coinReward },
                }).exec();

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

        return unlocked;
    }

    async getAchievementStats(userId: string): Promise<{ total: number; completed: number; progress: number }> {
        const [total, completed] = await Promise.all([
            AchievementModel.countDocuments({ userId }).exec(),
            AchievementModel.countDocuments({ userId, completed: true }).exec(),
        ]);

        return {
            total,
            completed,
            progress: total > 0 ? Math.round((completed / total) * 100) : 0,
        };
    }
}

