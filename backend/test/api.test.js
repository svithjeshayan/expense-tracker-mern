const request = require('supertest');
const express = require('express');

describe('Health Check Endpoint', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.get('/health', (req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });
  });

  it('should return health status with 200 OK', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(response.body.timestamp).toBeDefined();
  });

  it('should return JSON content type', async () => {
    const response = await request(app).get('/health');
    expect(response.headers['content-type']).toMatch(/json/);
  });
});

describe('Currency Service Unit Tests', () => {
  const currencyService = require('../services/currencyService');

  it('should export CURRENCIES object', () => {
    expect(currencyService.CURRENCIES).toBeDefined();
    expect(typeof currencyService.CURRENCIES).toBe('object');
  });

  it('should have at least 10 supported currencies', () => {
    const currencyCount = Object.keys(currencyService.CURRENCIES).length;
    expect(currencyCount).toBeGreaterThanOrEqual(10);
  });

  it('should have correct currency structure for each currency', () => {
    Object.entries(currencyService.CURRENCIES).forEach(([code, currency]) => {
      expect(currency).toHaveProperty('symbol');
      expect(currency).toHaveProperty('name');
      expect(currency).toHaveProperty('locale');
      expect(typeof code).toBe('string');
      expect(typeof currency.symbol).toBe('string');
      expect(typeof currency.name).toBe('string');
    });
  });

  it('should include USD with correct properties', () => {
    const usd = currencyService.CURRENCIES.USD;
    expect(usd).toBeDefined();
    expect(usd.symbol).toBe('$');
    expect(usd.name).toBe('US Dollar');
  });

  it('should include EUR with correct properties', () => {
    const eur = currencyService.CURRENCIES.EUR;
    expect(eur).toBeDefined();
    expect(eur.symbol).toBe('€');
    expect(eur.name).toBe('Euro');
  });

  it('should export convertCurrency function', () => {
    expect(typeof currencyService.convertCurrency).toBe('function');
  });

  it('should export fetchExchangeRates function', () => {
    expect(typeof currencyService.fetchExchangeRates).toBe('function');
  });

  it('should export formatCurrency function', () => {
    expect(typeof currencyService.formatCurrency).toBe('function');
  });

  it('should export getSupportedCurrencies function', () => {
    expect(typeof currencyService.getSupportedCurrencies).toBe('function');
  });

  it('getSupportedCurrencies should return array of currencies', () => {
    const currencies = currencyService.getSupportedCurrencies();
    expect(Array.isArray(currencies)).toBe(true);
    expect(currencies.length).toBeGreaterThan(0);
    
    currencies.forEach(curr => {
      expect(curr).toHaveProperty('code');
      expect(curr).toHaveProperty('symbol');
      expect(curr).toHaveProperty('name');
    });
  });
});
