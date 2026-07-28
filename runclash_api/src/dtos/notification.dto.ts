import { z } from "zod";

export const CreateNotificationDTO = z.object({
    userId: z.string(),
    type: z.enum([
        "friend_request", "friend_accepted", "territory_captured", "territory_lost",
        "challenge_completed", "challenge_received", "level_up", "leaderboard_promotion",
        "achievement_unlocked", "badge_earned", "run_completed", "system"
    ]),
    title: z.string().min(1),
    message: z.string().min(1),
    data: z.any().optional(),
});

export type CreateNotificationDTO = z.infer<typeof CreateNotificationDTO>;

