import { z } from "zod";

export const SendFriendRequestDTO = z.object({
    receiverId: z.string(),
});

export type SendFriendRequestDTO = z.infer<typeof SendFriendRequestDTO>;

export const RespondFriendRequestDTO = z.object({
    requestId: z.string(),
    action: z.enum(["accept", "reject"]),
});

export type RespondFriendRequestDTO = z.infer<typeof RespondFriendRequestDTO>;

