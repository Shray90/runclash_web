"use client";

import { io, Socket } from "socket.io-client";
import { getTokenCookie } from "./cookies-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:8089";

let socket: Socket | null = null;

export const getSocket = (): Socket | null => {
    if (typeof window === "undefined") return null;

    if (!socket || !socket.connected) {
        const token = getTokenCookie();
        if (!token) return null;

        socket = io(SOCKET_URL, {
            auth: { token },
            transports: ["websocket", "polling"],
        });

        socket.on("connect", () => {
            console.log("Socket connected:", socket?.id);
        });

        socket.on("disconnect", (reason) => {
            console.log("Socket disconnected:", reason);
        });

        socket.on("connect_error", (error) => {
            console.error("Socket connection error:", error.message);
        });
    }

    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

export const joinTerritoryRoom = (territoryId: string) => {
    const s = getSocket();
    if (s) {
        s.emit("territory:join", territoryId);
    }
};

export const leaveTerritoryRoom = (territoryId: string) => {
    const s = getSocket();
    if (s) {
        s.emit("territory:leave", territoryId);
    }
};

export const sendLocationUpdate = (data: { lat: number; lng: number }) => {
    const s = getSocket();
    if (s) {
        s.emit("location:update", data);
    }
};

export const sendHeartbeat = (runId?: string) => {
    const s = getSocket();
    if (s) {
        s.emit("heartbeat", { runId, timestamp: Date.now() });
    }
};

