import { TerritoryModel, ITerritory } from "../models/territory.model";
import { UserModel } from "../models/user.model";
import { AchievementModel } from "../models/achievement.model";
import { BadgeModel } from "../models/badge.model";
import { ChallengeProgressModel } from "../models/challenge-progress.model";
import { ChallengeModel } from "../models/challenge.model";
import { NotificationModel } from "../models/notification.model";
import { HttpException } from "../exceptions/http-exception";
import mongoose from "mongoose";
import { emitTerritoryUpdate, getIO, emitToUser } from "../socket";

interface ActiveCapture {
    userId: string;
    territoryId: string;
    startTime: number;
    progress: number;
}

const activeCaptures = new Map<string, ActiveCapture>();

export class TerritoryService {
    async getAllTerritories(): Promise<ITerritory[]> {
        return await TerritoryModel.find({ isActive: true })
            .populate("owner", "firstName lastName username profileImage")
            .populate("capturedBy", "firstName lastName username profileImage")
            .exec();
    }

    async getTerritoryById(id: string): Promise<ITerritory> {
        const territory = await TerritoryModel.findById(id)
            .populate("owner", "firstName lastName username profileImage")
            .populate("capturedBy", "firstName lastName username profileImage")
            .populate("captureHistory.userId", "firstName lastName username profileImage")
            .exec();
        if (!territory) throw new HttpException(404, "Territory not found");
        return territory;
    }

    async createTerritory(data: {
        name: string;
        lat: number;
        lng: number;
        radius: number;
        polygon?: number[][];
        color?: string;
        icon?: string;
        pointsRequired?: number;
        xpReward?: number;
        coinReward?: number;
    }): Promise<ITerritory> {
        const territory = await TerritoryModel.create({
            name: data.name,
            center: {
                type: "Point",
                coordinates: [data.lng, data.lat],
            },
            radius: data.radius,
            polygon: data.polygon || null,
            color: data.color || "#ef4444",
            icon: data.icon || "🏁",
            pointsRequired: data.pointsRequired || 100,
            xpReward: data.xpReward || 100,
            coinReward: data.coinReward || 50,
        });
        return territory;
    }

    async updateTerritory(id: string, data: Partial<ITerritory>): Promise<ITerritory> {
        const territory = await TerritoryModel.findByIdAndUpdate(id, data, { new: true }).exec();
        if (!territory) throw new HttpException(404, "Territory not found");
        return territory;
    }

    async deleteTerritory(id: string): Promise<void> {
        const result = await TerritoryModel.findByIdAndDelete(id).exec();
        if (!result) throw new HttpException(404, "Territory not found");
    }

    async checkTerritory(userId: string, territoryId: string, lat: number, lng: number): Promise<{ inside: boolean; progress: number; territory: ITerritory; captureActive: boolean }> {
        const territory = await TerritoryModel.findById(territoryId);
        if (!territory) throw new HttpException(404, "Territory not found");

        const distance = this.haversineDistance(lat, lng, territory.center.coordinates[1], territory.center.coordinates[0]);
        const isInside = distance <= territory.radius;

        if (!isInside) {
            const captureKey = `${userId}:${territoryId}`;
            if (activeCaptures.has(captureKey)) {
                activeCaptures.delete(captureKey);
            }
            return { inside: false, progress: territory.captureProgress, territory, captureActive: false };
        }

        const captureKey = `${userId}:${territoryId}`;
        let captureActive = false;

        if (!activeCaptures.has(captureKey)) {
            activeCaptures.set(captureKey, {
                userId,
                territoryId,
                startTime: Date.now(),
                progress: territory.captureProgress,
            });
            captureActive = true;
        } else {
            const capture = activeCaptures.get(captureKey)!;
            const elapsed = (Date.now() - capture.startTime) / 1000;
            const progressPerSecond = 2;
            const increment = Math.min(progressPerSecond * (elapsed / 10), 100 - territory.captureProgress);

            territory.captureProgress = Math.min(100, territory.captureProgress + increment);
            capture.startTime = Date.now();
            captureActive = true;
        }

        await territory.save();

        return {
            inside: true,
            progress: territory.captureProgress,
            territory,
            captureActive,
        };
    }

