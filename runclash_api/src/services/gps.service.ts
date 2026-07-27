import { GPSLocationModel } from "../models/gps-location.model";
import { RunModel, IRun } from "../models/run.model";
import { HttpException } from "../exceptions/http-exception";
import mongoose from "mongoose";

interface GPSPoint {
    lat: number;
    lng: number;
    speed?: number;
    accuracy?: number;
    timestamp: Date;
}

const MAX_LOCATION_ACCURACY_METERS = 50;
const MIN_DISTANCE_METERS = 3;
const MAX_DISTANCE_METERS = 100;
const ROUTE_COMPRESSION_THRESHOLD_METERS = 5;

export class GPSService {
    shouldAcceptLocation(accuracy: number | undefined): boolean {
        if (accuracy === undefined || accuracy === null) return true;
        return accuracy <= MAX_LOCATION_ACCURACY_METERS;
    }

    shouldStoreRoutePoint(
        previousPoint: GPSPoint | null,
        currentLat: number,
        currentLng: number
    ): boolean {
        if (!previousPoint) return true;
        const distance = this.haversineDistance(
            previousPoint.lat,
            previousPoint.lng,
            currentLat,
            currentLng
        );
        return distance >= ROUTE_COMPRESSION_THRESHOLD_METERS;
    }

    isDistanceValid(distanceMeters: number): boolean {
        return distanceMeters > MIN_DISTANCE_METERS && distanceMeters < MAX_DISTANCE_METERS;
    }

    async recordLocation(
        userId: string,
        runId: string,
        lat: number,
        lng: number,
        speed?: number,
        accuracy?: number,
        altitude?: number
    ): Promise<IRun | null> {
        if (!this.shouldAcceptLocation(accuracy)) {
            return null;
        }

        const run = await RunModel.findOne({ _id: runId, userId, status: "active" });
        if (!run) throw new HttpException(400, "No active run found");

        const previousRoutePoint = run.route.length > 0 ? run.route[run.route.length - 1] : null;

        if (!this.shouldStoreRoutePoint(previousRoutePoint, lat, lng)) {
            return run;
        }

        const newPoint: GPSPoint = { lat, lng, speed, accuracy, timestamp: new Date() };
        run.route.push(newPoint);

        const elapsedSeconds = this.getElapsedSeconds(run);
        run.duration = elapsedSeconds;

        if (run.route.length >= 2) {
            const lastPoint = run.route[run.route.length - 2];
            const currentPoint = run.route[run.route.length - 1];
            const segmentDistance = this.haversineDistance(lastPoint.lat, lastPoint.lng, currentPoint.lat, currentPoint.lng);

            if (this.isDistanceValid(segmentDistance)) {
                run.distance += segmentDistance;
            }
        }

        run.avgSpeed = run.duration > 0 ? (run.distance / 1000) / (run.duration / 3600) : 0;
        run.pace = run.distance > 0 ? (run.duration / 60) / (run.distance / 1000) : 0;
        run.calories = this.calculateCalories(run.distance);

        await run.save();

        await GPSLocationModel.create({
            userId: new mongoose.Types.ObjectId(userId),
            runId: new mongoose.Types.ObjectId(runId),
            coordinates: [lng, lat],
            timestamp: new Date(),
            speed,
            accuracy,
            altitude,
        });

        return run;
    }

    async recordInitialLocation(
        userId: string,
        runId: string,
        lat: number,
        lng: number
    ): Promise<void> {
        await GPSLocationModel.create({
            userId: new mongoose.Types.ObjectId(userId),
            runId: new mongoose.Types.ObjectId(runId),
            coordinates: [lng, lat],
            timestamp: new Date(),
        });
    }

    calculateCalories(distanceMeters: number): number {
        return Math.round(distanceMeters * 0.035);
    }

    calculateXP(distanceMeters: number, calories: number): number {
        const distanceXP = distanceMeters * 0.02;
        const caloriesXP = calories * 0.2;
        return Math.round(10 + distanceXP + caloriesXP);
    }

    calculateLevel(xp: number): number {
        return Math.floor(Math.sqrt(xp / 100)) + 1;
    }

    haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
        const R = 6371000;
        const toRad = (deg: number) => (deg * Math.PI) / 180;
        const dLat = toRad(lat2 - lat1);
        const dLng = toRad(lng2 - lng1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    recalculateRunStats(run: IRun): IRun {
        if (run.route.length >= 2) {
            let totalDistance = 0;
            for (let i = 1; i < run.route.length; i++) {
                const prev = run.route[i - 1];
                const curr = run.route[i];
                const segmentDistance = this.haversineDistance(prev.lat, prev.lng, curr.lat, curr.lng);
                if (this.isDistanceValid(segmentDistance)) {
                    totalDistance += segmentDistance;
                }
            }
            run.distance = totalDistance;
        }

        run.avgSpeed = run.duration > 0 ? (run.distance / 1000) / (run.duration / 3600) : 0;
        run.pace = run.distance > 0 ? (run.duration / 60) / (run.distance / 1000) : 0;
        run.calories = this.calculateCalories(run.distance);

        return run;
    }

    private getElapsedSeconds(run: IRun): number {
        return (Date.now() - new Date(run.startTime).getTime()) / 1000 - run.totalPauseDuration;
    }
}