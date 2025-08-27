import axios from 'axios';
import {API_CONFIG, validateApiConfig} from '../config/apiConfig';

class TwelveDataApi {
  constructor() {
    this.apiKey = API_CONFIG.TWELVE_DATA_API_KEY;
    this.baseUrl = API_CONFIG.TWELVE_DATA_BASE_URL;
    this.demoMode = API_CONFIG.DEMO_MODE;
    
    // Validate configuration on initialization
    const warnings = validateApiConfig();
    if (warnings.length > 0) {
      console.warn('TwelveDataApi Configuration Warnings:', warnings);
    }
  }

  // Get real-time forex quotes
  async getForexQuotes(symbols = 'EUR/USD,GBP/USD,USD/JPY,USD/CHF,AUD/USD') {
    try {
      const response = await axios.get(`${this.baseUrl}/quote`, {
        params: {
          symbol: symbols,
          apikey: this.apiKey,
          format: 'json'
        }
      });

      return {success: true, data: response.data};
    } catch (error) {
      console.error('Error fetching forex quotes:', error);
      return {success: false, error: error.message};
    }
  }

  // Get historical forex data for charts
  async getForexTimeSeries(symbol, interval = '1min', outputsize = 100) {
    try {
      const response = await axios.get(`${this.baseUrl}/time_series`, {
        params: {
          symbol: symbol,
          interval: interval,
          outputsize: outputsize,
          apikey: this.apiKey,
          format: 'json'
        }
      });

      return {success: true, data: response.data};
    } catch (error) {
      console.error('Error fetching time series:', error);
      return {success: false, error: error.message};
    }
  }

  // Get exchange rate between two currencies
  async getExchangeRate(from, to) {
    try {
      const response = await axios.get(`${this.baseUrl}/exchange_rate`, {
        params: {
          from: from,
          to: to,
          apikey: this.apiKey,
          format: 'json'
        }
      });

      return {success: true, data: response.data};
    } catch (error) {
      console.error('Error fetching exchange rate:', error);
      return {success: false, error: error.message};
    }
  }

  // Get currency conversion
  async convertCurrency(from, to, amount) {
    try {
      const response = await axios.get(`${this.baseUrl}/currency_conversion`, {
        params: {
          from: from,
          to: to,
          amount: amount,
          apikey: this.apiKey,
          format: 'json'
        }
      });

      return {success: true, data: response.data};
    } catch (error) {
      console.error('Error converting currency:', error);
      return {success: false, error: error.message};
    }
  }

  // Get market status
  async getMarketStatus() {
    try {
      const response = await axios.get(`${this.baseUrl}/market_state`, {
        params: {
          apikey: this.apiKey,
          format: 'json'
        }
      });

      return {success: true, data: response.data};
    } catch (error) {
      console.error('Error fetching market status:', error);
      return {success: false, error: error.message};
    }
  }

  // Get forex pairs list
  async getForexPairs() {
    try {
      const response = await axios.get(`${this.baseUrl}/forex_pairs`, {
        params: {
          apikey: this.apiKey,
          format: 'json'
        }
      });

      return {success: true, data: response.data};
    } catch (error) {
      console.error('Error fetching forex pairs:', error);
      return {success: false, error: error.message};
    }
  }

  // Get technical indicators
  async getTechnicalIndicator(symbol, indicator, interval = '1day') {
    try {
      const response = await axios.get(`${this.baseUrl}/${indicator}`, {
        params: {
          symbol: symbol,
          interval: interval,
          apikey: this.apiKey,
          format: 'json'
        }
      });

      return {success: true, data: response.data};
    } catch (error) {
      console.error(`Error fetching ${indicator}:`, error);
      return {success: false, error: error.message};
    }
  }
}

export default new TwelveDataApi();

// Popular forex pairs for the app
export const MAJOR_PAIRS = [
  { symbol: 'EUR/USD', name: 'Euro / US Dollar' },
  { symbol: 'GBP/USD', name: 'British Pound / US Dollar' },
  { symbol: 'USD/JPY', name: 'US Dollar / Japanese Yen' },
  { symbol: 'USD/CHF', name: 'US Dollar / Swiss Franc' },
  { symbol: 'AUD/USD', name: 'Australian Dollar / US Dollar' },
  { symbol: 'USD/CAD', name: 'US Dollar / Canadian Dollar' },
  { symbol: 'NZD/USD', name: 'New Zealand Dollar / US Dollar' },
];

export const MINOR_PAIRS = [
  { symbol: 'EUR/GBP', name: 'Euro / British Pound' },
  { symbol: 'EUR/JPY', name: 'Euro / Japanese Yen' },
  { symbol: 'GBP/JPY', name: 'British Pound / Japanese Yen' },
  { symbol: 'AUD/JPY', name: 'Australian Dollar / Japanese Yen' },
  { symbol: 'EUR/CHF', name: 'Euro / Swiss Franc' },
  { symbol: 'GBP/CHF', name: 'British Pound / Swiss Franc' },
];

export const EXOTIC_PAIRS = [
  { symbol: 'USD/TRY', name: 'US Dollar / Turkish Lira' },
  { symbol: 'USD/ZAR', name: 'US Dollar / South African Rand' },
  { symbol: 'USD/MXN', name: 'US Dollar / Mexican Peso' },
  { symbol: 'USD/SGD', name: 'US Dollar / Singapore Dollar' },
];
