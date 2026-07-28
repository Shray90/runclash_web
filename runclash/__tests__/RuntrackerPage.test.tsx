import { render, screen } from '@testing-library/react';
import { jest } from '@jest/globals';
import RuntrackerPage from '@/app/runtracker/page';

jest.mock('@/lib/hooks/useRunTracker', () => ({
  useRunTracker: () => ({
    status: 'idle',
    runId: null,
    distance: 0,
    duration: 0,
    pace: 0,
    avgSpeed: 0,
    calories: 0,
    route: [],
    smoothedRoute: [],
    gpsAccuracy: null,
    lastLocationSent: null,
    autoPaused: false,
    offlineQueueSize: 0,
    startRun: jest.fn(),
    pauseRun: jest.fn(),
    resumeRun: jest.fn(),
    stopRun: jest.fn(),
  }),
}));

describe('RuntrackerPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the page title', () => {
    render(<RuntrackerPage />);
    expect(screen.getByText(/run tracker/i)).toBeDefined();
  });

  it('renders the start run button', () => {
    render(<RuntrackerPage />);
    expect(screen.getByRole('button', { name: /start run/i })).toBeDefined();
  });

  it('shows gps idle state when not running', () => {
    render(<RuntrackerPage />);
    expect(screen.getByText(/gps idle/i)).toBeDefined();
  });
});
