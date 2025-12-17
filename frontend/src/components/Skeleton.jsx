import React from 'react';

// Skeleton base component with shimmer animation
const SkeletonBase = ({ className = '', children }) => (
  <div className={`animate-pulse ${className}`}>
    {children}
  </div>
);

// Text skeleton - for single lines of text
export const SkeletonText = ({ width = 'w-full', height = 'h-4', className = '' }) => (
  <div className={`${width} ${height} bg-gray-300 dark:bg-gray-700 rounded ${className}`} />
);

// Circle skeleton - for avatars/icons
export const SkeletonCircle = ({ size = 'w-10 h-10', className = '' }) => (
  <div className={`${size} bg-gray-300 dark:bg-gray-700 rounded-full ${className}`} />
);

// Card skeleton - for dashboard cards
export const SkeletonCard = ({ className = '' }) => (
  <SkeletonBase className={`p-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 ${className}`}>
    <div className="flex items-center gap-4 mb-4">
      <SkeletonCircle size="w-12 h-12" />
      <div className="flex-1 space-y-2">
        <SkeletonText width="w-24" height="h-3" />
        <SkeletonText width="w-32" height="h-6" />
      </div>
    </div>
    <SkeletonText width="w-full" height="h-2" />
  </SkeletonBase>
);

// Table row skeleton
export const SkeletonTableRow = ({ columns = 5, className = '' }) => (
  <SkeletonBase className={`flex items-center gap-4 p-4 border-b border-gray-200 dark:border-gray-700 ${className}`}>
    {Array.from({ length: columns }).map((_, i) => (
      <SkeletonText 
        key={i} 
        width={i === 0 ? 'w-32' : i === columns - 1 ? 'w-20' : 'w-24'} 
        height="h-4" 
      />
    ))}
  </SkeletonBase>
);

// Chart skeleton
export const SkeletonChart = ({ height = 'h-64', className = '' }) => (
  <SkeletonBase className={`${height} rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 ${className}`}>
    <div className="flex items-end justify-around h-full gap-2">
      {[40, 65, 45, 80, 55, 70, 50].map((h, i) => (
        <div
          key={i}
          className="flex-1 bg-gray-300 dark:bg-gray-700 rounded-t"
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  </SkeletonBase>
);

// Dashboard skeleton - complete dashboard loading state
export const SkeletonDashboard = () => (
  <div className="space-y-6">
    {/* Stats cards */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
    
    {/* Chart */}
    <SkeletonChart height="h-80" />
    
    {/* Table */}
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
      <SkeletonTableRow columns={6} />
      <SkeletonTableRow columns={6} />
      <SkeletonTableRow columns={6} />
      <SkeletonTableRow columns={6} />
    </div>
  </div>
);

// List skeleton
export const SkeletonList = ({ items = 5, className = '' }) => (
  <div className={`space-y-3 ${className}`}>
    {Array.from({ length: items }).map((_, i) => (
      <SkeletonBase key={i} className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <SkeletonCircle size="w-10 h-10" />
        <div className="flex-1 space-y-2">
          <SkeletonText width="w-32" height="h-4" />
          <SkeletonText width="w-48" height="h-3" />
        </div>
        <SkeletonText width="w-20" height="h-5" />
      </SkeletonBase>
    ))}
  </div>
);

export default {
  Text: SkeletonText,
  Circle: SkeletonCircle,
  Card: SkeletonCard,
  TableRow: SkeletonTableRow,
  Chart: SkeletonChart,
  Dashboard: SkeletonDashboard,
  List: SkeletonList,
};
