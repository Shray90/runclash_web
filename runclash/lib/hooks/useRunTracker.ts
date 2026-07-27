"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { startRun, getCurrentRun, addLocation, pauseRun, resumeRun, finishRun } from "../api/run";
import { sendLocationUpdate, sendHeartbeat } from "../socket";

interface GPSPoint {
    lat: number;
    lng: number;
    timestamp: number;
    speed?: number;
    accuracy?: number;
}

interface RunState {
    status: "idle" | "active" | "paused";
    runId: string | null;
    distance: number;
    duration: number;
    pace: number;
    avgSpeed: number;
    calories: number;
    route: GPSPoint[];
    startTime: Date | null;
    pausedAt: Date | null;
    totalPausedDuration: number;
    gpsAccuracy: number | null;
    lastLocationSent: number;
    autoPaused: boolean;
    offlineQueueSize: number;
}

interface OfflineQueueItem {
    point: GPSPoint;
    speed?: number;
    accuracy?: number;
    retries: number;
}

const LOCATION_SEND_INTERVAL_MS = 8000;
const AUTO_PAUSE_SPEED_THRESHOLD = 0.5;
const AUTO_PAUSE_DURATION_MS = 60000;
const HEARTBEAT_INTERVAL_MS = 30000;
const SPEED_SMOOTHING_WINDOW = 5;
const MAX_OFFLINE_QUEUE = 50;
const MAX_RETRIES = 3;

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
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

function simpleKalmanFilter(points: GPSPoint[]): GPSPoint[] {
    if (points.length < 3) return points;

    const smoothed: GPSPoint[] = [points[0]];
    const q = 0.01;
    const r = 0.1;
    let pLat = 1;
    let pLng = 1;
    let kLat = points[0].lat;
    let kLng = points[0].lng;

    for (let i = 1; i < points.length; i++) {
        const prev = smoothed[smoothed.length - 1];
        const dist = haversineDistance(prev.lat, prev.lng, points[i].lat, points[i].lng);

        if (dist > 100) {
            smoothed.push(points[i]);
            kLat = points[i].lat;
            kLng = points[i].lng;
            pLat = 1;
            pLng = 1;
            continue;
        }

        pLat = pLat + q;
        pLng = pLng + q;
        const kLatGain = pLat / (pLat + r);
        const kLngGain = pLng / (pLng + r);
        kLat = kLat + kLatGain * (points[i].lat - kLat);
        kLng = kLng + kLngGain * (points[i].lng - kLng);
        pLat = (1 - kLatGain) * pLat;
        pLng = (1 - kLngGain) * pLng;

        smoothed.push({
            lat: kLat,
            lng: kLng,
            timestamp: points[i].timestamp,
            speed: points[i].speed,
            accuracy: points[i].accuracy,
        });
    }

    return smoothed;
}

