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
import twelveDataApi from './twelveDataApi';
import { MAJOR_PAIRS, MINOR_PAIRS, EXOTIC_PAIRS } from './twelveDataApi';
import dummyApiService from './dummyApiService';
import dummyApiPollingService from './dummyApiPollingService';
import internalMockDataService from './internalMockDataService';
import { API_CONFIG } from '../config/apiConfig';

class RealTimeDataService extends EventEmitter {
  constructor() {
    super();
    this.isRunning = false;
    this.interval = null;
    this.updateInterval = 10000; // 10 seconds - respects free tier limits
    this.subscribedPairs = [];
    this.latestData = new Map();
    this.requestQueue = [];
    this.isProcessingQueue = false;
    
    // API configuration
    this.useDummyApi = API_CONFIG.USE_DUMMY_API;
    this.useInternalMock = API_CONFIG.USE_INTERNAL_MOCK;
    this.usePolling = true; // Use HTTP polling for better React Native compatibility
    
    let serviceType = 'Twelve Data API';
    if (this.useInternalMock) {
      serviceType = 'Internal Mock Service';
    } else if (this.useDummyApi) {
      serviceType = this.usePolling ? 'Dummy API (HTTP Polling)' : 'Dummy API (WebSocket)';
    }
    console.log('🔧 RealTimeDataService initialized with:', serviceType);
    
    // Set up event listeners based on service type
    if (this.useInternalMock) {
      this.setupInternalMockListeners();
    } else if (this.useDummyApi) {
      this.setupDummyApiListeners();
    }
  }

  // Set up internal mock service event listeners
  setupInternalMockListeners() {
    console.log('🎧 RealTimeDataService: Setting up internal mock service event listeners');
    
    internalMockDataService.on('service_started', () => {
      console.log('📡 RealTimeDataService: Internal mock service started');
      this.emit('service_started');
    });
    
    internalMockDataService.on('service_stopped', () => {
      console.log('🛑 RealTimeDataService: Internal mock service stopped');
      this.emit('service_stopped');
    });
    
    internalMockDataService.on('pair_updated', (pairData) => {
      console.log('📈 RealTimeDataService: Received pair update from internal mock:', pairData.symbol);
      this.latestData.set(pairData.symbol, pairData);
      this.emit('pair_updated', pairData);
    });
  }

  // Set up dummy API event listeners
  setupDummyApiListeners() {
    console.log('🎧 RealTimeDataService: Setting up dummy API event listeners');
    
    const service = this.usePolling ? dummyApiPollingService : dummyApiService;
    
    service.on('pair_updated', (updateData) => {
      console.log('📥 RealTimeDataService: Received pair_updated for:', updateData.symbol);
      this.emit('pair_updated', updateData);
    });
    
    service.on('batch_updated', (batchData) => {
      console.log('📥 RealTimeDataService: Received batch_updated for:', batchData.symbols.length, 'pairs');
      this.emit('batch_updated', batchData);
    });
    
    service.on('service_started', () => {
      console.log('📥 RealTimeDataService: Received service_started event');
      this.emit('service_started');
    });
    
    service.on('connected', () => {
      console.log('📥 RealTimeDataService: Received connected event');
      this.emit('service_started');
    });
    
    service.on('service_stopped', () => {
      console.log('📥 RealTimeDataService: Received service_stopped event');
      this.emit('service_stopped');
    });
    
    service.on('disconnected', () => {
      console.log('📥 RealTimeDataService: Received disconnected event');
      this.emit('service_stopped');
    });
    
    service.on('error', (error) => {
      console.log('📥 RealTimeDataService: Received error event:', error);
      this.emit('error', error);
    });
    
    console.log('✅ RealTimeDataService: Event listeners set up complete');
  }

