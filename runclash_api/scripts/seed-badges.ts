import mongoose from "mongoose";
import { BadgeModel } from "../src/models/badge.model";
import { ChallengeModel } from "../src/models/challenge.model";
import { MONGODB_URL } from "../src/configs/constant";

const seedBadges = async () => {
    await mongoose.connect(MONGODB_URL);
    console.log("Connected to MongoDB");

    const existingBadges = await BadgeModel.countDocuments().exec();
    if (existingBadges > 0) {
        console.log(`Badges already exist (${existingBadges}). Skipping badge seed.`);
    } else {
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
        console.log(`Seeded ${badges.length} badges`);
    }

    const existingChallenges = await ChallengeModel.countDocuments().exec();
    if (existingChallenges > 0) {
        console.log(`Challenges already exist (${existingChallenges}). Skipping challenge seed.`);
    } else {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
        const startOfWeek = new Date(now.getTime() - now.getDay() * 24 * 60 * 60 * 1000);
        const endOfWeek = new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000);
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

        const challenges = [
            { title: "Daily Runner", description: "Run 5 km today", type: "distance", goal: 5, reward: { xp: 50, coins: 25 }, startDate: startOfDay, endDate: endOfDay, createdBy: new mongoose.Types.ObjectId(), isActive: true },
            { title: "Weekly Warrior", description: "Run 25 km this week", type: "distance", goal: 25, reward: { xp: 200, coins: 100 }, startDate: startOfWeek, endDate: endOfWeek, createdBy: new mongoose.Types.ObjectId(), isActive: true },
            { title: "Monthly Marathon", description: "Run 100 km this month", type: "distance", goal: 100, reward: { xp: 500, coins: 250 }, startDate: startOfMonth, endDate: endOfMonth, createdBy: new mongoose.Types.ObjectId(), isActive: true },
            { title: "Consistency King", description: "Maintain a 7-day streak", type: "streak", goal: 7, reward: { xp: 150, coins: 75 }, startDate: startOfDay, endDate: endOfMonth, createdBy: new mongoose.Types.ObjectId(), isActive: true },
            { title: "Territory Conqueror", description: "Capture 3 territories", type: "territories", goal: 3, reward: { xp: 100, coins: 50 }, startDate: startOfDay, endDate: endOfWeek, createdBy: new mongoose.Types.ObjectId(), isActive: true },
        ];

        await ChallengeModel.insertMany(challenges);
        console.log(`Seeded ${challenges.length} challenges`);
    }

    await mongoose.disconnect();
    console.log("Seed completed. Disconnected from MongoDB.");
    process.exit(0);
};

seedBadges().catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
});
