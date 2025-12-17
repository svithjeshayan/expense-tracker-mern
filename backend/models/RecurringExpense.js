const mongoose = require('mongoose');

const RecurringExpenseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['income', 'expense'],
    default: 'expense'
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
    default: 'monthly'
  },
  dayOfMonth: {
    type: Number,
    min: 1,
    max: 31,
    default: 1
  },
  startDate: {
    type: Date,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Digital Wallet'],
    default: 'Cash'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastProcessed: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('RecurringExpense', RecurringExpenseSchema);

