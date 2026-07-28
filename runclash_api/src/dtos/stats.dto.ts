import { z } from "zod";

export const StatsQueryDTO = z.object({
    period: z.enum(["daily", "weekly", "monthly", "yearly", "all"]).default("weekly"),
    userId: z.string().optional(),
});

export type StatsQueryDTO = z.infer<typeof StatsQueryDTO>;

