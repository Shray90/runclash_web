import { Request, Response } from "express";
import { StatsService } from "../services/stats.service";
import { ApiResponseHelper } from "../utils/apihelper.util";

const statsService = new StatsService();

export class StatsController {
    async getDashboard(req: Request, res: Response) {
        try {
            const stats = await statsService.getDashboardStats(req.user!._id.toString());
            return ApiResponseHelper.success(res, stats, "Dashboard stats fetched");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async getCharts(req: Request, res: Response) {
        try {
            const data = await statsService.getChartsData(req.user!._id.toString());
            return ApiResponseHelper.success(res, data, "Chart data fetched");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async getAdminAnalytics(req: Request, res: Response) {
        try {
            const analytics = await statsService.getAdminAnalytics();
            return ApiResponseHelper.success(res, analytics, "Admin analytics fetched");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }
}

