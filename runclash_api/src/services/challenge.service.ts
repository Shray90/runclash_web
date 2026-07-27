import { ChallengeModel, IChallenge } from "../models/challenge.model";
import { ChallengeProgressModel, IChallengeProgress } from "../models/challenge-progress.model";
import { UserModel } from "../models/user.model";
import { NotificationModel } from "../models/notification.model";
import { HttpException } from "../exceptions/http-exception";
import mongoose from "mongoose";
import { emitToUser } from "../socket";

export class ChallengeService {
    async createChallenge(data: {
        title: string;
        description: string;
        type: IChallenge["type"];
        goal: number;
        reward: { xp: number; coins: number; badgeId?: string };
        startDate: string;
        endDate: string;
        createdBy: string;
    }): Promise<IChallenge> {
        const challenge = await ChallengeModel.create({
            title: data.title,
            description: data.description,
            type: data.type,
            goal: data.goal,
            reward: {
                xp: data.reward.xp,
                coins: data.reward.coins,
                badgeId: data.reward.badgeId ? new mongoose.Types.ObjectId(data.reward.badgeId) : undefined,
            },
            startDate: new Date(data.startDate),
            endDate: new Date(data.endDate),
            createdBy: new mongoose.Types.ObjectId(data.createdBy),
        });
        return challenge;
    }

    async getAllChallenges(activeOnly: boolean = false): Promise<IChallenge[]> {
        const filter: any = {};
        if (activeOnly) {
            filter.isActive = true;
            filter.endDate = { $gte: new Date() };
        }
        return await ChallengeModel.find(filter).sort({ endDate: 1 }).exec();
    }

    async getChallengeById(id: string): Promise<IChallenge> {
        const challenge = await ChallengeModel.findById(id).exec();
        if (!challenge) throw new HttpException(404, "Challenge not found");
        return challenge;
    }

    async updateChallenge(id: string, data: Partial<IChallenge>): Promise<IChallenge> {
        const challenge = await ChallengeModel.findByIdAndUpdate(id, data, { new: true }).exec();
        if (!challenge) throw new HttpException(404, "Challenge not found");
        return challenge;
    }

    async deleteChallenge(id: string): Promise<void> {
        const result = await ChallengeModel.findByIdAndDelete(id).exec();
        if (!result) throw new HttpException(404, "Challenge not found");
    }

    async joinChallenge(userId: string, challengeId: string): Promise<IChallengeProgress> {
        const challenge = await ChallengeModel.findById(challengeId);
        if (!challenge) throw new HttpException(404, "Challenge not found");
        if (!challenge.isActive) throw new HttpException(400, "Challenge is not active");
        if (new Date() > challenge.endDate) throw new HttpException(400, "Challenge has ended");

        // Check if already joined
        const existing = await ChallengeProgressModel.findOne({
            userId: userId,
            challengeId: challengeId,
        }).exec();

        if (existing) {
            throw new HttpException(400, "Already joined this challenge");
        }

        const progress = await ChallengeProgressModel.create({
            userId: new mongoose.Types.ObjectId(userId),
            challengeId: new mongoose.Types.ObjectId(challengeId),
            progress: 0,
            completed: false,
        });

        return progress;
    }

