// ============================================================================
// FINAL UI COMPONENTS TO ADD TO APP.JSX
// ============================================================================
// These components complete the Phase 2 implementation
// Add them to the appropriate locations in App.jsx as indicated

// ============================================================================
// SECTION 1: UPDATE TRANSACTION FORM CATEGORY DROPDOWN
// ============================================================================
// Find the category dropdown in the Add/Edit Expense Modal (around line 1380)
// Replace the existing category select with this:

/*
<div>
  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Category</label>
  <select
    className={`w-full px-4 py-2 border ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
    value={expenseForm.category}
    onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
  >
    {(expenseForm.type === 'expense' ? getExpenseCategories() : getIncomeCategories()).map(cat => (
      <option key={cat} value={cat}>{cat}</option>
    ))}
  </select>
</div>
*/

// ============================================================================
// SECTION 2: UPDATE RECURRING FORM CATEGORY DROPDOWN
// ============================================================================
// Find the category dropdown in the Add/Edit Recurring Modal (around line 1500)
// Replace with:

/*
<div>
  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Category</label>
  <select
    className={`w-full px-4 py-2 border ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
    value={recurringForm.category}
    onChange={(e) => setRecurringForm({ ...recurringForm, category: e.target.value })}
  >
    {(recurringForm.type === 'expense' ? getExpenseCategories() : getIncomeCategories()).map(cat => (
      <option key={cat} value={cat}>{cat}</option>
    ))}
  </select>
</div>
*/

// ============================================================================
// SECTION 3: UPDATE BUDGET FORM CATEGORY DROPDOWN
// ============================================================================
// Find the category dropdown in the Set Budget Modal (around line 1610)
// Replace with:

/*
<div>
  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Category</label>
  <select
    className={`w-full px-4 py-2 border ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
    value={budgetForm.category}
    onChange={(e) => setBudgetForm({ ...budgetForm, category: e.target.value })}
  >
    {getExpenseCategories().map(cat => (
      <option key={cat} value={cat}>{cat}</option>
    ))}
  </select>
</div>
*/

// ============================================================================
// SECTION 4: ADD TRENDS TAB
// ============================================================================
// Add this AFTER the analytics tab section (around line 1315)
// Insert between the closing of analytics tab and before the closing </main>

