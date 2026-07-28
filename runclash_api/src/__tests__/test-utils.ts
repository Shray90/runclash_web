import { jest } from '@jest/globals';

export const mockQuery = () => {
  const execImpl = jest.fn<(...args: any[]) => any>();

  const q: any = {
    populate: () => q,
    lean: () => q,
    sort: () => q,
    skip: () => q,
    limit: () => q,
    select: () => q,
    exec: execImpl,
  };

  return q;
};

const makeModel = (name: string) => ({
  findOne: jest.fn(() => mockQuery()),
  findById: jest.fn(() => mockQuery()),
  find: jest.fn(() => mockQuery()),
  countDocuments: jest.fn(() => mockQuery()),
  create: jest.fn((data: any) => ({ _id: `${name}-id`, ...data })),
  findByIdAndUpdate: jest.fn(() => mockQuery()),
  findByIdAndDelete: jest.fn(() => mockQuery()),
  aggregate: jest.fn(() => mockQuery()),
  updateMany: jest.fn(() => mockQuery()),
  deleteMany: jest.fn(() => mockQuery()),
  findOneAndUpdate: jest.fn(() => mockQuery()),
  findOneAndDelete: jest.fn(() => mockQuery()),
  where: jest.fn(() => mockQuery()),
  select: jest.fn().mockReturnThis(),
  save: jest.fn(),
});

export const UserModel = makeModel('user');
export const RunModel = makeModel('run');
export const TerritoryModel = makeModel('territory');
export const FriendRequestModel = makeModel('friend-request');
export const ChallengeModel = makeModel('challenge');
export const ChallengeProgressModel = makeModel('challenge-progress');
export const AchievementModel = makeModel('achievement');
export const BadgeModel = makeModel('badge');
export const NotificationModel = makeModel('notification');
export const UserStatsModel = makeModel('user-stats');
export const GPSLocationModel = makeModel('gps-location');

export const mockSocket = {
  emitToUser: jest.fn(),
  emitLeaderboardUpdate: jest.fn(),
  emitTerritoryUpdate: jest.fn(),
  getIO: jest.fn(() => ({
    to: jest.fn(() => ({ emit: jest.fn() })),
    emit: jest.fn(),
  })),
};

export const mockJwt = {
  sign: jest.fn(() => 'fake-jwt-token'),
  verify: jest.fn(() => ({ id: '507f1f77bcf86cd799439011', email: 'test@example.com', role: 'user' })),
};

export const mockBcrypt = {
  hash: jest.fn(() => Promise.resolve('hashedpassword')),
  compare: jest.fn(() => Promise.resolve(true)),
};

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