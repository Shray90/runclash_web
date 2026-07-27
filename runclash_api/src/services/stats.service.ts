import { RunModel } from "../models/run.model";
import { UserModel } from "../models/user.model";
import { UserStatsModel } from "../models/user-stats.model";
import { TerritoryModel } from "../models/territory.model";
import { AchievementModel } from "../models/achievement.model";
import { ChallengeProgressModel } from "../models/challenge-progress.model";
import { NotificationModel } from "../models/notification.model";
import { ChallengeModel } from "../models/challenge.model";
import mongoose from "mongoose";

interface DashboardStats {
    currentRank: number;
    totalUsers: number;
    todaysDistance: number;
    todayCalories: number;
    weeklyDistance: number;
    weeklyRuns: number;
    monthlyDistance: number;
    monthlyRuns: number;
    totalCalories: number;
    currentStreak: number;
    territoriesCaptured: number;
    ownedTerritories: number;
    level: number;
    xp: number;
    xpToNextLevel: number;
    totalRuns: number;
    achievementsCompleted: number;
    achievementsTotal: number;
    hasActiveRun: boolean;
    activeRunStatus?: string;
    recentCaptures: any[];
    recentNotifications: any[];
}

interface ChartDataPoint {
    date: string;
    value: number;
}

interface DayDataPoint {
    day: string;
    value: number;
}

interface StatsData {
    weeklyDistances: { day: string; distance: number }[];
    monthlyDistances: { month: string; distance: number }[];
    weeklyCalories: { day: string; value: number }[];
    paceOverTime: ChartDataPoint[];
    runsPerDay: ChartDataPoint[];
    xpGrowth: ChartDataPoint[];
    territoryCaptureHistory: DayDataPoint[];
}

export class StatsService {
    async getDashboardStats(userId: string): Promise<DashboardStats> {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const user = await UserModel.findById(userId).exec();
        const userStats = await UserStatsModel.findOne({ userId: new mongoose.Types.ObjectId(userId) }).exec();
        if (!user) throw new Error("User not found");

        // Get active run
        const activeRun = await RunModel.findOne({
            userId,
            status: { $in: ["active", "paused"] },
        }).sort({ startTime: -1 }).exec();

        // Calculate today's distance
        const todayRuns = await RunModel.find({
            userId,
            startTime: { $gte: startOfDay },
            status: "finished",
        }).exec();
        const todaysDistance = todayRuns.reduce((sum, r) => sum + r.distance, 0);
        const todayCalories = todayRuns.reduce((sum, r) => sum + (r.calories || 0), 0);

        const weeklyRunsData = await RunModel.find({
            userId,
            startTime: { $gte: startOfWeek },
            status: "finished",
        }).exec();
        const weeklyDistance = weeklyRunsData.reduce((sum, r) => sum + r.distance, 0);

        const monthlyRunsData = await RunModel.find({
            userId,
            startTime: { $gte: startOfMonth },
            status: "finished",
        }).exec();
        const monthlyDistance = monthlyRunsData.reduce((sum, r) => sum + r.distance, 0);

        // User rank based on UserStats
        const usersAhead = await UserStatsModel.countDocuments({
            totalDistance: { $gt: userStats?.totalDistance || 0 },
        }).exec();
        const totalUsers = await UserStatsModel.countDocuments().exec();

        // Achievements
        const achievementStats = await Promise.all([
            AchievementModel.countDocuments({ userId }).exec(),
            AchievementModel.countDocuments({ userId, completed: true }).exec(),
        ]);

        // XP to next level
        const xpToNextLevel = (userStats?.level || 1) * 500 - (userStats?.xp || 0);

        const ownedTerritories = await TerritoryModel.countDocuments({ owner: new mongoose.Types.ObjectId(userId), isActive: true }).exec();
        const recentCaptures = await TerritoryModel.find({ "captureHistory.userId": new mongoose.Types.ObjectId(userId) })
            .sort({ updatedAt: -1 })
            .limit(5)
            .lean()
            .exec();

        const recentNotifications = await NotificationModel.find({ userId: new mongoose.Types.ObjectId(userId) })
            .sort({ createdAt: -1 })
            .limit(5)
            .lean()
            .exec();

        return {
            currentRank: usersAhead + 1,
            totalUsers,
            todaysDistance: Math.round(todaysDistance * 100) / 100,
            todayCalories: Math.round(todayCalories),
            weeklyDistance: Math.round(weeklyDistance * 100) / 100,
            weeklyRuns: weeklyRunsData.length,
            monthlyDistance: Math.round(monthlyDistance * 100) / 100,
            monthlyRuns: monthlyRunsData.length,
            totalCalories: userStats?.caloriesBurned || 0,
            currentStreak: userStats?.currentStreak || 0,
            territoriesCaptured: userStats?.territoriesCaptured || 0,
            ownedTerritories,
            level: userStats?.level || 1,
            xp: userStats?.xp || 0,
            xpToNextLevel: Math.max(1, xpToNextLevel),
            totalRuns: userStats?.totalRuns || 0,
            achievementsCompleted: achievementStats[1],
            achievementsTotal: achievementStats[0] || 1,
            hasActiveRun: !!activeRun,
            activeRunStatus: activeRun?.status,
            recentCaptures: recentCaptures.map((t: any) => ({
                _id: t._id.toString(),
                name: t.name,
                capturedAt: t.captureHistory?.find((c: any) => c.userId?.toString() === userId)?.capturedAt || t.lastCaptured || t.updatedAt,
                xpReward: t.xpReward,
                color: t.color,
                icon: t.icon,
            })),
            recentNotifications: recentNotifications.map((n: any) => ({
                _id: n._id.toString(),
                type: n.type,
                title: n.title,
                message: n.message,
                read: n.read,
                createdAt: n.createdAt,
            })),
        };
    }

