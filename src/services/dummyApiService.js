import { EventEmitter } from 'events';
import { API_CONFIG } from '../config/apiConfig';
import { getDummyApiUrls } from '../utils/network';

/**
 * Local Dummy API Service for development
 * Provides real-time forex data with WebSocket support
 */
class DummyApiService extends EventEmitter {
  constructor() {
    super();
    // Resolve base URLs (supports Expo device/simulator)
    const urls = getDummyApiUrls({
      httpOverride: API_CONFIG?.DUMMY_API_URL,
      wsOverride: API_CONFIG?.DUMMY_API_WS_URL,
    });
    this.wsUrl = urls.ws;
    this.apiUrl = urls.http;
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 2000;
    this.isConnected = false;
    this.latestData = new Map();
    this.subscribedPairs = [];
  }

  /**
   * Start the WebSocket connection
   */
  connect() {
    try {
      console.log('🔌 DummyApiService: Connecting to WebSocket:', this.wsUrl);
      
      this.ws = new WebSocket(this.wsUrl);
      
      this.ws.onopen = () => {
        console.log('✅ DummyApiService: Connected to WebSocket successfully');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.emit('connected');
        console.log('📡 DummyApiService: Emitted connected event');
      };
      
      this.ws.onmessage = (event) => {
        try {
          console.log('📨 DummyApiService: Received WebSocket message');
          const message = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('❌ DummyApiService: Error parsing WebSocket message:', error);
        }
      };
      
      this.ws.onclose = () => {
        console.log('🔌 WebSocket connection closed');
        this.isConnected = false;
        this.emit('disconnected');
        this.handleReconnect();
      };
      
      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.emit('error', error);
      };
      
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      this.emit('error', error);
      this.handleReconnect();
    }
  }

  /**
   * Handle incoming WebSocket messages
   */
  handleMessage(message) {
    const { type, data, timestamp } = message;
    
    console.log(`🎯 DummyApiService: Processing message type: ${type}`);
    
    switch (type) {
      case 'initial_data':
        console.log('📊 DummyApiService: Received initial data, processing...');
        this.processForexData(data);
        break;
        
      case 'forex_update':
        console.log('🔄 DummyApiService: Received real-time update, processing...');
        this.processForexData(data);
        break;
        
      default:
        console.log('❓ DummyApiService: Unknown message type:', type);
    }
  }

  /**
   * Process forex data and emit events
   */
  processForexData(data) {
    console.log(`💱 DummyApiService: Processing forex data for ${Object.keys(data).length} pairs`);
    
    Object.entries(data).forEach(([symbol, raw]) => {
      const previousData = this.latestData.get(symbol);
      
      // Normalize server fields (close/percent_change) to app's expected shape (price/changePercent)
      const normalized = {
        symbol,
        name: raw?.name || symbol,
        price: typeof raw?.price === 'number' ? raw.price : Number(raw?.close ?? 0),
        change: typeof raw?.change === 'number' ? Number(raw.change) : Number((raw?.close ?? 0) - (raw?.previous_close ?? raw?.close ?? 0)),
        changePercent: typeof raw?.changePercent === 'number' ? Number(raw.changePercent) : Number(raw?.percent_change ?? 0),
        high: Number(raw?.high ?? 0),
        low: Number(raw?.low ?? 0),
        volume: Number(raw?.volume ?? 0),
        timestamp: new Date().toISOString(),
        open: Number(raw?.open ?? 0),
        previousClose: Number(raw?.previous_close ?? 0),
      };

      // Store the normalized data
      this.latestData.set(symbol, normalized);
      
      // Check if this pair is subscribed
      if (this.subscribedPairs.length === 0 || this.subscribedPairs.some(pair => pair.symbol === symbol)) {
        console.log(`📤 DummyApiService: Emitting pair_updated for ${symbol} @ ${normalized.price}`);
        // Emit pair update event
        this.emit('pair_updated', {
          symbol,
          data: normalized,
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
   * Handle reconnection attempts
   */
  handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        this.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('❌ Max reconnection attempts reached');
      this.emit('max_reconnects_reached');
    }
  }

  /**
   * Subscribe to specific currency pairs
   */
  subscribe(pairs) {
    this.subscribedPairs = Array.isArray(pairs) ? pairs : [pairs];
    console.log('📈 Subscribed to pairs:', this.subscribedPairs.map(p => p.symbol));
  }

  /**
   * Start the service
   */
  start(pairs = []) {
    console.log('🚀 DummyApiService: Starting service with pairs:', pairs.map(p => p.symbol));
    
    if (pairs.length > 0) {
      this.subscribe(pairs);
    }
    
    this.connect();
    this.emit('service_started');
    console.log('📡 DummyApiService: Emitted service_started event');
  }

  /**
   * Stop the service
   */
  stop() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
    this.latestData.clear();
    this.emit('service_stopped');
  }

  /**
   * Get current connection status
   */
  getStatus() {
    return {
      isConnected: this.isConnected,
      subscribedPairs: this.subscribedPairs.length,
      dataPoints: this.latestData.size,
      reconnectAttempts: this.reconnectAttempts
    };
  }

  /**
   * Get latest data for all symbols
   */
  getAllData() {
    return Object.fromEntries(this.latestData);
  }

  /**
   * Get data for specific symbol
   */
  getData(symbol) {
    return this.latestData.get(symbol);
  }

  /**
   * Manually fetch data via HTTP (fallback)
   */
  async fetchQuotes(symbols = '') {
    try {
      const url = `${this.apiUrl}/quote${symbols ? `?symbol=${symbols}` : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching quotes:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Manually trigger a price update on the server
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
      console.log('✅ Manual update triggered:', data.message);
      return { success: true, data };
    } catch (error) {
      console.error('Error triggering update:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Check server health
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
      console.error('Health check failed:', error);
      return { success: false, error: error.message };
    }
  }
}

// Create singleton instance
const dummyApiService = new DummyApiService();

export default dummyApiService;
