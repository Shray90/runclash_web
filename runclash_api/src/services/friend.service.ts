import { FriendRequestModel, IFriendRequest } from "../models/friend-request.model";
import { UserModel, IUser } from "../models/user.model";
import { RunModel } from "../models/run.model";
import { NotificationModel } from "../models/notification.model";
import { AchievementModel } from "../models/achievement.model";
import { HttpException } from "../exceptions/http-exception";
import mongoose from "mongoose";
import { emitToUser } from "../socket";

export class FriendService {
    async sendFriendRequest(senderId: string, receiverId: string): Promise<IFriendRequest> {
        if (senderId === receiverId) {
            throw new HttpException(400, "Cannot send friend request to yourself");
        }

        const receiver = await UserModel.findById(receiverId);
        if (!receiver) {
            throw new HttpException(404, "User not found");
        }

        // Check if already friends
        const senderUser = await UserModel.findById(senderId);
        if (senderUser?.friends?.some((f) => f.toString() === receiverId)) {
            throw new HttpException(400, "Already friends");
        }

        // Check for existing request
        const existing = await FriendRequestModel.findOne({
            $or: [
                { sender: senderId, receiver: receiverId, status: "pending" },
                { sender: receiverId, receiver: senderId, status: "pending" },
            ],
        });

        if (existing) {
            throw new HttpException(400, "Friend request already exists");
        }

        const request = await FriendRequestModel.create({
            sender: new mongoose.Types.ObjectId(senderId),
            receiver: new mongoose.Types.ObjectId(receiverId),
            status: "pending",
        });

        const sender = await UserModel.findById(senderId).select("firstName lastName username").exec();

        await NotificationModel.create({
            userId: receiverId,
            type: "friend_request",
            title: "👋 New Friend Request",
            message: `${sender?.firstName || "Someone"} ${sender?.lastName || ""} sent you a friend request!`,
            data: { userId: senderId, userName: `${sender?.firstName || ""} ${sender?.lastName || ""}`.trim(), requestId: request._id.toString() },
        });

        emitToUser(receiverId, "notification:new", {
            type: "friend_request",
            title: "👋 New Friend Request",
            message: `${sender?.firstName || "Someone"} ${sender?.lastName || ""} sent you a friend request!`,
            data: { userId: senderId, userName: `${sender?.firstName || ""} ${sender?.lastName || ""}`.trim(), requestId: request._id.toString() },
            read: false,
            createdAt: new Date(),
        });

        return request;
    }

    async respondToRequest(requestId: string, userId: string, action: "accept" | "reject"): Promise<IFriendRequest> {
        const request = await FriendRequestModel.findById(requestId);
        if (!request) {
            throw new HttpException(404, "Friend request not found");
        }

        if (request.receiver.toString() !== userId && request.sender.toString() !== userId) {
            throw new HttpException(403, "Not authorized to respond to this request");
        }

        if (request.status !== "pending") {
            throw new HttpException(400, "Friend request already responded to");
        }

        if (action === "accept") {
            request.status = "accepted";

            const sender = await UserModel.findById(request.sender).select("firstName lastName username").exec();
            const receiver = await UserModel.findById(request.receiver).select("firstName lastName username").exec();

            await UserModel.findByIdAndUpdate(request.sender, {
                $addToSet: { friends: request.receiver },
                $inc: { friendsCount: 1 },
            }).exec();

            await UserModel.findByIdAndUpdate(request.receiver, {
                $addToSet: { friends: request.sender },
                $inc: { friendsCount: 1 },
            }).exec();

            await NotificationModel.create({
                userId: request.sender,
                type: "friend_accepted",
                title: "✅ Friend Request Accepted!",
                message: `${receiver?.firstName || "Someone"} ${receiver?.lastName || ""} accepted your friend request!`,
                data: { userId: request.receiver.toString(), userName: `${receiver?.firstName || ""} ${receiver?.lastName || ""}`.trim() },
            });

            emitToUser(request.sender.toString(), "notification:new", {
                type: "friend_accepted",
                title: "✅ Friend Request Accepted!",
                message: `${receiver?.firstName || "Someone"} ${receiver?.lastName || ""} accepted your friend request!`,
                data: { userId: request.receiver.toString(), userName: `${receiver?.firstName || ""} ${receiver?.lastName || ""}`.trim() },
                read: false,
                createdAt: new Date(),
            });
        } else {
            request.status = "rejected";

            await NotificationModel.create({
                userId: request.sender,
                type: "friend_request",
                title: "Friend Request Rejected",
                message: `Your friend request was rejected.`,
                data: { userId: request.receiver.toString() },
            });
        }

        await request.save();
        return request;
    }

