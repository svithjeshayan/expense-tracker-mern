import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const StatsView = ({ expenses, categories, darkMode, formatAmount }) => {
  // Filter for expenses only for the stats
  const expenseExpenses = expenses.filter(e => e.type === 'expense');
  const totalExpense = expenseExpenses.reduce((sum, e) => sum + e.amount, 0);

  const data = categories
    .filter(c => c.type === 'expense')
    .map(cat => {
      const catTotal = expenseExpenses
        .filter(e => e.category === cat.name)
        .reduce((sum, e) => sum + e.amount, 0);
      return {
        name: cat.name,
        value: catTotal,
        color: cat.color || '#ccc',
        percentage: totalExpense > 0 ? (catTotal / totalExpense) * 100 : 0
      };
    })
    .filter(d => d.value > 0)
    .sort((a, b) => b.value - a.value);

  const COLORS = ['#FF8042', '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="h-full overflow-y-auto pb-20">
      <div className={`p-4 ${darkMode ? 'bg-gray-800' : 'bg-white'} mb-2`}>
        <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Expense Breakdown</h2>
        
        {/* Chart */}
        <div className="h-[250px] w-full flex items-center justify-center relative">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => formatAmount(value)}
                  contentStyle={{ backgroundColor: darkMode ? '#1f2937' : '#fff', borderColor: darkMode ? '#374151' : '#e5e7eb' }}
                  itemStyle={{ color: darkMode ? '#E5E7EB' : '#111827' }}
                  labelStyle={{ color: darkMode ? '#E5E7EB' : '#111827' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
             <div className="text-gray-400">No data</div>
          )}
          {/* Centered Total */}
           <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
             <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total</span>
             <span className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{formatAmount(totalExpense)}</span>
           </div>
        </div>
      </div>

      {/* List */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        {data.map((item, index) => (
          <div key={item.name} className={`flex items-center justify-between p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
            <div className="flex items-center gap-3">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: item.color || COLORS[index % COLORS.length] }} 
              />
              <span className={darkMode ? 'text-white' : 'text-gray-900'}>{item.name}</span>
              <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {item.percentage.toFixed(1)}%
              </span>
            </div>
            <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {formatAmount(item.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatsView;
