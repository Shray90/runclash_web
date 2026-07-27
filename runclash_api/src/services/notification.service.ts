import { NotificationModel, INotification } from "../models/notification.model";
import { UserModel } from "../models/user.model";
import { RunModel } from "../models/run.model";
import mongoose from "mongoose";

export class NotificationService {
    async createNotification(data: {
        userId: string;
        type: INotification["type"];
        title: string;
        message: string;
        data?: Record<string, any>;
    }): Promise<INotification> {
        const notification = await NotificationModel.create({
            userId: new mongoose.Types.ObjectId(data.userId),
            type: data.type,
            title: data.title,
            message: data.message,
            data: data.data,
        });
        return notification;
    }

    async getUserNotifications(
        userId: string,
        page: number = 1,
        limit: number = 20,
        unreadOnly: boolean = false
    ): Promise<{ data: INotification[]; total: number; unreadCount: number; page: number; totalPages: number }> {
        const filter: any = { userId: new mongoose.Types.ObjectId(userId) };
        if (unreadOnly) {
            filter.read = false;
        }

        const skip = (page - 1) * limit;
        const [data, total, unreadCount] = await Promise.all([
            NotificationModel.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .exec(),
            NotificationModel.countDocuments({ userId: new mongoose.Types.ObjectId(userId) }).exec(),
            NotificationModel.countDocuments({
                userId: new mongoose.Types.ObjectId(userId),
                read: false,
            }).exec(),
        ]);

        return {
            data,
            total,
            unreadCount,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }

    async markAsRead(notificationId: string, userId: string): Promise<INotification> {
        const notification = await NotificationModel.findOneAndUpdate(
            { _id: notificationId, userId: new mongoose.Types.ObjectId(userId) },
            { read: true, readAt: new Date() },
            { new: true }
        ).exec();
        if (!notification) {
            throw new Error("Notification not found");
        }
        return notification;
    }

    async markAllAsRead(userId: string): Promise<void> {
        await NotificationModel.updateMany(
            { userId: new mongoose.Types.ObjectId(userId), read: false },
            { read: true, readAt: new Date() }
        ).exec();
    }

    async deleteNotification(notificationId: string, userId: string): Promise<void> {
        const result = await NotificationModel.findOneAndDelete({
            _id: notificationId,
            userId: new mongoose.Types.ObjectId(userId),
        }).exec();
        if (!result) {
            throw new Error("Notification not found");
        }
    }

    async getUnreadCount(userId: string): Promise<number> {
        return await NotificationModel.countDocuments({
            userId: new mongoose.Types.ObjectId(userId),
            read: false,
        }).exec();
    }

    async generateWeeklySummary(userId: string): Promise<INotification> {
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const weekRuns = await RunModel.find({
            userId: new mongoose.Types.ObjectId(userId),
            startTime: { $gte: weekAgo },
            status: "finished",
        }).exec();

        const totalDistance = weekRuns.reduce((sum, r) => sum + r.distance, 0);
        const totalRuns = weekRuns.length;
        const totalCalories = weekRuns.reduce((sum, r) => sum + (r.calories || 0), 0);
        const totalDuration = weekRuns.reduce((sum, r) => sum + (r.duration || 0), 0);

        const user = await UserModel.findById(userId).exec();
        const userName = user ? `${user.firstName} ${user.lastName}` : "Runner";

        const message = `This week you ran ${totalRuns} time${totalRuns !== 1 ? "s" : ""}, covering ${(totalDistance / 1000).toFixed(1)} km and burning ${Math.round(totalCalories)} calories!`;

        const notification = await NotificationModel.create({
            userId: new mongoose.Types.ObjectId(userId),
            type: "system",
            title: "📊 Weekly Activity Summary",
            message,
            data: {
                totalRuns,
                totalDistance,
                totalCalories,
                totalDuration,
                weekStart: weekAgo,
                weekEnd: now,
            },
        });

        return notification;
    }
}

