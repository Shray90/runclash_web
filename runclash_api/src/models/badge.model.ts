import mongoose, { Schema, Document } from "mongoose";

export interface IBadge extends Document {
    name: string;
    description: string;
    icon: string;
    criteria: {
        type: "distance" | "runs" | "territories" | "streak" | "speed" | "calories" | "challenges" | "custom";
        value: number;
    };
    rarity: "common" | "rare" | "epic" | "legendary";
    color: string;
    xpReward: number;
    coinReward: number;
    createdAt: Date;
    updatedAt: Date;
}

const BadgeSchema = new Schema<IBadge>(
    {
        name: { type: String, required: true },
        description: { type: String, required: true },
        icon: { type: String, required: true, default: "🏅" },
        criteria: {
            type: { type: String, enum: ["distance", "runs", "territories", "streak", "speed", "calories", "challenges", "custom"], required: true },
            value: { type: Number, required: true },
        },
        rarity: {
            type: String,
            enum: ["common", "rare", "epic", "legendary"],
            default: "common",
        },
        color: { type: String, default: "#6b7280" },
        xpReward: { type: Number, default: 50 },
        coinReward: { type: Number, default: 10 },
    },
    { timestamps: true }
);

export const BadgeModel = mongoose.model<IBadge>("Badge", BadgeSchema);

