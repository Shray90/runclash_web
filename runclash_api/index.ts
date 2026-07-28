import http from "http";
import app from "./src/app";
import { connectToMongoDB } from "./src/database/mongodb";
import { PORT } from "./src/configs/constant";
import { initializeSocket } from "./src/socket";
import { ChallengeService } from "./src/services/challenge.service";
import { BadgeModel } from "./src/models/badge.model";
import { ChallengeModel } from "./src/models/challenge.model";

const server = http.createServer(app);

connectToMongoDB().then(async () => {
    // Seed default badges if none exist
    const existingBadges = await BadgeModel.countDocuments().exec();
    if (existingBadges === 0) {
        const badges = [
            { name: "First Run", description: "Complete your first run", icon: "👟", criteria: { type: "runs", value: 1 }, rarity: "common", color: "#6b7280", xpReward: 50, coinReward: 10 },
            { name: "Run 5 km", description: "Run a total of 5 km", icon: "🏃", criteria: { type: "distance", value: 5 }, rarity: "common", color: "#6b7280", xpReward: 50, coinReward: 10 },
            { name: "Run 10 km", description: "Run a total of 10 km", icon: "🏃‍♂️", criteria: { type: "distance", value: 10 }, rarity: "rare", color: "#3b82f6", xpReward: 100, coinReward: 25 },
            { name: "Run 50 km", description: "Run a total of 50 km", icon: "🏅", criteria: { type: "distance", value: 50 }, rarity: "epic", color: "#a855f7", xpReward: 250, coinReward: 100 },
            { name: "Run 100 km", description: "Run a total of 100 km", icon: "🏆", criteria: { type: "distance", value: 100 }, rarity: "legendary", color: "#eab308", xpReward: 500, coinReward: 250 },
            { name: "Territory Beginner", description: "Capture your first territory", icon: "🏁", criteria: { type: "territories", value: 1 }, rarity: "common", color: "#6b7280", xpReward: 50, coinReward: 10 },
            { name: "Territory Master", description: "Capture 10 territories", icon: "👑", criteria: { type: "territories", value: 10 }, rarity: "epic", color: "#a855f7", xpReward: 250, coinReward: 100 },
            { name: "Explorer", description: "Run 25 km in total", icon: "🧭", criteria: { type: "distance", value: 25 }, rarity: "rare", color: "#3b82f6", xpReward: 150, coinReward: 50 },
            { name: "Marathon Runner", description: "Run a total of 42.195 km", icon: "🎽", criteria: { type: "distance", value: 42.195 }, rarity: "epic", color: "#a855f7", xpReward: 300, coinReward: 150 },
            { name: "7-Day Streak", description: "Maintain a 7-day running streak", icon: "🔥", criteria: { type: "streak", value: 7 }, rarity: "rare", color: "#3b82f6", xpReward: 150, coinReward: 75 },
            { name: "30-Day Streak", description: "Maintain a 30-day running streak", icon: "💪", criteria: { type: "streak", value: 30 }, rarity: "legendary", color: "#eab308", xpReward: 500, coinReward: 250 },
        ];
        await BadgeModel.insertMany(badges);
        console.log(`Seeded ${badges.length} default badges`);
    }

    const existingChallenges = await ChallengeModel.countDocuments().exec();
    if (existingChallenges === 0) {
        const challengeService = new ChallengeService();
        await challengeService.generateDefaultChallenges();
        console.log("Seeded default challenges");
    }

    // Initialize Socket.IO
    initializeSocket(server);

    server.listen(PORT, () => {
        console.log(`Server: http://localhost:${PORT}`);
        console.log(`Socket.IO: ws://localhost:${PORT}`);
    });
}).catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
});

