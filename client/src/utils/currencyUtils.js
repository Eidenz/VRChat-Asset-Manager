// client/src/utils/currencyUtils.js

/**
 * List of supported currencies with their symbols and formatting options
 */
export const SUPPORTED_CURRENCIES = [
    { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US' },
    { code: 'EUR', symbol: '€', name: 'Euro', locale: 'de-DE' },
    { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', locale: 'en-CA' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', locale: 'en-AU' },
    { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', locale: 'zh-CN' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee', locale: 'en-IN' },
    { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', locale: 'pt-BR' },
    { code: 'RUB', symbol: '₽', name: 'Russian Ruble', locale: 'ru-RU' },
    { code: 'KRW', symbol: '₩', name: 'South Korean Won', locale: 'ko-KR' },
    { code: 'MXN', symbol: 'Mex$', name: 'Mexican Peso', locale: 'es-MX' },
    { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc', locale: 'de-CH' }
  ];
  
  /**
   * Get currency information by code
   * @param {string} currencyCode - Currency code (e.g., 'USD', 'EUR')
   * @returns {Object} Currency information
   */
  export const getCurrencyInfo = (currencyCode = 'USD') => {
    return SUPPORTED_CURRENCIES.find(c => c.code === currencyCode) || SUPPORTED_CURRENCIES[0];
  };
  
  /**
   * Format a numeric value as currency
   * @param {number|string} value - The value to format
   * @param {string} currencyCode - Currency code (e.g., 'USD', 'EUR')
   * @returns {string} Formatted currency string
   */
  export const formatCurrency = (value, currencyCode = 'USD') => {
    if (value === null || value === undefined || value === '') {
      return '';
    }
    
    // Parse the value to a number
    const numericValue = typeof value === 'string' 
      ? parseFloat(value.replace(/[^\d.-]/g, '')) 
      : value;
    
    if (isNaN(numericValue)) {
      return '';
    }
    
    const currency = getCurrencyInfo(currencyCode);
    
    try {
      // Use the Intl.NumberFormat for proper currency formatting based on locale
      return new Intl.NumberFormat(currency.locale, {
        style: 'currency',
        currency: currency.code
      }).format(numericValue);
    } catch (error) {
      // Fallback simple formatting
      return `${currency.symbol}${numericValue.toFixed(2)}`;
    }
  };
  
  /**
   * Parse a currency string into a numeric value
   * @param {string} value - The currency string to parse
   * @returns {number} Numeric value
   */
  export const parseCurrencyValue = (value) => {
    if (!value) return null;
    
    // Remove currency symbols and other non-numeric characters
    const numericString = value.replace(/[^\d.-]/g, '');
    return numericString ? parseFloat(numericString) : null;
  };
  
  /**
   * Format a raw input value into a currency string for a specific currency
   * @param {string} value - Raw input value
   * @param {string} currencyCode - Currency code
   * @returns {string} Formatted currency string for input
   */
  export const formatCurrencyInput = (value, currencyCode = 'USD') => {
    if (!value) return '';
    
    // Get the currency symbol
    const currency = getCurrencyInfo(currencyCode);
    
    // Remove any non-digit or non-decimal characters
    let numericValue = value.replace(/[^\d.]/g, '');
    
    // Ensure we're not adding multiple decimal points
    const parts = numericValue.split('.');
    if (parts.length > 2) {
      numericValue = parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Format with currency symbol prefix
    return numericValue === '' ? '' : `${currency.symbol}${numericValue}`;
  };
  
  export default {
    SUPPORTED_CURRENCIES,
    getCurrencyInfo,
    formatCurrency,
    parseCurrencyValue,
    formatCurrencyInput
  };