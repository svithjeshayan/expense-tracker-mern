/**
 * Application Constants
 * Centralized configuration values to avoid magic strings
 */

// Navigation Tabs
export const TABS = [
  'dashboard',
  'calendar',
  'assets',
  'expenses',
  'stats',
  'recurring',
  'budgets',
  'trends',
  'categories',
  'settings'
];

// Payment Methods
export const PAYMENT_METHODS = [
  { value: 'Cash', label: 'Cash', icon: '💵' },
  { value: 'Credit Card', label: 'Credit Card', icon: '💳' },
  { value: 'Debit Card', label: 'Debit Card', icon: '💳' },
  { value: 'Bank Transfer', label: 'Bank Transfer', icon: '🏦' },
  { value: 'Digital Wallet', label: 'Digital Wallet', icon: '📱' },
];

// Recurring Frequencies
export const FREQUENCIES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

// Transaction Types
export const TRANSACTION_TYPES = {
  EXPENSE: 'expense',
  INCOME: 'income',
};

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: '/auth',
  EXPENSES: '/expenses',
  BUDGETS: '/budgets',
  RECURRING: '/recurring',
  CATEGORIES: '/categories',
  NOTIFICATIONS: '/notifications',
  REPORTS: '/reports',
  TWO_FA: '/2fa',
  CURRENCY: '/currency',
};

// Chart Colors
export const CHART_COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
  '#84cc16', // lime
  '#6366f1', // indigo
];

// Default Form Values
export const DEFAULT_EXPENSE_FORM = {
  type: 'expense',
  amount: '',
  category: '',
  description: '',
  date: new Date().toISOString().split('T')[0],
  paymentMethod: 'Cash',
};

export const DEFAULT_BUDGET_FORM = {
  category: '',
  limit: '',
  month: new Date().toISOString().slice(0, 7),
};

export const DEFAULT_RECURRING_FORM = {
  type: 'expense',
  amount: '',
  category: '',
  description: '',
  frequency: 'monthly',
  dayOfMonth: '1',
  startDate: new Date().toISOString().split('T')[0],
  paymentMethod: 'Cash',
};

export const DEFAULT_CATEGORY_FORM = {
  name: '',
  type: 'expense',
  icon: '📁',
  color: '#3b82f6',
};

// Pagination
export const ITEMS_PER_PAGE = 10;

// Currency Defaults
export const DEFAULT_CURRENCY = {
  code: 'USD',
  symbol: '$',
  name: 'US Dollar',
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  INPUT: 'yyyy-MM-dd',
  MONTH: 'yyyy-MM',
};

// Validation Rules
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 6,
  DESCRIPTION_MAX_LENGTH: 200,
  AMOUNT_MAX: 999999999,
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  DARK_MODE: 'darkMode',
  OFFLINE_QUEUE: 'offlineQueue',
};
