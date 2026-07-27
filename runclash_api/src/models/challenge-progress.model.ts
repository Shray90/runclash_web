import mongoose, { Schema, Document } from "mongoose";

export interface IChallengeProgress extends Document {
    userId: mongoose.Types.ObjectId;
    challengeId: mongoose.Types.ObjectId;
    progress: number;
    completed: boolean;
    completedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const ChallengeProgressSchema = new Schema<IChallengeProgress>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        challengeId: { type: Schema.Types.ObjectId, ref: "Challenge", required: true },
        progress: { type: Number, default: 0 },
        completed: { type: Boolean, default: false },
        completedAt: { type: Date },
    },
    { timestamps: true }
);

ChallengeProgressSchema.index({ userId: 1, challengeId: 1 }, { unique: true });

export const ChallengeProgressModel = mongoose.model<IChallengeProgress>("ChallengeProgress", ChallengeProgressSchema);

