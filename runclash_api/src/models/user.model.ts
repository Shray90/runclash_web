import mongoose, { Schema, Document } from "mongoose";

export interface IUserSettings {
    darkMode: boolean;
    locationPermissions: boolean;
    notificationPreferences: {
        friendRequests: boolean;
        territoryUpdates: boolean;
        challenges: boolean;
        achievements: boolean;
        leaderboard: boolean;
        runs: boolean;
    };
    language: string;
    privacy: {
        showProfile: boolean;
        showStats: boolean;
        showLocation: boolean;
    };
}

export interface IUser extends Document {
    _id: mongoose.Types.ObjectId;
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    password: string;
    role: "admin" | "user";
    profileImage?: string;
    bio?: string;
    level: number;
    xp: number;
    coins: number;
    totalDistance: number;
    weeklyDistance: number;
    monthlyDistance: number;
    longestRun: number;
    fastestPace: number;
    currentStreak: number;
    bestStreak: number;
    territoriesCaptured: number;
    totalRuns: number;
    totalCalories: number;
    achievements: mongoose.Types.ObjectId[];
    badges: mongoose.Types.ObjectId[];
    friends: mongoose.Types.ObjectId[];
    friendsCount: number;
    followersCount: number;
    settings: IUserSettings;
    lastActive?: Date;
    isOnline: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const UserSettingsSchema = new Schema<IUserSettings>({
    darkMode: { type: Boolean, default: false },
    locationPermissions: { type: Boolean, default: true },
    notificationPreferences: {
        friendRequests: { type: Boolean, default: true },
        territoryUpdates: { type: Boolean, default: true },
        challenges: { type: Boolean, default: true },
        achievements: { type: Boolean, default: true },
        leaderboard: { type: Boolean, default: true },
        runs: { type: Boolean, default: true },
    },
    language: { type: String, default: "en" },
    privacy: {
        showProfile: { type: Boolean, default: true },
        showStats: { type: Boolean, default: true },
        showLocation: { type: Boolean, default: false },
    },
});

const UserMongoSchema = new Schema<IUser>(
    {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        username: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: { type: String, enum: ["admin", "user"], default: "user" },
        profileImage: { type: String },
        bio: { type: String, maxlength: 500 },
        level: { type: Number, default: 1 },
        xp: { type: Number, default: 0 },
        coins: { type: Number, default: 0 },
        totalDistance: { type: Number, default: 0 },
        weeklyDistance: { type: Number, default: 0 },
        monthlyDistance: { type: Number, default: 0 },
        longestRun: { type: Number, default: 0 },
        fastestPace: { type: Number, default: 0 },
        currentStreak: { type: Number, default: 0 },
        bestStreak: { type: Number, default: 0 },
        territoriesCaptured: { type: Number, default: 0 },
        totalRuns: { type: Number, default: 0 },
        totalCalories: { type: Number, default: 0 },
        achievements: [{ type: Schema.Types.ObjectId, ref: "Achievement" }],
        badges: [{ type: Schema.Types.ObjectId, ref: "Badge" }],
        friends: [{ type: Schema.Types.ObjectId, ref: "User" }],
        friendsCount: { type: Number, default: 0 },
        followersCount: { type: Number, default: 0 },
        settings: { type: UserSettingsSchema, default: () => ({}) },
        lastActive: { type: Date },
        isOnline: { type: Boolean, default: false },
    },
    { timestamps: true }
);

UserMongoSchema.index({ username: 1 });
UserMongoSchema.index({ email: 1 });
UserMongoSchema.index({ totalDistance: -1 });
UserMongoSchema.index({ level: -1, xp: -1 });

export const UserModel = mongoose.model<IUser>("User", UserMongoSchema);

