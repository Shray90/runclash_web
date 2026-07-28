import { z } from "zod";

export const StartRunDTO = z.object({
    startLat: z.number(),
    startLng: z.number(),
});

export type StartRunDTO = z.infer<typeof StartRunDTO>;

export const LocationDTO = z.object({
    runId: z.string(),
    lat: z.number(),
    lng: z.number(),
    speed: z.number().optional(),
    accuracy: z.number().optional(),
    altitude: z.number().optional(),
    timestamp: z.string().optional(),
});

export type LocationDTO = z.infer<typeof LocationDTO>;

export const FinishRunDTO = z.object({
    runId: z.string(),
    distance: z.number(),
    duration: z.number(),
    avgSpeed: z.number(),
    pace: z.number(),
    calories: z.number(),
});

export type FinishRunDTO = z.infer<typeof FinishRunDTO>;

export const RunQueryDTO = z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    period: z.enum(["daily", "weekly", "monthly", "all"]).optional(),
});

export type RunQueryDTO = z.infer<typeof RunQueryDTO>;

