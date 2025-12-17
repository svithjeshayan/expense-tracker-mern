import React, { useState, useEffect } from 'react';
import { PlusCircle, TrendingUp, TrendingDown, Wallet, Download, Edit2, Trash2, Save, X, DollarSign, LogOut, User, Moon, Sun, Search, Filter, ChevronLeft, ChevronRight, RefreshCw, Calendar } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart as RechartsPie, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from './api/axios';

const CATEGORIES = [
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

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1'];

export default function ExpenseTracker() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLogin, setIsLogin] = useState(true);
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [recurringExpenses, setRecurringExpenses] = useState([]);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddBudget, setShowAddBudget] = useState(false);
  const [showAddRecurring, setShowAddRecurring] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [editingRecurring, setEditingRecurring] = useState(null);
  
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
    category: 'Food & Dining',
    description: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'Cash',
    type: 'expense'
  });

  const [recurringForm, setRecurringForm] = useState({
    amount: '',
    category: 'Food & Dining',
    description: '',
    paymentMethod: 'Cash',
    type: 'expense',
    frequency: 'monthly',
    startDate: new Date().toISOString().split('T')[0],
    dayOfMonth: '1'
  });

  const [budgetForm, setBudgetForm] = useState({
    category: 'Food & Dining',
    limit: '',
    month: new Date().toISOString().slice(0, 7)
  });

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
    checkAuth();
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
        loadUserData();
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('token');
      }
    }
  };

  const loadUserData = async () => {
    try {
      const [expensesRes, budgetsRes, recurringRes] = await Promise.all([
        api.get('/expenses'),
        api.get('/budgets'),
        api.get('/recurring').catch(() => ({ data: [] }))
      ]);
      setExpenses(expensesRes.data);
      setBudgets(budgetsRes.data);
      setRecurringExpenses(recurringRes.data);
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
    try {
      const expenseData = {
        ...expenseForm,
        amount: parseFloat(expenseForm.amount)
      };
      
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
      try {
        await api.delete(`/expenses/${id}`);
        await loadUserData();
      } catch (error) {
        alert('Error deleting transaction');
      }
    }
  };

  const handleDeleteRecurring = async (id) => {
    if (window.confirm('Are you sure you want to delete this recurring expense?')) {
      try {
        await api.delete(`/recurring/${id}`);
        await loadUserData();
      } catch (error) {
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

  const handleAddBudget = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const budgetData = {
        ...budgetForm,
        limit: parseFloat(budgetForm.limit)
      };
      await api.post('/budgets', budgetData);
      await loadUserData();
      setShowAddBudget(false);
      setBudgetForm({
        category: 'Food & Dining',
        limit: '',
        month: new Date().toISOString().slice(0, 7)
      });
    } catch (error) {
      alert(error.response?.data?.message || 'Error setting budget');
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

  // Analytics calculations
  const totalIncome = expenses.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
  const totalExpense = expenses.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
  const balance = totalIncome - totalExpense;

  const categoryData = CATEGORIES.map(cat => ({
    name: cat,
    value: expenses.filter(e => e.category === cat && e.type === 'expense').reduce((sum, e) => sum + e.amount, 0)
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
  const currentMonth = new Date().toISOString().slice(0, 7);
  const budgetAnalysis = budgets.filter(b => b.month === currentMonth).map(budget => {
    const spent = expenses.filter(e => 
      e.category === budget.category && 
      e.type === 'expense' && 
      e.date.startsWith(currentMonth)
    ).reduce((sum, e) => sum + e.amount, 0);
    
    return {
      category: budget.category,
      limit: budget.limit,
      spent,
      percentage: (spent / budget.limit) * 100
    };
  });

  if (!currentUser) {
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
            <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Expense Tracker</h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 text-yellow-400' : 'bg-gray-100 text-gray-600'} hover:opacity-80 transition`}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} flex items-center gap-2`}>
              <User className="w-5 h-5" />
              {currentUser.name}
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
      <nav className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} shadow-sm border-b`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-2">
            {['dashboard', 'expenses', 'recurring', 'budgets', 'analytics'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-medium capitalize transition ${
                  activeTab === tab
                    ? `${darkMode ? 'text-blue-400' : 'text-blue-600'} border-b-2 ${darkMode ? 'border-blue-400' : 'border-blue-600'}`
                    : `${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'}`
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6 rounded-xl shadow-sm border`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>Total Income</p>
                    <p className="text-3xl font-bold text-green-600 mt-2">
                      ${totalIncome.toFixed(2)}
                    </p>
                  </div>
                  <TrendingUp className="w-12 h-12 text-green-600 opacity-20" />
                </div>
              </div>

              <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6 rounded-xl shadow-sm border`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>Total Expenses</p>
                    <p className="text-3xl font-bold text-red-600 mt-2">
                      ${totalExpense.toFixed(2)}
                    </p>
                  </div>
                  <TrendingDown className="w-12 h-12 text-red-600 opacity-20" />
                </div>
              </div>

              <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6 rounded-xl shadow-sm border`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>Balance</p>
                    <p className={`text-3xl font-bold mt-2 ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                      ${balance.toFixed(2)}
                    </p>
                  </div>
                  <DollarSign className="w-12 h-12 text-blue-600 opacity-20" />
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6 rounded-xl shadow-sm border`}>
                <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : ''}`}>Income vs Expenses</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                    <XAxis dataKey="month" stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                    <YAxis stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                    <Tooltip contentStyle={{ backgroundColor: darkMode ? '#1f2937' : '#fff', border: darkMode ? '1px solid #374151' : '1px solid #e5e7eb' }} />
                    <Legend />
                    <Bar dataKey="income" fill="#10b981" />
                    <Bar dataKey="expense" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6 rounded-xl shadow-sm border`}>
                <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : ''}`}>Expenses by Category</h3>
                {categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPie>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => entry.name}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: darkMode ? '#1f2937' : '#fff' }} />
                    </RechartsPie>
                  </ResponsiveContainer>
                ) : (
                  <div className={`h-[300px] flex items-center justify-center ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    No expense data available
                  </div>
                )}
              </div>
            </div>

            {/* Recent Transactions */}
            <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6 rounded-xl shadow-sm border`}>
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : ''}`}>Recent Transactions</h3>
              {expenses.length > 0 ? (
                <div className="space-y-3">
                  {expenses.slice(-5).reverse().map(expense => (
                    <div key={expense._id} className={`flex items-center justify-between p-3 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          expense.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {expense.type === 'income' ? (
                            <TrendingUp className="w-5 h-5 text-green-600" />
                          ) : (
                            <TrendingDown className="w-5 h-5 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className={`font-medium ${darkMode ? 'text-white' : ''}`}>{expense.description}</p>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{expense.category} • {expense.date.split('T')[0]}</p>
                        </div>
                      </div>
                      <p className={`font-semibold ${expense.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {expense.type === 'income' ? '+' : '-'}${expense.amount.toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={`${darkMode ? 'text-gray-500' : 'text-gray-500'} text-center py-8`}>No transactions yet. Add your first transaction!</p>
              )}
            </div>
          </div>
        )}

        {/* Expenses Tab */}
        {activeTab === 'expenses' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : ''}`}>All Transactions</h2>
              
              {/* Search and Filter Bar */}
              <div className="flex flex-wrap gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:flex-initial">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                  <input
                    type="text"
                    placeholder="Search transactions..."
                    className={`pl-10 pr-4 py-2 border ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 w-full md:w-64`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-2 ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-700'} rounded-lg hover:opacity-80 transition`}
                >
                  <Filter className="w-4 h-4" />
                  Filters
                </button>

                <button
                  onClick={exportToCSV}
                  disabled={expenses.length === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
                
                <button
                  onClick={() => {
                    setShowAddExpense(true);
                    setEditingExpense(null);
                    resetExpenseForm();
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <PlusCircle className="w-4 h-4" />
                  Add
                </button>
              </div>
            </div>

            {/* Advanced Filters Panel */}
            {showFilters && (
              <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6 rounded-xl shadow-sm border`}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Category</label>
                    <select
                      className={`w-full px-4 py-2 border ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'} rounded-lg`}
                      value={filters.category}
                      onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    >
                      <option value="">All Categories</option>
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Type</label>
                    <select
                      className={`w-full px-4 py-2 border ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'} rounded-lg`}
                      value={filters.type}
                      onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                    >
                      <option value="">All Types</option>
                      <option value="income">Income</option>
                      <option value="expense">Expense</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Payment Method</label>
                    <select
                      className={`w-full px-4 py-2 border ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'} rounded-lg`}
                      value={filters.paymentMethod}
                      onChange={(e) => setFilters({ ...filters, paymentMethod: e.target.value })}
                    >
                      <option value="">All Methods</option>
                      <option value="Cash">Cash</option>
                      <option value="Credit Card">Credit Card</option>
                      <option value="Debit Card">Debit Card</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Digital Wallet">Digital Wallet</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Start Date</label>
                    <input
                      type="date"
                      className={`w-full px-4 py-2 border ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'} rounded-lg`}
                      value={filters.startDate}
                      onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>End Date</label>
                    <input
                      type="date"
                      className={`w-full px-4 py-2 border ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'} rounded-lg`}
                      value={filters.endDate}
                      onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Amount Range</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        className={`w-1/2 px-4 py-2 border ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'} rounded-lg`}
                        value={filters.minAmount}
                        onChange={(e) => setFilters({ ...filters, minAmount: e.target.value })}
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        className={`w-1/2 px-4 py-2 border ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'} rounded-lg`}
                        value={filters.maxAmount}
                        onChange={(e) => setFilters({ ...filters, maxAmount: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={clearFilters}
                    className={`px-4 py-2 ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-700'} rounded-lg hover:opacity-80 transition`}
                  >
                    Clear Filters
                  </button>
                  <div className={`flex-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} flex items-center`}>
                    Showing {filteredExpenses.length} of {expenses.length} transactions
                  </div>
                </div>
              </div>
            )}

            {/* Transactions Table */}
            <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-x-auto`}>
              {currentExpenses.length > 0 ? (
                <>
                  <table className="w-full">
                    <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} border-b ${darkMode ? 'border-gray-600' : ''}`}>
                      <tr>
                        <th className={`px-6 py-3 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Date</th>
                        <th className={`px-6 py-3 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Description</th>
                        <th className={`px-6 py-3 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Category</th>
                        <th className={`px-6 py-3 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Payment</th>
                        <th className={`px-6 py-3 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Amount</th>
                        <th className={`px-6 py-3 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {currentExpenses.map(expense => (
                        <tr key={expense._id} className={`${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                          <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-300' : ''}`}>{expense.date.split('T')[0]}</td>
                          <td className={`px-6 py-4 text-sm font-medium ${darkMode ? 'text-white' : ''}`}>{expense.description}</td>
                          <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-300' : ''}`}>{expense.category}</td>
                          <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-300' : ''}`}>{expense.paymentMethod}</td>
                          <td className="px-6 py-4 text-sm">
                            <span className={`font-semibold ${expense.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                              {expense.type === 'income' ? '+' : '-'}${expense.amount.toFixed(2)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditExpense(expense)}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteExpense(expense._id)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className={`px-6 py-4 border-t ${darkMode ? 'border-gray-700' : ''} flex items-center justify-between`}>
                      <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredExpenses.length)} of {filteredExpenses.length} entries
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className={`px-3 py-1 rounded ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-700'} disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-80`}
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        {[...Array(totalPages)].map((_, i) => (
                          <button
                            key={i + 1}
                            onClick={() => setCurrentPage(i + 1)}
                            className={`px-3 py-1 rounded ${
                              currentPage === i + 1
                                ? 'bg-blue-600 text-white'
                                : darkMode ? 'bg-gray-700 text-white hover:opacity-80' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {i + 1}
                          </button>
                        ))}
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className={`px-3 py-1 rounded ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-700'} disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-80`}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className={`p-8 text-center ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  <p>No transactions found. {searchTerm || Object.values(filters).some(v => v) ? 'Try adjusting your filters.' : 'Click "Add" to get started!'}</p>
                </div>
              )}
            </div>
          </div>
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
                        ${recurring.amount.toFixed(2)}
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
            <div className="flex justify-between items-center">
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : ''}`}>Budget Management</h2>
              <button
                onClick={() => setShowAddBudget(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <PlusCircle className="w-4 h-4" />
                Set Budget
              </button>
            </div>

            {budgetAnalysis.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {budgetAnalysis.map(budget => (
                  <div key={budget.category} className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6 rounded-xl shadow-sm border`}>
                    <h3 className={`font-semibold text-lg mb-4 ${darkMode ? 'text-white' : ''}`}>{budget.category}</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Spent</span>
                        <span className={`font-semibold ${darkMode ? 'text-white' : ''}`}>${budget.spent.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Budget</span>
                        <span className={`font-semibold ${darkMode ? 'text-white' : ''}`}>${budget.limit.toFixed(2)}</span>
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
                ))}
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
                    <YAxis stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                    <Tooltip contentStyle={{ backgroundColor: darkMode ? '#1f2937' : '#fff', border: darkMode ? '1px solid #374151' : '1px solid #e5e7eb' }} />
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
      </main>

      {/* Add/Edit Expense Modal */}
      {showAddExpense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto`}>
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
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
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
                  className={`w-full px-4 py-2 border ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
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
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto`}>
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
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl p-6 w-full max-w-md`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : ''}`}>Set Budget</h3>
              <button
                onClick={() => setShowAddBudget(false)}
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
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
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
                {loading ? 'Saving...' : 'Set Budget'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}