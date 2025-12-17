const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const currencyService = require('../services/currencyService');

// Get list of supported currencies
router.get('/list', async (req, res) => {
  try {
    const currencies = currencyService.getSupportedCurrencies();
    res.json(currencies);
  } catch (error) {
    console.error('Currency list error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current exchange rates
router.get('/rates', async (req, res) => {
  try {
    const rates = await currencyService.fetchExchangeRates();
    res.json({
      baseCurrency: 'USD',
      rates,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Currency rates error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Convert amount between currencies
router.get('/convert', async (req, res) => {
  try {
    const { amount, from, to } = req.query;
    
    if (!amount || !from || !to) {
      return res.status(400).json({ message: 'Missing required parameters: amount, from, to' });
    }

    const convertedAmount = await currencyService.convertCurrency(
      parseFloat(amount),
      from.toUpperCase(),
      to.toUpperCase()
    );

    res.json({
      originalAmount: parseFloat(amount),
      originalCurrency: from.toUpperCase(),
      convertedAmount,
      targetCurrency: to.toUpperCase()
    });
  } catch (error) {
    console.error('Currency convert error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's currency preference
router.get('/preference', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const currencyInfo = currencyService.CURRENCIES[user.currency] || currencyService.CURRENCIES.USD;
    
    res.json({
      currency: user.currency,
      symbol: currencyInfo.symbol,
      name: currencyInfo.name
    });
  } catch (error) {
    console.error('Currency preference error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user's currency preference
router.put('/preference', auth, async (req, res) => {
  try {
    const { currency } = req.body;
    
    if (!currency) {
      return res.status(400).json({ message: 'Currency code is required' });
    }

    const upperCurrency = currency.toUpperCase();
    
    if (!currencyService.CURRENCIES[upperCurrency]) {
      return res.status(400).json({ message: 'Unsupported currency' });
    }

    const user = await User.findById(req.user.id);
    user.currency = upperCurrency;
    await user.save();

    const currencyInfo = currencyService.CURRENCIES[upperCurrency];
    
    res.json({
      message: 'Currency preference updated',
      currency: upperCurrency,
      symbol: currencyInfo.symbol,
      name: currencyInfo.name
    });
  } catch (error) {
    console.error('Currency preference update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