  // Start real-time updates
  start(pairs = null) {
    if (this.isRunning) {
      console.log('Real-time service already running');
      return;
    }

    this.subscribedPairs = pairs || [...MAJOR_PAIRS, ...MINOR_PAIRS, ...EXOTIC_PAIRS];
    this.isRunning = true;
    
    console.log('🚀 Starting real-time forex data service...');
    console.log('📊 Subscribed pairs:', this.subscribedPairs.map(p => p.symbol));
    console.log('⏰ Update interval:', this.updateInterval);
    
    if (this.useInternalMock) {
      // Use internal mock service (no external dependencies)
      console.log('🔧 Using Internal Mock Service for real-time data');
      internalMockDataService.start(this.subscribedPairs);
    } else if (this.useDummyApi) {
      // Use dummy API with HTTP polling or WebSocket
      const service = this.usePolling ? dummyApiPollingService : dummyApiService;
      console.log('🔧 Using Dummy API for real-time data (method:', this.usePolling ? 'HTTP Polling' : 'WebSocket', ')');
      service.start(this.subscribedPairs);
    } else {
      // Use original Twelve Data API with polling
      console.log('🔧 Using Twelve Data API for real-time data');
      
      // Initial fetch
      this.fetchLatestData();
      
      // Set up interval for periodic updates
      this.interval = setInterval(() => {
        console.log('🔄 Fetching real-time data...');
        this.fetchLatestData();
      }, this.updateInterval);

      console.log('✅ Service started, emitting service_started event');
      this.emit('service_started');
    }
  }

  // Stop real-time updates
  stop() {
    if (!this.isRunning) {
      return;
    }

    console.log('Stopping real-time forex data service...');
    
    this.isRunning = false;
    
    if (this.useInternalMock) {
      // Stop internal mock service
      internalMockDataService.stop();
    } else if (this.useDummyApi) {
      // Stop dummy API service
      const service = this.usePolling ? dummyApiPollingService : dummyApiService;
      service.stop();
    } else {
      // Stop polling interval
      if (this.interval) {
        clearInterval(this.interval);
        this.interval = null;
      }
      this.emit('service_stopped');
    }
  }

  // Add pairs to subscription
  subscribe(pairs) {
    const newPairs = Array.isArray(pairs) ? pairs : [pairs];
    newPairs.forEach(pair => {
      if (!this.subscribedPairs.find(p => p.symbol === pair.symbol)) {
        this.subscribedPairs.push(pair);
      }
    });
    
    if (this.isRunning) {
      // Fetch data for new pairs immediately
      this.fetchSpecificPairs(newPairs);
    }
  }

  // Remove pairs from subscription
  unsubscribe(symbols) {
    const symbolsArray = Array.isArray(symbols) ? symbols : [symbols];
    this.subscribedPairs = this.subscribedPairs.filter(
      pair => !symbolsArray.includes(pair.symbol)
    );
    
    // Remove from latest data cache
    symbolsArray.forEach(symbol => {
      this.latestData.delete(symbol);
    });
  }

  // Get latest data for a specific symbol
  getLatestData(symbol) {
    return this.latestData.get(symbol);
  }

  // Get all latest data
  getAllLatestData() {
    return Object.fromEntries(this.latestData);
  }

  // Fetch latest data for all subscribed pairs
  async fetchLatestData() {
    if (!this.isRunning || this.subscribedPairs.length === 0) {
      return;
    }

    try {
      // Process in batches to respect API limits
      const batchSize = 5; // Conservative batch size for free tier
      const batches = [];
      
      for (let i = 0; i < this.subscribedPairs.length; i += batchSize) {
        batches.push(this.subscribedPairs.slice(i, i + batchSize));
      }

      // Process batches with delay
      for (let i = 0; i < batches.length; i++) {
        if (!this.isRunning) break; // Check if service was stopped
        
        await this.processBatch(batches[i]);
        
        // Add delay between batches to respect rate limits
        if (i < batches.length - 1) {
          await this.delay(2000); // 2 second delay between batches
        }
      }
    } catch (error) {
      console.error('Error fetching real-time data:', error);
      this.emit('error', error);
    }
  }

