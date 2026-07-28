import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';
import LoginForm from '@/app/(auth)/_components/LoginForm';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock('@/lib/actions/auth-action', () => ({
  handleLoginUser: jest.fn(),
}));

describe('LoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders email and password fields', () => {
    render(<LoginForm />);
    expect(screen.getByPlaceholderText(/athlete@runclash.com/i)).toBeDefined();
    expect(screen.getByPlaceholderText(/••••••••••/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /initialize session/i })).toBeDefined();
  });

  it('shows validation errors for invalid email', async () => {
    render(<LoginForm />);
    fireEvent.click(screen.getByRole('button', { name: /initialize session/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid email address/i)).toBeDefined();
    });
  });

  it('shows error message on failed login', async () => {
    const { handleLoginUser } = require('@/lib/actions/auth-action');
    handleLoginUser.mockResolvedValue({ success: false, message: 'Invalid credentials' });

    render(<LoginForm />);
    fireEvent.change(screen.getByPlaceholderText(/athlete@runclash.com/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/••••••••••/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /initialize session/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeDefined();
    });
  });

  it('submits form with valid data', async () => {
    const { handleLoginUser } = require('@/lib/actions/auth-action');
    handleLoginUser.mockResolvedValue({ success: true });

    render(<LoginForm />);
    fireEvent.change(screen.getByPlaceholderText(/athlete@runclash.com/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/••••••••••/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /initialize session/i }));

    await waitFor(() => {
      expect(handleLoginUser).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });
});
