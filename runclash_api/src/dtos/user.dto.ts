import { z } from "zod";
import { UserSchema } from "../types/user.type";

export const CreateUserDTO = UserSchema.pick({
    firstName: true,
    lastName: true,
    email: true,
    username: true,
    password: true
});
export type CreateUserDTO = z.infer<typeof CreateUserDTO>;

export const CreateUserDTOAdmin = UserSchema.pick({
    firstName: true,
    lastName: true,
    email: true,
    username: true,
    password: true,
    role: true
});
export type CreateUserDTOAdmin = z.infer<typeof CreateUserDTOAdmin>;

export const LoginUserDTO = UserSchema.pick({
    email: true,
    password: true
});
export type LoginUserDTO = z.infer<typeof LoginUserDTO>;

export const UpdateUserDTO = UserSchema.partial().extend({
    profileImage: z.string().optional(),
    settings: z.object({
        darkMode: z.boolean().optional(),
        locationPermissions: z.boolean().optional(),
        notificationPreferences: z.object({
            friendRequests: z.boolean().optional(),
            territoryUpdates: z.boolean().optional(),
            challenges: z.boolean().optional(),
            achievements: z.boolean().optional(),
            leaderboard: z.boolean().optional(),
            runs: z.boolean().optional(),
        }).optional(),
        privacy: z.object({
            showProfile: z.boolean().optional(),
            showStats: z.boolean().optional(),
            showLocation: z.boolean().optional(),
        }).optional(),
    }).optional(),
});
export type UpdateUserDTO = z.infer<typeof UpdateUserDTO>;

export const UpdateSettingsDTO = z.object({
    darkMode: z.boolean().optional(),
    locationPermissions: z.boolean().optional(),
    notificationPreferences: z.object({
        friendRequests: z.boolean().optional(),
        territoryUpdates: z.boolean().optional(),
        challenges: z.boolean().optional(),
        achievements: z.boolean().optional(),
        leaderboard: z.boolean().optional(),
        runs: z.boolean().optional(),
    }).optional(),
    privacy: z.object({
        showProfile: z.boolean().optional(),
        showStats: z.boolean().optional(),
        showLocation: z.boolean().optional(),
    }).optional(),
});
export type UpdateSettingsDTO = z.infer<typeof UpdateSettingsDTO>;

export const UpdatePasswordDTO = z.object({
    currentPassword: z.string().min(6, "Current password must be at least 6 characters long"),
    newPassword: z.string().min(6, "New password must be at least 6 characters long"),
    confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters long")
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "New password and confirm password must match",
    path: ["confirmPassword"]
});
export type UpdatePasswordDTO = z.infer<typeof UpdatePasswordDTO>;
