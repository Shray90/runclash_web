import { z } from "zod";

export const CreateBadgeDTO = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().min(1, "Description is required"),
    icon: z.string().default("🏅"),
    criteria: z.object({
        type: z.enum(["distance", "runs", "territories", "streak", "speed", "calories", "challenges", "custom"]),
        value: z.number(),
    }),
    rarity: z.enum(["common", "rare", "epic", "legendary"]).default("common"),
    color: z.string().optional(),
    xpReward: z.number().default(50),
    coinReward: z.number().default(10),
});

export type CreateBadgeDTO = z.infer<typeof CreateBadgeDTO>;

