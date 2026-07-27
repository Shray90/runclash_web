import mongoose, { Schema, Document } from "mongoose";

export interface ICaptureHistory {
    userId: mongoose.Types.ObjectId;
    capturedAt: Date;
    duration: number;
    distance: number;
}

export interface ITerritory extends Document {
    name: string;
    polygon?: [number, number][];
    center: {
        type: "Point";
        coordinates: [number, number];
    };
    radius: number;
    owner?: mongoose.Types.ObjectId;
    capturedBy?: mongoose.Types.ObjectId;
    captureProgress: number;
    xpReward: number;
    coinReward: number;
    totalCaptures: number;
    pointsRequired: number;
    color: string;
    icon: string;
    captureHistory: ICaptureHistory[];
    lastCaptured?: Date;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const CaptureHistorySchema = new Schema<ICaptureHistory>({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    capturedAt: { type: Date, default: Date.now },
    duration: { type: Number, default: 0 },
    distance: { type: Number, default: 0 },
});

const TerritorySchema = new Schema<ITerritory>(
    {
        name: { type: String, required: true },
        polygon: {
            type: mongoose.Schema.Types.Mixed,
            default: null,
            validate: {
                validator: function (v: number[][][]) {
                    return v && v.length > 0 && v[0].length >= 4;
                },
                message: "Polygon must have at least 4 coordinate pairs",
            },
        },
        center: {
            type: { type: String, enum: ["Point"], default: "Point" },
            coordinates: {
                type: [Number],
                required: true,
                validate: {
                    validator: function (v: number[]) {
                        return v.length === 2;
                    },
                    message: "Center must be [lng, lat]",
                },
            },
        },
        radius: { type: Number, required: true, default: 500 },
        owner: { type: Schema.Types.ObjectId, ref: "User", default: null },
        capturedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
        captureProgress: { type: Number, default: 0, min: 0, max: 100 },
        xpReward: { type: Number, default: 100 },
        coinReward: { type: Number, default: 50 },
        totalCaptures: { type: Number, default: 0 },
        pointsRequired: { type: Number, default: 100 },
        color: { type: String, default: "#ef4444" },
        icon: { type: String, default: "🏁" },
        captureHistory: [CaptureHistorySchema],
        lastCaptured: { type: Date, default: null },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

TerritorySchema.index({ center: "2dsphere" });
TerritorySchema.index({ owner: 1 });
TerritorySchema.index({ capturedBy: 1 });

export const TerritoryModel = mongoose.model<ITerritory>("Territory", TerritorySchema);

