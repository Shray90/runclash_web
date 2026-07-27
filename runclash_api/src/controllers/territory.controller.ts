import { Request, Response } from "express";
import { TerritoryService } from "../services/territory.service";
import { ApiResponseHelper } from "../utils/apihelper.util";
import { CreateTerritoryDTO, UpdateTerritoryDTO, CaptureProgressDTO, TerritoryCheckDTO } from "../dtos/territory.dto";
import { z } from "zod";

const territoryService = new TerritoryService();

export class TerritoryController {
    async getAll(req: Request, res: Response) {
        try {
            const territories = await territoryService.getAllTerritories();
            return ApiResponseHelper.success(res, territories, "Territories fetched");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async getById(req: Request, res: Response) {
        try {
            const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
            const territory = await territoryService.getTerritoryById(id);
            return ApiResponseHelper.success(res, territory, "Territory fetched");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async create(req: Request, res: Response) {
        try {
            const parsed = CreateTerritoryDTO.safeParse(req.body);
            if (!parsed.success) {
                return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
            }
            const territory = await territoryService.createTerritory(parsed.data);
            return ApiResponseHelper.success(res, territory, "Territory created", 201);
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async update(req: Request, res: Response) {
        try {
            const parsed = UpdateTerritoryDTO.safeParse(req.body);
            if (!parsed.success) {
                return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
            }
            const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
            const territory = await territoryService.updateTerritory(id, parsed.data as any);
            return ApiResponseHelper.success(res, territory, "Territory updated");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
            await territoryService.deleteTerritory(id);
            return ApiResponseHelper.success(res, null, "Territory deleted");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async checkTerritory(req: Request, res: Response) {
        try {
            const parsed = TerritoryCheckDTO.safeParse(req.body);
            if (!parsed.success) {
                return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
            }
            const result = await territoryService.checkTerritory(
                req.user!._id.toString(),
                parsed.data.territoryId,
                parsed.data.lat,
                parsed.data.lng
            );
            return ApiResponseHelper.success(res, result, "Territory check completed");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async capture(req: Request, res: Response) {
        try {
            const parsed = CaptureProgressDTO.safeParse(req.body);
            if (!parsed.success) {
                return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
            }
            const result = await territoryService.captureTerritory(
                req.user!._id.toString(),
                parsed.data.territoryId,
                parsed.data.lat,
                parsed.data.lng
            );
            return ApiResponseHelper.success(res, result, "Capture processed");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async getUserTerritories(req: Request, res: Response) {
        try {
            const territories = await territoryService.getUserTerritories(req.user!._id.toString());
            return ApiResponseHelper.success(res, territories, "User territories fetched");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async getNearby(req: Request, res: Response) {
        try {
            const lat = parseFloat(req.query.lat as string);
            const lng = parseFloat(req.query.lng as string);
            const maxDistance = parseInt(req.query.distance as string) || 5000;

            if (isNaN(lat) || isNaN(lng)) {
                return ApiResponseHelper.error(res, "Valid lat and lng query params required", 400);
            }

            const territories = await territoryService.getNearbyTerritories(lat, lng, maxDistance);
            return ApiResponseHelper.success(res, territories, "Nearby territories fetched");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }
}