    async getChartsData(userId: string): Promise<StatsData> {
        const now = new Date();
        const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const runs = await RunModel.find({
            userId,
            startTime: { $gte: startOfMonth },
            status: "finished",
        }).sort({ startTime: 1 }).exec();

        const territories = await TerritoryModel.find({
            "captureHistory.userId": new mongoose.Types.ObjectId(userId),
            updatedAt: { $gte: startOfMonth },
        }).lean().exec();

        const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const weekDates: string[] = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            weekDates.push(d.toISOString().split("T")[0]);
        }

        const weeklyDistances = weekDates.map((date) => {
            const dayRuns = runs.filter((r) => new Date(r.startTime).toISOString().split("T")[0] === date);
            const dateObj = new Date(date + "T00:00:00");
            return { day: weekDays[dateObj.getDay()], distance: Math.round(dayRuns.reduce((sum, r) => sum + r.distance, 0) * 100) / 100 };
        });

        const weeklyCalories = weekDates.map((date) => {
            const dayRuns = runs.filter((r) => new Date(r.startTime).toISOString().split("T")[0] === date);
            const dateObj = new Date(date + "T00:00:00");
            return { day: weekDays[dateObj.getDay()], value: Math.round(dayRuns.reduce((sum, r) => sum + (r.calories || 0), 0)) };
        });

        const paceOverTime = runs
            .filter((r) => r.pace > 0)
            .map((r) => ({
                date: new Date(r.startTime).toISOString().split("T")[0],
                value: Math.round(r.pace * 100) / 100,
            }));

        const runsPerDay = weekDates.map((date) => ({
            date,
            value: runs.filter((r) => new Date(r.startTime).toISOString().split("T")[0] === date).length,
        }));

