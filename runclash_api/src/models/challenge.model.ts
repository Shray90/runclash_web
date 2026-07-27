import mongoose, { Schema, Document } from "mongoose";

export interface IChallenge extends Document {
    title: string;
    description: string;
    type: "distance" | "runs" | "territories" | "streak" | "speed" | "calories" | "marathon";
    goal: number;
    reward: {
        xp: number;
        coins: number;
        badgeId?: mongoose.Types.ObjectId;
    };
    startDate: Date;
    endDate: Date;
    isActive: boolean;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const ChallengeSchema = new Schema<IChallenge>(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        type: {
            type: String,
            enum: ["distance", "runs", "territories", "streak", "speed", "calories", "marathon"],
            required: true,
        },
        goal: { type: Number, required: true },
        reward: {
            xp: { type: Number, default: 100 },
            coins: { type: Number, default: 50 },
            badgeId: { type: Schema.Types.ObjectId, ref: "Badge" },
        },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        isActive: { type: Boolean, default: true },
        createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    },
    { timestamps: true }
);

ChallengeSchema.index({ isActive: 1, endDate: 1 });

export const ChallengeModel = mongoose.model<IChallenge>("Challenge", ChallengeSchema);

