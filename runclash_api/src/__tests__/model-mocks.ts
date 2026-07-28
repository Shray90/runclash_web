import { jest } from '@jest/globals';

const mockQuery = () => ({
  populate: jest.fn().mockReturnThis(),
  lean: jest.fn().mockReturnThis(),
  sort: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  exec: jest.fn(),
  select: jest.fn().mockReturnThis(),
});

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
