import { Request, Response } from "express";
import { AchievementService } from "../services/achievement.service";
import { ApiResponseHelper } from "../utils/apihelper.util";
import { CreateBadgeDTO } from "../dtos/badge.dto";
import { z } from "zod";

const achievementService = new AchievementService();

export class AchievementController {
    async createBadge(req: Request, res: Response) {
        try {
            const parsed = CreateBadgeDTO.safeParse(req.body);
            if (!parsed.success) {
                return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
            }
            const badge = await achievementService.createBadge(parsed.data);
            return ApiResponseHelper.success(res, badge, "Badge created", 201);
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async getAllBadges(req: Request, res: Response) {
        try {
            const badges = await achievementService.getAllBadges();
            return ApiResponseHelper.success(res, badges, "Badges fetched");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async getUserAchievements(req: Request, res: Response) {
        try {
            const achievements = await achievementService.getUserAchievements(req.user!._id.toString());
            return ApiResponseHelper.success(res, achievements, "Achievements fetched");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async getUserBadges(req: Request, res: Response) {
        try {
            const badges = await achievementService.getUserBadges(req.user!._id.toString());
            return ApiResponseHelper.success(res, badges, "Badges fetched");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async checkAndUnlock(req: Request, res: Response) {
        try {
            const unlocked = await achievementService.checkAndUnlock(req.user!._id.toString());
            return ApiResponseHelper.success(res, unlocked, "Achievements checked");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }
}

