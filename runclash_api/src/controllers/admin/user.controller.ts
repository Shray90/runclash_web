import { Request, Response } from "express";
import { z } from "zod";
import { ApiResponseHelper } from "../../utils/apihelper.util";
import { UserService } from "../../services/user.service";
import { CreateUserDTOAdmin, UpdateUserDTO, UpdatePasswordDTO } from "../../dtos/user.dto";

const userService = new UserService();

export class AdminUserController {
    async createUser(req: Request, res: Response) {
        try {
            const parsed = CreateUserDTOAdmin.safeParse(req.body);
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

    async listUsers(req: Request, res: Response) {
        try {
            const { page, limit, search } = req.query;
            const result = await userService.getAllUserPaginated(
                page as string | undefined,
                limit as string | undefined,
                search as string | undefined
            );
            return ApiResponseHelper.success(res, result.data, "Users fetched successfully", 200, result.pagination);
        } catch (error: any) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }

    async getUserById(req: Request, res: Response) {
        try {
            const userId = req.params.id;
            if (!userId) {
                return ApiResponseHelper.error(res, "User id is required", 400);
            }
            const user = await userService.getUserById(userId);
            return ApiResponseHelper.success(res, user, "User retrieved successfully");
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
            const userId = req.params.id;
            // merge file upload (if any) into body as profileImage
            const bodyWithFile = { ...req.body } as any;
            if ((req as any).file) {
                const file = (req as any).file;
                bodyWithFile.profileImage = `/uploads/${file.filename}`;
            }
            const parsed = UpdateUserDTO.safeParse(bodyWithFile);
            if (!parsed.success) {
                return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
            }

            const updatedUser = await userService.updateUser(userId, parsed.data);
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
            const userId = req.params.id;
            const parsed = UpdatePasswordDTO.safeParse(req.body);
            if (!parsed.success) {
                return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
            }

            const isValid = await userService.checkPassword(userId, parsed.data.currentPassword);
            if (!isValid) {
                return ApiResponseHelper.error(res, "Current password is incorrect", 400);
            }

            const updatedUser = await userService.updateUser(userId, { password: parsed.data.newPassword });
            return ApiResponseHelper.success(res, updatedUser, "Password updated successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }

    async deleteUser(req: Request, res: Response) {
        try {
            const userId = req.params.id;
            const deleted = await userService.deleteUser(userId);
            if (!deleted) {
                return ApiResponseHelper.error(res, "User not found", 404);
            }
            return ApiResponseHelper.success(res, null, "User deleted successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }
}
