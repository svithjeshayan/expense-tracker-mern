const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const auth = require('../middleware/auth');

// Get all categories for the logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const categories = await Category.find({ userId: req.user.id }).sort({ type: 1, name: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create a new category
router.post('/', auth, async (req, res) => {
  try {
    const { name, type, icon, color } = req.body;

    // Check if category already exists for this user
    const existingCategory = await Category.findOne({
      userId: req.user.id,
      name: name.trim(),
      type
    });

    if (existingCategory) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const category = new Category({
      userId: req.user.id,
      name: name.trim(),
      type,
      icon: icon || '📁',
      color: color || '#3b82f6',
      isDefault: false
    });

    await category.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update a category
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, icon, color } = req.body;
    
    const category = await Category.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    if (name) category.name = name.trim();
    if (icon) category.icon = icon;
    if (color) category.color = color;

    await category.save();
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete a category
router.delete('/:id', auth, async (req, res) => {
  try {
    const Expense = require('../models/Expense');
    
    const category = await Category.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if category is in use
    const expenseCount = await Expense.countDocuments({
      userId: req.user.id,
      category: category.name
    });

    if (expenseCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete category that is in use',
        expenseCount 
      });
    }

    await Category.deleteOne({ _id: req.params.id });
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Initialize default categories for a user
router.post('/initialize', auth, async (req, res) => {
  try {
    // Check if user already has categories
    const existingCategories = await Category.countDocuments({ userId: req.user.id });
    
    if (existingCategories > 0) {
      return res.status(400).json({ message: 'Categories already initialized' });
    }

    const defaultExpenseCategories = [
      { name: 'Food & Dining', icon: '🍔', color: '#ef4444' },
      { name: 'Transportation', icon: '🚗', color: '#f59e0b' },
      { name: 'Shopping', icon: '🛍️', color: '#ec4899' },
      { name: 'Entertainment', icon: '🎬', color: '#8b5cf6' },
      { name: 'Bills & Utilities', icon: '💡', color: '#3b82f6' },
      { name: 'Healthcare', icon: '🏥', color: '#10b981' },
      { name: 'Education', icon: '📚', color: '#6366f1' },
      { name: 'Travel', icon: '✈️', color: '#14b8a6' },
      { name: 'Others', icon: '📁', color: '#6b7280' }
    ];

    const defaultIncomeCategories = [
      { name: 'Salary', icon: '💰', color: '#10b981' },
      { name: 'Freelance', icon: '💼', color: '#3b82f6' },
      { name: 'Investment', icon: '📈', color: '#8b5cf6' },
      { name: 'Business', icon: '🏢', color: '#f59e0b' },
      { name: 'Gift', icon: '🎁', color: '#ec4899' },
      { name: 'Others', icon: '💵', color: '#6b7280' }
    ];

    const categories = [
      ...defaultExpenseCategories.map(cat => ({
        userId: req.user.id,
        name: cat.name,
        type: 'expense',
        icon: cat.icon,
        color: cat.color,
        isDefault: true
      })),
      ...defaultIncomeCategories.map(cat => ({
        userId: req.user.id,
        name: cat.name,
        type: 'income',
        icon: cat.icon,
        color: cat.color,
        isDefault: true
      }))
    ];

    await Category.insertMany(categories);
    res.status(201).json({ message: 'Default categories initialized', count: categories.length });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
