import { z } from "zod";

export const CreateChallengeDTO = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    type: z.enum(["distance", "runs", "territories", "streak", "speed", "calories", "marathon"]),
    goal: z.number().min(1, "Goal must be at least 1"),
    reward: z.object({
        xp: z.number().default(100),
        coins: z.number().default(50),
        badgeId: z.string().optional(),
    }),
    startDate: z.string(),
    endDate: z.string(),
});

export type CreateChallengeDTO = z.infer<typeof CreateChallengeDTO>;

export const UpdateChallengeDTO = z.object({
    title: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    goal: z.number().min(1).optional(),
    reward: z.object({
        xp: z.number().optional(),
        coins: z.number().optional(),
        badgeId: z.string().optional(),
    }).optional(),
    isActive: z.boolean().optional(),
});

export type UpdateChallengeDTO = z.infer<typeof UpdateChallengeDTO>;

