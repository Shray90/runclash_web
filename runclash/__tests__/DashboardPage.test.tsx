import { render, screen } from '@testing-library/react';
import { jest } from '@jest/globals';
import DashboardPage from '@/app/dashboard/page';
import { getDashboardStats, getChartsData } from '@/lib/api/stats';
import { getMiniLeaderboard } from '@/lib/api/leaderboard';
import { getRunHistory, getCurrentRun } from '@/lib/api/run';
import { getUserTerritories } from '@/lib/api/territories';

jest.mock('@/lib/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { _id: '507f1f77bcf86cd799439011', firstName: 'Test', lastName: 'User' },
    loading: false,
  }),
}));

jest.mock('@/lib/actions/auth-action', () => ({
  handleLogout: jest.fn(),
}));

jest.mock('@/lib/api/stats', () => ({
  getDashboardStats: jest.fn(),
  getChartsData: jest.fn(),
}));

jest.mock('@/lib/api/leaderboard', () => ({
  getMiniLeaderboard: jest.fn(),
}));

jest.mock('@/lib/api/run', () => ({
  getRunHistory: jest.fn(),
  getCurrentRun: jest.fn(),
}));

jest.mock('@/lib/api/territories', () => ({
  getUserTerritories: jest.fn(),
}));

jest.mock('@/lib/hooks/useSocket', () => ({
  useNotifications: () => ({ unreadCount: 0 }),
  useLeaderboardUpdates: () => ({}),
  useTerritoryUpdates: () => ({}),
}));

describe('DashboardPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(getDashboardStats).mockResolvedValue({
      success: true,
      data: { level: 1, xp: 0 },
    });
    jest.mocked(getChartsData).mockResolvedValue({
      success: true,
      data: {},
    });
    jest.mocked(getMiniLeaderboard).mockResolvedValue({ success: true, data: [] });
    jest.mocked(getRunHistory).mockResolvedValue({ success: true, data: [] });
    jest.mocked(getCurrentRun).mockResolvedValue({ success: true, data: null });
    jest.mocked(getUserTerritories).mockResolvedValue({ success: true, data: [] });
  });

  it('renders a main container', () => {
    const { container } = render(<DashboardPage />);
    expect(container.querySelector('main')).toBeDefined();
  });

  it('renders the loading skeleton initially', () => {
    const { container } = render(<DashboardPage />);
    expect(container.querySelector('.skeleton-shimmer')).toBeDefined();
  });
});