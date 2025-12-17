import React from 'react';
import { Search, Filter, Download, FileText, PlusCircle, Table as TableIcon, List, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ExpensesView({
  expenses,
  filteredExpenses,
  currentExpenses, // paginated
  searchTerm,
  setSearchTerm,
  showFilters,
  setShowFilters,
  filters,
  setFilters,
  clearFilters,
  exportToCSV,
  handleExportPDF,
  setShowAddExpense,
  setEditingExpense,
  resetExpenseForm,
  expenseViewMode,
  setExpenseViewMode,
  categories,
  formatAmount,
  handleEditExpense,
  handleDeleteExpense,
  currentPage,
  setCurrentPage,
  totalPages,
  indexOfFirstItem,
  indexOfLastItem,
  darkMode
}) {
  return (
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
            onClick={() => exportToCSV(expenses, `expenses_export_${new Date().toISOString().slice(0, 10)}.csv`)}
            disabled={expenses.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            CSV
          </button>

          <button
            onClick={handleExportPDF}
            disabled={expenses.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileText className="w-4 h-4" />
            PDF
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
                {categories.map(cat => (
                  <option key={cat._id} value={cat.name}>{cat.name}</option>
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

      {/* View Toggle & Content */}
      <div className="flex justify-end gap-2 mb-4">
         <button
           onClick={() => setExpenseViewMode('table')}
           className={`p-2 rounded-lg transition ${expenseViewMode === 'table' ? 'bg-blue-600 text-white' : (darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600')}`}
           title="Table View"
         >
           <TableIcon className="w-5 h-5" />
         </button>
         <button
           onClick={() => setExpenseViewMode('daily')}
           className={`p-2 rounded-lg transition ${expenseViewMode === 'daily' ? 'bg-blue-600 text-white' : (darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600')}`}
           title="Daily View"
         >
           <List className="w-5 h-5" />
         </button>
      </div>

      {expenseViewMode === 'daily' ? (
        <div className="space-y-4">
          {Object.values(filteredExpenses.reduce((groups, expense) => {
              const date = expense.date.split('T')[0];
              if (!groups[date]) groups[date] = { date, income: 0, expense: 0, items: [] };
              groups[date].items.push(expense);
              if (expense.type === 'income') groups[date].income += expense.amount;
              else groups[date].expense += expense.amount;
              return groups;
            }, {})).sort((a, b) => new Date(b.date) - new Date(a.date)).map(group => (
            <div key={group.date} className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
              <div className={`p-4 border-b ${darkMode ? 'bg-gray-750 border-gray-700' : 'bg-gray-50 border-gray-100'} flex justify-between items-center`}>
                <div className="flex items-center gap-3">
                   <span className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                     {new Date(group.date).getDate()}
                   </span>
                   <div className="flex flex-col">
                     <span className={`text-xs font-medium uppercase ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                       {new Date(group.date).toLocaleDateString('default', { weekday: 'long' })}
                     </span>
                     <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                       {new Date(group.date).toLocaleDateString('default', { month: 'long', year: 'numeric' })}
                     </span>
                   </div>
                </div>
                <div className="flex gap-4 text-sm font-semibold">
                   {group.income > 0 && <span className="text-green-500">+{formatAmount(group.income)}</span>}
                   {group.expense > 0 && <span className="text-red-500">-{formatAmount(group.expense)}</span>}
                </div>
              </div>
              <div className="divide-y dark:divide-gray-700">
                {group.items.map(expense => (
                  <div key={expense._id} className={`p-4 flex justify-between items-center hover:bg-opacity-50 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-blue-50'} text-2xl`}>
                         {categories.find(c => c.name === expense.category)?.icon || '📝'}
                      </div>
                      <div>
                         <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{expense.category}</p>
                         <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{expense.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                       <p className={`font-semibold ${expense.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                         {expense.type === 'income' ? '+' : '-'}{formatAmount(expense.amount)}
                       </p>
                       <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{expense.paymentMethod}</p>
                       <div className="flex gap-2 justify-end mt-1">
                          <button onClick={() => handleEditExpense(expense)} className="text-blue-500 hover:text-blue-600"><Edit2 size={14} /></button>
                          <button onClick={() => handleDeleteExpense(expense._id)} className="text-red-500 hover:text-red-600"><Trash2 size={14} /></button>
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {filteredExpenses.length === 0 && (
            <div className={`p-8 text-center ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              No transactions found.
            </div>
          )}
        </div>
      ) : (
      /* Transactions Table */
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-x-auto`}>
        {currentExpenses.length > 0 ? (
          <>
            <table className="w-full">
              <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} border-b ${darkMode ? 'border-gray-600' : ''}`}>
                <tr>
                  <th className={`px-3 md:px-6 py-3 text-left text-xs md:text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Date</th>
                  <th className={`px-3 md:px-6 py-3 text-left text-xs md:text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Desc</th>
                  <th className={`hidden md:table-cell px-6 py-3 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Category</th>
                  <th className={`hidden lg:table-cell px-6 py-3 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Payment</th>
                  <th className={`px-3 md:px-6 py-3 text-left text-xs md:text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Amount</th>
                  <th className={`px-3 md:px-6 py-3 text-left text-xs md:text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {currentExpenses.map(expense => (
                  <tr key={expense._id} className={`${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                    <td className={`px-3 md:px-6 py-4 text-xs md:text-sm ${darkMode ? 'text-gray-300' : ''}`}>
                      <span className="md:hidden">{expense.date.split('T')[0].slice(5)}</span>
                      <span className="hidden md:inline">{expense.date.split('T')[0]}</span>
                    </td>
                    <td className={`px-3 md:px-6 py-4 text-xs md:text-sm font-medium ${darkMode ? 'text-white' : ''}`}>
                      <div className="truncate max-w-[80px] md:max-w-none">{expense.description}</div>
                      <div className="text-[10px] text-gray-500 md:hidden">{expense.category}</div>
                    </td>
                    <td className={`hidden md:table-cell px-6 py-4 text-sm ${darkMode ? 'text-gray-300' : ''}`}>{expense.category}</td>
                    <td className={`hidden lg:table-cell px-6 py-4 text-sm ${darkMode ? 'text-gray-300' : ''}`}>{expense.paymentMethod}</td>
                    <td className="px-3 md:px-6 py-4 text-xs md:text-sm">
                      <span className={`font-semibold ${expense.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {expense.type === 'income' ? '+' : '-'}{formatAmount(expense.amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditExpense(expense)}
                          className={`p-1 text-blue-600 rounded ${darkMode ? 'hover:bg-blue-900/50' : 'hover:bg-blue-50'}`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteExpense(expense._id)}
                          className={`p-1 text-red-600 rounded ${darkMode ? 'hover:bg-red-900/50' : 'hover:bg-red-50'}`}
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
      )}
    </div>
  );
}
