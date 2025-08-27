// Import events for React Native
let EventEmitter;
try {
  EventEmitter = require('events').EventEmitter;
} catch (e) {
  // Fallback for React Native
  EventEmitter = class extends Array {
    constructor() {
      super();
      this.events = {};
    }
    
    on(event, listener) {
      if (!this.events[event]) this.events[event] = [];
      this.events[event].push(listener);
    }
    
    off(event, listener) {
      if (!this.events[event]) return;
      this.events[event] = this.events[event].filter(l => l !== listener);
    }
    
    emit(event, ...args) {
      if (!this.events[event]) return;
      this.events[event].forEach(listener => listener(...args));
    }
  };
}

/**
 * Internal Mock Data Service
 * Generates real-time forex data without external dependencies
 * Perfect for React Native apps that need guaranteed real-time updates
 */
class InternalMockDataService extends EventEmitter {
  constructor() {
    super();
    this.isRunning = false;
    this.interval = null;
    this.updateInterval = 1000; // 1 second updates
    this.mockData = this.initializeMockData();
    this.subscribedPairs = [];
  }

  /**
   * Initialize mock forex data
   */
  initializeMockData() {
    return {
      'EUR/USD': {
        symbol: 'EUR/USD',
        name: 'Euro / US Dollar',
        exchange: 'Forex',
        price: 1.1625,
        bid: 1.1623,
        ask: 1.1627,
        open: 1.1620,
        high: 1.1645,
        low: 1.1610,
        close: 1.1625,
        previous_close: 1.1615,
        change: 0.0010,
        percent_change: 0.086,
        volume: 2847600,
        fifty_two_week_high: 1.2345,
        fifty_two_week_low: 1.0567,
        is_market_open: true,
        timestamp: Date.now(),
      },
      'GBP/USD': {
        symbol: 'GBP/USD',
        name: 'British Pound / US Dollar',
        exchange: 'Forex',
        price: 1.3475,
        bid: 1.3473,
        ask: 1.3477,
        open: 1.3465,
        high: 1.3490,
        low: 1.3450,
        close: 1.3475,
        previous_close: 1.3460,
        change: 0.0015,
        percent_change: 0.111,
        volume: 1847200,
        fifty_two_week_high: 1.4256,
        fifty_two_week_low: 1.2034,
        is_market_open: true,
        timestamp: Date.now(),
      },
      'USD/JPY': {
        symbol: 'USD/JPY',
        name: 'US Dollar / Japanese Yen',
        exchange: 'Forex',
        price: 147.75,
        bid: 147.73,
        ask: 147.77,
        open: 147.60,
        high: 147.90,
        low: 147.40,
        close: 147.75,
        previous_close: 147.50,
        change: 0.25,
        percent_change: 0.169,
        volume: 3247800,
        fifty_two_week_high: 151.89,
        fifty_two_week_low: 127.21,
        is_market_open: true,
        timestamp: Date.now(),
      },
      'USD/CHF': {
        symbol: 'USD/CHF',
        name: 'US Dollar / Swiss Franc',
        exchange: 'Forex',
        price: 0.8425,
        bid: 0.8423,
        ask: 0.8427,
        open: 0.8420,
        high: 0.8435,
        low: 0.8410,
        close: 0.8425,
        previous_close: 0.8415,
        change: 0.0010,
        percent_change: 0.119,
        volume: 1547300,
        fifty_two_week_high: 0.9326,
        fifty_two_week_low: 0.8234,
        is_market_open: true,
        timestamp: Date.now(),
      },
      'AUD/USD': {
        symbol: 'AUD/USD',
        name: 'Australian Dollar / US Dollar',
        exchange: 'Forex',
        price: 0.6790,
        bid: 0.6788,
        ask: 0.6792,
        open: 0.6785,
        high: 0.6795,
        low: 0.6775,
        close: 0.6790,
        previous_close: 0.6780,
        change: 0.0010,
        percent_change: 0.147,
        volume: 1247500,
        fifty_two_week_high: 0.7156,
        fifty_two_week_low: 0.6347,
        is_market_open: true,
        timestamp: Date.now(),
      },
      'USD/CAD': {
        symbol: 'USD/CAD',
        name: 'US Dollar / Canadian Dollar',
        exchange: 'Forex',
        price: 1.3460,
        bid: 1.3458,
        ask: 1.3462,
        open: 1.3455,
        high: 1.3470,
        low: 1.3445,
        close: 1.3460,
        previous_close: 1.3450,
        change: 0.0010,
        percent_change: 0.074,
        volume: 987600,
        fifty_two_week_high: 1.3856,
        fifty_two_week_low: 1.3156,
        is_market_open: true,
        timestamp: Date.now(),
      },
      'NZD/USD': {
        symbol: 'NZD/USD',
        name: 'New Zealand Dollar / US Dollar',
        exchange: 'Forex',
        price: 0.6130,
        bid: 0.6128,
        ask: 0.6132,
        open: 0.6125,
        high: 0.6140,
        low: 0.6115,
        close: 0.6130,
        previous_close: 0.6120,
        change: 0.0010,
        percent_change: 0.163,
        volume: 847200,
        fifty_two_week_high: 0.6587,
        fifty_two_week_low: 0.5847,
        is_market_open: true,
        timestamp: Date.now(),
      },
    };
  }

