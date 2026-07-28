import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';
import RegisterForm from '@/app/(auth)/_components/RegisterForm';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock('@/lib/actions/auth-action', () => ({
  handleRegisterUser: jest.fn(),
}));

describe('RegisterForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders email field and register button', () => {
    render(<RegisterForm />);
    expect(screen.getByPlaceholderText(/athlete@runclash.com/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /register/i })).toBeDefined();
  });

  it('shows validation error for short first name', async () => {
    render(<RegisterForm />);
    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(screen.getByText(/first name must be at least 2 characters long/i)).toBeDefined();
    });
  });

  it('validates password mismatch', async () => {
    render(<RegisterForm />);
    const passwordInputs = screen.getAllByPlaceholderText(/••••••••/i);
    fireEvent.change(passwordInputs[0], { target: { value: 'password123' } });
    fireEvent.change(passwordInputs[1], { target: { value: 'different' } });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeDefined();
    });
  });
});
