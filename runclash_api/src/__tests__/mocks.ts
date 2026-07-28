import { jest } from '@jest/globals';

export const mockQuery = () => {
  const q: any = {
    populate: () => q,
    lean: () => q,
    sort: () => q,
    skip: () => q,
    limit: () => q,
    exec: jest.fn(),
    select: () => q,
  };
  return q;
};

export const userModelMock = {
  findOne: jest.fn(() => mockQuery()),
  findById: jest.fn(() => mockQuery()),
  find: jest.fn(() => mockQuery()),
  countDocuments: jest.fn(() => mockQuery()),
  create: jest.fn((data: any) => ({ _id: '507f1f77bcf86cd799439011', ...data })),
  findByIdAndUpdate: jest.fn(() => mockQuery()),
  findByIdAndDelete: jest.fn(() => mockQuery()),
  aggregate: jest.fn(() => mockQuery()),
  updateMany: jest.fn(() => mockQuery()),
  deleteMany: jest.fn(() => mockQuery()),
  findOneAndUpdate: jest.fn(() => mockQuery()),
  findOneAndDelete: jest.fn(() => mockQuery()),
  where: jest.fn(() => mockQuery()),
  select: jest.fn().mockReturnThis(),
};

export const runModelMock = {
  findOne: jest.fn(() => mockQuery()),
  findById: jest.fn(() => mockQuery()),
  find: jest.fn(() => mockQuery()),
  countDocuments: jest.fn(() => mockQuery()),
  create: jest.fn((data: any) => ({ _id: '507f1f77bcf86cd799439013', ...data })),
  findByIdAndUpdate: jest.fn(() => mockQuery()),
  findByIdAndDelete: jest.fn(() => mockQuery()),
  aggregate: jest.fn(() => mockQuery()),
};

export const territoryModelMock = {
  findOne: jest.fn(() => mockQuery()),
  findById: jest.fn(() => mockQuery()),
  find: jest.fn(() => mockQuery()),
  countDocuments: jest.fn(() => mockQuery()),
  create: jest.fn((data: any) => ({ _id: '507f1f77bcf86cd799439014', ...data })),
  findByIdAndUpdate: jest.fn(() => mockQuery()),
  findByIdAndDelete: jest.fn(() => mockQuery()),
  aggregate: jest.fn(() => mockQuery()),
};

export const friendRequestModelMock = {
  findOne: jest.fn(() => mockQuery()),
  find: jest.fn(() => mockQuery()),
  countDocuments: jest.fn(() => mockQuery()),
  create: jest.fn((data: any) => ({ _id: '507f1f77bcf86cd799439016', ...data })),
  findByIdAndUpdate: jest.fn(() => mockQuery()),
  deleteMany: jest.fn(() => mockQuery()),
};

export const challengeModelMock = {
  findOne: jest.fn(() => mockQuery()),
  findById: jest.fn(() => mockQuery()),
  find: jest.fn(() => mockQuery()),
  countDocuments: jest.fn(() => mockQuery()),
  create: jest.fn((data: any) => ({ _id: '507f1f77bcf86cd799439017', ...data })),
  findByIdAndUpdate: jest.fn(() => mockQuery()),
  findByIdAndDelete: jest.fn(() => mockQuery()),
};

export const challengeProgressModelMock = {
  findOne: jest.fn(() => mockQuery()),
  find: jest.fn(() => mockQuery()),
  countDocuments: jest.fn(() => mockQuery()),
  create: jest.fn((data: any) => ({ _id: '507f1f77bcf86cd799439018', ...data })),
  findByIdAndUpdate: jest.fn(() => mockQuery()),
  save: jest.fn(),
};

export const achievementModelMock = {
  findOne: jest.fn(() => mockQuery()),
  find: jest.fn(() => mockQuery()),
  countDocuments: jest.fn(() => mockQuery()),
  create: jest.fn((data: any) => ({ _id: '507f1f77bcf86cd799439019', ...data })),
  findByIdAndUpdate: jest.fn(() => mockQuery()),
  save: jest.fn(),
};

export const badgeModelMock = {
  findOne: jest.fn(() => mockQuery()),
  find: jest.fn(() => mockQuery()),
  create: jest.fn((data: any) => ({ _id: '507f1f77bcf86cd79943901a', ...data })),
};

export const notificationModelMock = {
  findOne: jest.fn(() => mockQuery()),
  find: jest.fn(() => mockQuery()),
  countDocuments: jest.fn(() => mockQuery()),
  create: jest.fn((data: any) => ({ _id: '507f1f77bcf86cd799439015', ...data })),
  findByIdAndUpdate: jest.fn(() => mockQuery()),
  findByIdAndDelete: jest.fn(() => mockQuery()),
  updateMany: jest.fn(() => mockQuery()),
};

export const userStatsModelMock = {
  findOne: jest.fn(() => mockQuery()),
  create: jest.fn((data: any) => ({ _id: '507f1f77bcf86cd79943901b', ...data })),
  countDocuments: jest.fn(() => mockQuery()),
  findByIdAndUpdate: jest.fn(() => mockQuery()),
  save: jest.fn(),
};

export const gpsLocationModelMock = {
  create: jest.fn((data: any) => ({ _id: '507f1f77bcf86cd79943901c', ...data })),
};

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
