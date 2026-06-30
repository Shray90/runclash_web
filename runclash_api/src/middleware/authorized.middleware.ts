import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { HttpException } from "../exceptions/http-exception";
import { ApiResponseHelper } from "../utils/apihelper.util";
import { UserMongoRepository } from "../repositories/user.repository";
import { SECRET_KEY } from "../configs/constant";

const userRepository = new UserMongoRepository();

export const authorizedMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            throw new HttpException(401, "Unauthorized JWT missing");
        }

        const token = authHeader.replace("Bearer ", "");
        if (!token) {
            throw new HttpException(401, "Unauthorized JWT missing");
        }

        const payload = jwt.verify(token, SECRET_KEY) as { id: string };
        const user = await userRepository.getUserById(payload.id);
        if (!user) {
            throw new HttpException(401, "Unauthorized user not found");
        }

        req.user = user;
        next();
    } catch (error: any) {
        if (error instanceof HttpException) {
            return ApiResponseHelper.error(res, error.message, error.status);
        }
        return ApiResponseHelper.error(res, "Unauthorized JWT invalid", 401);
    }
};

export const adminMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user) {
            throw new HttpException(401, "Unauthorized no user info");
        }
        if (req.user.role !== "admin") {
            throw new HttpException(403, "Forbidden not admin");
        }
        next();
    } catch (error: any) {
        if (error instanceof HttpException) {
            return ApiResponseHelper.error(res, error.message, error.status);
        }
        return ApiResponseHelper.error(res, "Forbidden", 403);
    }
};