    async captureTerritory(userId: string, territoryId: string, lat: number, lng: number): Promise<{ captured: boolean; progress: number; territory: ITerritory; xpRewarded: number; coinRewarded: number }> {
        const territory = await TerritoryModel.findById(territoryId).populate("owner", "firstName lastName username").exec();
        if (!territory) throw new HttpException(404, "Territory not found");

        const distance = this.haversineDistance(lat, lng, territory.center.coordinates[1], territory.center.coordinates[0]);
        const isInside = distance <= territory.radius;

        if (!isInside) {
            return { captured: false, progress: territory.captureProgress, territory: territory as ITerritory, xpRewarded: 0, coinRewarded: 0 };
        }

        const captureKey = `${userId}:${territoryId}`;
        const capture = activeCaptures.get(captureKey);
        const captureDuration = capture ? (Date.now() - capture.startTime) / 1000 : 0;

        if (territory.captureProgress < 100) {
            const progressIncrement = Math.min(Math.max(captureDuration * 2, 5), 100 - territory.captureProgress);
            territory.captureProgress = Math.min(100, territory.captureProgress + progressIncrement);
        }

        let xpRewarded = 0;
        let coinRewarded = 0;
        let captured = false;

        if (territory.captureProgress >= 100) {
            const previousOwner = territory.owner;
            const wasChanged = !previousOwner || previousOwner.toString() !== userId;

            territory.owner = new mongoose.Types.ObjectId(userId);
            territory.capturedBy = new mongoose.Types.ObjectId(userId);
            territory.lastCaptured = new Date();
            territory.captureProgress = 0;
            territory.totalCaptures += 1;

            xpRewarded = territory.xpReward;
            coinRewarded = territory.coinReward;

            await UserModel.findByIdAndUpdate(userId, {
                $inc: {
                    territoriesCaptured: 1,
                    coins: coinRewarded,
                    xp: xpRewarded,
                },
            }).exec();

            territory.captureHistory.push({
                userId: new mongoose.Types.ObjectId(userId),
                capturedAt: new Date(),
                duration: Math.round(captureDuration),
                distance: Math.round(distance),
            });

            captured = true;

            await this.updateChallengeProgressForTerritory(userId);

            if (wasChanged && previousOwner) {
                const io = getIO();
                io.to(`user:${previousOwner.toString()}`).emit("territory:lost", {
                    territoryId: territory._id.toString(),
                    territoryName: territory.name,
                    newOwnerId: userId,
                });
            }

            const io = getIO();
            io.emit("territory:captured", {
                territoryId: territory._id.toString(),
                territoryName: territory.name,
                previousOwnerId: previousOwner ? previousOwner.toString() : null,
                newOwnerId: userId,
                xpRewarded,
                coinRewarded,
            });

            emitTerritoryUpdate(territory._id.toString(), {
                event: "capture",
                territoryId: territory._id.toString(),
                owner: userId,
                capturedBy: userId,
                lastCaptured: new Date(),
                xpRewarded,
                coinRewarded,
            });

            await this.checkAndUnlockTerritoryAchievements(userId);
        }

        await territory.save();

        if (captureKey && activeCaptures.has(captureKey)) {
            activeCaptures.delete(captureKey);
        }

        return {
            captured,
            progress: territory.captureProgress,
            territory: territory as ITerritory,
            xpRewarded,
            coinRewarded,
        };
    }

    async getUserTerritories(userId: string): Promise<ITerritory[]> {
        return await TerritoryModel.find({ owner: userId, isActive: true }).exec();
    }

    async getNearbyTerritories(lat: number, lng: number, maxDistance: number = 5000): Promise<ITerritory[]> {
        return await TerritoryModel.find({
            isActive: true,
            center: {
                $nearSphere: {
                    $geometry: { type: "Point", coordinates: [lng, lat] },
                    $maxDistance: maxDistance,
                },
            },
        })
            .populate("owner", "firstName lastName username profileImage")
            .exec();
    }

    private async checkAndUnlockTerritoryAchievements(userId: string): Promise<void> {
        const user = await UserModel.findById(userId).exec();
        if (!user) return;

        const badges = await BadgeModel.find({ "criteria.type": "territories" }).exec();

        for (const badge of badges) {
            const existing = await AchievementModel.findOne({
                userId,
                badgeId: badge._id,
            }).exec();

            if (existing?.completed) continue;

            const progress = Math.min(100, Math.floor(user.territoriesCaptured / badge.criteria.value * 100));
            const completed = user.territoriesCaptured >= badge.criteria.value;

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
            } else if (completed) {
                await AchievementModel.create({
                    userId: new mongoose.Types.ObjectId(userId),
                    badgeId: badge._id,
                    progress,
                    completed: true,
                    completedAt: new Date(),
                });

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
    }

    private async updateChallengeProgressForTerritory(userId: string): Promise<void> {
        const activeChallenges = await ChallengeProgressModel.find({
            userId: new mongoose.Types.ObjectId(userId),
            completed: false,
        })
            .populate("challengeId")
            .exec();

        for (const progress of activeChallenges) {
            const challenge = progress.challengeId as any;
            if (!challenge || !challenge.isActive) continue;

            if (challenge.type === "territories") {
                progress.progress = Math.min(challenge.goal, (progress.progress || 0) + 1);

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

    private haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
        const R = 6371000;
        const toRad = (deg: number) => (deg * Math.PI) / 180;
        const dLat = toRad(lat2 - lat1);
        const dLng = toRad(lng2 - lng1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}