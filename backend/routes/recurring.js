const express = require('express');
const router = express.Router();
const RecurringExpense = require('../models/RecurringExpense');
const Expense = require('../models/Expense');
const auth = require('../middleware/auth');

// Get all recurring expenses for user
router.get('/', auth, async (req, res) => {
  try {
    const recurring = await RecurringExpense.find({ 
      user: req.user.id,
      isActive: true 
    }).sort({ createdAt: -1 });
    res.json(recurring);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add recurring expense
router.post('/', auth, async (req, res) => {
  try {
    const newRecurring = new RecurringExpense({
      user: req.user.id,
      ...req.body
    });

    const recurring = await newRecurring.save();
    res.json(recurring);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update recurring expense
router.put('/:id', auth, async (req, res) => {
  try {
    let recurring = await RecurringExpense.findById(req.params.id);

    if (!recurring) {
      return res.status(404).json({ message: 'Recurring expense not found' });
    }

    if (recurring.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    recurring = await RecurringExpense.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    res.json(recurring);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete recurring expense
router.delete('/:id', auth, async (req, res) => {
  try {
    const recurring = await RecurringExpense.findById(req.params.id);

    if (!recurring) {
      return res.status(404).json({ message: 'Recurring expense not found' });
    }

    if (recurring.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await RecurringExpense.findByIdAndDelete(req.params.id);
    res.json({ message: 'Recurring expense removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Process recurring expenses (call this daily via cron job or manually)
router.post('/process', auth, async (req, res) => {
  try {
    const today = new Date();
    const currentDay = today.getDate();
    
    // Find all active recurring expenses for user
    const recurring = await RecurringExpense.find({
      user: req.user.id,
      isActive: true,
      startDate: { $lte: today }
    });

    const processed = [];

    for (const rec of recurring) {
      // Check if should be processed today
      let shouldProcess = false;

      if (rec.frequency === 'monthly' && rec.dayOfMonth === currentDay) {
        // Check if not already processed this month
        const lastProcessedMonth = rec.lastProcessed 
          ? rec.lastProcessed.getMonth() 
          : -1;
        if (lastProcessedMonth !== today.getMonth()) {
          shouldProcess = true;
        }
      }

      if (shouldProcess) {
        // Create new expense
        const newExpense = new Expense({
          user: rec.user,
          amount: rec.amount,
          category: rec.category,
          description: rec.description,
          type: rec.type,
          date: today,
          paymentMethod: rec.paymentMethod
        });

        await newExpense.save();

        // Update last processed date
        rec.lastProcessed = today;
        await rec.save();

        processed.push(newExpense);
      }
    }

    res.json({ 
      message: `Processed ${processed.length} recurring expenses`,
      expenses: processed 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;