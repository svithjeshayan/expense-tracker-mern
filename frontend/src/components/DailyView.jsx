import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';

const DailyView = ({ 
  expenses, 
  onEdit, 
  // onDelete - available for swipe-to-delete feature
  darkMode, 
  formatAmount 
}) => {
  // Group by date
  const grouped = expenses.reduce((acc, expense) => {
    const dateStr = expense.date.split('T')[0];
    if (!acc[dateStr]) {
      acc[dateStr] = {
        date: new Date(expense.date),
        items: [],
        income: 0,
        expense: 0
      };
    }
    acc[dateStr].items.push(expense);
    if (expense.type === 'income') acc[dateStr].income += expense.amount;
    else acc[dateStr].expense += expense.amount;
    return acc;
  }, {});

  // Sort dates descending
  const sortedDates = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a));

  if (sortedDates.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-20 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
        <p>No transactions details</p>
      </div>
    );
  }

  return (
    <div className="pb-20">
      {sortedDates.map(dateStr => {
        const group = grouped[dateStr];
        const dayName = group.date.toLocaleDateString('en-US', { weekday: 'short' });
        const dayNum = group.date.getDate();
        const monthName = group.date.toLocaleDateString('en-US', { month: 'short' });

        return (
          <div key={dateStr} className="mb-2">
            {/* Date Header */}
            <div className={`flex items-center justify-between px-4 py-2 text-sm border-b ${
              darkMode ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-gray-100 border-gray-200 text-gray-500'
            }`}>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg">{dayNum}</span>
                <div className="flex items-center gap-1 text-xs">
                  <span className="bg-gray-200 dark:bg-gray-700 px-1 rounded uppercase min-w-[30px] text-center">{dayName}</span>
                  <span>{monthName} {group.date.getFullYear()}</span>
                </div>
              </div>
              <div className="flex gap-3 text-xs font-medium">
                {group.income > 0 && <span className="text-blue-500">+{Math.round(group.income)}</span>}
                {group.expense > 0 && <span className="text-red-500">-{Math.round(group.expense)}</span>}
              </div>
            </div>

            {/* Transactions List */}
            <div>
              {group.items.map(item => (
                <div 
                  key={item._id} 
                  className={`flex items-center justify-between px-4 py-3 border-b ${
                    darkMode ? 'bg-gray-900 border-gray-800 hover:bg-gray-800' : 'bg-white border-gray-100 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white ${
                       // Use random colors or based on category
                       'bg-blue-400'
                    }`}>
                      {item.category.slice(0, 1)}
                    </div>
                    <div className="min-w-0">
                      <p className={`text-sm font-medium truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {item.category}
                      </p>
                      <p className={`text-xs truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {item.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-semibold ${
                      item.type === 'income' ? 'text-blue-500' : 'text-red-500'
                    }`}>
                      {formatAmount(item.amount)}
                    </span>
                    <button onClick={() => onEdit(item)} className="text-gray-400 hover:text-blue-500">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {/* Delete hidden or requires swipe, stick to edit icon for now */}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DailyView;
