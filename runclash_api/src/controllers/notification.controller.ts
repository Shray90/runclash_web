import { Request, Response } from "express";
import { NotificationService } from "../services/notification.service";
import { ApiResponseHelper } from "../utils/apihelper.util";

const notificationService = new NotificationService();

export class NotificationController {
    async list(req: Request, res: Response) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;
            const unreadOnly = req.query.unreadOnly === "true";
            const result = await notificationService.getUserNotifications(req.user!._id.toString(), page, limit, unreadOnly);
            return ApiResponseHelper.success(res, result.data, "Notifications fetched", 200, {
                page: result.page,
                limit,
                total: result.total,
                totalPages: result.totalPages,
                unreadCount: result.unreadCount,
            } as any);
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async markRead(req: Request, res: Response) {
        try {
            const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
            const notification = await notificationService.markAsRead(id, req.user!._id.toString());
            return ApiResponseHelper.success(res, notification, "Notification marked as read");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async markAllRead(req: Request, res: Response) {
        try {
            await notificationService.markAllAsRead(req.user!._id.toString());
            return ApiResponseHelper.success(res, null, "All notifications marked as read");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
            await notificationService.deleteNotification(id, req.user!._id.toString());
            return ApiResponseHelper.success(res, null, "Notification deleted");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async getUnreadCount(req: Request, res: Response) {
        try {
            const count = await notificationService.getUnreadCount(req.user!._id.toString());
            return ApiResponseHelper.success(res, { count }, "Unread count fetched");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async generateWeeklySummary(req: Request, res: Response) {
        try {
            const notification = await notificationService.generateWeeklySummary(req.user!._id.toString());
            return ApiResponseHelper.success(res, notification, "Weekly summary generated");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }
}

