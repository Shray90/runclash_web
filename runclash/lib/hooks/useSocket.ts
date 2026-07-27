"use client";

import { useEffect, useState, useCallback } from "react";
import { getSocket, disconnectSocket } from "../socket";
import { useAuth } from "../contexts/AuthContext";

export const useSocket = () => {
    const [isConnected, setIsConnected] = useState(false);
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        if (!isAuthenticated) {
            disconnectSocket();
            setIsConnected(false);
            return;
        }

        const socket = getSocket();
        if (!socket) return;

        const onConnect = () => setIsConnected(true);
        const onDisconnect = () => setIsConnected(false);

        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);

        if (socket.connected) {
            setIsConnected(true);
        }

        return () => {
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
        };
    }, [isAuthenticated]);

    return { isConnected };
};

export const useNotifications = () => {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const socket = getSocket();
        if (!socket) return;

        const handler = (data: any) => {
            setNotifications((prev) => [data, ...prev]);
            setUnreadCount((prev) => prev + 1);
        };

        socket.on("notification:new", handler);
        return () => {
            socket.off("notification:new", handler);
        };
    }, []);

    return { notifications, unreadCount, setUnreadCount, setNotifications };
};

export const useLeaderboardUpdates = () => {
    const [update, setUpdate] = useState<any>(null);

    useEffect(() => {
        const socket = getSocket();
        if (!socket) return;

        const handler = (data: any) => setUpdate(data);
        socket.on("leaderboard:updated", handler);
        return () => {
            socket.off("leaderboard:updated", handler);
        };
    }, []);

    return update;
};

export const useTerritoryUpdates = () => {
    const [update, setUpdate] = useState<any>(null);

    useEffect(() => {
        const socket = getSocket();
        if (!socket) return;

        const handler = (data: any) => setUpdate(data);
        socket.on("territory:global-update", handler);
        return () => {
            socket.off("territory:global-update", handler);
        };
    }, []);

    return update;
};

export const useTerritoryCapture = () => {
    const [captureEvent, setCaptureEvent] = useState<any>(null);

    useEffect(() => {
        const socket = getSocket();
        if (!socket) return;

        const handler = (data: any) => setCaptureEvent(data);
        socket.on("territory:captured", handler);
        return () => {
            socket.off("territory:captured", handler);
        };
    }, []);

    return captureEvent;
};

export const useTerritoryLost = () => {
    const [lostEvent, setLostEvent] = useState<any>(null);

    useEffect(() => {
        const socket = getSocket();
        if (!socket) return;

        const handler = (data: any) => setLostEvent(data);
        socket.on("territory:lost", handler);
        return () => {
            socket.off("territory:lost", handler);
        };
    }, []);

    return lostEvent;
};

export const useOnlineFriends = () => {
    const [onlineFriends, setOnlineFriends] = useState<string[]>([]);

    useEffect(() => {
        const socket = getSocket();
        if (!socket) return;

        const onOnline = (data: { userId: string }) => {
            setOnlineFriends((prev) => [...new Set([...prev, data.userId])]);
        };

        const onOffline = (data: { userId: string }) => {
            setOnlineFriends((prev) => prev.filter((id) => id !== data.userId));
        };

        socket.on("user:online", onOnline);
        socket.on("user:offline", onOffline);

        return () => {
            socket.off("user:online", onOnline);
            socket.off("user:offline", onOffline);
        };
    }, []);

    return onlineFriends;
};

export const useLocationBroadcast = () => {
    const broadcastLocation = useCallback((lat: number, lng: number) => {
        const socket = getSocket();
        if (socket) {
            socket.emit("location:update", { lat, lng });
        }
    }, []);

    return broadcastLocation;
};