  // Process a batch of currency pairs
  async processBatch(batch) {
    try {
      const symbols = batch.map(pair => pair.symbol).join(',');
      const result = await twelveDataApi.getForexQuotes(symbols);
      
      if (result.success) {
        const quotes = Array.isArray(result.data) ? result.data : [result.data];
        
        batch.forEach((pair, index) => {
          const quote = quotes[index];
          if (quote) {
            const previousData = this.latestData.get(pair.symbol);
            const newData = {
              symbol: pair.symbol,
              name: pair.name,
              price: parseFloat(quote.close || quote.price || 0),
              change: parseFloat(quote.change || 0),
              changePercent: parseFloat(quote.percent_change || 0),
              high: parseFloat(quote.high || 0),
              low: parseFloat(quote.low || 0),
              volume: parseInt(quote.volume || 0),
              timestamp: new Date().toISOString(),
              open: parseFloat(quote.open || 0),
              previousClose: parseFloat(quote.previous_close || 0),
            };

            // Check if data has changed
            const hasChanged = !previousData || 
              previousData.price !== newData.price ||
              previousData.change !== newData.change ||
              previousData.changePercent !== newData.changePercent;

            this.latestData.set(pair.symbol, newData);

            if (hasChanged) {
              console.log(`📈 Price update for ${pair.symbol}: ${previousData?.price || 'N/A'} → ${newData.price}`);
              // Emit individual pair update
              this.emit('pair_updated', {
                symbol: pair.symbol,
                data: newData,
                previousData: previousData
              });
            }
          }
        });

        // Emit batch update
        this.emit('batch_updated', {
          symbols: batch.map(p => p.symbol),
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error processing batch:', error);
      this.emit('batch_error', { batch, error });
    }
  }

  // Fetch data for specific pairs
  async fetchSpecificPairs(pairs) {
    try {
      await this.processBatch(pairs);
    } catch (error) {
      console.error('Error fetching specific pairs:', error);
    }
  }

  // Utility function for delays
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Set update interval (minimum 5 seconds to respect API limits)
  setUpdateInterval(interval) {
    if (interval < 5000) {
      console.warn('Update interval too low, setting to minimum 5 seconds');
      interval = 5000;
    }
    
    this.updateInterval = interval;
    
    if (this.isRunning) {
      this.stop();
      this.start(this.subscribedPairs);
    }
  }

  // Get service status
  getStatus() {
    return {
      isRunning: this.isRunning,
      updateInterval: this.updateInterval,
      subscribedPairsCount: this.subscribedPairs.length,
      latestDataCount: this.latestData.size,
      subscribedPairs: this.subscribedPairs.map(p => p.symbol)
    };
  }

  // Manual refresh for specific symbol
  async refreshSymbol(symbol) {
    const pair = this.subscribedPairs.find(p => p.symbol === symbol);
    if (pair) {
      await this.fetchSpecificPairs([pair]);
    }
  }

  // Get price change indicators
  getPriceChangeIndicator(symbol) {
    const current = this.latestData.get(symbol);
    if (!current) return null;

    return {
      symbol,
      isPositive: current.change >= 0,
      magnitude: Math.abs(current.changePercent),
      level: this.getChangeLevel(Math.abs(current.changePercent))
    };
  }

  // Categorize change level for UI indicators
  getChangeLevel(changePercent) {
    if (changePercent >= 2) return 'high';
    if (changePercent >= 1) return 'medium';
    if (changePercent >= 0.5) return 'low';
    return 'minimal';
  }
}

// Create singleton instance
const realTimeDataService = new RealTimeDataService();

export default realTimeDataService;

// Export helper functions for React components
export const useRealTimeData = () => {
  return realTimeDataService;
};

export const subscribeToSymbol = (symbol, callback) => {
  const handleUpdate = (data) => {
    if (data.symbol === symbol) {
      callback(data);
    }
  };

  realTimeDataService.on('pair_updated', handleUpdate);
  
  return () => {
    realTimeDataService.off('pair_updated', handleUpdate);
  };
};

export const subscribeToAllUpdates = (callback) => {
  realTimeDataService.on('pair_updated', callback);
  
  return () => {
    realTimeDataService.off('pair_updated', callback);
  };
};
