import React from 'react';
import { ChevronLeft, ChevronRight, Search, Filter } from 'lucide-react';

const Header = ({ 
  currentDate, 
  onPrevMonth, 
  onNextMonth, 
  darkMode, 
  title,
  showMonthNav = true,
  rightActions 
}) => {
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  return (
    <header className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} shadow-sm z-10 sticky top-0`}>
      <div className="flex items-center justify-between px-4 h-14">
        {/* Left Action (Maybe Menu or placeholder) */}
        <div className="w-10">
          {/* <Menu className="w-6 h-6" /> */}
        </div>

        {/* Center: Title or Month Selector */}
        <div className="flex-1 flex justify-center">
          {showMonthNav ? (
            <div className="flex items-center gap-4">
              <button onClick={onPrevMonth} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="font-semibold text-lg">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </span>
              <button onClick={onNextMonth} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <h1 className="font-semibold text-lg">{title}</h1>
          )}
        </div>

        {/* Right Actions */}
        <div className="w-10 flex justify-end gap-2">
          {rightActions}
        </div>
      </div>
    </header>
  );
};

export default Header;
