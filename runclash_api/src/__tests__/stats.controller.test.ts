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

jest.mock('../services/stats.service', () => ({
  StatsService: jest.fn().mockImplementation(() => ({
    getDashboardStats: jest.fn<(...args: any[]) => any>().mockResolvedValue({
      currentRank: 1,
      totalUsers: 10,
      todaysDistance: 5000,
      weeklyDistance: 15000,
      level: 1,
      xp: 0,
      achievementsCompleted: 0,
      achievementsTotal: 1,
    }),
    getChartsData: jest.fn<(...args: any[]) => any>().mockResolvedValue({
      weeklyDistances: [],
      monthlyDistances: [],
      weeklyCalories: [],
      paceOverTime: [],
      runsPerDay: [],
      xpGrowth: [],
      territoryCaptureHistory: [],
    }),
    getAdminAnalytics: jest.fn<(...args: any[]) => any>().mockResolvedValue({
      totalUsers: 0,
      activeUsers: 0,
      totalRuns: 0,
      totalDistance: 0,
      mostActiveRunners: [],
      xpDistribution: [],
      territoryOwnership: [],
    }),
  })),
}));

const request = supertest(app);
const authHeader = 'Bearer fake-jwt-token';

describe('Stats API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('gets dashboard stats', async () => {
    const response = await request
      .get('/api/v1/stats/dashboard')
      .set('Authorization', authHeader);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.level).toBeDefined();
  });

  it('gets charts data', async () => {
    const response = await request
      .get('/api/v1/stats/charts')
      .set('Authorization', authHeader);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.weeklyDistances).toBeDefined();
  });

  it('gets admin analytics', async () => {
    const response = await request
      .get('/api/v1/stats/admin/analytics')
      .set('Authorization', authHeader);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
