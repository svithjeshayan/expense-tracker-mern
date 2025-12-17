import React from 'react';
import { FileText, PieChart, CreditCard, Settings } from 'lucide-react';

const BottomNavigation = ({ activeTab, onTabChange, darkMode }) => {
  const tabs = [
    { id: 'transactions', label: 'Trans.', icon: FileText },
    { id: 'stats', label: 'Stats', icon: PieChart },
    { id: 'assets', label: 'Assets', icon: CreditCard },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className={`fixed bottom-0 left-0 right-0 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-t pb-safe`}>
      <div className="flex justify-around items-center h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                isActive 
                  ? (darkMode ? 'text-white' : 'text-gray-900') 
                  : (darkMode ? 'text-gray-500' : 'text-gray-400')
              }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? 'fill-current opacity-20' : ''}`} strokeWidth={isActive ? 2 : 1.5} />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;
