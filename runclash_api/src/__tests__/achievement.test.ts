import app from '../app';
import supertest from 'supertest';
import { jest } from '@jest/globals';

jest.mock('../middleware/authorized.middleware', () => ({
  authorizedMiddleware: (req: any, res: any, next: any) => {
    req.user = {
      _id: '507f1f77bcf86cd799439011',
      email: 'test@example.com',
      username: 'testuser',
      role: 'user',
    };
    next();
  },
  adminMiddleware: (req: any, res: any, next: any) => next(),
}));

jest.mock('../services/achievement.service', () => ({
  AchievementService: jest.fn().mockImplementation(() => ({
    getAllBadges: jest.fn<(...args: any[]) => any>().mockResolvedValue([]),
    getUserAchievements: jest.fn<(...args: any[]) => any>().mockResolvedValue([]),
    getUserBadges: jest.fn<(...args: any[]) => any>().mockResolvedValue([]),
    checkAndUnlock: jest.fn<(...args: any[]) => any>().mockResolvedValue([]),
    getAchievementStats: jest.fn<(...args: any[]) => any>().mockResolvedValue({ total: 0, completed: 0, progress: 0 }),
    createBadge: jest.fn<(...args: any[]) => any>().mockResolvedValue({ _id: 'badge-id' }),
  })),
}));

const request = supertest(app);
const authHeader = 'Bearer fake-jwt-token';

describe('Achievement API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('gets all badges', async () => {
    const response = await request
      .get('/api/v1/achievements/badges')
      .set('Authorization', authHeader);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it('gets user achievements', async () => {
    const response = await request
      .get('/api/v1/achievements/my')
      .set('Authorization', authHeader);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it('gets user badges', async () => {
    const response = await request
      .get('/api/v1/achievements/my/badges')
      .set('Authorization', authHeader);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it('checks and unlocks achievements', async () => {
    const response = await request
      .post('/api/v1/achievements/check')
      .set('Authorization', authHeader);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
