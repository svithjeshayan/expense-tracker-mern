import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from '../../App';
import api from '../../api/axios';

// Mock API
vi.mock('../../api/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn(), eject: vi.fn() },
      response: { use: vi.fn(), eject: vi.fn() }
    }
  }
}));

// Mock ResizeObserver for Recharts
globalThis.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('App Integration Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock successful auth check
    api.get.mockImplementation((url) => {
      if (url === '/auth/me') return Promise.resolve({ data: { name: 'Test User', email: 'test@example.com' } });
      if (url === '/expenses') return Promise.resolve({ data: [] });
      if (url === '/budgets') return Promise.resolve({ data: [] });
      if (url === '/recurring') return Promise.resolve({ data: [] });
      if (url === '/categories') return Promise.resolve({ data: [{ _id: '1', name: 'Food', type: 'expense', icon: '🍔', color: '#000' }] });
      if (url === '/currency/preference') return Promise.resolve({ data: { currency: 'USD', symbol: '$' } });
      if (url === '/currency/list') return Promise.resolve({ data: [{ code: 'USD', symbol: '$', name: 'US Dollar' }, { code: 'EUR', symbol: '€', name: 'Euro' }] });
      if (url === '/reports/trends') return Promise.resolve({ data: { insights: { avgMonthlyExpense: 0, avgMonthlyIncome: 0 }, monthlyTrends: [] } });
      return Promise.resolve({ data: {} });
    });
    
    // Mock local storage token
    localStorage.setItem('token', 'fake-token');
  });

  it('renders dashboard and allows adding an expense', async () => {
    render(<App />);

    // Wait for Dashboard to load (checking for Income/Expense cards)
    await waitFor(() => {
      expect(screen.getByText('Total Income')).toBeInTheDocument();
    });

    // 1. Open Add Expense Modal
    const addButtons = screen.getAllByText('Add Expense');
    // Using the one in the welcome empty state or the main button. 
    // Since expenses mock is empty, welcome state is visible.
    fireEvent.click(addButtons[0]);

    // 2. Fill Form
    const amountInput = screen.getByPlaceholderText('0.00');
    fireEvent.change(amountInput, { target: { value: '50.00' } });

    const descriptionInput = screen.getByPlaceholderText('e.g., Grocery shopping');
    fireEvent.change(descriptionInput, { target: { value: 'Test Expense' } });

    // 3. Submit
    api.post.mockResolvedValueOnce({ data: { _id: 'new-1', amount: 50, description: 'Test Expense', category: 'Food', date: new Date().toISOString(), type: 'expense', paymentMethod: 'Cash' } });
    
    // Mock reload of data
    api.get.mockImplementation((url) => {
        if (url === '/expenses') return Promise.resolve({ data: [{ _id: 'new-1', amount: 50, description: 'Test Expense', category: 'Food', date: new Date().toISOString(), type: 'expense', paymentMethod: 'Cash' }] });
        // Return other defaults
        if (url === '/auth/me') return Promise.resolve({ data: { name: 'Test User', email: 'test@example.com' } });
        if (url === '/budgets') return Promise.resolve({ data: [] });
        if (url === '/recurring') return Promise.resolve({ data: [] });
        if (url === '/categories') return Promise.resolve({ data: [{ _id: '1', name: 'Food', type: 'expense', icon: '🍔', color: '#000' }] });
        return Promise.resolve({ data: {} });
    });

    const saveButton = screen.getByRole('button', { name: /Add Transaction/i });
    fireEvent.click(saveButton);

    // 4. Verify API call
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/expenses', expect.objectContaining({
        amount: 50,
        description: 'Test Expense'
      }));
    });

    // 5. Verify UI Update (Dashboard Balance Update)
    // The balance should update. Wait for re-render.
    // Note: The mock re-fetch logic in App.jsx (loadUserData) is triggered after add.
    
    // Check if the dashboard card updates. 
    // Total Expense should be $50.00
    await waitFor(() => {
        // We look for the text "$50.00" inside the Expense Card
        const totalExpensesText = screen.getAllByText('$50.00');
        expect(totalExpensesText.length).toBeGreaterThan(0);
    });
  });

  it('navigates to settings tab', async () => {
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('Total Income')).toBeInTheDocument();
    });

    // Find custom tab button
    // The tab component renders buttons with text
    // "settings" is rendered inside <button ...>{tab}</button>
    // So fireEvent.click(screen.getByText('settings')) should work if visible.
    
    fireEvent.click(screen.getByText('settings'));

    await waitFor(() => {
      // Check for Settings view content
      expect(screen.getByText('Account')).toBeInTheDocument();
      // "Two-Factor Authentication" is also in the SettingsView component
      expect(screen.getByText('Two-Factor Authentication')).toBeInTheDocument();
    });
  });
});
