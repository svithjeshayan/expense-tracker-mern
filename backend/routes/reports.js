const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Expense = require('../models/Expense');
const Budget = require('../models/Budget');

// Get summary data for reports
router.get('/summary', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const query = { userId: req.user.id };
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const expenses = await Expense.find(query).sort({ date: -1 });
    
    const totalIncome = expenses
      .filter(e => e.type === 'income')
      .reduce((sum, e) => sum + e.amount, 0);
    
    const totalExpense = expenses
      .filter(e => e.type === 'expense')
      .reduce((sum, e) => sum + e.amount, 0);

    // Category breakdown
    const categoryBreakdown = expenses
      .filter(e => e.type === 'expense')
      .reduce((acc, e) => {
        if (!acc[e.category]) {
          acc[e.category] = 0;
        }
        acc[e.category] += e.amount;
        return acc;
      }, {});

    const categoryData = Object.entries(categoryBreakdown)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);

    // Monthly data
    const monthlyData = expenses.reduce((acc, e) => {
      const month = e.date.toISOString().slice(0, 7);
      if (!acc[month]) {
        acc[month] = { month, income: 0, expense: 0 };
      }
      if (e.type === 'income') {
        acc[month].income += e.amount;
      } else {
        acc[month].expense += e.amount;
      }
      return acc;
    }, {});

    const chartData = Object.values(monthlyData).sort((a, b) => 
      a.month.localeCompare(b.month)
    );

    res.json({
      summary: {
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
        transactionCount: expenses.length
      },
      categoryData,
      chartData,
      transactions: expenses
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get trend analysis data
router.get('/trends', auth, async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.user.id }).sort({ date: 1 });
    
    // Calculate monthly trends
    const monthlyTrends = expenses.reduce((acc, e) => {
      const month = e.date.toISOString().slice(0, 7);
      if (!acc[month]) {
        acc[month] = {
          month,
          income: 0,
          expense: 0,
          transactions: 0,
          categories: {}
        };
      }
      
      acc[month].transactions++;
      if (e.type === 'income') {
        acc[month].income += e.amount;
      } else {
        acc[month].expense += e.amount;
        if (!acc[month].categories[e.category]) {
          acc[month].categories[e.category] = 0;
        }
        acc[month].categories[e.category] += e.amount;
      }
      
      return acc;
    }, {});

    const trends = Object.values(monthlyTrends).sort((a, b) => 
      a.month.localeCompare(b.month)
    );

    // Calculate month-over-month changes
    const trendsWithChanges = trends.map((trend, index) => {
      if (index === 0) {
        return { ...trend, expenseChange: 0, incomeChange: 0 };
      }
      
      const prev = trends[index - 1];
      const expenseChange = prev.expense === 0 ? 0 : 
        ((trend.expense - prev.expense) / prev.expense) * 100;
      const incomeChange = prev.income === 0 ? 0 : 
        ((trend.income - prev.income) / prev.income) * 100;
      
      return {
        ...trend,
        expenseChange: parseFloat(expenseChange.toFixed(2)),
        incomeChange: parseFloat(incomeChange.toFixed(2))
      };
    });

    // Calculate category trends
    const categoryTrends = {};
    trends.forEach(trend => {
      Object.entries(trend.categories).forEach(([category, amount]) => {
        if (!categoryTrends[category]) {
          categoryTrends[category] = [];
        }
        categoryTrends[category].push({
          month: trend.month,
          amount
        });
      });
    });

    // Calculate average spending
    const totalMonths = trends.length;
    const avgIncome = totalMonths > 0 ? 
      trends.reduce((sum, t) => sum + t.income, 0) / totalMonths : 0;
    const avgExpense = totalMonths > 0 ? 
      trends.reduce((sum, t) => sum + t.expense, 0) / totalMonths : 0;

    // Predict next month (simple linear regression)
    let prediction = null;
    if (trends.length >= 3) {
      const recentTrends = trends.slice(-3);
      const avgRecentExpense = recentTrends.reduce((sum, t) => sum + t.expense, 0) / 3;
      const trend = recentTrends[2].expense - recentTrends[0].expense;
      prediction = {
        estimatedExpense: avgRecentExpense + (trend / 2),
        confidence: 'medium'
      };
    }

    res.json({
      monthlyTrends: trendsWithChanges,
      categoryTrends,
      insights: {
        avgMonthlyIncome: parseFloat(avgIncome.toFixed(2)),
        avgMonthlyExpense: parseFloat(avgExpense.toFixed(2)),
        prediction
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
