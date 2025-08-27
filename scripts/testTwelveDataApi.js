#!/usr/bin/env node

/**
 * Test script for Twelve Data API
 * Run with: node scripts/testTwelveDataApi.js
 * Or: npm run test-api
 */

const axios = require('axios');

// API Configuration
const API_CONFIG = {
  TWELVE_DATA_API_KEY: '8c01754c71074264b44d9a30925b5a39',
  TWELVE_DATA_BASE_URL: 'https://api.twelvedata.com',
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Utility functions
const log = (message, color = colors.reset) => {
  console.log(`${color}${message}${colors.reset}`);
};

const logSuccess = (message) => log(`✅ ${message}`, colors.green);
const logError = (message) => log(`❌ ${message}`, colors.red);
const logInfo = (message) => log(`ℹ️  ${message}`, colors.blue);
const logWarning = (message) => log(`⚠️  ${message}`, colors.yellow);

// API test functions
class TwelveDataApiTester {
  constructor() {
    this.apiKey = API_CONFIG.TWELVE_DATA_API_KEY;
    this.baseUrl = API_CONFIG.TWELVE_DATA_BASE_URL;
  }

  async testConnection() {
    logInfo('Testing API connection...');
    
    try {
      const response = await axios.get(`${this.baseUrl}/quote`, {
        params: {
          symbol: 'EUR/USD',
          apikey: this.apiKey,
          format: 'json'
        },
        timeout: 10000
      });

      if (response.status === 200) {
        logSuccess('API connection successful');
        return true;
      } else {
        logError(`Unexpected status code: ${response.status}`);
        return false;
      }
    } catch (error) {
      if (error.response) {
        logError(`API Error: ${error.response.status} - ${error.response.data?.message || error.response.statusText}`);
        log(`Response: ${JSON.stringify(error.response.data, null, 2)}`, colors.red);
      } else if (error.request) {
        logError('Network Error: No response received');
      } else {
        logError(`Request Error: ${error.message}`);
      }
      return false;
    }
  }

  async getForexQuotes(symbols = 'EUR/USD,GBP/USD,USD/JPY') {
    logInfo(`Fetching forex quotes for: ${symbols}`);
    
    try {
      const response = await axios.get(`${this.baseUrl}/quote`, {
        params: {
          symbol: symbols,
          apikey: this.apiKey,
          format: 'json'
        },
        timeout: 10000
      });

      logSuccess('Forex quotes fetched successfully');
      log('Response:', colors.cyan);
      console.log(JSON.stringify(response.data, null, 2));
      
      return { success: true, data: response.data };
    } catch (error) {
      logError('Failed to fetch forex quotes');
      if (error.response) {
        log(`Error: ${JSON.stringify(error.response.data, null, 2)}`, colors.red);
      } else {
        log(`Error: ${error.message}`, colors.red);
      }
      return { success: false, error: error.message };
    }
  }

  async getExchangeRate(from = 'EUR', to = 'USD') {
    logInfo(`Fetching exchange rate: ${from} to ${to}`);
    
    try {
      const response = await axios.get(`${this.baseUrl}/exchange_rate`, {
        params: {
          from: from,
          to: to,
          apikey: this.apiKey,
          format: 'json'
        },
        timeout: 10000
      });

      logSuccess('Exchange rate fetched successfully');
      log('Response:', colors.cyan);
      console.log(JSON.stringify(response.data, null, 2));
      
      return { success: true, data: response.data };
    } catch (error) {
      logError('Failed to fetch exchange rate');
      if (error.response) {
        log(`Error: ${JSON.stringify(error.response.data, null, 2)}`, colors.red);
      } else {
        log(`Error: ${error.message}`, colors.red);
      }
      return { success: false, error: error.message };
    }
  }

  async convertCurrency(from = 'USD', to = 'EUR', amount = 100) {
    logInfo(`Converting ${amount} ${from} to ${to}`);
    
    try {
      const response = await axios.get(`${this.baseUrl}/currency_conversion`, {
        params: {
          from: from,
          to: to,
          amount: amount,
          apikey: this.apiKey,
          format: 'json'
        },
        timeout: 10000
      });

      logSuccess('Currency conversion completed successfully');
      log('Response:', colors.cyan);
      console.log(JSON.stringify(response.data, null, 2));
      
      return { success: true, data: response.data };
    } catch (error) {
      logError('Failed to convert currency');
      if (error.response) {
        log(`Error: ${JSON.stringify(error.response.data, null, 2)}`, colors.red);
      } else {
        log(`Error: ${error.message}`, colors.red);
      }
      return { success: false, error: error.message };
    }
  }

  async getMarketStatus() {
    logInfo('Fetching market status...');
    
    try {
      const response = await axios.get(`${this.baseUrl}/market_state`, {
        params: {
          apikey: this.apiKey,
          format: 'json'
        },
        timeout: 10000
      });

      logSuccess('Market status fetched successfully');
      log('Response:', colors.cyan);
      console.log(JSON.stringify(response.data, null, 2));
      
      return { success: true, data: response.data };
    } catch (error) {
      logError('Failed to fetch market status');
      if (error.response) {
        log(`Error: ${JSON.stringify(error.response.data, null, 2)}`, colors.red);
      } else {
        log(`Error: ${error.message}`, colors.red);
      }
      return { success: false, error: error.message };
    }
  }

  async getTimeSeries(symbol = 'EUR/USD', interval = '1min', outputsize = 10) {
    logInfo(`Fetching time series for ${symbol} (${interval}, last ${outputsize} points)`);
    
    try {
      const response = await axios.get(`${this.baseUrl}/time_series`, {
        params: {
          symbol: symbol,
          interval: interval,
          outputsize: outputsize,
          apikey: this.apiKey,
          format: 'json'
        },
        timeout: 15000
      });

      logSuccess('Time series data fetched successfully');
      log('Response:', colors.cyan);
      console.log(JSON.stringify(response.data, null, 2));
      
      return { success: true, data: response.data };
    } catch (error) {
      logError('Failed to fetch time series');
      if (error.response) {
        log(`Error: ${JSON.stringify(error.response.data, null, 2)}`, colors.red);
      } else {
        log(`Error: ${error.message}`, colors.red);
      }
      return { success: false, error: error.message };
    }
  }
}

// Main test runner
async function runTests() {
  log('\n🚀 Twelve Data API Tester', colors.bright);
  log('=' .repeat(50), colors.blue);
  
  const tester = new TwelveDataApiTester();
  
  // Test connection first
  log('\n📡 Testing Connection', colors.bright);
  log('-'.repeat(30), colors.blue);
  const connected = await tester.testConnection();
  
  if (!connected) {
    logError('Connection failed. Exiting...');
    process.exit(1);
  }

  // Run API tests
  const tests = [
    {
      name: '💱 Forex Quotes',
      fn: () => tester.getForexQuotes('EUR/USD,GBP/USD,USD/JPY')
    },
    {
      name: '🔄 Exchange Rate',
      fn: () => tester.getExchangeRate('EUR', 'USD')
    },
    {
      name: '💰 Currency Conversion',
      fn: () => tester.convertCurrency('USD', 'EUR', 100)
    },
    {
      name: '📊 Market Status',
      fn: () => tester.getMarketStatus()
    },
    {
      name: '📈 Time Series',
      fn: () => tester.getTimeSeries('EUR/USD', '1min', 5)
    }
  ];

  for (const test of tests) {
    log(`\n${test.name}`, colors.bright);
    log('-'.repeat(30), colors.blue);
    
    try {
      await test.fn();
    } catch (error) {
      logError(`Test failed: ${error.message}`);
    }
    
    // Add delay between requests to respect rate limits
    logInfo('Waiting 2 seconds before next request...');
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  log('\n✨ All tests completed!', colors.bright);
  log('=' .repeat(50), colors.blue);
}

// Handle command line arguments
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  log('\n🔧 Twelve Data API Tester', colors.bright);
  log('Usage: node scripts/testTwelveDataApi.js [options]', colors.blue);
  log('\nOptions:');
  log('  --help, -h     Show this help message');
  log('  --quick, -q    Run only connection test and forex quotes');
  log('  --single <endpoint>  Test a single endpoint');
  log('\nEndpoints:');
  log('  quotes         Test forex quotes');
  log('  exchange       Test exchange rate');
  log('  convert        Test currency conversion');
  log('  market         Test market status');
  log('  timeseries     Test time series data');
  process.exit(0);
}

if (args.includes('--quick') || args.includes('-q')) {
  // Quick test mode
  (async () => {
    const tester = new TwelveDataApiTester();
    log('\n⚡ Quick Test Mode', colors.bright);
    log('-'.repeat(30), colors.blue);
    
    await tester.testConnection();
    await new Promise(resolve => setTimeout(resolve, 1000));
    await tester.getForexQuotes();
    
    log('\n✨ Quick test completed!', colors.bright);
  })();
} else if (args.includes('--single')) {
  // Single endpoint test
  const endpoint = args[args.indexOf('--single') + 1];
  const tester = new TwelveDataApiTester();
  
  (async () => {
    log(`\n🎯 Testing single endpoint: ${endpoint}`, colors.bright);
    log('-'.repeat(30), colors.blue);
    
    switch (endpoint) {
      case 'quotes':
        await tester.getForexQuotes();
        break;
      case 'exchange':
        await tester.getExchangeRate();
        break;
      case 'convert':
        await tester.convertCurrency();
        break;
      case 'market':
        await tester.getMarketStatus();
        break;
      case 'timeseries':
        await tester.getTimeSeries();
        break;
      default:
        logError(`Unknown endpoint: ${endpoint}`);
        process.exit(1);
    }
    
    log('\n✨ Single test completed!', colors.bright);
  })();
} else {
  // Run all tests
  runTests().catch(error => {
    logError(`Test runner failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = TwelveDataApiTester;
