/**
 * Form validation utilities for consistent validation across the app
 */

/**
 * Validate email format
 * @param {string} email
 * @returns {{ valid: boolean, message: string }}
 */
export function validateEmail(email) {
  if (!email || email.trim() === '') {
    return { valid: false, message: 'Email is required' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, message: 'Please enter a valid email address' };
  }
  
  return { valid: true, message: '' };
}

/**
 * Validate password strength
 * @param {string} password
 * @returns {{ valid: boolean, message: string }}
 */
export function validatePassword(password) {
  if (!password) {
    return { valid: false, message: 'Password is required' };
  }
  
  if (password.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters' };
  }
  
  return { valid: true, message: '' };
}

/**
 * Validate expense/income amount
 * @param {string|number} amount
 * @returns {{ valid: boolean, message: string, value: number }}
 */
export function validateAmount(amount) {
  const numAmount = parseFloat(amount);
  
  if (isNaN(numAmount)) {
    return { valid: false, message: 'Please enter a valid amount', value: 0 };
  }
  
  if (numAmount <= 0) {
    return { valid: false, message: 'Amount must be greater than 0', value: 0 };
  }
  
  if (numAmount > 999999999) {
    return { valid: false, message: 'Amount is too large', value: 0 };
  }
  
  return { valid: true, message: '', value: numAmount };
}

/**
 * Validate required field
 * @param {string} value
 * @param {string} fieldName
 * @returns {{ valid: boolean, message: string }}
 */
export function validateRequired(value, fieldName = 'This field') {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return { valid: false, message: `${fieldName} is required` };
  }
  return { valid: true, message: '' };
}

/**
 * Validate date
 * @param {string} dateString
 * @returns {{ valid: boolean, message: string, date: Date | null }}
 */
export function validateDate(dateString) {
  if (!dateString) {
    return { valid: false, message: 'Date is required', date: null };
  }
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return { valid: false, message: 'Please enter a valid date', date: null };
  }
  
  // Check if date is not too far in the future (1 year)
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1);
  if (date > maxDate) {
    return { valid: false, message: 'Date cannot be more than 1 year in the future', date: null };
  }
  
  return { valid: true, message: '', date };
}

/**
 * Sanitize string input (prevent XSS)
 * @param {string} input
 * @returns {string}
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
}

/**
 * Validate expense form
 * @param {Object} form
 * @returns {{ valid: boolean, errors: Object }}
 */
export function validateExpenseForm(form) {
  const errors = {};
  
  const amountResult = validateAmount(form.amount);
  if (!amountResult.valid) {
    errors.amount = amountResult.message;
  }
  
  const categoryResult = validateRequired(form.category, 'Category');
  if (!categoryResult.valid) {
    errors.category = categoryResult.message;
  }
  
  const dateResult = validateDate(form.date);
  if (!dateResult.valid) {
    errors.date = dateResult.message;
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate budget form
 * @param {Object} form
 * @returns {{ valid: boolean, errors: Object }}
 */
export function validateBudgetForm(form) {
  const errors = {};
  
  const categoryResult = validateRequired(form.category, 'Category');
  if (!categoryResult.valid) {
    errors.category = categoryResult.message;
  }
  
  const limitResult = validateAmount(form.limit);
  if (!limitResult.valid) {
    errors.limit = limitResult.message;
  }
  
  if (!form.month) {
    errors.month = 'Month is required';
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}