  /**
   * Start the mock data service
   */
  start(pairs = []) {
    console.log('🚀 InternalMockDataService: Starting internal mock data service');
    
    if (pairs.length > 0) {
      this.subscribedPairs = pairs;
      console.log('📈 InternalMockDataService: Subscribed to pairs:', pairs.map(p => p.symbol));
    }
    
    this.isRunning = true;
    
    // Emit initial data
    this.emitInitialData();
    
    // Set up update interval
    this.interval = setInterval(() => {
      this.updateMockData();
    }, this.updateInterval);
    
    this.emit('service_started');
    console.log('✅ InternalMockDataService: Service started with 1-second updates');
  }

  /**
   * Stop the mock data service
   */
  stop() {
    console.log('🛑 InternalMockDataService: Stopping mock data service');
    
    this.isRunning = false;
    
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    
    this.emit('service_stopped');
    console.log('✅ InternalMockDataService: Service stopped');
  }

  /**
   * Emit initial data for all pairs
   */
  emitInitialData() {
    console.log('📤 InternalMockDataService: Emitting initial data');
    
    Object.values(this.mockData).forEach(pairData => {
      this.emit('pair_updated', pairData);
      console.log(`📊 InternalMockDataService: Emitted initial data for ${pairData.symbol}`);
    });
  }

  /**
   * Update mock data with realistic fluctuations
   */
  updateMockData() {
    const now = Date.now();
    
    Object.keys(this.mockData).forEach(symbol => {
      const pair = this.mockData[symbol];
      const previousPrice = pair.price;
      
      // Generate realistic price fluctuation (-0.1% to +0.1%)
      const fluctuation = (Math.random() - 0.5) * 0.002; // 0.2% max change
      const newPrice = previousPrice * (1 + fluctuation);
      
      // Calculate spread (0.1 to 0.5 pips for major pairs)
      const spread = 0.0002 + (Math.random() * 0.0003); // 0.2-0.5 pips
      
      // Update price data
      pair.previous_close = previousPrice;
      pair.price = Math.round(newPrice * 100000) / 100000; // 5 decimal places
      pair.close = pair.price;
      pair.change = pair.price - pair.previous_close;
      pair.percent_change = (pair.change / pair.previous_close) * 100;
      pair.timestamp = now;
      
      // Update BID/ASK with realistic spread
      pair.bid = Math.round((pair.price - spread/2) * 100000) / 100000;
      pair.ask = Math.round((pair.price + spread/2) * 100000) / 100000;
      
      // Update high/low for the day
      if (pair.price > pair.high) pair.high = pair.price;
      if (pair.price < pair.low) pair.low = pair.price;
      
      // Update volume (simulate trading activity)
      const volumeChange = Math.floor((Math.random() - 0.5) * 50000); // +/- 25k volume change
      pair.volume = Math.max(100000, pair.volume + volumeChange); // Minimum 100k volume
      
      // Occasionally update 52-week high/low (very rarely)
      if (Math.random() < 0.001) { // 0.1% chance
        if (pair.price > pair.fifty_two_week_high) {
          pair.fifty_two_week_high = pair.price;
        }
        if (pair.price < pair.fifty_two_week_low) {
          pair.fifty_two_week_low = pair.price;
        }
      }
      
      // Emit the update
      this.emit('pair_updated', { ...pair });
    });
    
    console.log(`📈 InternalMockDataService: Updated ${Object.keys(this.mockData).length} pairs with BID/ASK/Volume`);
  }

  /**
   * Get current data for all pairs
   */
  getCurrentData() {
    return Object.values(this.mockData);
  }

  /**
   * Get data for a specific symbol
   */
  getSymbolData(symbol) {
    return this.mockData[symbol] || null;
  }
}

// Export singleton instance
const internalMockDataService = new InternalMockDataService();
export default internalMockDataService;
