import { Server as HTTPServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { SECRET_KEY } from "../configs/constant";
import { UserMongoRepository } from "../repositories/user.repository";

const userRepository = new UserMongoRepository();

let io: Server;

export const initializeSocket = (httpServer: HTTPServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
    });

    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth?.token || socket.handshake.query?.token;
            if (!token) {
                return next(new Error("Authentication required"));
            }

            const decoded = jwt.verify(token as string, SECRET_KEY) as { id: string };
            const user = await userRepository.getUserById(decoded.id);
            if (!user) {
                return next(new Error("User not found"));
            }

            (socket as any).user = user;
            next();
        } catch (error) {
            next(new Error("Invalid token"));
        }
    });

    io.on("connection", async (socket) => {
        const user = (socket as any).user;
        console.log(`User connected: ${user.username} (${socket.id})`);

        socket.join(`user:${user._id}`);

        await userRepository.update(user._id.toString(), { isOnline: true } as any);
        io.emit("user:online", { userId: user._id.toString(), username: user.username });

        socket.on("location:update", (data) => {
            socket.broadcast.emit("location:updated", {
                userId: user._id.toString(),
                lat: data.lat,
                lng: data.lng,
            });
        });

        socket.on("territory:join", (territoryId: string) => {
            socket.join(`territory:${territoryId}`);
        });

        socket.on("territory:leave", (territoryId: string) => {
            socket.leave(`territory:${territoryId}`);
        });

        socket.on("disconnect", async () => {
            console.log(`User disconnected: ${user.username} (${socket.id})`);
            await userRepository.update(user._id.toString(), {
                isOnline: false,
                lastActive: new Date(),
            } as any);
            io.emit("user:offline", { userId: user._id.toString(), username: user.username });
        });
    });

    return io;
};

export const getIO = (): Server => {
    if (!io) {
        throw new Error("Socket.IO not initialized");
    }
    return io;
};

export const emitToUser = (userId: string, event: string, data: any) => {
    if (io) {
        io.to(`user:${userId}`).emit(event, data);
    }
};

export const emitTerritoryUpdate = (territoryId: string, data: any) => {
    if (io) {
        io.to(`territory:${territoryId}`).emit("territory:updated", data);
        io.emit("territory:global-update", data);
    }
};

export const emitTerritoryCapture = (data: any) => {
    if (io) {
        io.emit("territory:captured", data);
        io.emit("territory:global-update", data);
    }
};

export const emitTerritoryLost = (userId: string, data: any) => {
    if (io) {
        io.to(`user:${userId}`).emit("territory:lost", data);
    }
};

export const emitLeaderboardUpdate = (data: any) => {
    if (io) {
        io.emit("leaderboard:updated", data);
    }
};

export const emitFriendStatus = (friendId: string, status: "online" | "offline") => {
    if (io) {
        io.to(`user:${friendId}`).emit("friend:status", { status });
    }
};

export const emitAchievementUnlock = (userId: string, data: any) => {
    if (io) {
        io.to(`user:${userId}`).emit("achievement:unlocked", data);
    }
};

export const emitChallengeComplete = (userId: string, data: any) => {
    if (io) {
        io.to(`user:${userId}`).emit("challenge:completed", data);
    }
};

export const emitFriendRequest = (userId: string, data: any) => {
    if (io) {
        io.to(`user:${userId}`).emit("friend:request", data);
    }
};

