import dotenv from 'dotenv';

dotenv.config();

export const mockUser = {
  _id: '507f1f77bcf86cd799439011',
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  username: 'testuser',
  password: 'hashedpassword',
  role: 'user',
  level: 1,
  xp: 0,
  coins: 0,
  totalDistance: 0,
  weeklyDistance: 0,
  monthlyDistance: 0,
  longestRun: 0,
  fastestPace: 0,
  currentStreak: 0,
  bestStreak: 0,
  territoriesCaptured: 0,
  totalRuns: 0,
  totalCalories: 0,
  achievements: [],
  badges: [],
  friends: [],
  friendsCount: 0,
  followersCount: 0,
  settings: {
    darkMode: false,
    locationPermissions: true,
    notificationPreferences: {
      friendRequests: true,
      territoryUpdates: true,
      challenges: true,
      achievements: true,
      leaderboard: true,
      runs: true,
    },
    language: 'en',
    privacy: {
      showProfile: true,
      showStats: true,
      showLocation: false,
    },
  },
  lastActive: undefined,
  isOnline: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockAdmin = {
  ...mockUser,
  _id: '507f1f77bcf86cd799439012',
  email: 'admin@example.com',
  username: 'admin',
  role: 'admin',
};
