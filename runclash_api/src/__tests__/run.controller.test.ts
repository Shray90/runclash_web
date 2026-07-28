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

jest.mock('../services/run.service', () => ({
  RunService: jest.fn().mockImplementation(() => ({
    startRun: jest.fn<(...args: any[]) => any>().mockResolvedValue({ _id: 'run-id', userId: '507f1f77bcf86cd799439011', status: 'active', startTime: new Date(), route: [] }),
    getCurrentRun: jest.fn<(...args: any[]) => any>().mockResolvedValue(null),
    pauseRun: jest.fn<(...args: any[]) => any>().mockResolvedValue({ _id: 'run-id', status: 'paused', pauseHistory: [], save: jest.fn() }),
    resumeRun: jest.fn<(...args: any[]) => any>().mockResolvedValue({ _id: 'run-id', status: 'active', pauseHistory: [], save: jest.fn() }),
    addLocation: jest.fn<(...args: any[]) => any>().mockResolvedValue(null),
    finishRun: jest.fn<(...args: any[]) => any>().mockResolvedValue({ _id: 'run-id', status: 'finished', distance: 5000, duration: 1800, save: jest.fn() }),
    getRunHistory: jest.fn<(...args: any[]) => any>().mockResolvedValue({ data: [], total: 0, page: 1, totalPages: 0 }),
    getRunById: jest.fn<(...args: any[]) => any>().mockResolvedValue({ _id: 'run-id', status: 'active' }),
  })),
}));

const request = supertest(app);
const authHeader = 'Bearer fake-jwt-token';

describe('Run API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('starts a run', async () => {
    const response = await request
      .post('/api/v1/run/start')
      .set('Authorization', authHeader)
      .send({ startLat: 40.7128, startLng: -74.006 });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
  });

  it('gets current run', async () => {
    const RunService = require('../services/run.service').RunService;
    RunService.mockImplementation(() => ({
      ...RunService.mock.results[0]?.value || {},
      getCurrentRun: jest.fn<(...args: any[]) => any>().mockResolvedValue({ _id: 'run-id', status: 'active' }),
    }));

    const response = await request
      .get('/api/v1/run/current')
      .set('Authorization', authHeader);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it('returns null when no current run', async () => {
    const response = await request
      .get('/api/v1/run/current')
      .set('Authorization', authHeader);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeNull();
  });

  it('pauses a run', async () => {
    const response = await request
      .post('/api/v1/run/pause')
      .set('Authorization', authHeader)
      .send({ runId: '507f1f77bcf86cd799439013' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it('finishes a run', async () => {
    const response = await request
      .post('/api/v1/run/finish')
      .set('Authorization', authHeader)
      .send({ runId: '507f1f77bcf86cd799439013', distance: 5000, duration: 1800, avgSpeed: 10, pace: 6, calories: 350 });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it('gets run history', async () => {
    const response = await request
      .get('/api/v1/run/history')
      .set('Authorization', authHeader);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
