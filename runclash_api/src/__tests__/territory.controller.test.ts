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

jest.mock('../services/territory.service', () => ({
  TerritoryService: jest.fn().mockImplementation(() => ({
    getAllTerritories: jest.fn<(...args: any[]) => any>().mockResolvedValue([]),
    getTerritoryById: jest.fn((id: string) => {
      if (id === '507f1f77bcf86cd799439014') {
        const err = new Error('Territory not found') as any;
        err.status = 404;
        return Promise.reject(err);
      }
      return Promise.resolve({ _id: id, name: 'Central Park', center: { coordinates: [-74.006, 40.7128] }, radius: 500, captureProgress: 0 });
    }),
    checkTerritory: jest.fn<(...args: any[]) => any>().mockResolvedValue({ inside: true, progress: 0, territory: { name: 'Central Park' }, captureActive: true }),
    captureTerritory: jest.fn<(...args: any[]) => any>().mockResolvedValue({ captured: true, progress: 100, xpRewarded: 100, coinRewarded: 50 }),
  })),
}));

const request = supertest(app);
const authHeader = 'Bearer fake-jwt-token';

describe('Territory API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('gets all territories', async () => {
    const response = await request
      .get('/api/v1/territories')
      .set('Authorization', authHeader);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it('gets territory by id', async () => {
    const response = await request
      .get('/api/v1/territories/territory-id')
      .set('Authorization', authHeader);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it('returns 404 for non-existent territory', async () => {
    const response = await request
      .get('/api/v1/territories/507f1f77bcf86cd799439014')
      .set('Authorization', authHeader);

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });

  it('checks territory proximity', async () => {
    const response = await request
      .post('/api/v1/territories/check')
      .set('Authorization', authHeader)
      .send({ territoryId: 'territory-id', lat: 40.7128, lng: -74.006 });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it('captures territory when inside', async () => {
    const response = await request
      .post('/api/v1/territories/capture')
      .set('Authorization', authHeader)
      .send({ territoryId: 'territory-id', lat: 40.7128, lng: -74.006 });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.captured).toBe(true);
  });
});
