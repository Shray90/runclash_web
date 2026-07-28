import { z } from "zod";

export const CreateTerritoryDTO = z.object({
    name: z.string().min(1, "Name is required"),
    lat: z.number(),
    lng: z.number(),
    radius: z.number().min(10, "Radius must be at least 10m"),
    polygon: z.array(z.array(z.number())).optional(),
    color: z.string().optional(),
    icon: z.string().optional(),
    pointsRequired: z.number().min(1).optional(),
    xpReward: z.number().min(0).optional(),
    coinReward: z.number().min(0).optional(),
});

export type CreateTerritoryDTO = z.infer<typeof CreateTerritoryDTO>;

export const UpdateTerritoryDTO = z.object({
    name: z.string().min(1).optional(),
    radius: z.number().min(10).optional(),
    color: z.string().optional(),
    icon: z.string().optional(),
    pointsRequired: z.number().min(1).optional(),
    xpReward: z.number().min(0).optional(),
    coinReward: z.number().min(0).optional(),
    isActive: z.boolean().optional(),
});

export type UpdateTerritoryDTO = z.infer<typeof UpdateTerritoryDTO>;

export const CaptureProgressDTO = z.object({
    territoryId: z.string(),
    lat: z.number(),
    lng: z.number(),
});

export type CaptureProgressDTO = z.infer<typeof CaptureProgressDTO>;

export const TerritoryCheckDTO = z.object({
    territoryId: z.string(),
    lat: z.number(),
    lng: z.number(),
});

export type TerritoryCheckDTO = z.infer<typeof TerritoryCheckDTO>;