export const useRunTracker = () => {
    const [state, setState] = useState<RunState>({
        status: "idle",
        runId: null,
        distance: 0,
        duration: 0,
        pace: 0,
        avgSpeed: 0,
        calories: 0,
        route: [],
        startTime: null,
        pausedAt: null,
        totalPausedDuration: 0,
        gpsAccuracy: null,
        lastLocationSent: 0,
        autoPaused: false,
        offlineQueueSize: 0,
    });

    const watchIdRef = useRef<number | null>(null);
    const intervalRef = useRef<number | null>(null);
    const locationTimerRef = useRef<number | null>(null);
    const heartbeatTimerRef = useRef<number | null>(null);
    const autoPauseTimerRef = useRef<number | null>(null);
    const lastPositionRef = useRef<GPSPoint | null>(null);
    const mountedRef = useRef(true);
    const handlePositionUpdateRef = useRef<(position: GeolocationPosition) => void>(() => {});
    const offlineQueueRef = useRef<OfflineQueueItem[]>([]);
    const isOnlineRef = useRef(true);
    const speedBufferRef = useRef<number[]>([]);
    const autoPausedRef = useRef(false);
    const lowSpeedStartRef = useRef<number | null>(null);
    const buildHandlePositionUpdateRef = useRef<(position: GeolocationPosition) => void>(() => {});
    const attemptAutoPauseRef = useRef<(speed: number) => void>(() => {});
    const attemptAutoResumeRef = useRef<() => Promise<void>>(async () => Promise.resolve());
    const startLocationTimerRef = useRef<() => void>(() => {});
    const startHeartbeatRef = useRef<() => void>(() => {});

    const cleanup = useCallback(() => {
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }
        if (intervalRef.current !== null) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        if (locationTimerRef.current !== null) {
            clearInterval(locationTimerRef.current);
            locationTimerRef.current = null;
        }
        if (heartbeatTimerRef.current !== null) {
            clearInterval(heartbeatTimerRef.current);
            heartbeatTimerRef.current = null;
        }
        if (autoPauseTimerRef.current !== null) {
            clearTimeout(autoPauseTimerRef.current);
            autoPauseTimerRef.current = null;
        }
    }, []);

    const flushOfflineQueue = useCallback(async () => {
        if (!isOnlineRef.current || !state.runId || offlineQueueRef.current.length === 0) return;

        const queue = [...offlineQueueRef.current];
        offlineQueueRef.current = [];

        for (const item of queue) {
            if (item.retries >= MAX_RETRIES) continue;
            try {
                await addLocation({
                    runId: state.runId,
                    lat: item.point.lat,
                    lng: item.point.lng,
                    speed: item.speed,
                    accuracy: item.accuracy,
                });
                sendLocationUpdate({ lat: item.point.lat, lng: item.point.lng });
            } catch (err: unknown) {
                console.error("[useRunTracker] flushOfflineQueue item error:", err);
                item.retries += 1;
                offlineQueueRef.current.push(item);
            }
        }

        if (mountedRef.current) {
            setState((prev) => ({ ...prev, offlineQueueSize: offlineQueueRef.current.length }));
        }
    }, [state.runId]);

    const queueLocation = useCallback((point: GPSPoint, speed?: number, accuracy?: number) => {
        if (offlineQueueRef.current.length >= MAX_OFFLINE_QUEUE) {
            offlineQueueRef.current.shift();
        }
        offlineQueueRef.current.push({ point, speed, accuracy, retries: 0 });
        if (mountedRef.current) {
            setState((prev) => ({ ...prev, offlineQueueSize: offlineQueueRef.current.length }));
        }
    }, []);

    const processLocation = useCallback(async (point: GPSPoint, speed?: number, accuracy?: number) => {
        if (!state.runId) return;

        if (!isOnlineRef.current) {
            queueLocation(point, speed, accuracy);
            return;
        }

        try {
            await addLocation({
                runId: state.runId,
                lat: point.lat,
                lng: point.lng,
                speed,
                accuracy,
            });
            sendLocationUpdate({ lat: point.lat, lng: point.lng });
            if (mountedRef.current) {
                setState((prev) => ({ ...prev, lastLocationSent: Date.now() }));
            }
        } catch (err: unknown) {
            console.error("[useRunTracker] processLocation error:", err);
            queueLocation(point, speed, accuracy);
        }
    }, [state.runId, queueLocation]);

    const startLocationTimer = useCallback(() => {
        if (locationTimerRef.current) {
            clearInterval(locationTimerRef.current);
        }
        locationTimerRef.current = window.setInterval(() => {
            if (lastPositionRef.current && state.status === "active" && !autoPausedRef.current) {
                const elapsed = Date.now() - state.lastLocationSent;
                if (elapsed >= LOCATION_SEND_INTERVAL_MS) {
                    processLocation(lastPositionRef.current);
                }
            }
            flushOfflineQueue();
        }, 2000);
    }, [state.status, state.lastLocationSent, processLocation, flushOfflineQueue]);

    const startHeartbeat = useCallback(() => {
        if (heartbeatTimerRef.current) {
            clearInterval(heartbeatTimerRef.current);
        }
        heartbeatTimerRef.current = window.setInterval(() => {
            if (state.status === "active" && !autoPausedRef.current) {
                sendHeartbeat(state.runId || undefined);
            }
        }, HEARTBEAT_INTERVAL_MS);
    }, [state.status, state.runId]);

    const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
        return haversineDistance(lat1, lng1, lat2, lng2);
    };

    const calculateCalories = (distanceMeters: number): number => {
        return Math.round(distanceMeters * 0.035);
    };

    const getSmoothedSpeed = useCallback((rawSpeed?: number): number => {
        if (rawSpeed && rawSpeed > 0) {
            speedBufferRef.current.push(rawSpeed);
            if (speedBufferRef.current.length > SPEED_SMOOTHING_WINDOW) {
                speedBufferRef.current.shift();
            }
        }
        if (speedBufferRef.current.length === 0) return 0;
        const sum = speedBufferRef.current.reduce((a, b) => a + b, 0);
        return sum / speedBufferRef.current.length;
    }, []);

    const attemptAutoPause = useCallback((speed: number) => {
        if (autoPausedRef.current) return;
        if (state.status !== "active") return;

        if (speed < AUTO_PAUSE_SPEED_THRESHOLD) {
            if (lowSpeedStartRef.current === null) {
                lowSpeedStartRef.current = Date.now();
            } else if (Date.now() - lowSpeedStartRef.current >= AUTO_PAUSE_DURATION_MS) {
                autoPausedRef.current = true;
                lowSpeedStartRef.current = null;
                pauseRun(state.runId!).catch(() => {});
                cleanup();
                if (mountedRef.current) {
                    setState((prev) => ({ ...prev, status: "paused", pausedAt: new Date(), autoPaused: true }));
                }
            }
        } else {
            lowSpeedStartRef.current = null;
        }
    }, [state.status, state.runId, cleanup]);

    const attemptAutoResume = useCallback(async () => {
        if (!autoPausedRef.current) return;
        if (state.status !== "paused") return;
        if (!state.runId) return;

        try {
            await resumeRun(state.runId);
            autoPausedRef.current = false;
            lowSpeedStartRef.current = null;

            setState((prev) => {
                const pausedDuration = prev.pausedAt ? (Date.now() - prev.pausedAt.getTime()) / 1000 : 0;
                return { ...prev, status: "active", pausedAt: null, totalPausedDuration: prev.totalPausedDuration + pausedDuration, autoPaused: false };
            });

            const last = lastPositionRef.current;
            if (last) {
                const handler = buildHandlePositionUpdateRef.current;
                handlePositionUpdateRef.current = handler;

                watchIdRef.current = navigator.geolocation.watchPosition(
                    handler,
                    (err) => console.error("GPS error:", err),
                    { enableHighAccuracy: true, distanceFilter: 5, timeout: 10000 } as PositionOptions
                );
            }

            intervalRef.current = window.setInterval(() => {
                if (!mountedRef.current) return;
                setState((prev) => {
                    if (prev.status !== "active" || !prev.startTime) return prev;
                    const elapsed = (Date.now() - prev.startTime.getTime()) / 1000 - prev.totalPausedDuration;
                    return { ...prev, duration: Math.max(0, elapsed) };
                });
            }, 1000);

            startLocationTimerRef.current();
            startHeartbeatRef.current();
        } catch (err: unknown) {
            console.error("[useRunTracker] attemptAutoResume error:", err);
        }
    }, [state.status, state.runId, buildHandlePositionUpdateRef, startLocationTimerRef, startHeartbeatRef]);

    const buildHandlePositionUpdate = useCallback((currentStatus: "idle" | "active" | "paused") => {
        return (position: GeolocationPosition) => {
            if (!mountedRef.current || currentStatus !== "active") return;

            const { latitude, longitude, speed, accuracy } = position.coords;
            const smoothedSpeed = getSmoothedSpeed(speed ?? undefined);

            if (smoothedSpeed > AUTO_PAUSE_SPEED_THRESHOLD && autoPausedRef.current) {
                attemptAutoResumeRef.current();
            }

            const point: GPSPoint = {
                lat: latitude,
                lng: longitude,
                timestamp: Date.now(),
                speed: smoothedSpeed,
                accuracy,
            };

            setState((prev) => {
                if (prev.status !== "active") return prev;

                let newDistance = prev.distance;
                if (lastPositionRef.current) {
                    const segmentDistance = calculateDistance(
                        lastPositionRef.current.lat,
                        lastPositionRef.current.lng,
                        point.lat,
                        point.lng
                    );
                    if (segmentDistance > 1) {
                        newDistance += segmentDistance;
                    }
                }

                const elapsedSeconds = (Date.now() - (prev.startTime?.getTime() || Date.now())) / 1000;
                const newDuration = elapsedSeconds;
                const newAvgSpeed = newDuration > 0 ? (newDistance / 1000) / (newDuration / 3600) : 0;
                const newPace = newDistance > 0 ? (newDuration / 60) / (newDistance / 1000) : 0;
                const newCalories = calculateCalories(newDistance);

                lastPositionRef.current = point;

                if (smoothedSpeed < AUTO_PAUSE_SPEED_THRESHOLD) {
                    attemptAutoPauseRef.current(smoothedSpeed);
                }

                processLocation(point, smoothedSpeed, accuracy);

                return {
                    ...prev,
                    distance: newDistance,
                    duration: newDuration,
                    avgSpeed: newAvgSpeed,
                    pace: newPace,
                    calories: newCalories,
                    route: [...prev.route, point],
                    gpsAccuracy: accuracy || prev.gpsAccuracy,
                };
            });
        };
    }, [getSmoothedSpeed, processLocation]);

    useEffect(() => {
        buildHandlePositionUpdateRef.current = buildHandlePositionUpdate("active");
        attemptAutoPauseRef.current = attemptAutoPause;
        attemptAutoResumeRef.current = attemptAutoResume;
        startLocationTimerRef.current = startLocationTimer;
        startHeartbeatRef.current = startHeartbeat;
    }, [buildHandlePositionUpdate, attemptAutoPause, attemptAutoResume, startLocationTimer, startHeartbeat]);

    const startRunHandler = useCallback(async () => {
        try {
            const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 15000,
                    maximumAge: 0,
                });
            });

            const { latitude, longitude, speed } = pos.coords;
            const res = await startRun({ startLat: latitude, startLng: longitude });
            if (!res.success) throw new Error(res.message);

            const run = res.data;
            const now = Date.now();

            if (!mountedRef.current) return;
            setState({
                status: "active",
                runId: run._id,
                distance: 0,
                duration: 0,
                pace: 0,
                avgSpeed: 0,
                calories: 0,
                route: [{ lat: latitude, lng: longitude, timestamp: now, speed: speed || undefined, accuracy: pos.coords.accuracy ?? undefined }],
                startTime: new Date(now),
                pausedAt: null,
                totalPausedDuration: 0,
                gpsAccuracy: pos.coords.accuracy || null,
                lastLocationSent: now,
                autoPaused: false,
                offlineQueueSize: 0,
            });

            lastPositionRef.current = { lat: latitude, lng: longitude, timestamp: now, speed: speed || undefined, accuracy: pos.coords.accuracy ?? undefined };
            speedBufferRef.current = speed && speed > 0 ? [speed] : [];
            autoPausedRef.current = false;
            lowSpeedStartRef.current = null;

            handlePositionUpdateRef.current = buildHandlePositionUpdateRef.current;

            watchIdRef.current = navigator.geolocation.watchPosition(
                buildHandlePositionUpdateRef.current,
                (err) => console.error("GPS error:", err),
                { enableHighAccuracy: true, distanceFilter: 5, timeout: 10000 } as PositionOptions
            );

            intervalRef.current = window.setInterval(() => {
                if (!mountedRef.current) return;
                setState((prev) => {
                    if (prev.status !== "active" || !prev.startTime) return prev;
                    const elapsed = (Date.now() - prev.startTime.getTime()) / 1000 - prev.totalPausedDuration;
                    return { ...prev, duration: Math.max(0, elapsed) };
                });
            }, 1000);

            startLocationTimerRef.current();
            startHeartbeatRef.current();
        } catch (err: unknown) {
            const geoError = err as GeolocationPositionError;
            if (geoError.code === 1) {
                throw new Error("Location permission denied. Please enable location access.");
            }
            if (geoError.code === 2) {
                throw new Error("Location unavailable. Please check your GPS settings.");
            }
            if (geoError.code === 3) {
                throw new Error("Location request timed out. Please try again.");
            }
            throw new Error((err as Error).message || "Failed to start run");
        }
    }, []);

    const pauseRunHandler = useCallback(async () => {
        if (!state.runId) return;
        try {
            await pauseRun(state.runId);
            cleanup();
            autoPausedRef.current = false;
            lowSpeedStartRef.current = null;
            setState((prev) => ({ ...prev, status: "paused", pausedAt: new Date(), autoPaused: false }));
        } catch (err: unknown) {
            throw new Error((err as Error).message || "Failed to pause run");
        }
    }, [state.runId, cleanup]);

    const resumeRunHandler = useCallback(async () => {
        if (!state.runId) return;
        try {
            await resumeRun(state.runId);
            setState((prev) => {
                const pausedDuration = prev.pausedAt ? (Date.now() - prev.pausedAt.getTime()) / 1000 : 0;
                return { ...prev, status: "active", pausedAt: null, totalPausedDuration: prev.totalPausedDuration + pausedDuration, autoPaused: false };
            });

            const last = lastPositionRef.current;
            if (last) {
                const handler = buildHandlePositionUpdateRef.current;
                handlePositionUpdateRef.current = handler;

                watchIdRef.current = navigator.geolocation.watchPosition(
                    handler,
                    (err) => console.error("GPS error:", err),
                    { enableHighAccuracy: true, distanceFilter: 5, timeout: 10000 } as PositionOptions
                );
            }

            intervalRef.current = window.setInterval(() => {
                if (!mountedRef.current) return;
                setState((prev) => {
                    if (prev.status !== "active" || !prev.startTime) return prev;
                    const elapsed = (Date.now() - prev.startTime.getTime()) / 1000 - prev.totalPausedDuration;
                    return { ...prev, duration: Math.max(0, elapsed) };
                });
            }, 1000);

            startLocationTimerRef.current();
            startHeartbeatRef.current();
            autoPausedRef.current = false;
            lowSpeedStartRef.current = null;
        } catch (err: unknown) {
            throw new Error((err as Error).message || "Failed to resume run");
        }
    }, [state.runId, buildHandlePositionUpdateRef, startLocationTimerRef, startHeartbeatRef]);

    const stopRunHandler = useCallback(async () => {
        if (!state.runId) return;
        try {
            await finishRun({
                runId: state.runId,
                distance: state.distance,
                duration: state.duration,
                avgSpeed: state.avgSpeed,
                pace: state.pace,
                calories: state.calories,
            });

            cleanup();

            setState({
                status: "idle",
                runId: null,
                distance: 0,
                duration: 0,
                pace: 0,
                avgSpeed: 0,
                calories: 0,
                route: [],
                startTime: null,
                pausedAt: null,
                totalPausedDuration: 0,
                gpsAccuracy: null,
                lastLocationSent: 0,
                autoPaused: false,
                offlineQueueSize: 0,
            });
            lastPositionRef.current = null;
            offlineQueueRef.current = [];
            speedBufferRef.current = [];
            autoPausedRef.current = false;
            lowSpeedStartRef.current = null;
        } catch (err: unknown) {
            throw new Error((err as Error).message || "Failed to finish run");
        }
    }, [state, cleanup]);

    useEffect(() => {
        const handleOnline = () => {
            isOnlineRef.current = true;
            flushOfflineQueue();
        };
        const handleOffline = () => {
            isOnlineRef.current = false;
        };

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);
        isOnlineRef.current = navigator.onLine;

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, [flushOfflineQueue]);

    useEffect(() => {
        const checkActive = async () => {
            try {
                const res = await getCurrentRun();
                if (res.success && res.data) {
                    const run = res.data;
                    const totalPausedDuration = run.pauseHistory?.reduce((sum: number, p: { duration?: number }) => sum + (p.duration || 0), 0) || 0;
                    if (mountedRef.current) {
                        setState({
                            status: run.status === "paused" ? "paused" : "active",
                            runId: run._id,
                            distance: run.distance || 0,
                            duration: run.duration || 0,
                            pace: run.pace || 0,
                            avgSpeed: run.avgSpeed || 0,
                            calories: run.calories || 0,
                            route: run.route || [],
                            startTime: new Date(run.startTime),
                            pausedAt: run.status === "paused" ? new Date() : null,
                            totalPausedDuration,
                            gpsAccuracy: null,
                            lastLocationSent: Date.now(),
                            autoPaused: false,
                            offlineQueueSize: 0,
                        });
                    }

                    if (run.status === "active") {
                        const lastPoint = run.route?.[run.route.length - 1];
                        if (lastPoint) {
                            lastPositionRef.current = {
                                lat: lastPoint.lat,
                                lng: lastPoint.lng,
                                timestamp: lastPoint.timestamp?.getTime?.() || Date.now(),
                                speed: (lastPoint as { speed?: number }).speed,
                                accuracy: (lastPoint as { accuracy?: number }).accuracy,
                            };
                        }

                        const handler = buildHandlePositionUpdateRef.current;
                        handlePositionUpdateRef.current = handler;

                        watchIdRef.current = navigator.geolocation.watchPosition(
                            handler,
                            (err) => console.error("GPS error:", err),
                            { enableHighAccuracy: true, distanceFilter: 5, timeout: 10000 } as PositionOptions
                        );

                        intervalRef.current = window.setInterval(() => {
                            if (!mountedRef.current) return;
                            setState((prev) => {
                                if (prev.status !== "active" || !prev.startTime) return prev;
                                const elapsed = (Date.now() - prev.startTime.getTime()) / 1000 - prev.totalPausedDuration;
                                return { ...prev, duration: Math.max(0, elapsed) };
                            });
                        }, 1000);

                        startLocationTimerRef.current();
                        startHeartbeatRef.current();
                    }
                }
            } catch (err: unknown) {
                console.error("[useRunTracker] checkActive error:", err);
            }
        };
        checkActive();

        return () => {
            mountedRef.current = false;
            cleanup();
        };
    }, [cleanup, buildHandlePositionUpdateRef, startLocationTimerRef, startHeartbeatRef]);

    return {
        ...state,
        smoothedRoute: simpleKalmanFilter(state.route),
        startRun: startRunHandler,
        pauseRun: pauseRunHandler,
        resumeRun: resumeRunHandler,
        stopRun: stopRunHandler,
    };
};
