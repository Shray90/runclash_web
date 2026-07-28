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

jest.mock('../services/leaderboard.service', () => ({
  LeaderboardService: jest.fn().mockImplementation(() => ({
    getLeaderboard: jest.fn<(...args: any[]) => any>().mockResolvedValue({ data: [], page: 1, total: 0, totalPages: 0 }),
    getUserRank: jest.fn<(...args: any[]) => any>().mockResolvedValue({ rank: 1, totalUsers: 10 }),
    getMiniLeaderboard: jest.fn<(...args: any[]) => any>().mockResolvedValue([]),
    getTopRunners: jest.fn<(...args: any[]) => any>().mockResolvedValue([]),
  })),
}));

const request = supertest(app);
const authHeader = 'Bearer fake-jwt-token';

describe('Leaderboard API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('gets global leaderboard', async () => {
    const { LeaderboardService } = require('../services/leaderboard.service');
    const instance = (LeaderboardService as jest.Mock).mock.results[0]?.value as any;
    console.log('LeaderboardService instance methods:', Object.keys(instance || {}));
    console.log('getLeaderboard mock state:', instance?.getLeaderboard?.getMockName?.());

    const response = await request
      .get('/api/v1/leaderboard')
      .set('Authorization', authHeader);

    console.log('Response status:', response.status);
    console.log('Response body:', response.body);
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it('gets mini leaderboard', async () => {
    const response = await request
      .get('/api/v1/leaderboard/mini')
      .set('Authorization', authHeader);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it('gets user rank', async () => {
    const response = await request
      .get('/api/v1/leaderboard/rank')
      .set('Authorization', authHeader);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.rank).toBeDefined();
  });

  it('gets friends leaderboard', async () => {
    const response = await request
      .get('/api/v1/leaderboard/friends')
      .set('Authorization', authHeader);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('API not found');
  });
});
