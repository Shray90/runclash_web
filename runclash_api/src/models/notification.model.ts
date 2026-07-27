import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
    userId: mongoose.Types.ObjectId;
    type: "friend_request" | "friend_accepted" | "territory_captured" | "territory_lost" | "challenge_completed" | "challenge_received" | "level_up" | "leaderboard_promotion" | "achievement_unlocked" | "badge_earned" | "run_completed" | "system";
    title: string;
    message: string;
    data?: Record<string, any>;
    read: boolean;
    readAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        type: {
            type: String,
            enum: [
                "friend_request", "friend_accepted", "territory_captured", "territory_lost",
                "challenge_completed", "challenge_received", "level_up", "leaderboard_promotion",
                "achievement_unlocked", "badge_earned", "run_completed", "system"
            ],
            required: true,
        },
        title: { type: String, required: true },
        message: { type: String, required: true },
        data: { type: Schema.Types.Mixed },
        read: { type: Boolean, default: false },
        readAt: { type: Date },
    },
    { timestamps: true }
);

NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

export const NotificationModel = mongoose.model<INotification>("Notification", NotificationSchema);

