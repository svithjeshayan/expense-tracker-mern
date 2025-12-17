import React, { useState, useEffect } from 'react';
import { PlusCircle, TrendingUp, TrendingDown, Wallet, Download, Edit2, Trash2, Save, X, DollarSign, LogOut, User, Moon, Sun, Search, Filter, ChevronLeft, ChevronRight, RefreshCw, Calendar, FileText, Bell, Tag, Plus, BarChart3, Shield, Globe, Smartphone, Settings, Key, Copy, Check, Table as TableIcon, List } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart as RechartsPie, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import api from './api/axios';
import { generatePDFReport } from './utils/pdfGenerator';
import { queueOperation, processQueue } from './services/queue';
import DashboardView from './components/DashboardView';
import ExpensesView from './components/ExpensesView';
import SettingsView from './components/SettingsView';
import MobileBottomNav from './components/MobileBottomNav';

// Default categories - will be replaced by user's custom categories
const DEFAULT_EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Healthcare',
  'Education',
  'Travel',
  'Others'
];

const DEFAULT_INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Investment',
  'Business',
  'Gift',
  'Others'
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1'];

export default function ExpenseTracker() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLogin, setIsLogin] = useState(true);
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [recurringExpenses, setRecurringExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [trendData, setTrendData] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [expenseViewMode, setExpenseViewMode] = useState('table');
  
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddBudget, setShowAddBudget] = useState(false);
  const [showAddRecurring, setShowAddRecurring] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [editingRecurring, setEditingRecurring] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    type: '',
    paymentMethod: '',
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: ''
  });
  
  const [expenseForm, setExpenseForm] = useState({
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'Cash',
    type: 'expense'
  });

  const [recurringForm, setRecurringForm] = useState({
    amount: '',
    category: '',
    description: '',
    paymentMethod: 'Cash',
    type: 'expense',
    frequency: 'monthly',
    startDate: new Date().toISOString().split('T')[0],
    dayOfMonth: '1'
  });

  const [budgetForm, setBudgetForm] = useState({
    category: '',
    limit: '',
    month: new Date().toISOString().slice(0, 7)
  });
  const [editingBudget, setEditingBudget] = useState(null);
  const [selectedBudgetMonth, setSelectedBudgetMonth] = useState(new Date().toISOString().slice(0, 7));

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    type: 'expense',
    icon: '📁',
    color: '#3b82f6'
  });

  // 2FA State
  const [twoFactorStatus, setTwoFactorStatus] = useState({ enabled: false, backupCodesRemaining: 0 });
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [twoFASetupData, setTwoFASetupData] = useState(null);
  const [twoFACode, setTwoFACode] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);
  const [pending2FAUserId, setPending2FAUserId] = useState(null);

  // Currency State
  const [currencies, setCurrencies] = useState([]);
  const [exchangeRates, setExchangeRates] = useState(null);
  const [userCurrency, setUserCurrency] = useState({ currency: 'USD', symbol: '$', name: 'US Dollar' });

  // PWA State
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  // Helper: Format amount in user's currency
  const formatAmount = (amount) => {
    if (!exchangeRates || userCurrency.currency === 'USD') {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    }
    
    // Convert from USD (base) to User Currency
    const rate = exchangeRates[userCurrency.currency];
    const converted = amount * (rate || 1);
    
    return new Intl.NumberFormat(navigator.language, { 
      style: 'currency', 
      currency: userCurrency.currency 
    }).format(converted);
  };

  // Helper: Convert amount value only (for charts)
  const convertAmount = (amount) => {
    if (!exchangeRates || userCurrency.currency === 'USD') return amount;
    return Number((amount * exchangeRates[userCurrency.currency]).toFixed(2));
  };

  // Offline Sync Listener
  useEffect(() => {
    const handleOnline = async () => {
      console.log('Online! Syncing...');
      const result = await processQueue();
      if (result.count > 0) {
        loadUserData();
        alert(`Synced ${result.count} offline operations.`);
      }
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  useEffect(() => {
    // Detect system theme preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleThemeChange = (e) => {
      
      // Only apply if user hasn't manually set a preference
      const savedTheme = localStorage.getItem('theme');
      if (!savedTheme) {
        setDarkMode(e.matches);
        if (e.matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };

    // Set initial theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else if (savedTheme === 'light') {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    } else {
      // Use system preference
      const prefersDark = mediaQuery.matches;
      setDarkMode(prefersDark);
      if (prefersDark) {
        document.documentElement.classList.add('dark');
      }
    }

    // Listen for system theme changes
    mediaQuery.addEventListener('change', handleThemeChange);
    
    checkAuth();

    return () => {
      mediaQuery.removeEventListener('change', handleThemeChange);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await api.get('/auth/me');
        setCurrentUser(response.data);
        await loadUserData();
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('token');
      }
    }
    setAuthLoading(false);
  };

  const loadUserData = async () => {
    try {
      const [expensesRes, budgetsRes, recurringRes, categoriesRes] = await Promise.all([
        api.get('/expenses'),
        api.get('/budgets'),
        api.get('/recurring').catch(() => ({ data: [] })),
        api.get('/categories').catch(() => ({ data: [] }))
      ]);
      
      setExpenses(expensesRes.data);
      setBudgets(budgetsRes.data);
      setRecurringExpenses(recurringRes.data);
      setCategories(categoriesRes.data);
      
      // Initialize categories if none exist
      if (categoriesRes.data.length === 0) {
        try {
          await api.post('/categories/initialize');
          const newCategoriesRes = await api.get('/categories');
          setCategories(newCategoriesRes.data);
        } catch (error) {
          console.error('Error initializing categories:', error);
        }
      }

      // Set default category for forms
      if (categoriesRes.data.length > 0) {
        const firstExpenseCat = categoriesRes.data.find(c => c.type === 'expense');
        
        setExpenseForm(prev => ({ ...prev, category: firstExpenseCat?.name || '' }));
        setRecurringForm(prev => ({ ...prev, category: firstExpenseCat?.name || '' }));
        setBudgetForm(prev => ({ ...prev, category: firstExpenseCat?.name || '' }));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const response = await api.post(endpoint, authForm);
      
      // Check if 2FA is required
      if (response.data.requires2FA) {
        setRequires2FA(true);
        setPending2FAUserId(response.data.userId);
        setLoading(false);
        return;
      }
      
      localStorage.setItem('token', response.data.token);
      setCurrentUser(response.data.user);
      await loadUserData();
      setAuthForm({ name: '', email: '', password: '' });
    } catch (error) {
      alert(error.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
    setExpenses([]);
    setBudgets([]);
    setRecurringExpenses([]);
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    setLoading(true);

    const expenseData = {
      ...expenseForm,
      amount: parseFloat(expenseForm.amount)
    };

    // Offline Handling
    if (!navigator.onLine) {
      const tempId = Date.now().toString();
      if (editingExpense) {
        queueOperation('EDIT_EXPENSE', { id: editingExpense._id, updates: expenseData }, tempId);
        // Optimistic UI Update
        setExpenses(prev => prev.map(ex => ex._id === editingExpense._id ? { ...ex, ...expenseData } : ex));
      } else {
        queueOperation('ADD_EXPENSE', expenseData, tempId);
        // Optimistic UI Update
        setExpenses(prev => [{ ...expenseData, _id: tempId, date: new Date(expenseData.date).toISOString() }, ...prev]);
      }
      
      setShowAddExpense(false);
      setEditingExpense(null);
      resetExpenseForm();
      setLoading(false);
      alert('You are offline. Transaction saved locally and will sync when connected.');
      return;
    }

    try {
      if (editingExpense) {
        await api.put(`/expenses/${editingExpense._id}`, expenseData);
      } else {
        await api.post('/expenses', expenseData);
      }
      
      await loadUserData();
      setShowAddExpense(false);
      setEditingExpense(null);
      resetExpenseForm();
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving transaction');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRecurring = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const recurringData = {
        ...recurringForm,
        amount: parseFloat(recurringForm.amount),
        dayOfMonth: parseInt(recurringForm.dayOfMonth)
      };
      
      if (editingRecurring) {
        await api.put(`/recurring/${editingRecurring._id}`, recurringData);
      } else {
        await api.post('/recurring', recurringData);
      }
      
      await loadUserData();
      setShowAddRecurring(false);
      setEditingRecurring(null);
      resetRecurringForm();
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving recurring expense');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExpense = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      // Offline Handling
      if (!navigator.onLine) {
        queueOperation('DELETE_EXPENSE', { id }, id);
        setExpenses(prev => prev.filter(ex => ex._id !== id));
        alert('You are offline. Deletion queued.');
        return;
      }

      try {
        await api.delete(`/expenses/${id}`);
        await loadUserData();
      } catch {
        alert('Error deleting transaction');
      }
    }
  };

  const handleDeleteRecurring = async (id) => {
    if (window.confirm('Are you sure you want to delete this recurring expense?')) {
      try {
        await api.delete(`/recurring/${id}`);
        await loadUserData();
      } catch {
        alert('Error deleting recurring expense');
      }
    }
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setExpenseForm({
      amount: expense.amount.toString(),
      category: expense.category,
      description: expense.description,
      date: expense.date.split('T')[0],
      paymentMethod: expense.paymentMethod,
      type: expense.type
    });
    setShowAddExpense(true);
  };

  const handleEditRecurring = (recurring) => {
    setEditingRecurring(recurring);
    setRecurringForm({
      amount: recurring.amount.toString(),
      category: recurring.category,
      description: recurring.description,
      paymentMethod: recurring.paymentMethod,
      type: recurring.type,
      frequency: recurring.frequency,
      startDate: recurring.startDate.split('T')[0],
      dayOfMonth: recurring.dayOfMonth.toString()
    });
    setShowAddRecurring(true);
  };

  const resetBudgetForm = () => {
    setBudgetForm({
      category: '',
      limit: '',
      month: selectedBudgetMonth
    });
    setEditingBudget(null);
  };

  const handleEditBudget = (budget) => {
    setEditingBudget(budget);
    setBudgetForm({
      category: budget.category,
      limit: budget.limit,
      month: budget.month
    });
    setShowAddBudget(true);
  };

  const handleDeleteBudget = async (id) => {
    if (!window.confirm('Are you sure you want to delete this budget?')) return;
    try {
      setLoading(true);
      await api.delete(`/budgets/${id}`);
      setBudgets(prev => prev.filter(b => b._id !== id));
    } catch {
      alert('Error deleting budget');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBudget = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const budgetData = {
        ...budgetForm,
        limit: parseFloat(budgetForm.limit)
      };

      if (editingBudget) {
        const response = await api.put(`/budgets/${editingBudget._id}`, budgetData);
        setBudgets(prev => prev.map(b => b._id === editingBudget._id ? response.data : b));
        alert('Budget updated successfully');
      } else {
        const response = await api.post('/budgets', budgetData);
        setBudgets(prev => [...prev, response.data]);
        alert('Budget set successfully');
      }
      setShowAddBudget(false);
      resetBudgetForm();
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving budget');
    } finally {
      setLoading(false);
    }
  };

  const resetExpenseForm = () => {
    setExpenseForm({
      amount: '',
      category: 'Food & Dining',
      description: '',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'Cash',
      type: 'expense'
    });
  };

  const resetRecurringForm = () => {
    setRecurringForm({
      amount: '',
      category: 'Food & Dining',
      description: '',
      paymentMethod: 'Cash',
      type: 'expense',
      frequency: 'monthly',
      startDate: new Date().toISOString().split('T')[0],
      dayOfMonth: '1'
    });
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      type: '',
      paymentMethod: '',
      startDate: '',
      endDate: '',
      minAmount: '',
      maxAmount: ''
    });
    setSearchTerm('');
  };

  // Filter and search expenses
  const getFilteredExpenses = () => {
    let filtered = [...expenses];

    // Search by description
    if (searchTerm) {
      filtered = filtered.filter(e => 
        e.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply filters
    if (filters.category) {
      filtered = filtered.filter(e => e.category === filters.category);
    }
    if (filters.type) {
      filtered = filtered.filter(e => e.type === filters.type);
    }
    if (filters.paymentMethod) {
      filtered = filtered.filter(e => e.paymentMethod === filters.paymentMethod);
    }
    if (filters.startDate) {
      filtered = filtered.filter(e => e.date >= filters.startDate);
    }
    if (filters.endDate) {
      filtered = filtered.filter(e => e.date <= filters.endDate);
    }
    if (filters.minAmount) {
      filtered = filtered.filter(e => e.amount >= parseFloat(filters.minAmount));
    }
    if (filters.maxAmount) {
      filtered = filtered.filter(e => e.amount <= parseFloat(filters.maxAmount));
    }

    return filtered;
  };

  // Pagination logic
  const filteredExpenses = getFilteredExpenses();
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentExpenses = filteredExpenses.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);

  const exportToCSV = () => {
    const headers = ['Date', 'Category', 'Description', 'Amount', 'Type', 'Payment Method'];
    const rows = filteredExpenses.map(e => [
      e.date.split('T')[0],
      e.category,
      e.description,
      e.amount,
      e.type,
      e.paymentMethod
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expenses_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // PDF Export
  const handleExportPDF = async () => {
    try {
      const reportRes = await api.get('/reports/summary', {
        params: {
          startDate: filters.startDate || undefined,
          endDate: filters.endDate || undefined
        }
      });
      
      const reportData = {
        ...reportRes.data,
        dateRange: filters.startDate && filters.endDate ? {
          start: filters.startDate,
          end: filters.endDate
        } : null
      };
      
      await generatePDFReport(reportData, currentUser);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF report');
    }
  };

  // Load trend data
  const loadTrendData = async () => {
    try {
      const response = await api.get('/reports/trends');
      setTrendData(response.data);
    } catch (error) {
      console.error('Error loading trend data:', error);
    }
  };

  // Category management
  const handleAddCategory = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory._id}`, categoryForm);
      } else {
        await api.post('/categories', categoryForm);
      }
      
      const categoriesRes = await api.get('/categories');
      setCategories(categoriesRes.data);
      setShowAddCategory(false);
      setEditingCategory(null);
      setCategoryForm({ name: '', type: 'expense', icon: '📁', color: '#3b82f6' });
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving category');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await api.delete(`/categories/${id}`);
        const categoriesRes = await api.get('/categories');
        setCategories(categoriesRes.data);
      } catch (error) {
        alert(error.response?.data?.message || 'Error deleting category');
      }
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      type: category.type,
      icon: category.icon,
      color: category.color
    });
    setShowAddCategory(true);
  };

  // Get categories by type
  const getExpenseCategories = () => {
    return categories.filter(c => c.type === 'expense').map(c => c.name);
  };

  const getIncomeCategories = () => {
    return categories.filter(c => c.type === 'income').map(c => c.name);
  };

  // 2FA Handlers
  const load2FAStatus = async () => {
    try {
      const response = await api.get('/2fa/status');
      setTwoFactorStatus(response.data);
    } catch (error) {
      console.error('Error loading 2FA status:', error);
    }
  };

  const handle2FASetup = async () => {
    try {
      setLoading(true);
      const response = await api.post('/2fa/setup');
      setTwoFASetupData(response.data);
      setShow2FASetup(true);
    } catch (error) {
      alert(error.response?.data?.message || 'Error setting up 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handle2FAVerify = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await api.post('/2fa/verify-setup', { token: twoFACode });
      setBackupCodes(response.data.backupCodes);
      setShowBackupCodes(true);
      setShow2FASetup(false);
      setTwoFASetupData(null);
      setTwoFACode('');
      setTwoFactorStatus({ enabled: true, backupCodesRemaining: response.data.backupCodes.length });
      alert('2FA enabled successfully! Save your backup codes!');
    } catch (error) {
      alert(error.response?.data?.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const handle2FADisable = async (password) => {
    try {
      setLoading(true);
      await api.post('/2fa/disable', { password });
      setTwoFactorStatus({ enabled: false, backupCodesRemaining: 0 });
      alert('2FA disabled successfully');
    } catch (error) {
      alert(error.response?.data?.message || 'Error disabling 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin2FA = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await api.post('/auth/login/verify-2fa', {
        userId: pending2FAUserId,
        token: twoFACode,
        isBackupCode: twoFACode.length === 8
      });
      localStorage.setItem('token', response.data.token);
      setCurrentUser(response.data.user);
      await loadUserData();
      setRequires2FA(false);
      setPending2FAUserId(null);
      setTwoFACode('');
    } catch (error) {
      alert(error.response?.data?.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const loadCurrencies = async () => {
    try {
      const response = await api.get('/currency/list');
      setCurrencies(response.data);
    } catch (error) {
      console.error('Error loading currencies:', error);
    }
  };

  const loadExchangeRates = async () => {
    try {
      const response = await api.get('/currency/rates');
      setExchangeRates(response.data);
    } catch (error) {
      console.error('Error loading exchange rates:', error);
    }
  };

  const loadUserCurrency = async () => {
    try {
      const response = await api.get('/currency/preference');
      setUserCurrency(response.data);
    } catch (error) {
      console.error('Error loading user currency:', error);
    }
  };

  const handleCurrencyChange = async (currencyCode) => {
    try {
      setLoading(true);
      const response = await api.put('/currency/preference', { currency: currencyCode });
      setUserCurrency(response.data);
      alert('Currency updated successfully');
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating currency');
    } finally {
      setLoading(false);
    }
  };

  // PWA Install Handler
  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setShowInstallPrompt(false);
    }
    setDeferredPrompt(null);
  };

  // Load settings when Settings tab is active
  useEffect(() => {
    if (currentUser) {
      loadExchangeRates(); // Load rates on login
      loadUserCurrency();
      if (activeTab === 'settings') {
        load2FAStatus();
        loadCurrencies();
      }
    }
  }, [activeTab, currentUser]);

  // PWA Install prompt listener
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Analytics calculations
  const totalIncome = expenses.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
  const totalExpense = expenses.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
  const balance = totalIncome - totalExpense;

  // Use dynamic categories for category data
  const expenseCategories = categories.filter(c => c.type === 'expense');
  const categoryData = expenseCategories.map(cat => ({
    name: cat.name,
    value: expenses.filter(e => e.category === cat.name && e.type === 'expense').reduce((sum, e) => sum + e.amount, 0),
    color: cat.color
  })).filter(d => d.value > 0);

  const monthlyData = expenses.reduce((acc, e) => {
    const month = e.date.slice(0, 7);
    if (!acc[month]) acc[month] = { month, income: 0, expense: 0 };
    if (e.type === 'income') acc[month].income += e.amount;
    else acc[month].expense += e.amount;
    return acc;
  }, {});

  const chartData = Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month)).slice(-6);

  // Budget analysis
  const budgetAnalysis = budgets.filter(b => b.month === selectedBudgetMonth).map(budget => {
    const spent = expenses.filter(e => 
      e.category === budget.category && 
      e.type === 'expense' && 
      e.date.startsWith(selectedBudgetMonth)
    ).reduce((sum, e) => sum + e.amount, 0);
    
    return {
      category: budget.category,
      limit: budget.limit,
      spent,
      percentage: (spent / budget.limit) * 100
    };
  });

  if (authLoading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!currentUser) {
    // 2FA Verification Screen
    if (requires2FA) {
      return (
        <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100'} flex items-center justify-center p-4`}>
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl p-8 w-full max-w-md`}>
            <div className="text-center mb-8">
              <Shield className={`w-16 h-16 ${darkMode ? 'text-blue-400' : 'text-blue-600'} mx-auto mb-4`} />
              <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Two-Factor Authentication</h1>
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-2`}>Enter the code from your authenticator app</p>
            </div>

            <form onSubmit={handleLogin2FA} className="space-y-4">
              <input
                type="text"
                placeholder="Enter 6-digit code or backup code"
                maxLength={8}
                className={`w-full px-4 py-3 border ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 text-center text-2xl tracking-widest`}
                value={twoFACode}
                onChange={(e) => setTwoFACode(e.target.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase())}
                required
                autoFocus
              />
              <p className={`text-xs text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Use a 6-digit code from your authenticator app, or an 8-character backup code
              </p>
              <button
                type="submit"
                disabled={loading || twoFACode.length < 6}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify'}
              </button>
            </form>

            <button
              onClick={() => {
                setRequires2FA(false);
                setPending2FAUserId(null);
                setTwoFACode('');
              }}
              className={`w-full mt-4 py-2 ${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'} transition`}
            >
              ← Back to login
            </button>
          </div>
        </div>
      );
    }

    // Normal Login/Register Screen
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100'} flex items-center justify-center p-4`}>
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl p-8 w-full max-w-md`}>
          <div className="text-center mb-8">
            <Wallet className={`w-16 h-16 ${darkMode ? 'text-blue-400' : 'text-blue-600'} mx-auto mb-4`} />
            <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Expense Tracker</h1>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-2`}>Manage your finances efficiently</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <input
                type="text"
                placeholder="Full Name"
                className={`w-full px-4 py-3 border ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                value={authForm.name}
                onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                required
              />
            )}
            <input
              type="email"
              placeholder="Email"
              className={`w-full px-4 py-3 border ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              value={authForm.email}
              onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className={`w-full px-4 py-3 border ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              value={authForm.password}
              onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Register')}
            </button>
          </form>

          <p className={`text-center mt-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-600 font-semibold ml-2 hover:underline"
            >
              {isLogin ? 'Register' : 'Login'}
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} shadow-sm border-b`}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Wallet className={`w-8 h-8 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            <h1 className={`text-xl md:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              <span className="hidden sm:inline">Expense Tracker</span>
              <span className="sm:hidden">Expenses</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 text-yellow-400' : 'bg-gray-100 text-gray-600'} hover:opacity-80 transition`}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} flex items-center gap-2`}>
              <User className="w-5 h-5" />
              <span className="hidden sm:inline">{currentUser.name}</span>
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className={`sticky top-0 z-50 backdrop-blur-xl border-b transition-all duration-300 hidden md:block ${darkMode ? 'bg-gray-900/80 border-gray-800' : 'bg-white/80 border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto py-2">
            {['dashboard', 'calendar', 'assets', 'expenses', 'recurring', 'budgets', 'analytics', 'trends', 'categories', 'settings'].map(tab => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  if (tab === 'trends') {
                    loadTrendData();
                  }
                }}
                className={`px-5 py-2 rounded-full font-medium transition-all duration-300 capitalize text-sm whitespace-nowrap ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 transform scale-105'
                    : (darkMode ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50')
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8 pb-24 md:pb-8">
        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <DashboardView
            totalIncome={totalIncome}
            totalExpense={totalExpense}
            balance={balance}
            chartData={chartData}
            categoryData={categoryData}
            trendData={trendData?.monthlyTrends}
            expenses={expenses}
            darkMode={darkMode}
            formatAmount={formatAmount}
            convertAmount={convertAmount}
            userCurrency={userCurrency}
            setShowAddExpense={setShowAddExpense}
            setExpenseForm={setExpenseForm}
          />
        )}

        {/* Calendar Tab */}
        {activeTab === 'calendar' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : ''}`}>Calendar</h2>
              <div className="flex items-center gap-4">
                 <input 
                   type="month" 
                   className={`px-4 py-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                   value={currentDate.toISOString().slice(0, 7)}
                   onChange={(e) => {
                     const [y, m] = e.target.value.split('-');
                     setCurrentDate(new Date(y, m - 1));
                   }}
                 />
              </div>
            </div>

            <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border p-6`}>
              <div className="grid grid-cols-7 gap-2 mb-2 text-center font-semibold text-gray-500">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d}>{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {[...Array(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay())].map((_, i) => <div key={`empty-${i}`} />)}
                {[...Array(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate())].map((_, i) => {
                   const day = i + 1;
                   const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                   const dayExpenses = expenses.filter(e => e.date.startsWith(dateStr));
                   const inc = dayExpenses.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0);
                   const exp = dayExpenses.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0);
                   
                   return (
                     <div 
                       key={day} 
                       className={`min-h-[100px] border rounded-lg p-2 flex flex-col justify-between cursor-pointer hover:shadow-md transition ${darkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-100 bg-gray-50'}`}
                       onClick={() => {
                         setFilters({...filters, startDate: dateStr, endDate: dateStr});
                         setActiveTab('expenses');
                       }}
                     >
                       <span className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{day}</span>
                       <div className="text-xs space-y-1 text-right">
                         {inc > 0 && <div className="text-green-500">+{Math.round(inc)}</div>}
                         {exp > 0 && <div className="text-red-500">-{Math.round(exp)}</div>}
                       </div>
                     </div>
                   );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Assets Tab */}
        {activeTab === 'assets' && (
          <div className="space-y-6">
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : ''}`}>Assets</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Digital Wallet'].map(method => {
                  const income = expenses.filter(e => e.paymentMethod === method && e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
                  const expense = expenses.filter(e => e.paymentMethod === method && e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
                  const balance = income - expense;
                  
                  return (
                    <div key={method} className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6 rounded-xl shadow-sm border`}>
                      <div className="flex justify-between mb-4">
                        <h3 className={`font-semibold text-lg ${darkMode ? 'text-white' : 'text-gray-800'}`}>{method}</h3>
                        <Wallet className={`w-6 h-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                      </div>
                      <div className="space-y-2">
                         <div className="flex justify-between text-sm">
                           <span className="text-green-500">Income</span>
                           <span className={`font-mono ${darkMode ? 'text-gray-300' : ''}`}>{formatAmount(income)}</span>
                         </div>
                         <div className="flex justify-between text-sm">
                           <span className="text-red-500">Expense</span>
                           <span className={`font-mono ${darkMode ? 'text-gray-300' : ''}`}>{formatAmount(expense)}</span>
                         </div>
                         <div className={`pt-2 border-t mt-2 flex justify-between font-bold ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                           <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Balance</span>
                           <span className={balance >= 0 ? 'text-blue-600' : 'text-red-600'}>{formatAmount(balance)}</span>
                         </div>
                      </div>
                    </div>
                  );
               })}
            </div>
          </div>
        )}

        {/* Expenses Tab */}
        {activeTab === 'expenses' && (
          <ExpensesView
            expenses={expenses}
            filteredExpenses={filteredExpenses}
            currentExpenses={currentExpenses}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            filters={filters}
            setFilters={setFilters}
            clearFilters={clearFilters}
            exportToCSV={exportToCSV}
            handleExportPDF={handleExportPDF}
            setShowAddExpense={setShowAddExpense}
            setEditingExpense={setEditingExpense}
            resetExpenseForm={resetExpenseForm}
            expenseViewMode={expenseViewMode}
            setExpenseViewMode={setExpenseViewMode}
            categories={categories}
            formatAmount={formatAmount}
            handleEditExpense={handleEditExpense}
            handleDeleteExpense={handleDeleteExpense}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
            indexOfFirstItem={indexOfFirstItem}
            indexOfLastItem={indexOfLastItem}
            darkMode={darkMode}
          />
        )}

        {/* Recurring Expenses Tab */}
        {activeTab === 'recurring' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : ''}`}>Recurring Expenses</h2>
              <button
                onClick={() => {
                  setShowAddRecurring(true);
                  setEditingRecurring(null);
                  resetRecurringForm();
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <RefreshCw className="w-4 h-4" />
                Add Recurring
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recurringExpenses.length > 0 ? recurringExpenses.map(recurring => (
                <div key={recurring._id} className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6 rounded-xl shadow-sm border`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className={`font-semibold text-lg ${darkMode ? 'text-white' : ''}`}>{recurring.description}</h3>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{recurring.category}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      recurring.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {recurring.type}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Amount</span>
                      <span className={`font-semibold ${recurring.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {formatAmount(recurring.amount)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Frequency</span>
                      <span className={`font-medium ${darkMode ? 'text-white' : ''}`}>{recurring.frequency}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Day of Month</span>
                      <span className={`font-medium ${darkMode ? 'text-white' : ''}`}>{recurring.dayOfMonth}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Payment Method</span>
                      <span className={`font-medium ${darkMode ? 'text-white' : ''}`}>{recurring.paymentMethod}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4 pt-4 border-t">
                    <button
                      onClick={() => handleEditRecurring(recurring)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteRecurring(recurring._id)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              )) : (
                <div className={`col-span-2 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-8 rounded-xl shadow-sm border text-center ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>No recurring expenses set up yet.</p>
                  <p className="text-sm mt-2">Click "Add Recurring" to create automated monthly transactions.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Budgets and Analytics tabs remain similar, just add dark mode classes */}
        {/* For brevity, I'll skip to the modals */}

        {activeTab === 'budgets' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h2 className={`text-xl md:text-2xl font-bold ${darkMode ? 'text-white' : ''}`}>Budget Management</h2>
              <div className="flex gap-4 items-center w-full md:w-auto">
                <input
                  type="month"
                  className={`px-4 py-2 border ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500`}
                  value={selectedBudgetMonth}
                  onChange={(e) => setSelectedBudgetMonth(e.target.value)}
                />
                <button
                  onClick={() => {
                    setShowAddBudget(true);
                    resetBudgetForm();
                    setBudgetForm(prev => ({ ...prev, month: selectedBudgetMonth }));
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <PlusCircle className="w-4 h-4" />
                  Set Budget
                </button>
              </div>
            </div>

            {budgetAnalysis.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {budgetAnalysis.map(budget => {
                  const remaining = budget.limit - budget.spent;
                  return (
                    <div key={budget._id || budget.category} className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-4 md:p-6 rounded-xl shadow-sm border`}>
                      <div className="flex justify-between items-start mb-4">
                        <h3 className={`font-semibold text-lg ${darkMode ? 'text-white' : ''}`}>{budget.category}</h3>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditBudget(budget)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteBudget(budget._id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Spent</span>
                          <span className={`font-semibold ${darkMode ? 'text-white' : ''}`}>{formatAmount(budget.spent)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Budget</span>
                          <span className={`font-semibold ${darkMode ? 'text-white' : ''}`}>{formatAmount(budget.limit)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Remaining</span>
                          <span className={`font-semibold ${remaining < 0 ? 'text-red-500' : 'text-green-500'}`}>{formatAmount(remaining)}</span>
                        </div>
                        <div className={`w-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-3`}>
                          <div
                            className={`h-3 rounded-full transition-all ${
                              budget.percentage > 100 ? 'bg-red-600' : budget.percentage > 80 ? 'bg-yellow-600' : 'bg-green-600'
                            }`}
                            style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                          />
                        </div>
                        <p className={`text-sm font-medium ${
                          budget.percentage > 100 ? 'text-red-600' : budget.percentage > 80 ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {budget.percentage.toFixed(1)}% used
                          {budget.percentage > 100 && ' - Over budget!'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className={`${darkMode ? 'bg-gray-800 border-gray-700 text-gray-500' : 'bg-white border-gray-200 text-gray-500'} p-8 rounded-xl shadow-sm border text-center`}>
                <p>No budgets set for this month. Click "Set Budget" to create one!</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : ''}`}>Financial Analytics</h2>

            <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6 rounded-xl shadow-sm border`}>
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : ''}`}>Monthly Trend</h3>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                    <XAxis dataKey="month" stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                    <YAxis stroke={darkMode ? '#9ca3af' : '#6b7280'} tickFormatter={val => `${val}`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: darkMode ? '#1f2937' : '#fff', border: darkMode ? '1px solid #374151' : '1px solid #e5e7eb' }} 
                      formatter={(value) => [convertAmount(value), 'Amount']}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} />
                    <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className={`h-[400px] flex items-center justify-center ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  No data available for trend analysis
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6 rounded-xl shadow-sm border`}>
                <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : ''}`}>Category Breakdown</h3>
                {categoryData.length > 0 ? (
                  <div className="space-y-3">
                    {categoryData.map((cat, idx) => (
                      <div key={cat.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 rounded" style={{ backgroundColor: COLORS[idx] }} />
                          <span className={`text-sm ${darkMode ? 'text-gray-300' : ''}`}>{cat.name}</span>
                        </div>
                        <span className={`font-semibold ${darkMode ? 'text-white' : ''}`}>${cat.value.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={`${darkMode ? 'text-gray-500' : 'text-gray-500'} text-center py-8`}>No expense data available</p>
                )}
              </div>

              <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6 rounded-xl shadow-sm border`}>
                <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : ''}`}>Summary Statistics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Average Monthly Expense</span>
                    <span className={`font-semibold ${darkMode ? 'text-white' : ''}`}>
                      ${chartData.length > 0 ? (chartData.reduce((sum, d) => sum + d.expense, 0) / chartData.length).toFixed(2) : '0.00'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Highest Expense Month</span>
                    <span className={`font-semibold ${darkMode ? 'text-white' : ''}`}>
                      {chartData.length > 0 ? chartData.reduce((max, d) => d.expense > max.expense ? d : max, chartData[0]).month : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Total Transactions</span>
                    <span className={`font-semibold ${darkMode ? 'text-white' : ''}`}>{expenses.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Savings Rate</span>
                    <span className={`font-semibold ${darkMode ? 'text-white' : ''}`}>
                      {totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(1) : '0.0'}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'trends' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : ''}`}>Trend Analysis</h2>
              <button
                onClick={loadTrendData}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>

            {trendData ? (
              <>
                {/* Insights Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6 rounded-xl shadow-sm border`}>
                    <div className="flex items-center gap-3 mb-2">
                      <BarChart3 className="w-8 h-8 text-blue-600" />
                      <h3 className={`font-semibold ${darkMode ? 'text-white' : ''}`}>Avg Monthly Expense</h3>
                    </div>
                    <p className="text-3xl font-bold text-blue-600">${trendData.insights.avgMonthlyExpense.toFixed(2)}</p>
                  </div>

                  <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6 rounded-xl shadow-sm border`}>
                    <div className="flex items-center gap-3 mb-2">
                      <TrendingUp className="w-8 h-8 text-green-600" />
                      <h3 className={`font-semibold ${darkMode ? 'text-white' : ''}`}>Avg Monthly Income</h3>
                    </div>
                    <p className="text-3xl font-bold text-green-600">${trendData.insights.avgMonthlyIncome.toFixed(2)}</p>
                  </div>

                  {trendData.insights.prediction && (
                    <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6 rounded-xl shadow-sm border`}>
                      <div className="flex items-center gap-3 mb-2">
                        <Calendar className="w-8 h-8 text-purple-600" />
                        <h3 className={`font-semibold ${darkMode ? 'text-white' : ''}`}>Next Month Estimate</h3>
                      </div>
                      <p className="text-3xl font-bold text-purple-600">${trendData.insights.prediction.estimatedExpense.toFixed(2)}</p>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>Confidence: {trendData.insights.prediction.confidence}</p>
                    </div>
                  )}
                </div>

                {/* Monthly Trends Chart */}
                <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6 rounded-xl shadow-sm border`}>
                  <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : ''}`}>Monthly Trends with Changes</h3>
                  <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={trendData.monthlyTrends}>
                      <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                      <XAxis dataKey="month" stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                      <YAxis stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                      <Tooltip contentStyle={{ backgroundColor: darkMode ? '#1f2937' : '#fff', border: darkMode ? '1px solid #374151' : '1px solid #e5e7eb' }} />
                      <Legend />
                      <Area type="monotone" dataKey="income" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                      <Area type="monotone" dataKey="expense" stackId="2" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Month-over-Month Changes */}
                <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6 rounded-xl shadow-sm border`}>
                  <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : ''}`}>Month-over-Month Changes</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} border-b ${darkMode ? 'border-gray-600' : ''}`}>
                        <tr>
                          <th className={`px-6 py-3 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Month</th>
                          <th className={`px-6 py-3 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Income</th>
                          <th className={`px-6 py-3 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Expense</th>
                          <th className={`px-6 py-3 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Income Change</th>
                          <th className={`px-6 py-3 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Expense Change</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {trendData.monthlyTrends.slice(-6).map(trend => (
                          <tr key={trend.month} className={`${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                            <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-300' : ''}`}>{trend.month}</td>
                            <td className={`px-6 py-4 text-sm font-medium text-green-600`}>${trend.income.toFixed(2)}</td>
                            <td className={`px-6 py-4 text-sm font-medium text-red-600`}>${trend.expense.toFixed(2)}</td>
                            <td className={`px-6 py-4 text-sm font-medium ${trend.incomeChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {trend.incomeChange >= 0 ? '+' : ''}{trend.incomeChange}%
                            </td>
                            <td className={`px-6 py-4 text-sm font-medium ${trend.expenseChange <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {trend.expenseChange >= 0 ? '+' : ''}{trend.expenseChange}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              <div className={`${darkMode ? 'bg-gray-800 border-gray-700 text-gray-500' : 'bg-white border-gray-200 text-gray-500'} p-8 rounded-xl shadow-sm border text-center`}>
                <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Loading trend data...</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : ''}`}>Manage Categories</h2>
              <button
                onClick={() => {
                  setShowAddCategory(true);
                  setEditingCategory(null);
                  setCategoryForm({ name: '', type: 'expense', icon: '📁', color: '#3b82f6' });
                }}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-300"
              >
                <Plus className="w-4 h-4" />
                Add Category
              </button>
            </div>

            {/* Expense Categories */}
            <div>
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : ''}`}>Expense Categories</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.filter(c => c.type === 'expense').map(category => (
                  <div key={category._id} className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-4 rounded-xl shadow-sm border`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">{category.icon}</div>
                        <div>
                          <p className={`font-semibold ${darkMode ? 'text-white' : ''}`}>{category.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="w-4 h-4 rounded" style={{ backgroundColor: category.color }}></div>
                            <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{category.color}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditCategory(category)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          disabled={category.isDefault}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                          disabled={category.isDefault}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {category.isDefault && (
                      <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mt-2 block`}>Default category</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Income Categories */}
            <div>
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : ''}`}>Income Categories</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.filter(c => c.type === 'income').map(category => (
                  <div key={category._id} className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-4 rounded-xl shadow-sm border`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">{category.icon}</div>
                        <div>
                          <p className={`font-semibold ${darkMode ? 'text-white' : ''}`}>{category.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="w-4 h-4 rounded" style={{ backgroundColor: category.color }}></div>
                            <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{category.color}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditCategory(category)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          disabled={category.isDefault}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                          disabled={category.isDefault}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {category.isDefault && (
                      <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mt-2 block`}>Default category</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <SettingsView
            darkMode={darkMode}
            toggleDarkMode={toggleDarkMode}
            userCurrency={userCurrency}
            handleCurrencyChange={handleCurrencyChange}
            currencies={currencies}
            twoFactorStatus={twoFactorStatus}
            show2FASetup={show2FASetup}
            setShow2FASetup={setShow2FASetup}
            twoFASetupData={twoFASetupData}
            setTwoFASetupData={setTwoFASetupData}
            twoFACode={twoFACode}
            setTwoFACode={setTwoFACode}
            handle2FASetup={handle2FASetup}
            handle2FAVerify={handle2FAVerify}
            handle2FADisable={handle2FADisable}
            backupCodes={backupCodes}
            showBackupCodes={showBackupCodes}
            setShowBackupCodes={setShowBackupCodes} // Verify this prop exists?
            isInstalled={isInstalled}
            showInstallPrompt={showInstallPrompt}
            handleInstallClick={handleInstallClick}
            currentUser={currentUser}
            expenses={expenses}
            loading={loading}
          />
        )}
      </main>

      {/* Add/Edit Expense Modal */}
      {showAddExpense && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[60] animate-fade-in">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto animate-modal`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : ''}`}>{editingExpense ? 'Edit' : 'Add'} Transaction</h3>
              <button
                onClick={() => {
                  setShowAddExpense(false);
                  setEditingExpense(null);
                }}
                className={darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setExpenseForm({ ...expenseForm, type: 'expense' })}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      expenseForm.type === 'expense'
                        ? 'bg-red-600 text-white'
                        : darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpenseForm({ ...expenseForm, type: 'income' })}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      expenseForm.type === 'income'
                        ? 'bg-green-600 text-white'
                        : darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Income
                  </button>
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Amount</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className={`w-full px-4 py-2 border ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Category</label>
                <select
                  className={`w-full px-4 py-2 border ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  value={expenseForm.category}
                  onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                >
                  {getExpenseCategories().length > 0 || getIncomeCategories().length > 0 ? (
                    (expenseForm.type === 'expense' ? getExpenseCategories() : getIncomeCategories()).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))
                  ) : (
                    <option disabled value="">Loading categories...</option>
                  )}
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Description</label>
                <input
                  type="text"
                  placeholder="e.g., Grocery shopping"
                  className={`w-full px-4 py-2 border ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Date</label>
                <input
                  type="date"
                  className={`w-full px-4 py-2 border ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  value={expenseForm.date}
                  onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Payment Method</label>
                <select
                  className={`input-field ${darkMode ? 'text-white' : ''}`}
                  value={expenseForm.paymentMethod}
                  onChange={(e) => setExpenseForm({ ...expenseForm, paymentMethod: e.target.value })}
                >
                  <option value="Cash">Cash</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Digital Wallet">Digital Wallet</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-gradient py-3 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Saving...' : (editingExpense ? 'Update' : 'Add')} Transaction
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add/Edit Recurring Expense Modal */}
      {showAddRecurring && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[60] animate-fade-in">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto animate-modal`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : ''}`}>{editingRecurring ? 'Edit' : 'Add'} Recurring Expense</h3>
              <button
                onClick={() => {
                  setShowAddRecurring(false);
                  setEditingRecurring(null);
                }}
                className={darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddRecurring} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRecurringForm({ ...recurringForm, type: 'expense' })}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      recurringForm.type === 'expense'
                        ? 'bg-red-600 text-white'
                        : darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecurringForm({ ...recurringForm, type: 'income' })}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      recurringForm.type === 'income'
                        ? 'bg-green-600 text-white'
                        : darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Income
                  </button>
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Amount</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className={`w-full px-4 py-2 border ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  value={recurringForm.amount}
                  onChange={(e) => setRecurringForm({ ...recurringForm, amount: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Category</label>
                <select
                  className={`w-full px-4 py-2 border ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  value={recurringForm.category}
                  onChange={(e) => setRecurringForm({ ...recurringForm, category: e.target.value })}
                >
                  {getExpenseCategories().length > 0 || getIncomeCategories().length > 0 ? (
                    (recurringForm.type === 'expense' ? getExpenseCategories() : getIncomeCategories()).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))
                  ) : (
                    <option disabled value="">Loading categories...</option>
                  )}
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Description</label>
                <input
                  type="text"
                  placeholder="e.g., Netflix Subscription"
                  className={`w-full px-4 py-2 border ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  value={recurringForm.description}
                  onChange={(e) => setRecurringForm({ ...recurringForm, description: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Frequency</label>
                <select
                  className={`w-full px-4 py-2 border ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  value={recurringForm.frequency}
                  onChange={(e) => setRecurringForm({ ...recurringForm, frequency: e.target.value })}
                >
                  <option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Day of Month (1-31)</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  placeholder="1"
                  className={`w-full px-4 py-2 border ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  value={recurringForm.dayOfMonth}
                  onChange={(e) => setRecurringForm({ ...recurringForm, dayOfMonth: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Start Date</label>
                <input
                  type="date"
                  className={`w-full px-4 py-2 border ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  value={recurringForm.startDate}
                  onChange={(e) => setRecurringForm({ ...recurringForm, startDate: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Payment Method</label>
                <select
                  className={`w-full px-4 py-2 border ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  value={recurringForm.paymentMethod}
                  onChange={(e) => setRecurringForm({ ...recurringForm, paymentMethod: e.target.value })}
                >
                  <option value="Cash">Cash</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Digital Wallet">Digital Wallet</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Saving...' : (editingRecurring ? 'Update' : 'Add')} Recurring
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Budget Modal */}
      {showAddBudget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl p-6 w-full max-w-md`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : ''}`}>{editingBudget ? 'Edit' : 'Set'} Budget</h3>
              <button
                onClick={() => {
                  setShowAddBudget(false);
                  setEditingBudget(null);
                }}
                className={darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddBudget} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Category</label>
                <select
                  className={`w-full px-4 py-2 border ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  value={budgetForm.category}
                  onChange={(e) => setBudgetForm({ ...budgetForm, category: e.target.value })}
                >
                  {getExpenseCategories().length > 0 ? (
                    getExpenseCategories().map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))
                  ) : (
                    <option disabled value="">No categories available</option>
                  )}
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Budget Limit</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className={`w-full px-4 py-2 border ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  value={budgetForm.limit}
                  onChange={(e) => setBudgetForm({ ...budgetForm, limit: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Month</label>
                <input
                  type="month"
                  className={`w-full px-4 py-2 border ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  value={budgetForm.month}
                  onChange={(e) => setBudgetForm({ ...budgetForm, month: e.target.value })}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                  {loading ? 'Saving...' : (editingBudget ? 'Update Budget' : 'Set Budget')}
              </button>
            </form>
          </div>
        </div>
      )}

      {showAddCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl p-6 w-full max-w-md`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : ''}`}>{editingCategory ? 'Edit' : 'Add'} Category</h3>
              <button
                onClick={() => {
                  setShowAddCategory(false);
                  setEditingCategory(null);
                }}
                className={darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setCategoryForm({ ...categoryForm, type: 'expense' })}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      categoryForm.type === 'expense'
                        ? 'bg-red-600 text-white'
                        : darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    disabled={editingCategory}
                  >
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategoryForm({ ...categoryForm, type: 'income' })}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      categoryForm.type === 'income'
                        ? 'bg-green-600 text-white'
                        : darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    disabled={editingCategory}
                  >
                    Income
                  </button>
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Name</label>
                <input
                  type="text"
                  placeholder="e.g., Groceries"
                  className={`w-full px-4 py-2 border ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Icon (Emoji)</label>
                <input
                  type="text"
                  placeholder="📁"
                  className={`w-full px-4 py-2 border ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  value={categoryForm.icon}
                  onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                  maxLength={2}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Color</label>
                <input
                  type="color"
                  className={`w-full h-12 px-2 py-1 border ${darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300'} rounded-lg cursor-pointer`}
                  value={categoryForm.color}
                  onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Saving...' : (editingCategory ? 'Update' : 'Add')} Category
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Mobile Bottom Navigation */}
      <div className="md:hidden">
        <MobileBottomNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          darkMode={darkMode}
          setShowAddExpense={setShowAddExpense}
        />
      </div>
    </div>
  );
}