    async updateProgress(userId: string, challengeId: string, increment: number): Promise<IChallengeProgress> {
        const challenge = await ChallengeModel.findById(challengeId);
        if (!challenge) throw new HttpException(404, "Challenge not found");

        let progress = await ChallengeProgressModel.findOne({
            userId: userId,
            challengeId: challengeId,
        }).exec();

        if (!progress) {
            progress = await ChallengeProgressModel.create({
                userId: new mongoose.Types.ObjectId(userId),
                challengeId: new mongoose.Types.ObjectId(challengeId),
                progress: 0,
                completed: false,
            });
        }

        if (progress.completed) return progress;

        progress.progress = Math.min(challenge.goal, progress.progress + increment);

        if (progress.progress >= challenge.goal) {
            progress.completed = true;
            progress.completedAt = new Date();

            await UserModel.findByIdAndUpdate(userId, {
                $inc: {
                    xp: challenge.reward.xp,
                    coins: challenge.reward.coins,
                },
                $addToSet: { badges: challenge.reward.badgeId },
            }).exec();

            await UserModel.findByIdAndUpdate(userId, {
                $inc: { challengesCompleted: 1 },
            }).exec();

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
        return progress;
    }

    async getUserChallenges(userId: string): Promise<(IChallengeProgress & { challenge: IChallenge })[]> {
        const progresses = await ChallengeProgressModel.find({ userId })
            .populate("challengeId")
            .sort({ updatedAt: -1 })
            .exec();

        return progresses.map((p: any) => ({
            ...p.toObject(),
            challenge: p.challengeId,
        }));
    }

    async getActiveChallengesForUser(userId: string): Promise<any[]> {
        const now = new Date();
        const progresses = await ChallengeProgressModel.find({
            userId,
            completed: false,
        })
            .populate({
                path: "challengeId",
                match: { isActive: true, endDate: { $gte: now } },
            })
            .exec();

        return progresses
            .filter((p: any) => p.challengeId)
            .map((p: any) => ({
                ...p.toObject(),
                challenge: p.challengeId,
            }));
    }

    async generateDefaultChallenges(): Promise<IChallenge[]> {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
        const startOfWeek = new Date(now.getTime() - now.getDay() * 24 * 60 * 60 * 1000);
        const endOfWeek = new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000);
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

        const systemUserId = new mongoose.Types.ObjectId();

        const existingDaily = await ChallengeModel.findOne({
            isActive: true,
            startDate: { $lt: endOfDay },
            endDate: { $gte: startOfDay },
        }).exec();

        if (!existingDaily) {
            await ChallengeModel.create({
                title: "Daily Runner",
                description: "Run 5 km today",
                type: "distance",
                goal: 5,
                reward: { xp: 50, coins: 25 },
                startDate: startOfDay,
                endDate: endOfDay,
                createdBy: systemUserId,
            });
        }

        const existingWeekly = await ChallengeModel.findOne({
            isActive: true,
            startDate: { $lt: endOfWeek },
            endDate: { $gte: startOfWeek },
        }).exec();

        if (!existingWeekly) {
            await ChallengeModel.create({
                title: "Weekly Warrior",
                description: "Run 25 km this week",
                type: "distance",
                goal: 25,
                reward: { xp: 200, coins: 100 },
                startDate: startOfWeek,
                endDate: endOfWeek,
                createdBy: systemUserId,
            });
        }

        const existingMonthly = await ChallengeModel.findOne({
            isActive: true,
            startDate: { $lt: endOfMonth },
            endDate: { $gte: startOfMonth },
        }).exec();

        if (!existingMonthly) {
            await ChallengeModel.create({
                title: "Monthly Marathon",
                description: "Run 100 km this month",
                type: "distance",
                goal: 100,
                reward: { xp: 500, coins: 250 },
                startDate: startOfMonth,
                endDate: endOfMonth,
                createdBy: systemUserId,
            });
        }

        const streakChallenge = await ChallengeModel.findOne({
            isActive: true,
            type: "streak",
            endDate: { $gte: now },
        }).exec();

        if (!streakChallenge) {
            await ChallengeModel.create({
                title: "Consistency King",
                description: "Maintain a 7-day streak",
                type: "streak",
                goal: 7,
                reward: { xp: 150, coins: 75 },
                startDate: startOfDay,
                endDate: endOfMonth,
                createdBy: systemUserId,
            });
        }

        const territoryChallenge = await ChallengeModel.findOne({
            isActive: true,
            type: "territories",
            endDate: { $gte: now },
        }).exec();

        if (!territoryChallenge) {
            await ChallengeModel.create({
                title: "Territory Conqueror",
                description: "Capture 3 territories",
                type: "territories",
                goal: 3,
                reward: { xp: 100, coins: 50 },
                startDate: startOfDay,
                endDate: endOfWeek,
                createdBy: systemUserId,
            });
        }

        const runsChallenge = await ChallengeModel.findOne({
            isActive: true,
            type: "runs",
            endDate: { $gte: now },
        }).exec();

        if (!runsChallenge) {
            await ChallengeModel.create({
                title: "Running Habit",
                description: "Complete 10 runs",
                type: "runs",
                goal: 10,
                reward: { xp: 200, coins: 100 },
                startDate: startOfMonth,
                endDate: endOfMonth,
                createdBy: systemUserId,
            });
        }

        return await this.getAllChallenges(true);
    }

    async getChallengeHistory(userId: string): Promise<any[]> {
        const progresses = await ChallengeProgressModel.find({
            userId: new mongoose.Types.ObjectId(userId),
            completed: true,
        })
            .populate("challengeId")
            .sort({ completedAt: -1 })
            .exec();

        return progresses.map((p: any) => ({
            _id: p._id,
            challenge: p.challengeId,
            completedAt: p.completedAt,
            progress: p.progress,
        }));
    }
}

