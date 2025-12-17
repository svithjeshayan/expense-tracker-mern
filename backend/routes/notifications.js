const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const emailService = require('../services/emailService');

// Get notification preferences
router.get('/preferences', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('notificationPreferences');
    res.json(user.notificationPreferences || {
      budgetAlerts: true,
      weeklyReports: false,
      monthlyReports: false,
      budgetThreshold: 80
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update notification preferences
router.post('/preferences', auth, async (req, res) => {
  try {
    const { budgetAlerts, weeklyReports, monthlyReports, budgetThreshold } = req.body;

    const user = await User.findById(req.user.id);
    
    if (!user.notificationPreferences) {
      user.notificationPreferences = {};
    }

    if (budgetAlerts !== undefined) user.notificationPreferences.budgetAlerts = budgetAlerts;
    if (weeklyReports !== undefined) user.notificationPreferences.weeklyReports = weeklyReports;
    if (monthlyReports !== undefined) user.notificationPreferences.monthlyReports = monthlyReports;
    if (budgetThreshold !== undefined) user.notificationPreferences.budgetThreshold = budgetThreshold;

    await user.save();
    res.json({ message: 'Preferences updated', preferences: user.notificationPreferences });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Send test email
router.post('/test-email', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    await emailService.sendTestEmail(user.email);
    res.json({ message: 'Test email sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send test email', error: error.message });
  }
});

module.exports = router;
