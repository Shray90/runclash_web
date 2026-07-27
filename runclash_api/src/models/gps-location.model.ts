import mongoose, { Schema, Document } from "mongoose";

export interface IGPSLocation extends Document {
    userId: mongoose.Types.ObjectId;
    runId: mongoose.Types.ObjectId;
    coordinates: [number, number]; // [lng, lat]
    timestamp: Date;
    speed?: number;
    accuracy?: number;
    altitude?: number;
    createdAt: Date;
}

const GPSLocationSchema = new Schema<IGPSLocation>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        runId: { type: Schema.Types.ObjectId, ref: "Run", required: true, index: true },
        coordinates: {
            type: [Number],
            required: true,
            validate: {
                validator: function (v: number[]) {
                    return v.length === 2;
                },
                message: "Coordinates must be [lng, lat]",
            },
        },
        timestamp: { type: Date, default: Date.now },
        speed: { type: Number },
        accuracy: { type: Number },
        altitude: { type: Number },
    },
    { timestamps: true }
);

GPSLocationSchema.index({ userId: 1, runId: 1, timestamp: 1 });
GPSLocationSchema.index({ coordinates: "2dsphere" });

export const GPSLocationModel = mongoose.model<IGPSLocation>("GPSLocation", GPSLocationSchema);

