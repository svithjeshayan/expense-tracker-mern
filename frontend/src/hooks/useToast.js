import { useContext, createContext } from 'react';

// Toast context - shared between Toast.jsx and useToast.js
export const ToastContext = createContext(null);

/**
 * Custom hook to trigger toast notifications
 * Must be used within a ToastProvider
 */
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