    async removeFriend(userId: string, friendId: string): Promise<void> {
        const user = await UserModel.findById(userId);
        if (!user) throw new HttpException(404, "User not found");

        const friend = await UserModel.findById(friendId);
        if (!friend) throw new HttpException(404, "Friend not found");

        // Remove from both users' friend lists
        await UserModel.findByIdAndUpdate(userId, {
            $pull: { friends: friendId },
            $inc: { friendsCount: -1 },
        }).exec();

        await UserModel.findByIdAndUpdate(friendId, {
            $pull: { friends: userId },
            $inc: { friendsCount: -1 },
        }).exec();

        // Also remove any pending requests between them
        await FriendRequestModel.deleteMany({
            $or: [
                { sender: userId, receiver: friendId },
                { sender: friendId, receiver: userId },
            ],
        }).exec();
    }

    async getFriends(userId: string): Promise<IUser[]> {
        const user = await UserModel.findById(userId)
            .populate("friends", "firstName lastName username profileImage level isOnline lastActive totalDistance")
            .exec();

        if (!user) throw new HttpException(404, "User not found");
        return user.friends as unknown as IUser[];
    }

    async getFriendRequests(userId: string): Promise<IFriendRequest[]> {
        return await FriendRequestModel.find({
            receiver: userId,
            status: "pending",
        })
            .populate("sender", "firstName lastName username profileImage level")
            .sort({ createdAt: -1 })
            .exec();
    }

    async getSentRequests(userId: string): Promise<IFriendRequest[]> {
        return await FriendRequestModel.find({
            sender: userId,
        })
            .populate("receiver", "firstName lastName username profileImage level")
            .sort({ createdAt: -1 })
            .exec();
    }

    async getPendingRequestCount(userId: string): Promise<number> {
        return await FriendRequestModel.countDocuments({
            receiver: userId,
            status: "pending",
        }).exec();
    }

    async isFriend(userId: string, targetId: string): Promise<boolean> {
        const user = await UserModel.findById(userId).exec();
        if (!user) return false;
        return user.friends?.some((f) => f.toString() === targetId) || false;
    }

    async getOnlineFriends(userId: string): Promise<IUser[]> {
        const user = await UserModel.findById(userId)
            .populate({
                path: "friends",
                match: { isOnline: true },
                select: "firstName lastName username profileImage level isOnline",
            })
            .exec();

        if (!user) throw new HttpException(404, "User not found");
        return user.friends as unknown as IUser[];
    }

    async compareStats(userId: string, friendId: string): Promise<{ user: any; friend: any }> {
        const [user, friend] = await Promise.all([
            UserModel.findById(userId).select("firstName lastName username profileImage level totalDistance totalRuns territoriesCaptured longestRun fastestPace currentStreak xp").exec(),
            UserModel.findById(friendId).select("firstName lastName username profileImage level totalDistance totalRuns territoriesCaptured longestRun fastestPace currentStreak xp").exec(),
        ] as const);

        if (!user) throw new HttpException(404, "User not found");
        if (!friend) throw new HttpException(404, "Friend not found");

        return { user, friend };
    }

    async getFriendActivity(userId: string): Promise<any[]> {
        const user = await UserModel.findById(userId).select("friends").exec();
        if (!user) throw new HttpException(404, "User not found");

        const friendIds = user.friends?.map((f) => f.toString()) || [];
        if (friendIds.length === 0) return [];

        const recentRuns = await RunModel.find({
            userId: { $in: friendIds.map((id) => new mongoose.Types.ObjectId(id)) },
            status: "finished",
        })
            .sort({ startTime: -1 })
            .limit(20)
            .populate("userId", "firstName lastName username profileImage")
            .lean()
            .exec();

        const recentAchievements = await AchievementModel.find({
            userId: { $in: friendIds.map((id) => new mongoose.Types.ObjectId(id)) },
            completed: true,
            completedAt: { $ne: undefined },
        })
            .sort({ completedAt: -1 })
            .limit(20)
            .populate("userId", "firstName lastName username profileImage")
            .populate("badgeId")
            .lean()
            .exec();

        const activities: any[] = [];

        for (const run of recentRuns) {
            activities.push({
                type: "run",
                userId: run.userId,
                message: `completed a ${(run.distance / 1000).toFixed(2)} km run`,
                timestamp: run.startTime,
                metadata: { distance: run.distance, duration: run.duration, pace: run.pace },
            });
        }

        for (const achievement of recentAchievements) {
            activities.push({
                type: "achievement",
                userId: achievement.userId,
                message: `earned the "${(achievement.badgeId as any)?.name || "badge"}" badge`,
                timestamp: achievement.completedAt,
                metadata: { badge: achievement.badgeId },
            });
        }

        activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        return activities.slice(0, 30);
    }
}

