import { Request, Response } from "express";
import { z } from "zod";
import { CreateUserDTO, LoginUserDTO, UpdateUserDTO, UpdatePasswordDTO, UpdateSettingsDTO } from "../dtos/user.dto";
import { ApiResponseHelper } from "../utils/apihelper.util";
import { UserService } from "../services/user.service";

const userService = new UserService();

export class UserController {
    async createUser(req: Request, res: Response) {
        try {
            const parsed = CreateUserDTO.safeParse(req.body);
            if (!parsed.success) {
                return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
            }
            const user = await userService.createUser(parsed.data);
            return ApiResponseHelper.success(res, user, "User created successfully", 201);
        } catch (error: any) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }

    async loginUser(req: Request, res: Response) {
        try {
            const parsed = LoginUserDTO.safeParse(req.body);
            if (!parsed.success) {
                return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
            }
            const { user, token } = await userService.loginUser(parsed.data);
            return ApiResponseHelper.success(res, { user, token }, "Login successful");
        } catch (error: any) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }

    async whoami(req: Request, res: Response) {
        try {
            if (!req.user) {
                return ApiResponseHelper.error(res, "User not found", 404);
            }
            return ApiResponseHelper.success(res, req.user, "User details fetched successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }

    async updateUser(req: Request, res: Response) {
        try {
            if (!req.user) {
                return ApiResponseHelper.error(res, "User not found", 404);
            }
            const bodyWithFile = { ...req.body } as any;
            if ((req as any).file) {
                const file = (req as any).file;
                bodyWithFile.profileImage = `/uploads/${file.filename}`;
            }
            const parsed = UpdateUserDTO.safeParse(bodyWithFile);
            if (!parsed.success) {
                return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
            }
            const updatedUser = await userService.updateUser(req.user._id.toString(), parsed.data);
            return ApiResponseHelper.success(res, updatedUser, "User updated successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }

    async updatePassword(req: Request, res: Response) {
        try {
            if (!req.user) {
                return ApiResponseHelper.error(res, "User not found", 404);
            }
            const parsed = UpdatePasswordDTO.safeParse(req.body);
            if (!parsed.success) {
                return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
            }

            const validPassword = await userService.checkPassword(
                req.user._id.toString(),
                parsed.data.currentPassword
            );
            if (!validPassword) {
                return ApiResponseHelper.error(res, "Current password is incorrect", 400);
            }
            const updatedUser = await userService.updateUser(req.user._id.toString(), { password: parsed.data.newPassword });
            return ApiResponseHelper.success(res, updatedUser, "Password updated successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }

    async deleteAccount(req: Request, res: Response) {
        try {
            if (!req.user) {
                return ApiResponseHelper.error(res, "User not found", 404);
            }
            await userService.deleteUser(req.user._id.toString());
            return ApiResponseHelper.success(res, null, "Account deleted successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }

    async searchUsers(req: Request, res: Response) {
        try {
            const page = req.query.page as string;
            const limit = req.query.limit as string;
            const search = req.query.search as string;
            const result = await userService.getAllUserPaginated(page, limit, search);
            return ApiResponseHelper.success(res, result.data, "Users fetched", 200, result.pagination as any);
        } catch (error: any) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }

    async updateSettings(req: Request, res: Response) {
        try {
            if (!req.user) {
                return ApiResponseHelper.error(res, "User not found", 404);
            }
            const parsed = UpdateSettingsDTO.safeParse(req.body);
            if (!parsed.success) {
                return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
            }
            const updatedUser = await userService.updateUser(req.user._id.toString(), { settings: parsed.data });
            return ApiResponseHelper.success(res, updatedUser, "Settings updated successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }
}
