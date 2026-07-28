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

jest.mock('../services/friend.service', () => ({
  FriendService: jest.fn().mockImplementation(() => ({
    sendFriendRequest: jest.fn<(...args: any[]) => any>().mockResolvedValue({ _id: 'request-id', sender: '507f1f77bcf86cd799439011', receiver: '507f1f77bcf86cd799439012', status: 'pending' }),
    respondToRequest: jest.fn<(...args: any[]) => any>().mockResolvedValue({ _id: 'request-id', status: 'accepted' }),
    removeFriend: jest.fn<(...args: any[]) => any>().mockResolvedValue(undefined),
    getFriends: jest.fn<(...args: any[]) => any>().mockResolvedValue([{ _id: '507f1f77bcf86cd799439012', firstName: 'Friend' }]),
    getFriendRequests: jest.fn<(...args: any[]) => any>().mockResolvedValue([]),
    getSentRequests: jest.fn<(...args: any[]) => any>().mockResolvedValue([]),
    getOnlineFriends: jest.fn<(...args: any[]) => any>().mockResolvedValue([]),
    compareStats: jest.fn<(...args: any[]) => any>().mockResolvedValue({ user: {}, friend: {} }),
    getFriendActivity: jest.fn<(...args: any[]) => any>().mockResolvedValue([]),
  })),
}));

const request = supertest(app);
const authHeader = 'Bearer fake-jwt-token';

describe('Friend API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('sends friend request successfully', async () => {
    const response = await request
      .post('/api/v1/friends/request')
      .set('Authorization', authHeader)
      .send({ receiverId: '507f1f77bcf86cd799439012' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it('responds to friend request', async () => {
    const response = await request
      .post('/api/v1/friends/respond')
      .set('Authorization', authHeader)
      .send({ requestId: '507f1f77bcf86cd799439016', action: 'accept' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it('removes friend successfully', async () => {
    const response = await request
      .delete('/api/v1/friends/507f1f77bcf86cd799439012')
      .set('Authorization', authHeader);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Friend removed');
  });

  it('returns friends list', async () => {
    const response = await request
      .get('/api/v1/friends')
      .set('Authorization', authHeader);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it('returns pending friend requests', async () => {
    const response = await request
      .get('/api/v1/friends/requests')
      .set('Authorization', authHeader);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
