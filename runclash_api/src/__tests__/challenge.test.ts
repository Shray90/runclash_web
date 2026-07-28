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

jest.mock('../services/challenge.service', () => ({
  ChallengeService: jest.fn().mockImplementation(() => ({
    getAllChallenges: jest.fn<(...args: any[]) => any>().mockResolvedValue([]),
    getChallengeById: jest.fn<(...args: any[]) => any>().mockResolvedValue({ _id: 'challenge-id', title: 'Test Challenge', isActive: true, endDate: new Date() }),
    joinChallenge: jest.fn<(...args: any[]) => any>().mockResolvedValue({ _id: 'progress-id', challengeId: 'challenge-id', progress: 0, completed: false }),
    getUserChallenges: jest.fn<(...args: any[]) => any>().mockResolvedValue([]),
    getActiveChallengesForUser: jest.fn<(...args: any[]) => any>().mockResolvedValue([]),
    updateProgress: jest.fn<(...args: any[]) => any>().mockResolvedValue({ _id: 'progress-id', progress: 5 }),
    generateDefaultChallenges: jest.fn<(...args: any[]) => any>().mockResolvedValue([]),
    getChallengeHistory: jest.fn<(...args: any[]) => any>().mockResolvedValue([]),
  })),
}));

const request = supertest(app);
const authHeader = 'Bearer fake-jwt-token';

describe('Challenge API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('gets all challenges', async () => {
    const response = await request
      .get('/api/v1/challenges')
      .set('Authorization', authHeader);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it('gets active challenges', async () => {
    const response = await request
      .get('/api/v1/challenges?active=true')
      .set('Authorization', authHeader);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it('joins a challenge', async () => {
    const response = await request
      .post('/api/v1/challenges/challenge-id/join')
      .set('Authorization', authHeader);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it('returns user challenge progress', async () => {
    const response = await request
      .get('/api/v1/challenges/my-progress')
      .set('Authorization', authHeader);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
