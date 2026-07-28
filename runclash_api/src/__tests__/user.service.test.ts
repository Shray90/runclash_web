import { jest } from '@jest/globals';
import { UserService } from '../services/user.service';
import { UserModel, RunModel, NotificationModel, AchievementModel, ChallengeProgressModel, ChallengeModel, UserStatsModel, GPSLocationModel } from './model-mocks';
import { mockQuery } from './test-utils';

jest.mock('bcryptjs', () => ({
  hash: jest.fn(() => Promise.resolve('hashedpassword')),
  compare: jest.fn(() => Promise.resolve(true)),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'fake-jwt-token'),
  verify: jest.fn(() => ({ id: '507f1f77bcf86cd799439011', email: 'test@example.com', role: 'user' })),
}));

jest.mock('../models/user.model', () => ({ UserModel: require('./model-mocks').UserModel }));
jest.mock('../models/run.model', () => ({ RunModel: require('./model-mocks').RunModel }));
jest.mock('../models/notification.model', () => ({ NotificationModel: require('./model-mocks').NotificationModel }));
jest.mock('../models/achievement.model', () => ({ AchievementModel: require('./model-mocks').AchievementModel }));
jest.mock('../models/challenge-progress.model', () => ({ ChallengeProgressModel: require('./model-mocks').ChallengeProgressModel }));
jest.mock('../models/challenge.model', () => ({ ChallengeModel: require('./model-mocks').ChallengeModel }));
jest.mock('../models/user-stats.model', () => ({ UserStatsModel: require('./model-mocks').UserStatsModel }));
jest.mock('../models/gps-location.model', () => ({ GPSLocationModel: require('./model-mocks').GPSLocationModel }));

const service = new UserService();

describe('UserService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a new user with hashed password', async () => {
    UserModel.findOne.mockImplementation(() => {
      const q = mockQuery();
      q.exec.mockResolvedValue(null);
      return q;
    });
    UserModel.create.mockReturnValue({
      _id: '507f1f77bcf86cd799439011',
      email: 'test@example.com',
      username: 'testuser',
      password: 'hashedpassword',
    } as any);

    const user = await service.createUser({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      username: 'testuser',
      password: 'password123',
    } as any);

    expect(user.email).toBe('test@example.com');
    expect(UserModel.create).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'test@example.com' })
    );
  });

  it('throws error when email already exists', async () => {
    UserModel.findOne.mockImplementation(() => {
      const q = mockQuery();
      q.exec.mockResolvedValue({ email: 'test@example.com', _id: '507f1f77bcf86cd799439011' } as any);
      return q;
    });

    await expect(
      service.createUser({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
      } as any)
    ).rejects.toThrow('Email already exists');
  });

  it('logs in with valid credentials', async () => {
    const mockUser = {
      _id: '507f1f77bcf86cd799439011',
      email: 'test@example.com',
      password: 'hashedpassword',
      role: 'user',
    };
    UserModel.findOne.mockImplementation(() => {
      const q = mockQuery();
      q.exec.mockResolvedValue(mockUser as any);
      return q;
    });

    const result = await service.loginUser({ email: 'test@example.com', password: 'password123' } as any);
    expect(result.user.email).toBe('test@example.com');
    expect(result.token).toBeDefined();
  });

  it('throws error for invalid email on login', async () => {
    UserModel.findOne.mockImplementation(() => {
      const q = mockQuery();
      q.exec.mockResolvedValue(null);
      return q;
    });

    await expect(
      service.loginUser({ email: 'wrong@example.com', password: 'password123' } as any)
    ).rejects.toThrow('Invalid email');
  });
});