import app from '../app';
import supertest from 'supertest';
import { jest } from '@jest/globals';

jest.mock('../middleware/authorized.middleware', () => ({
  authorizedMiddleware: (req: any, res: any, next: any) => {
    if (!req.headers.authorization) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
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

const request = supertest(app);
const authHeader = 'Bearer fake-jwt-token';

describe('Error Handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 404 for unknown routes', async () => {
    const response = await request
      .get('/api/v1/nonexistent-route')
      .set('Authorization', authHeader);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('API not found');
  });

  it('returns 401 when no auth header is provided', async () => {
    const response = await request.get('/api/v1/run/current');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Unauthorized');
  });
});
