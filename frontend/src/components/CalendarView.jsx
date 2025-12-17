import React from 'react';

const CalendarView = ({ 
  currentDate, 
  expenses, 
  onDateSelect, 
  selectedDate, 
  darkMode
  // formatAmount - available if needed for display
}) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay(); // 0 = Sun
  
  const days = [];
  // Empty slots for previous month
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  // Days of current month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }

  // Calculate daily totals
  const getDailyTotals = (date) => {
    if (!date) return { income: 0, expense: 0 };
    const dateStr = date.toISOString().split('T')[0];
    const dailyExpenses = expenses.filter(e => e.date.startsWith(dateStr));
    
    return dailyExpenses.reduce((acc, curr) => {
      if (curr.type === 'income') acc.income += curr.amount;
      else acc.expense += curr.amount;
      return acc;
    }, { income: 0, expense: 0 });
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className={`flex-1 overflow-y-auto ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Week Header */}
      <div className={`grid grid-cols-7 border-b ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        {weekDays.map((day, i) => (
          <div key={day} className={`py-2 text-center text-xs font-semibold ${
            i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : (darkMode ? 'text-gray-400' : 'text-gray-500')
          }`}>
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className={`grid grid-cols-7 auto-rows-fr ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        {days.map((date, i) => {
          if (!date) return <div key={`empty-${i}`} className={`min-h-[80px] border-b border-r ${darkMode ? 'border-gray-700' : 'border-gray-100'}`} />;
          
          const totals = getDailyTotals(date);
          const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
          const isToday = date.toDateString() === new Date().toDateString();

          return (
            <div
              key={date.toISOString()}
              onClick={() => onDateSelect(date)}
              className={`min-h-[80px] p-1 border-b border-r cursor-pointer transition-colors relative
                ${darkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-100 hover:bg-gray-50'}
                ${isSelected ? (darkMode ? 'bg-gray-700' : 'bg-blue-50') : ''}
              `}
            >
              <div className={`text-xs mb-1 ${
                isToday 
                  ? 'bg-blue-600 text-white w-5 h-5 flex items-center justify-center rounded-full' 
                  : (darkMode ? 'text-gray-300' : 'text-gray-700')
              }`}>
                {date.getDate()}
              </div>
              
              <div className="flex flex-col gap-0.5">
                {totals.income > 0 && (
                  <span className="text-[10px] text-blue-500 truncate">
                    +{Math.round(totals.income)}
                  </span>
                )}
                {totals.expense > 0 && (
                  <span className="text-[10px] text-red-500 truncate">
                    -{Math.round(totals.expense)}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;