const TrendsTab = `
        {activeTab === 'trends' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className={\`text-2xl font-bold \${darkMode ? 'text-white' : ''}\`}>Trend Analysis</h2>
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
                  <div className={\`\${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6 rounded-xl shadow-sm border\`}>
                    <div className="flex items-center gap-3 mb-2">
                      <BarChart3 className="w-8 h-8 text-blue-600" />
                      <h3 className={\`font-semibold \${darkMode ? 'text-white' : ''}\`}>Avg Monthly Expense</h3>
                    </div>
                    <p className="text-3xl font-bold text-blue-600">\${trendData.insights.avgMonthlyExpense.toFixed(2)}</p>
                  </div>

                  <div className={\`\${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6 rounded-xl shadow-sm border\`}>
                    <div className="flex items-center gap-3 mb-2">
                      <TrendingUp className="w-8 h-8 text-green-600" />
                      <h3 className={\`font-semibold \${darkMode ? 'text-white' : ''}\`}>Avg Monthly Income</h3>
                    </div>
                    <p className="text-3xl font-bold text-green-600">\${trendData.insights.avgMonthlyIncome.toFixed(2)}</p>
                  </div>

                  {trendData.insights.prediction && (
                    <div className={\`\${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6 rounded-xl shadow-sm border\`}>
                      <div className="flex items-center gap-3 mb-2">
                        <Calendar className="w-8 h-8 text-purple-600" />
                        <h3 className={\`font-semibold \${darkMode ? 'text-white' : ''}\`}>Next Month Estimate</h3>
                      </div>
                      <p className="text-3xl font-bold text-purple-600">\${trendData.insights.prediction.estimatedExpense.toFixed(2)}</p>
                      <p className={\`text-sm \${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1\`}>Confidence: {trendData.insights.prediction.confidence}</p>
                    </div>
                  )}
                </div>

                {/* Monthly Trends Chart */}
                <div className={\`\${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6 rounded-xl shadow-sm border\`}>
                  <h3 className={\`text-lg font-semibold mb-4 \${darkMode ? 'text-white' : ''}\`}>Monthly Trends</h3>
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
                <div className={\`\${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6 rounded-xl shadow-sm border\`}>
                  <h3 className={\`text-lg font-semibold mb-4 \${darkMode ? 'text-white' : ''}\`}>Month-over-Month Changes</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className={\`\${darkMode ? 'bg-gray-700' : 'bg-gray-50'} border-b \${darkMode ? 'border-gray-600' : ''}\`}>
                        <tr>
                          <th className={\`px-6 py-3 text-left text-sm font-semibold \${darkMode ? 'text-gray-300' : 'text-gray-700'}\`}>Month</th>
                          <th className={\`px-6 py-3 text-left text-sm font-semibold \${darkMode ? 'text-gray-300' : 'text-gray-700'}\`}>Income</th>
                          <th className={\`px-6 py-3 text-left text-sm font-semibold \${darkMode ? 'text-gray-300' : 'text-gray-700'}\`}>Expense</th>
                          <th className={\`px-6 py-3 text-left text-sm font-semibold \${darkMode ? 'text-gray-300' : 'text-gray-700'}\`}>Income Change</th>
                          <th className={\`px-6 py-3 text-left text-sm font-semibold \${darkMode ? 'text-gray-300' : 'text-gray-700'}\`}>Expense Change</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {trendData.monthlyTrends.slice(-6).map(trend => (
                          <tr key={trend.month} className={\`\${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}\`}>
                            <td className={\`px-6 py-4 text-sm \${darkMode ? 'text-gray-300' : ''}\`}>{trend.month}</td>
                            <td className={\`px-6 py-4 text-sm font-medium text-green-600\`}>\${trend.income.toFixed(2)}</td>
                            <td className={\`px-6 py-4 text-sm font-medium text-red-600\`}>\${trend.expense.toFixed(2)}</td>
                            <td className={\`px-6 py-4 text-sm font-medium \${trend.incomeChange >= 0 ? 'text-green-600' : 'text-red-600'}\`}>
                              {trend.incomeChange >= 0 ? '+' : ''}{trend.incomeChange}%
                            </td>
                            <td className={\`px-6 py-4 text-sm font-medium \${trend.expenseChange <= 0 ? 'text-green-600' : 'text-red-600'}\`}>
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
              <div className={\`\${darkMode ? 'bg-gray-800 border-gray-700 text-gray-500' : 'bg-white border-gray-200 text-gray-500'} p-8 rounded-xl shadow-sm border text-center\`}>
                <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Loading trend data...</p>
              </div>
            )}
          </div>
        )}
`;

// Copy the above TrendsTab content (without the backticks) and paste it into App.jsx

// ============================================================================
// SECTION 5: ADD CATEGORIES TAB
// ============================================================================
// Add this AFTER the trends tab section

