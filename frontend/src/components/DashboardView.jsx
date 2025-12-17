import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Calendar, PlusCircle } from 'lucide-react';
import { BarChart, Bar, PieChart as RechartsPie, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1'];

export default function DashboardView({
  totalIncome,
  totalExpense,
  balance,
  chartData,
  categoryData,
  trendData,
  expenses,
  darkMode,
  formatAmount,
  userCurrency,
  setShowAddExpense,
  setExpenseForm
}) {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Income Card */}
        <div className={`relative overflow-hidden p-4 md:p-6 rounded-2xl shadow-lg card-hover ${darkMode ? 'bg-gray-800' : 'bg-white'} border border-transparent`}>
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/90 to-green-600/90 dark:from-green-600/90 dark:to-green-700/90 z-0"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Total Income</p>
              <p className="text-2xl md:text-3xl font-bold text-white mt-2 truncate max-w-[200px] md:max-w-none">
                {formatAmount(totalIncome)}
              </p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        {/* Expense Card */}
        <div className={`relative overflow-hidden p-4 md:p-6 rounded-2xl shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} border border-transparent`}>
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/90 to-red-600/90 dark:from-red-600/90 dark:to-red-700/90 z-0"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">Total Expenses</p>
              <p className="text-2xl md:text-3xl font-bold text-white mt-2 truncate max-w-[200px] md:max-w-none">
                {formatAmount(totalExpense)}
              </p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <TrendingDown className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        {/* Balance Card */}
        <div className={`relative overflow-hidden p-4 md:p-6 rounded-2xl shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} border border-transparent`}>
          <div className={`absolute inset-0 bg-gradient-to-br z-0 ${balance >= 0 ? 'from-blue-500/90 to-blue-600/90 dark:from-blue-600/90 dark:to-blue-700/90' : 'from-orange-500/90 to-orange-600/90'}`}></div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Balance</p>
              <p className="text-2xl md:text-3xl font-bold text-white mt-2 truncate max-w-[200px] md:max-w-none">
                {formatAmount(balance)}
              </p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <DollarSign className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6 rounded-xl shadow-sm border`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : ''}`}>Income vs Expenses</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
              <XAxis dataKey="month" stroke={darkMode ? '#9ca3af' : '#6b7280'} />
              <YAxis stroke={darkMode ? '#9ca3af' : '#6b7280'} tickFormatter={val => `${val}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: darkMode ? '#1f2937' : '#fff', border: darkMode ? '1px solid #374151' : '1px solid #e5e7eb' }}
                  cursor={{ fill: 'transparent' }}
                  itemStyle={{ color: darkMode ? '#E5E7EB' : '#111827' }}
                  labelStyle={{ color: darkMode ? '#E5E7EB' : '#111827' }}
                  formatter={(value) => [formatAmount(value), 'Amount']}
                />
              <Legend />
              <Bar dataKey="income" fill="#10b981" name="Income" />
              <Bar dataKey="expense" fill="#ef4444" name="Expense" />
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
                <Tooltip 
                  contentStyle={{ backgroundColor: darkMode ? '#1f2937' : '#fff', border: darkMode ? '1px solid #374151' : '1px solid #e5e7eb' }}
                  itemStyle={{ color: darkMode ? '#E5E7EB' : '#111827' }}
                  labelStyle={{ color: darkMode ? '#E5E7EB' : '#111827' }}
                  formatter={(value) => [formatAmount(value), 'Amount']}
                />
              </RechartsPie>
            </ResponsiveContainer>
          ) : (
            <div className={`h-[300px] flex items-center justify-center ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              No expense data available
            </div>
          )}
        </div>
      </div>

      {/* Analysis/Onboarding Section */}
      {expenses.length === 0 ? (
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-sm p-8 text-center border ${darkMode ? 'border-gray-700' : 'border-blue-100'} mt-6`}>
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Welcome to Expense Tracker!</h3>
          <p className={`mb-6 max-w-md mx-auto ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Get started by adding your first transaction. You can track both income and expenses to see your financial health.
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => {
                setShowAddExpense(true);
                setExpenseForm(prev => ({ ...prev, type: 'income' }));
              }}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl shadow-lg shadow-green-600/20 hover:shadow-green-600/40 hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
            >
              <PlusCircle className="w-5 h-5" />
              Add Income
            </button>
            <button
              onClick={() => {
                setShowAddExpense(true);
                setExpenseForm(prev => ({ ...prev, type: 'expense' }));
              }}
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl shadow-lg shadow-red-600/20 hover:shadow-red-600/40 hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
            >
              <PlusCircle className="w-5 h-5" />
              Add Expense
            </button>
          </div>
        </div>
      ) : (
        <div className={`mt-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} p-6 rounded-xl shadow-sm border`}>
          <h3 className={`text-lg font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Income vs Expense Trend</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData || chartData}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? '#374151' : '#E5E7EB'} />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: darkMode ? '#9CA3AF' : '#6B7280' }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: darkMode ? '#9CA3AF' : '#6B7280' }}
                  tickFormatter={(value) => userCurrency.currency === 'USD' ? `$${value}` : `${userCurrency.symbol}${value}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: darkMode ? '#1F2937' : '#FFFFFF', 
                    borderColor: darkMode ? '#374151' : '#E5E7EB',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  itemStyle={{ color: darkMode ? '#E5E7EB' : '#111827' }}
                  formatter={(value) => [formatAmount(value), 'Amount']}
                  cursor={{ fill: 'transparent' }}
                  labelStyle={{ color: darkMode ? '#E5E7EB' : '#111827' }}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="income" 
                  name="Income"
                  stroke="#10B981" 
                  fillOpacity={1} 
                  fill="url(#colorIncome)" 
                  strokeWidth={3}
                />
                <Area 
                  type="monotone" 
                  dataKey="expense" 
                  name="Expense"
                  stroke="#EF4444" 
                  fillOpacity={1} 
                  fill="url(#colorExpense)" 
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

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
  );
}
