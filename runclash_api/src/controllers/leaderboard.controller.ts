import { Request, Response } from "express";
import { LeaderboardService } from "../services/leaderboard.service";
import { ApiResponseHelper } from "../utils/apihelper.util";

const leaderboardService = new LeaderboardService();

export class LeaderboardController {
    async getLeaderboard(req: Request, res: Response) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;
            const search = req.query.search as string | undefined;
            const sortBy = req.query.sortBy as string | undefined;
            const period = (req.query.period as string) || "all";

            const result = await leaderboardService.getLeaderboard({
                period: period as any,
                page,
                limit,
                search,
                sortBy,
            });

            return ApiResponseHelper.success(res, result.data, "Leaderboard fetched", 200, {
                page: result.page,
                limit,
                total: result.total,
                totalPages: result.totalPages,
            } as any);
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async getUserRank(req: Request, res: Response) {
        try {
            const result = await leaderboardService.getUserRank(req.user!._id.toString());
            return ApiResponseHelper.success(res, result, "User rank fetched");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async getMiniLeaderboard(req: Request, res: Response) {
        try {
            const limit = parseInt(req.query.limit as string) || 5;
            const data = await leaderboardService.getMiniLeaderboard(limit);
            return ApiResponseHelper.success(res, data, "Mini leaderboard fetched");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }
}