        const totalDaysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const todayDate = now.getDate();
        const weeksInMonth = Math.ceil(totalDaysInMonth / 7);
        const monthlyDistances: { month: string; distance: number }[] = [];
        for (let w = 1; w <= weeksInMonth; w++) {
            const weekStartDay = (w - 1) * 7 + 1;
            const weekEndDay = Math.min(w * 7, totalDaysInMonth);
            const weekRuns = runs.filter((r) => {
                const day = new Date(r.startTime).getDate();
                return day >= weekStartDay && day <= weekEndDay && new Date(r.startTime).getMonth() === now.getMonth() && new Date(r.startTime).getFullYear() === now.getFullYear();
            });
            const distance = Math.round(weekRuns.reduce((sum, r) => sum + r.distance, 0) * 100) / 100;
            monthlyDistances.push({ month: `Week ${w}`, distance });
        }

        const territoryCapturesByDay: { day: string; value: number }[] = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            const dateStr = d.toISOString().split("T")[0];
            const dayName = weekDays[d.getDay()];
            const captures = territories.filter((t: any) =>
                t.captureHistory?.some((c: any) => {
                    const capturedDate = new Date(c.capturedAt).toISOString().split("T")[0];
                    return capturedDate === dateStr && c.userId?.toString() === userId;
                })
            ).length;
            territoryCapturesByDay.push({ day: dayName, value: captures });
        }

        return {
            weeklyDistances,
            monthlyDistances,
            weeklyCalories,
            paceOverTime,
            runsPerDay,
            xpGrowth: [],
            territoryCaptureHistory: territoryCapturesByDay,
        };
    }

    async getAdminAnalytics(): Promise<any> {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        const [
            totalUsers,
            activeUsers,
            newUsersThisMonth,
            newUsersThisWeek,
            newUsersToday,
            totalRuns,
            runsThisMonth,
            runsThisWeek,
            runsToday,
            totalDistance,
            weeklyDistance,
            dailyDistance,
            totalTerritories,
            capturedTerritories,
            activeChallenges,
            totalNotifications,
            unreadNotifications,
            totalAchievements,
            totalBadges,
            totalXP,
            totalCoins,
        ] = await Promise.all([
            UserModel.countDocuments().exec(),
            UserModel.countDocuments({ isOnline: true }).exec(),
            UserModel.countDocuments({ createdAt: { $gte: startOfMonth } }).exec(),
            UserModel.countDocuments({ createdAt: { $gte: startOfWeek } }).exec(),
            UserModel.countDocuments({ createdAt: { $gte: startOfDay } }).exec(),
            RunModel.countDocuments().exec(),
            RunModel.countDocuments({ startTime: { $gte: startOfMonth } }).exec(),
            RunModel.countDocuments({ startTime: { $gte: startOfWeek } }).exec(),
            RunModel.countDocuments({ startTime: { $gte: startOfDay } }).exec(),
            UserModel.aggregate([{ $group: { _id: null, total: { $sum: "$totalDistance" } } }]).exec(),
            RunModel.aggregate([
                { $match: { startTime: { $gte: startOfWeek }, status: "finished" } },
                { $group: { _id: null, total: { $sum: "$distance" } } },
            ]).exec(),
            RunModel.aggregate([
                { $match: { startTime: { $gte: startOfDay }, status: "finished" } },
                { $group: { _id: null, total: { $sum: "$distance" } } },
            ]).exec(),
            TerritoryModel.countDocuments().exec(),
            TerritoryModel.countDocuments({ owner: { $ne: null } }).exec(),
            ChallengeModel.countDocuments({ isActive: true }).exec(),
            NotificationModel.countDocuments().exec(),
            NotificationModel.countDocuments({ read: false }).exec(),
            AchievementModel.countDocuments({ completed: true }).exec(),
            UserModel.countDocuments({ badges: { $ne: [] } }).exec(),
            UserModel.aggregate([{ $group: { _id: null, total: { $sum: "$xp" } } }]).exec(),
            UserModel.aggregate([{ $group: { _id: null, total: { $sum: "$coins" } } }]).exec(),
        ]);

        const mostActiveRunners = await UserModel.find()
            .sort({ totalDistance: -1 })
            .limit(10)
            .select("firstName lastName username totalDistance totalRuns level xp currentStreak")
            .lean()
            .exec();

        const xpDistribution = await UserModel.aggregate([
            {
                $group: {
                    _id: {
                        $switch: {
                            branches: [
                                { case: { $lt: ["$xp", 500] }, then: "Beginner (0-500 XP)" },
                                { case: { $lt: ["$xp", 2000] }, then: "Intermediate (500-2k XP)" },
                                { case: { $lt: ["$xp", 5000] }, then: "Advanced (2k-5k XP)" },
                                { case: { $lt: ["$xp", 10000] }, then: "Expert (5k-10k XP)" },
                            ],
                            default: "Master (10k+ XP)",
                        },
                    },
                    count: { $sum: 1 },
                },
            },
        ]).exec();

        const territoryOwnership = await TerritoryModel.aggregate([
            {
                $group: {
                    _id: "$owner",
                    count: { $sum: 1 },
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "owner",
                },
            },
            {
                $unwind: "$owner",
            },
            {
                $project: {
                    ownerName: { $concat: ["$owner.firstName", " ", "$owner.lastName"] },
                    count: 1,
                },
            },
            {
                $sort: { count: -1 },
            },
            {
                $limit: 10,
            },
        ]).exec();

        const dailyRegistrations = await UserModel.aggregate([
            {
                $match: {
                    createdAt: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) },
                },
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 },
                },
            },
            {
                $sort: { _id: 1 },
            },
        ]).exec();

        const weeklyActivity = await RunModel.aggregate([
            {
                $match: {
                    startTime: { $gte: startOfWeek },
                    status: "finished",
                },
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$startTime" } },
                    runs: { $sum: 1 },
                    distance: { $sum: "$distance" },
                },
            },
            {
                $sort: { _id: 1 },
            },
        ]).exec();

        const monthlyActivity = await RunModel.aggregate([
            {
                $match: {
                    startTime: { $gte: startOfMonth },
                    status: "finished",
                },
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$startTime" } },
                    runs: { $sum: 1 },
                    distance: { $sum: "$distance" },
                },
            },
            {
                $sort: { _id: 1 },
            },
        ]).exec();

        const leaderboardOverview = await UserModel.find()
            .sort({ xp: -1 })
            .limit(5)
            .select("firstName lastName username level xp totalDistance")
            .lean()
            .exec();

        const recentSystemActivity = await NotificationModel.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .select("type title message createdAt userId")
            .populate("userId", "firstName lastName username")
            .lean()
            .exec();

        return {
            totalUsers,
            activeUsers,
            newUsersThisMonth,
            newUsersThisWeek,
            newUsersToday,
            totalRuns,
            runsThisMonth,
            runsThisWeek,
            runsToday,
            totalDistance: totalDistance[0]?.total || 0,
            weeklyDistance: weeklyDistance[0]?.total || 0,
            dailyDistance: dailyDistance[0]?.total || 0,
            totalTerritories,
            capturedTerritories,
            activeChallenges,
            totalNotifications,
            unreadNotifications,
            totalAchievements,
            totalBadges,
            totalXP: totalXP[0]?.total || 0,
            totalCoins: totalCoins[0]?.total || 0,
            mostActiveRunners,
            xpDistribution: xpDistribution.length > 0 ? xpDistribution : [],
            territoryOwnership: territoryOwnership.length > 0 ? territoryOwnership : [],
            dailyRegistrations: dailyRegistrations.length > 0 ? dailyRegistrations : [],
            weeklyActivity: weeklyActivity.length > 0 ? weeklyActivity : [],
            monthlyActivity: monthlyActivity.length > 0 ? monthlyActivity : [],
            leaderboardOverview,
            recentSystemActivity: recentSystemActivity.length > 0 ? recentSystemActivity : [],
        };
    }
}


