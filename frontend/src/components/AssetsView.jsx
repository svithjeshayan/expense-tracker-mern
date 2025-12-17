import React from 'react';

const AssetsView = ({ expenses, darkMode, formatAmount }) => {
  const assetGroups = expenses.reduce((acc, curr) => {
    const method = curr.paymentMethod || 'Other';
    if (!acc[method]) {
      acc[method] = { name: method, income: 0, expense: 0, balance: 0 };
    }
    if (curr.type === 'income') {
      acc[method].income += curr.amount;
      acc[method].balance += curr.amount;
    } else {
      acc[method].expense += curr.amount;
      acc[method].balance -= curr.amount;
    }
    return acc;
  }, {});

  const data = Object.values(assetGroups);

  return (
    <div className={`h-full overflow-y-auto p-4 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="grid gap-4">
        {data.map(asset => (
          <div key={asset.name} className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-4 rounded-xl shadow-sm border`}>
            <div className="flex justify-between items-center mb-2">
              <h3 className={`font-semibold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>{asset.name}</h3>
              <span className={`font-bold ${asset.balance >= 0 ? 'text-blue-500' : 'text-red-500'}`}>
                {formatAmount(asset.balance)}
              </span>
            </div>
            
            <div className="flex justify-between text-sm">
              <div className="text-center">
                <span className={`block text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Income</span>
                <span className="text-blue-500 font-medium">{formatAmount(asset.income)}</span>
              </div>
              <div className="text-center">
                <span className={`block text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Expense</span>
                <span className="text-red-500 font-medium">{formatAmount(asset.expense)}</span>
              </div>
            </div>
            {/* Simple Bar */}
            <div className={`mt-3 w-full h-2 rounded-full hidden ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className="h-full bg-blue-500 rounded-l-full" style={{ width: '50%' }}></div>
            </div>
          </div>
        ))}

        {data.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            No asset data available for this period.
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetsView;
