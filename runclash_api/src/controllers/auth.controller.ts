import { NextFunction, Request, Response } from "express";
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { loginUser, registerUser } from "../services/user.service";
import { authUpdateSchema } from "../dtos/authUpdate.dto";
import { UserModel } from "../models/user.model";

const ensureUploadsDirExists = () => {
  const dir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
};

export const register = async (

  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await registerUser(req.body);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await loginUser(req.body);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const whoami = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const user = await UserModel.findById(userId).lean();
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      message: "User details fetched",
      data: {
        id: String(user._id),
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        fitnessGoal: user.fitnessGoal,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // multer will populate req.body (multipart fields)
    const parsed = authUpdateSchema.parse(req.body);

    const updatePayload: Record<string, unknown> = {};

    if (parsed.fullName !== undefined) updatePayload.fullName = parsed.fullName;
    if (parsed.fitnessGoal !== undefined)
      updatePayload.fitnessGoal = parsed.fitnessGoal;

    // Optional image upload handling
    if (req.file) {
      ensureUploadsDirExists();
      const ext = path.extname(req.file.originalname || "");
      const sanitizedExt = ext ? ext.replace(/[^a-zA-Z0-9.]/g, "") : ".jpg";
      const newFilename = `${userId}-${Date.now()}${sanitizedExt}`;
      const newPath = path.join(process.cwd(), "uploads", newFilename);

      fs.renameSync(req.file.path, newPath);

      // Store relative path for frontend rendering
      updatePayload.profileImage = `/uploads/${newFilename}`;
    }

    // Optional password update
    if (parsed.currentPassword && parsed.newPassword && parsed.confirmPassword) {
      const current = await UserModel.findById(userId).select("+password");
      if (!current) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      const matches = await bcrypt.compare(
        parsed.currentPassword,
        current.password
      );
      if (!matches) {
        return res
          .status(401)
          .json({ success: false, message: "Current password is incorrect" });
      }

      const hashed = await bcrypt.hash(parsed.newPassword, 12);
      updatePayload.password = hashed;
    }

    await UserModel.findByIdAndUpdate(userId, updatePayload, { new: false });

    const updated = await UserModel.findById(userId).lean();

    return res.status(200).json({
      success: true,
      message: "Profile updated",
      data: {
        id: String(updated?._id),
        fullName: updated?.fullName,
        email: updated?.email,
        role: updated?.role,
        fitnessGoal: updated?.fitnessGoal,
      },
    });
  } catch (error) {
    next(error);
  }
};