const CategoriesTab = `
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className={\`text-2xl font-bold \${darkMode ? 'text-white' : ''}\`}>Manage Categories</h2>
              <button
                onClick={() => {
                  setShowAddCategory(true);
                  setEditingCategory(null);
                  setCategoryForm({ name: '', type: 'expense', icon: '📁', color: '#3b82f6' });
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Plus className="w-4 h-4" />
                Add Category
              </button>
            </div>

            {/* Expense Categories */}
            <div>
              <h3 className={\`text-lg font-semibold mb-4 \${darkMode ? 'text-white' : ''}\`}>Expense Categories</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.filter(c => c.type === 'expense').map(category => (
                  <div key={category._id} className={\`\${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-4 rounded-xl shadow-sm border\`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">{category.icon}</div>
                        <div>
                          <p className={\`font-semibold \${darkMode ? 'text-white' : ''}\`}>{category.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="w-4 h-4 rounded" style={{ backgroundColor: category.color }}></div>
                            <span className={\`text-xs \${darkMode ? 'text-gray-400' : 'text-gray-600'}\`}>{category.color}</span>
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
                      <span className={\`text-xs \${darkMode ? 'text-gray-500' : 'text-gray-500'} mt-2 block\`}>Default category</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Income Categories */}
            <div>
              <h3 className={\`text-lg font-semibold mb-4 \${darkMode ? 'text-white' : ''}\`}>Income Categories</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.filter(c => c.type === 'income').map(category => (
                  <div key={category._id} className={\`\${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-4 rounded-xl shadow-sm border\`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">{category.icon}</div>
                        <div>
                          <p className={\`font-semibold \${darkMode ? 'text-white' : ''}\`}>{category.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="w-4 h-4 rounded" style={{ backgroundColor: category.color }}></div>
                            <span className={\`text-xs \${darkMode ? 'text-gray-400' : 'text-gray-600'}\`}>{category.color}</span>
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
                      <span className={\`text-xs \${darkMode ? 'text-gray-500' : 'text-gray-500'} mt-2 block\`}>Default category</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
`;

// Copy the above CategoriesTab content (without the backticks) and paste it into App.jsx

// ============================================================================
// SECTION 6: ADD CATEGORY MODAL
// ============================================================================
// Add this AFTER the Set Budget Modal (around line 1655)

const CategoryModal = `
      {/* Add Category Modal */}
      {showAddCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={\`\${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl p-6 w-full max-w-md\`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className={\`text-xl font-bold \${darkMode ? 'text-white' : ''}\`}>{editingCategory ? 'Edit' : 'Add'} Category</h3>
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
                <label className={\`block text-sm font-medium \${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2\`}>Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setCategoryForm({ ...categoryForm, type: 'expense' })}
                    className={\`px-4 py-2 rounded-lg font-medium transition \${
                      categoryForm.type === 'expense'
                        ? 'bg-red-600 text-white'
                        : darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }\`}
                    disabled={editingCategory}
                  >
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategoryForm({ ...categoryForm, type: 'income' })}
                    className={\`px-4 py-2 rounded-lg font-medium transition \${
                      categoryForm.type === 'income'
                        ? 'bg-green-600 text-white'
                        : darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }\`}
                    disabled={editingCategory}
                  >
                    Income
                  </button>
                </div>
              </div>

              <div>
                <label className={\`block text-sm font-medium \${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2\`}>Name</label>
                <input
                  type="text"
                  placeholder="e.g., Groceries"
                  className={\`w-full px-4 py-2 border \${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent\`}
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className={\`block text-sm font-medium \${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2\`}>Icon (Emoji)</label>
                <input
                  type="text"
                  placeholder="📁"
                  className={\`w-full px-4 py-2 border \${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent\`}
                  value={categoryForm.icon}
                  onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                  maxLength={2}
                />
              </div>

              <div>
                <label className={\`block text-sm font-medium \${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2\`}>Color</label>
                <input
                  type="color"
                  className={\`w-full h-12 px-2 py-1 border \${darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300'} rounded-lg cursor-pointer\`}
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
`;

// Copy the above CategoryModal content (without the backticks) and paste it into App.jsx

// ============================================================================
// INTEGRATION CHECKLIST
// ============================================================================
/*
[ ] Section 1: Update transaction form category dropdown (line ~1380)
[ ] Section 2: Update recurring form category dropdown (line ~1500)
[ ] Section 3: Update budget form category dropdown (line ~1610)
[ ] Section 4: Add Trends tab (after analytics tab, line ~1315)
[ ] Section 5: Add Categories tab (after trends tab)
[ ] Section 6: Add Category modal (after budget modal, line ~1655)
[ ] Test all features
[ ] Configure email settings in backend .env
*/
