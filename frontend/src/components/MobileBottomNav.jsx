import React, { useState } from 'react';
import { Home, List, PlusCircle, BarChart3, Menu, X, Calendar, Wallet, Repeat, PieChart, Settings, FolderClosed, Grid } from 'lucide-react';

export default function MobileBottomNav({ 
  activeTab, 
  setActiveTab, 
  darkMode, 
  setShowAddExpense 
}) {
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'expenses', label: 'Expenses', icon: List },
    { id: 'add', label: 'Add', icon: PlusCircle, isAction: true }, // Special action button
    { id: 'trends', label: 'Trends', icon: BarChart3 },
    { id: 'more', label: 'More', icon: Menu, isMenu: true } // Special menu toggle
  ];

  const moreMenuItems = [
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'assets', label: 'Assets', icon: Wallet },
    { id: 'budgets', label: 'Budgets', icon: PieChart },
    { id: 'recurring', label: 'Recurring', icon: Repeat },
    { id: 'analytics', label: 'Analytics', icon: Grid },
    { id: 'categories', label: 'Categories', icon: FolderClosed },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (item) => {
    if (item.isAction) {
      setShowAddExpense(true);
      return;
    }
    if (item.isMenu) {
      setShowMoreMenu(!showMoreMenu);
      return;
    }
    setActiveTab(item.id);
    setShowMoreMenu(false);
  };

  return (
    <>
      {/* More Menu Overlay */}
      {showMoreMenu && (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowMoreMenu(false)}>
          <div 
            className={`w-full max-w-md mx-auto ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-t-2xl p-6 pb-24 border-t shadow-2xl animate-in slide-in-from-bottom duration-200`}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>More Options</h3>
              <button 
                onClick={() => setShowMoreMenu(false)}
                className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-4 gap-4">
              {moreMenuItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setShowMoreMenu(false);
                  }}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${
                    activeTab === item.id 
                      ? 'bg-blue-50 text-blue-600 ring-2 ring-blue-500 ring-offset-2 ring-offset-transparent' 
                      : (darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-50 text-gray-600')
                  }`}
                >
                  <div className={`p-3 rounded-full ${
                    activeTab === item.id 
                      ? 'bg-blue-600 text-white' 
                      : (darkMode ? 'bg-gray-700' : 'bg-gray-100')
                  }`}>
                    <item.icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-medium text-center truncate w-full">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <nav className={`fixed bottom-0 left-0 right-0 z-50 ${darkMode ? 'bg-gray-900/95 border-gray-800' : 'bg-white/95 border-gray-200'} border-t backdrop-blur-lg pb-safe`}>
        <div className="flex justify-around items-center h-16 max-w-md mx-auto px-2">
          {navItems.map(item => {
            const isActive = activeTab === item.id || (item.isMenu && showMoreMenu);
            
            if (item.id === 'add') {
              return (
                <div key={item.id} className="relative -top-5">
                  <button
                    onClick={() => handleNavClick(item)}
                    className="flex flex-col items-center justify-center w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700 active:scale-95 transition-all"
                  >
                    <PlusCircle className="w-7 h-7" />
                  </button>
                </div>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className={`flex flex-col items-center justify-center flex-1 min-w-0 h-full gap-1 transition-all active:scale-95 ${
                  isActive 
                    ? 'text-blue-600' 
                    : (darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700')
                }`}
              >
                <item.icon className={`w-6 h-6 ${isActive && !item.isMenu ? 'fill-current' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
