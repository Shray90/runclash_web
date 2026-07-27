import mongoose, { Schema, Document } from "mongoose";

export interface IGPSPoint {
    lat: number;
    lng: number;
    timestamp: Date;
    speed?: number;
    accuracy?: number;
}

export interface IPauseEntry {
    pausedAt: Date;
    resumedAt?: Date;
    duration: number;
}

export interface IRun extends Document {
    userId: mongoose.Types.ObjectId;
    startTime: Date;
    endTime?: Date;
    duration: number;
    distance: number;
    avgSpeed: number;
    pace: number;
    calories: number;
    status: "active" | "paused" | "finished" | "cancelled";
    route: IGPSPoint[];
    pauseHistory: IPauseEntry[];
    totalPauseDuration: number;
    createdAt: Date;
    updatedAt: Date;
}

const GPSPointSchema = new Schema<IGPSPoint>({
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now },
    speed: { type: Number },
    accuracy: { type: Number },
});

const PauseEntrySchema = new Schema<IPauseEntry>({
    pausedAt: { type: Date, required: true },
    resumedAt: { type: Date },
    duration: { type: Number, default: 0 },
});

const RunSchema = new Schema<IRun>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        startTime: { type: Date, required: true },
        endTime: { type: Date },
        duration: { type: Number, default: 0 },
        distance: { type: Number, default: 0 },
        avgSpeed: { type: Number, default: 0 },
        pace: { type: Number, default: 0 },
        calories: { type: Number, default: 0 },
        status: {
            type: String,
            enum: ["active", "paused", "finished", "cancelled"],
            default: "active",
        },
        route: [GPSPointSchema],
        pauseHistory: [PauseEntrySchema],
        totalPauseDuration: { type: Number, default: 0 },
    },
    { timestamps: true }
);

RunSchema.index({ userId: 1, startTime: -1 });

export const RunModel = mongoose.model<IRun>("Run", RunSchema);

