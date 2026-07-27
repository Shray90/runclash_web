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
        console.log("=== AUTH MIDDLEWARE ===");
        console.log("Authorization header:", req.headers.authorization);

        const authHeader = req.headers.authorization;
        if (!authHeader) {
            console.log("FAIL: No Authorization header");
            throw new HttpException(401, "Unauthorized JWT missing");
        }

        const token = authHeader.replace("Bearer ", "");
        console.log("Extracted token:", token);
        console.log("SECRET_KEY loaded:", SECRET_KEY ? "yes" : "no", "length:", SECRET_KEY.length);

        const payload = jwt.verify(token, SECRET_KEY) as { id: string };
        console.log("Decoded JWT payload:", payload);
        console.log("User ID from payload:", payload.id);

        const user = await userRepository.getUserById(payload.id);
        console.log("MongoDB lookup result:", user ? { _id: user._id, email: user.email } : null);

        if (!user) {
            console.log("FAIL: User not found in MongoDB for ID:", payload.id);
            throw new HttpException(401, "Unauthorized user not found");
        }

        console.log("SUCCESS: User authenticated:", user._id.toString());
        req.user = user;
        next();
    } catch (error) {
        const reason = error instanceof Error ? error.message : String(error);
        console.error("AUTH FAILED:", reason);
        return ApiResponseHelper.error(res, "Unauthorized", 401);
    }
};

export const adminMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = req.user as any;
        if (!user || user.role !== "admin") {
            throw new HttpException(403, "Forbidden: Admin access required");
        }
        next();
    } catch (error) {
        console.error("ADMIN ERROR:", error);
        return ApiResponseHelper.error(res, "Forbidden", 403);
    }
};