const cron = require('node-cron');
const User = require('../models/User');
const Budget = require('../models/Budget');
const Expense = require('../models/Expense');
const emailService = require('../services/emailService');

// Track sent alerts to avoid duplicates
const sentAlerts = new Map();

async function checkBudgetAlerts() {
  try {
    console.log('Running budget alert check...');
    
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    // Get all users with budget alerts enabled
    const users = await User.find({ 'notificationPreferences.budgetAlerts': true });
    
    for (const user of users) {
      // Get user's budgets for current month
      const budgets = await Budget.find({
        userId: user._id,
        month: currentMonth
      });
      
      for (const budget of budgets) {
        // Calculate spent amount
        const expenses = await Expense.find({
          userId: user._id,
          category: budget.category,
          type: 'expense',
          date: {
            $gte: new Date(currentMonth + '-01'),
            $lt: new Date(new Date(currentMonth + '-01').setMonth(new Date(currentMonth + '-01').getMonth() + 1))
          }
        });
        
        const spent = expenses.reduce((sum, e) => sum + e.amount, 0);
        const percentage = (spent / budget.limit) * 100;
        const threshold = user.notificationPreferences?.budgetThreshold || 80;
        
        // Create unique key for this alert
        const alertKey = `${user._id}-${budget._id}-${currentMonth}`;
        const lastSentPercentage = sentAlerts.get(alertKey) || 0;
        
        // Send alert if threshold reached and not already sent for this level
        if (percentage >= threshold && lastSentPercentage < threshold) {
          await emailService.sendBudgetAlert(user, budget, spent, percentage);
          sentAlerts.set(alertKey, percentage);
        } else if (percentage >= 100 && lastSentPercentage < 100) {
          await emailService.sendBudgetAlert(user, budget, spent, percentage);
          sentAlerts.set(alertKey, percentage);
        }
      }
    }
    
    console.log('Budget alert check completed');
  } catch (error) {
    console.error('Error in budget alert job:', error);
  }
}

// Run every day at 9 AM
function startBudgetAlertJob() {
  cron.schedule('0 9 * * *', checkBudgetAlerts);
  console.log('Budget alert job scheduled (daily at 9 AM)');
  
  // Also run immediately on startup for testing
  // checkBudgetAlerts();
}

// Clear old alerts at the start of each month
function clearOldAlerts() {
  cron.schedule('0 0 1 * *', () => {
    sentAlerts.clear();
    console.log('Cleared old budget alerts');
  });
}

module.exports = {
  startBudgetAlertJob,
  clearOldAlerts,
  checkBudgetAlerts // Export for manual testing
};
