import { Request, Response } from "express";
import { RunService } from "../services/run.service";
import { ApiResponseHelper } from "../utils/apihelper.util";
import { StartRunDTO, LocationDTO, FinishRunDTO, RunQueryDTO } from "../dtos/run.dto";
import { z } from "zod";

const runService = new RunService();

export class RunController {
    async startRun(req: Request, res: Response) {
        try {
            const parsed = StartRunDTO.safeParse(req.body);
            if (!parsed.success) {
                return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
            }
            const run = await runService.startRun(req.user!._id.toString(), parsed.data.startLat, parsed.data.startLng);
            return ApiResponseHelper.success(res, run, "Run started successfully", 201);
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async getCurrentRun(req: Request, res: Response) {
        try {
            const run = await runService.getCurrentRun(req.user!._id.toString());
            return ApiResponseHelper.success(res, run || null, run ? "Active run found" : "No active run");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async pauseRun(req: Request, res: Response) {
        try {
            const { runId } = req.body;
            if (!runId) return ApiResponseHelper.error(res, "runId is required", 400);
            const run = await runService.pauseRun(req.user!._id.toString(), runId);
            return ApiResponseHelper.success(res, run, "Run paused");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async resumeRun(req: Request, res: Response) {
        try {
            const { runId } = req.body;
            if (!runId) return ApiResponseHelper.error(res, "runId is required", 400);
            const run = await runService.resumeRun(req.user!._id.toString(), runId);
            return ApiResponseHelper.success(res, run, "Run resumed");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async addLocation(req: Request, res: Response) {
        try {
            const parsed = LocationDTO.safeParse(req.body);
            if (!parsed.success) {
                return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
            }
            await runService.addLocation(
                req.user!._id.toString(),
                parsed.data.runId,
                parsed.data.lat,
                parsed.data.lng,
                parsed.data.speed,
                parsed.data.accuracy,
                parsed.data.altitude
            );
            return ApiResponseHelper.success(res, null, "Location recorded");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async finishRun(req: Request, res: Response) {
        try {
            const parsed = FinishRunDTO.safeParse(req.body);
            if (!parsed.success) {
                return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
            }
            const run = await runService.finishRun(req.user!._id.toString(), parsed.data.runId, {
                distance: parsed.data.distance,
                duration: parsed.data.duration,
                avgSpeed: parsed.data.avgSpeed,
                pace: parsed.data.pace,
                calories: parsed.data.calories,
            });
            return ApiResponseHelper.success(res, run, "Run finished successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async getRunHistory(req: Request, res: Response) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const period = req.query.period as string | undefined;
            const result = await runService.getRunHistory(req.user!._id.toString(), page, limit, period);
            return ApiResponseHelper.success(res, result.data, "Run history fetched", 200, {
                page: result.page,
                limit,
                total: result.total,
                totalPages: result.totalPages,
            } as any);
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async getRunById(req: Request, res: Response) {
        try {
            const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
            const run = await runService.getRunById(id, req.user!._id.toString());
            return ApiResponseHelper.success(res, run, "Run fetched");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }
}

