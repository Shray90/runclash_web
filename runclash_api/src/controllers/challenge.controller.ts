import { Request, Response } from "express";
import { ChallengeService } from "../services/challenge.service";
import { ApiResponseHelper } from "../utils/apihelper.util";
import { CreateChallengeDTO, UpdateChallengeDTO } from "../dtos/challenge.dto";
import { z } from "zod";

const challengeService = new ChallengeService();

export class ChallengeController {
    async create(req: Request, res: Response) {
        try {
            const parsed = CreateChallengeDTO.safeParse(req.body);
            if (!parsed.success) {
                return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
            }
            const challenge = await challengeService.createChallenge({
                ...parsed.data,
                createdBy: req.user!._id.toString(),
            });
            return ApiResponseHelper.success(res, challenge, "Challenge created", 201);
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async list(req: Request, res: Response) {
        try {
            const activeOnly = req.query.active === "true";
            const challenges = await challengeService.getAllChallenges(activeOnly);
            return ApiResponseHelper.success(res, challenges, "Challenges fetched");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async getById(req: Request, res: Response) {
        try {
            const challenge = await challengeService.getChallengeById(req.params.id as string);
            return ApiResponseHelper.success(res, challenge, "Challenge fetched");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async update(req: Request, res: Response) {
        try {
            const parsed = UpdateChallengeDTO.safeParse(req.body);
            if (!parsed.success) {
                return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
            }
            const challenge = await challengeService.updateChallenge(req.params.id as string, parsed.data as any);
            return ApiResponseHelper.success(res, challenge, "Challenge updated");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async delete(req: Request, res: Response) {
        try {
            await challengeService.deleteChallenge(req.params.id as string);
            return ApiResponseHelper.success(res, null, "Challenge deleted");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async join(req: Request, res: Response) {
        try {
            const progress = await challengeService.joinChallenge(req.user!._id.toString(), req.params.id as string);
            return ApiResponseHelper.success(res, progress, "Joined challenge");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async getUserChallenges(req: Request, res: Response) {
        try {
            const challenges = await challengeService.getUserChallenges(req.user!._id.toString());
            return ApiResponseHelper.success(res, challenges, "User challenges fetched");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async getChallengeHistory(req: Request, res: Response) {
        try {
            const history = await challengeService.getChallengeHistory(req.user!._id.toString());
            return ApiResponseHelper.success(res, history, "Challenge history fetched");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async generateDefaults(req: Request, res: Response) {
        try {
            const challenges = await challengeService.generateDefaultChallenges();
            return ApiResponseHelper.success(res, challenges, "Default challenges generated");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }
}

