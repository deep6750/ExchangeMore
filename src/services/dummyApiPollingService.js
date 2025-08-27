import { EventEmitter } from 'events';
import { API_CONFIG } from '../config/apiConfig';
import { getDummyApiUrls } from '../utils/network';

/**
 * HTTP Polling-based dummy API service for React Native
 * Falls back to HTTP polling if WebSocket doesn't work
 */
class DummyApiPollingService extends EventEmitter {
  constructor() {
    super();
    const urls = getDummyApiUrls({
      httpOverride: API_CONFIG?.DUMMY_API_URL,
      wsOverride: API_CONFIG?.DUMMY_API_WS_URL,
    });
    this.apiUrl = urls.http;
    this.isRunning = false;
    this.interval = null;
    this.latestData = new Map();
    this.subscribedPairs = [];
    this.updateInterval = 1000; // 1 second for fast real-time updates
  }

  /**
   * Start the polling service
   */
  start(pairs = []) {
    console.log('🚀 DummyApiPollingService: Starting HTTP polling service');
    
    if (pairs.length > 0) {
      this.subscribedPairs = pairs;
      console.log('📈 DummyApiPollingService: Subscribed to pairs:', pairs.map(p => p.symbol));
    }
    
    this.isRunning = true;
    
    // Initial fetch
    this.fetchData();
    
    // Set up polling interval
    this.interval = setInterval(() => {
      this.fetchData();
    }, this.updateInterval);
    
    this.emit('service_started');
    console.log('✅ DummyApiPollingService: Service started with HTTP polling');
  }

  /**
   * Fetch data from HTTP endpoint
   */
  async fetchData() {
    try {
      console.log('🔄 DummyApiPollingService: Fetching data...');
      
      const response = await fetch(`${this.apiUrl}/quote`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`📊 DummyApiPollingService: Received data for ${Object.keys(data).length} pairs`);
      
      this.processForexData(data);
      
    } catch (error) {
      console.error('❌ DummyApiPollingService: Fetch error:', error.message);
      this.emit('error', error);
    }
  }

  /**
   * Process forex data and emit events
   */
  processForexData(data) {
    Object.entries(data).forEach(([symbol, newData]) => {
      const previousData = this.latestData.get(symbol);
      
      // Store the new data
      this.latestData.set(symbol, newData);
      
      // Check if this pair is subscribed
      if (this.subscribedPairs.length === 0 || this.subscribedPairs.some(pair => pair.symbol === symbol)) {
        console.log(`📤 DummyApiPollingService: Emitting pair_updated for ${symbol}`);
        
        // Emit pair update event
        this.emit('pair_updated', {
          symbol,
          data: newData,
          previousData
        });
      }
    });
    
    // Emit batch update
    this.emit('batch_updated', {
      symbols: Object.keys(data),
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Stop the service
   */
  stop() {
    console.log('🛑 DummyApiPollingService: Stopping service');
    
    this.isRunning = false;
    
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    
    this.latestData.clear();
    this.emit('service_stopped');
  }

  /**
   * Get current connection status
   */
  getStatus() {
    return {
      isConnected: this.isRunning,
      subscribedPairs: this.subscribedPairs.length,
      dataPoints: this.latestData.size,
      method: 'HTTP Polling'
    };
  }

  /**
   * Manually trigger an update
   */
  async triggerUpdate() {
    try {
      const response = await fetch(`${this.apiUrl}/trigger_update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('✅ DummyApiPollingService: Manual update triggered:', data.message);
      
      // Fetch fresh data
      setTimeout(() => this.fetchData(), 500);
      
      return { success: true, data };
    } catch (error) {
      console.error('❌ DummyApiPollingService: Failed to trigger update:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Check API health
   */
  async checkHealth() {
    try {
      const response = await fetch(`${this.apiUrl}/health`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('❌ DummyApiPollingService: Health check failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Compatibility methods to match WebSocket service interface
  connect() {
    // For compatibility - polling doesn't need explicit connection
    this.emit('connected');
  }

  subscribe(pairs) {
    this.subscribedPairs = Array.isArray(pairs) ? pairs : [pairs];
    console.log('📈 DummyApiPollingService: Updated subscription:', this.subscribedPairs.map(p => p.symbol));
  }

  getAllData() {
    return Object.fromEntries(this.latestData);
  }

  getData(symbol) {
    return this.latestData.get(symbol);
  }
}

// Create singleton instance
const dummyApiPollingService = new DummyApiPollingService();

export default dummyApiPollingService;
