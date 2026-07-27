import mongoose, { Schema, Document } from "mongoose";

export interface IAchievement extends Document {
    userId: mongoose.Types.ObjectId;
    badgeId: mongoose.Types.ObjectId;
    progress: number; // 0-100
    completed: boolean;
    completedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const AchievementSchema = new Schema<IAchievement>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        badgeId: { type: Schema.Types.ObjectId, ref: "Badge", required: true },
        progress: { type: Number, default: 0, min: 0, max: 100 },
        completed: { type: Boolean, default: false },
        completedAt: { type: Date },
    },
    { timestamps: true }
);

AchievementSchema.index({ userId: 1, badgeId: 1 }, { unique: true });

export const AchievementModel = mongoose.model<IAchievement>("Achievement", AchievementSchema);

