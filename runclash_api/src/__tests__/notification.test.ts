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

jest.mock('../services/notification.service', () => ({
  NotificationService: jest.fn().mockImplementation(() => ({
    getUserNotifications: jest.fn<(...args: any[]) => any>().mockResolvedValue({ data: [], total: 0, page: 1, totalPages: 0, unreadCount: 0 }),
    markAsRead: jest.fn<(...args: any[]) => any>().mockResolvedValue({ _id: 'notification-id', read: true }),
    markAllAsRead: jest.fn<(...args: any[]) => any>().mockResolvedValue(undefined),
    deleteNotification: jest.fn<(...args: any[]) => any>().mockResolvedValue(undefined),
    getUnreadCount: jest.fn<(...args: any[]) => any>().mockResolvedValue(0),
    generateWeeklySummary: jest.fn<(...args: any[]) => any>().mockResolvedValue({ _id: 'summary-id', type: 'system' }),
  })),
}));

const request = supertest(app);
const authHeader = 'Bearer fake-jwt-token';

describe('Notification API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('gets user notifications', async () => {
    const response = await request
      .get('/api/v1/notifications')
      .set('Authorization', authHeader);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it('marks notification as read', async () => {
    const response = await request
      .put('/api/v1/notifications/507f1f77bcf86cd799439015/read')
      .set('Authorization', authHeader);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it('marks all notifications as read', async () => {
    const response = await request
      .put('/api/v1/notifications/read-all')
      .set('Authorization', authHeader);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it('generates weekly summary', async () => {
    const response = await request
      .post('/api/v1/notifications/weekly-summary')
      .set('Authorization', authHeader);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
