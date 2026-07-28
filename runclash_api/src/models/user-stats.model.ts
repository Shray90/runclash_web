import mongoose, { Schema, Document } from "mongoose";

export interface IUserStats extends Document {
    userId: mongoose.Types.ObjectId;
    totalDistance: number;
    weeklyDistance: number;
    monthlyDistance: number;
    totalRuns: number;
    caloriesBurned: number;
    currentStreak: number;
    bestStreak: number;
    xp: number;
    level: number;
    territoriesCaptured: number;
    longestRun: number;
    fastestPace: number;
    lastRunDate: Date;
    createdAt: Date;
    updatedAt: Date;
}

const UserStatsSchema = new Schema<IUserStats>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
        totalDistance: { type: Number, default: 0 },
        weeklyDistance: { type: Number, default: 0 },
        monthlyDistance: { type: Number, default: 0 },
        totalRuns: { type: Number, default: 0 },
        caloriesBurned: { type: Number, default: 0 },
        currentStreak: { type: Number, default: 0 },
        bestStreak: { type: Number, default: 0 },
        xp: { type: Number, default: 0 },
        level: { type: Number, default: 1 },
        territoriesCaptured: { type: Number, default: 0 },
        longestRun: { type: Number, default: 0 },
        fastestPace: { type: Number, default: 0 },
        lastRunDate: { type: Date },
    },
    { timestamps: true }
);

UserStatsSchema.index({ userId: 1 });

export const UserStatsModel = mongoose.model<IUserStats>("UserStats", UserStatsSchema);