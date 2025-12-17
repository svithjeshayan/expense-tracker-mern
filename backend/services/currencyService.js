// Supported currencies with symbols and names
const CURRENCIES = {
  USD: { symbol: '$', name: 'US Dollar', locale: 'en-US' },
  EUR: { symbol: '€', name: 'Euro', locale: 'de-DE' },
  GBP: { symbol: '£', name: 'British Pound', locale: 'en-GB' },
  JPY: { symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP' },
  CNY: { symbol: '¥', name: 'Chinese Yuan', locale: 'zh-CN' },
  INR: { symbol: '₹', name: 'Indian Rupee', locale: 'en-IN' },
  AUD: { symbol: 'A$', name: 'Australian Dollar', locale: 'en-AU' },
  CAD: { symbol: 'C$', name: 'Canadian Dollar', locale: 'en-CA' },
  CHF: { symbol: 'CHF', name: 'Swiss Franc', locale: 'de-CH' },
  KRW: { symbol: '₩', name: 'South Korean Won', locale: 'ko-KR' },
  SGD: { symbol: 'S$', name: 'Singapore Dollar', locale: 'en-SG' },
  HKD: { symbol: 'HK$', name: 'Hong Kong Dollar', locale: 'zh-HK' },
  SEK: { symbol: 'kr', name: 'Swedish Krona', locale: 'sv-SE' },
  NOK: { symbol: 'kr', name: 'Norwegian Krone', locale: 'nb-NO' },
  MXN: { symbol: '$', name: 'Mexican Peso', locale: 'es-MX' },
  BRL: { symbol: 'R$', name: 'Brazilian Real', locale: 'pt-BR' },
  ZAR: { symbol: 'R', name: 'South African Rand', locale: 'en-ZA' },
  RUB: { symbol: '₽', name: 'Russian Ruble', locale: 'ru-RU' },
  TRY: { symbol: '₺', name: 'Turkish Lira', locale: 'tr-TR' },
  AED: { symbol: 'د.إ', name: 'UAE Dirham', locale: 'ar-AE' }
};

// Cache for exchange rates
let ratesCache = {
  rates: null,
  lastUpdated: null,
  baseCurrency: 'USD'
};

const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

/**
 * Fetch exchange rates from a free API
 * Using exchangerate-api.com free tier
 */
async function fetchExchangeRates() {
  try {
    // Check cache first
    if (ratesCache.rates && ratesCache.lastUpdated) {
      const age = Date.now() - ratesCache.lastUpdated;
      if (age < CACHE_DURATION) {
        return ratesCache.rates;
      }
    }

    // Fetch new rates
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    
    if (!response.ok) {
      throw new Error('Failed to fetch exchange rates');
    }

    const data = await response.json();
    
    // Update cache
    ratesCache = {
      rates: data.rates,
      lastUpdated: Date.now(),
      baseCurrency: 'USD'
    };

    console.log('Exchange rates updated successfully');
    return data.rates;
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    
    // Return cached rates if available, even if expired
    if (ratesCache.rates) {
      console.log('Using cached exchange rates');
      return ratesCache.rates;
    }
    
    // Return fallback rates if no cache
    return getFallbackRates();
  }
}

/**
 * Fallback rates in case API fails and no cache
 */
function getFallbackRates() {
  return {
    USD: 1,
    EUR: 0.92,
    GBP: 0.79,
    JPY: 149.50,
    CNY: 7.24,
    INR: 83.12,
    AUD: 1.53,
    CAD: 1.36,
    CHF: 0.88,
    KRW: 1298.50,
    SGD: 1.34,
    HKD: 7.82,
    SEK: 10.42,
    NOK: 10.73,
    MXN: 17.15,
    BRL: 4.97,
    ZAR: 18.62,
    RUB: 89.50,
    TRY: 28.85,
    AED: 3.67
  };
}

/**
 * Convert amount from one currency to another
 */
async function convertCurrency(amount, fromCurrency, toCurrency) {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  const rates = await fetchExchangeRates();
  
  // Convert to USD first (base currency), then to target
  const amountInUSD = amount / (rates[fromCurrency] || 1);
  const convertedAmount = amountInUSD * (rates[toCurrency] || 1);
  
  return Math.round(convertedAmount * 100) / 100; // Round to 2 decimal places
}

/**
 * Format amount with currency symbol
 */
function formatCurrency(amount, currencyCode) {
  const currency = CURRENCIES[currencyCode] || CURRENCIES.USD;
  
  try {
    return new Intl.NumberFormat(currency.locale, {
      style: 'currency',
      currency: currencyCode
    }).format(amount);
  } catch (error) {
    // Fallback formatting
    return `${currency.symbol}${amount.toFixed(2)}`;
  }
}

/**
 * Get list of supported currencies
 */
function getSupportedCurrencies() {
  return Object.entries(CURRENCIES).map(([code, info]) => ({
    code,
    symbol: info.symbol,
    name: info.name
  }));
}

module.exports = {
  CURRENCIES,
  fetchExchangeRates,
  convertCurrency,
  formatCurrency,
  getSupportedCurrencies
};
