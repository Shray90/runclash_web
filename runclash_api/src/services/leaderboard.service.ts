import { UserModel, IUser } from "../models/user.model";

interface LeaderboardEntry {
    rank: number;
    _id: string;
    firstName: string;
    lastName: string;
    username: string;
    profileImage?: string;
    totalDistance: number;
    weeklyDistance: number;
    monthlyDistance: number;
    territoriesCaptured: number;
    totalPoints: number;
    longestRun: number;
    fastestPace: number;
    totalRuns: number;
    level: number;
    xp: number;
    longestStreak: number;
    currentStreak: number;
    challengesCompleted: number;
}

export class LeaderboardService {
    async getLeaderboard(params: {
        period: "daily" | "weekly" | "monthly" | "all";
        page: number;
        limit: number;
        search?: string;
        sortBy?: string;
    }): Promise<{ data: LeaderboardEntry[]; total: number; page: number; totalPages: number }> {
        const { period, page, limit, search, sortBy } = params;

        let sortField = "xp";
        let sortDirection = -1;

        switch (sortBy) {
            case "distance":
                sortField = "totalDistance";
                break;
            case "points":
                sortField = "xp";
                break;
            case "territories":
                sortField = "territoriesCaptured";
                break;
            case "runs":
                sortField = "totalRuns";
                break;
            case "level":
                sortField = "level";
                break;
            case "streak":
                sortField = "bestStreak";
                break;
            default:
                sortField = "xp";
        }

        const filter: any = {};
        if (search) {
            filter.$or = [
                { firstName: { $regex: search, $options: "i" } },
                { lastName: { $regex: search, $options: "i" } },
                { username: { $regex: search, $options: "i" } },
            ];
        }

        const calculatePoints = (user: IUser): number => {
            return user.xp || 0;
        };

        const skip = (page - 1) * limit;
        const users = await UserModel.find(filter)
            .sort({ [sortField]: sortDirection } as any)
            .skip(skip)
            .limit(limit)
            .lean()
            .exec();

        const total = await UserModel.countDocuments(filter).exec();

        const data: LeaderboardEntry[] = users.map((user: any, index: number) => ({
            rank: skip + index + 1,
            _id: user._id.toString(),
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            profileImage: user.profileImage,
            totalDistance: user.totalDistance || 0,
            weeklyDistance: user.weeklyDistance || 0,
            monthlyDistance: user.monthlyDistance || 0,
            territoriesCaptured: user.territoriesCaptured || 0,
            totalPoints: calculatePoints(user),
            longestRun: user.longestRun || 0,
            fastestPace: user.fastestPace || 0,
            totalRuns: user.totalRuns || 0,
            level: user.level || 1,
            xp: user.xp || 0,
            longestStreak: user.bestStreak || 0,
            currentStreak: user.currentStreak || 0,
            challengesCompleted: (user as any).challengesCompleted || 0,
        }));

        if (sortBy === "points" || !sortBy) {
            data.sort((a, b) => b.totalPoints - a.totalPoints);
            data.forEach((entry, index) => {
                entry.rank = skip + index + 1;
            });
        }

        return {
            data,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }

    async getUserRank(userId: string): Promise<{ rank: number; totalUsers: number }> {
        const user = await UserModel.findById(userId).exec();
        if (!user) {
            return { rank: 0, totalUsers: 0 };
        }

        const totalUsers = await UserModel.countDocuments().exec();
        const userPoints = user.xp || 0;

        const usersAhead = await UserModel.countDocuments({
            xp: { $gt: userPoints },
        }).exec();

        return {
            rank: usersAhead + 1,
            totalUsers,
        };
    }

    async getMiniLeaderboard(limit: number = 5): Promise<LeaderboardEntry[]> {
        const users = await UserModel.find()
            .sort({ xp: -1 })
            .limit(limit)
            .lean()
            .exec();

        return users.map((user: any, index: number) => ({
            rank: index + 1,
            _id: user._id.toString(),
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            profileImage: user.profileImage,
            totalDistance: user.totalDistance || 0,
            weeklyDistance: user.weeklyDistance || 0,
            monthlyDistance: user.monthlyDistance || 0,
            territoriesCaptured: user.territoriesCaptured || 0,
            totalPoints: user.xp || 0,
            longestRun: user.longestRun || 0,
            fastestPace: user.fastestPace || 0,
            totalRuns: user.totalRuns || 0,
            level: user.level || 1,
            xp: user.xp || 0,
            longestStreak: user.bestStreak || 0,
            currentStreak: user.currentStreak || 0,
            challengesCompleted: (user as any).challengesCompleted || 0,
        }));
    }
}

