import express, { Application, NextFunction, Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import { HttpException } from "./exceptions/http-exception";
import { ApiResponseHelper } from "./utils/apihelper.util";
import userRoutes from "./routes/user.route";
import adminUserRoutes from "./routes/admin/user.route";
import runRoutes from "./routes/run.route";
import territoryRoutes from "./routes/territory.route";
import leaderboardRoutes from "./routes/leaderboard.route";
import notificationRoutes from "./routes/notification.route";
import friendRoutes from "./routes/friend.route";
import challengeRoutes from "./routes/challenge.route";
import achievementRoutes from "./routes/achievement.route";
import statsRoutes from "./routes/stats.route";

const app: Application = express();
app.set("etag", false);
const corsOptions = {
    origin: "*",
    successStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("combined"));

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// API Routes
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/admin/users", adminUserRoutes);
app.use("/api/v1/run", runRoutes);
app.use("/api/v1/territories", territoryRoutes);
app.use("/api/v1/leaderboard", leaderboardRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/friends", friendRoutes);
app.use("/api/v1/challenges", challengeRoutes);
app.use("/api/v1/achievements", achievementRoutes);
app.use("/api/v1/stats", statsRoutes);

app.use((req: Request, res: Response) => {
    return res.status(404).json({ message: "API not found" });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof HttpException) {
        return ApiResponseHelper.error(res, err.message, err.status);
    }
    return ApiResponseHelper.error(res, err?.message || "Internal Server Error", 500);
});

export default app;

