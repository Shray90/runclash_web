import { z } from "zod";

export const authUpdateProfileSchema = z.object({
  fullName: z.string().trim().min(2).max(80).optional(),
  fitnessGoal: z.enum(["loose", "stay", "gain"]).optional(),
});

export const authUpdatePasswordSchema = z.object({
  currentPassword: z.string().min(1).optional(),
  newPassword: z
    .string()
    .min(8)
    .regex(/[A-Za-z]/)
    .regex(/[0-9]/)
    .optional(),
  confirmPassword: z.string().min(1).optional(),
});

export const authUpdateSchema = authUpdateProfileSchema.merge(
  authUpdatePasswordSchema
).superRefine((data, ctx) => {
  const hasAnyPasswordField =
    data.currentPassword || data.newPassword || data.confirmPassword;

  if (hasAnyPasswordField) {
    if (!data.currentPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Current password is required",
        path: ["currentPassword"],
      });
    }
    if (!data.newPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "New password is required",
        path: ["newPassword"],
      });
    }
    if (!data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Confirm password is required",
        path: ["confirmPassword"],
      });
    }
    if (data.newPassword && data.confirmPassword && data.newPassword !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords do not match",
        path: ["confirmPassword"],
      });
    }
  }
});

