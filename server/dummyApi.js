const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');
const http = require('http');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Store current forex data
let forexData = {
  'EUR/USD': {
    symbol: 'EUR/USD',
    name: 'Euro / US Dollar',
    exchange: 'Forex',
    datetime: new Date().toISOString().split('T')[0],
    timestamp: Math.floor(Date.now() / 1000),
    last_quote_at: Math.floor(Date.now() / 1000),
    open: 1.16255,
    high: 1.16648,
    low: 1.16027,
    close: 1.165,
    bid: 1.1648,
    ask: 1.1652,
    volume: 150000,
    previous_close: 1.16189,
    change: 0.0031,
    percent_change: 0.267,
    is_market_open: true,
    fifty_two_week: {
      low: 1.018382,
      high: 1.18303,
      low_change: 0.14661,
      high_change: -0.018025,
      low_change_percent: 14.397,
      high_change_percent: -1.524,
      range: '1.018382 - 1.183026'
    }
  },
  'GBP/USD': {
    symbol: 'GBP/USD',
    name: 'British Pound / US Dollar',
    exchange: 'Forex',
    datetime: new Date().toISOString().split('T')[0],
    timestamp: Math.floor(Date.now() / 1000),
    last_quote_at: Math.floor(Date.now() / 1000),
    open: 1.34725,
    high: 1.34929,
    low: 1.34354,
    close: 1.34773,
    bid: 1.3475,
    ask: 1.3479,
    volume: 120000,
    previous_close: 1.34539,
    change: 0.00234,
    percent_change: 0.174,
    is_market_open: true,
    fifty_two_week: {
      low: 1.21013,
      high: 1.37887,
      low_change: 0.1376,
      high_change: -0.03114,
      low_change_percent: 11.371,
      high_change_percent: -2.259,
      range: '1.210126 - 1.378873'
    }
  },
  'USD/JPY': {
    symbol: 'USD/JPY',
    name: 'US Dollar / Japanese Yen',
    exchange: 'Forex',
    datetime: new Date().toISOString().split('T')[0],
    timestamp: Math.floor(Date.now() / 1000),
    last_quote_at: Math.floor(Date.now() / 1000),
    open: 147.764,
    high: 147.908,
    low: 146.981,
    close: 147.317,
    bid: 147.305,
    ask: 147.329,
    volume: 180000,
    previous_close: 147.763,
    change: -0.446,
    percent_change: -0.302,
    is_market_open: true,
    fifty_two_week: {
      low: 139.58,
      high: 158.88,
      low_change: 7.737,
      high_change: -11.563,
      low_change_percent: 5.543,
      high_change_percent: -7.278,
      range: '139.580002 - 158.880005'
    }
  },
  'USD/CHF': {
    symbol: 'USD/CHF',
    name: 'US Dollar / Swiss Franc',
    exchange: 'Forex',
    datetime: new Date().toISOString().split('T')[0],
    timestamp: Math.floor(Date.now() / 1000),
    last_quote_at: Math.floor(Date.now() / 1000),
    open: 0.8425,
    high: 0.8456,
    low: 0.8398,
    close: 0.8432,
    bid: 0.8430,
    ask: 0.8434,
    volume: 95000,
    previous_close: 0.8419,
    change: 0.0013,
    percent_change: 0.154,
    is_market_open: true,
    fifty_two_week: {
      low: 0.8212,
      high: 0.9124,
      low_change: 0.022,
      high_change: -0.0692,
      low_change_percent: 2.68,
      high_change_percent: -7.58,
      range: '0.8212 - 0.9124'
    }
  },
  'AUD/USD': {
    symbol: 'AUD/USD',
    name: 'Australian Dollar / US Dollar',
    exchange: 'Forex',
    datetime: new Date().toISOString().split('T')[0],
    timestamp: Math.floor(Date.now() / 1000),
    last_quote_at: Math.floor(Date.now() / 1000),
    open: 0.6789,
    high: 0.6825,
    low: 0.6756,
    close: 0.6798,
    bid: 0.6796,
    ask: 0.6800,
    volume: 110000,
    previous_close: 0.6782,
    change: 0.0016,
    percent_change: 0.236,
    is_market_open: true,
    fifty_two_week: {
      low: 0.6347,
      high: 0.7156,
      low_change: 0.0451,
      high_change: -0.0358,
      low_change_percent: 7.1,
      high_change_percent: -5.0,
      range: '0.6347 - 0.7156'
    }
  },
  'USD/CAD': {
    symbol: 'USD/CAD',
    name: 'US Dollar / Canadian Dollar',
    exchange: 'Forex',
    datetime: new Date().toISOString().split('T')[0],
    timestamp: Math.floor(Date.now() / 1000),
    last_quote_at: Math.floor(Date.now() / 1000),
    open: 1.3456,
    high: 1.3489,
    low: 1.3421,
    close: 1.3467,
    bid: 1.3465,
    ask: 1.3469,
    volume: 105000,
    previous_close: 1.3452,
    change: 0.0015,
    percent_change: 0.112,
    is_market_open: true,
    fifty_two_week: {
      low: 1.3012,
      high: 1.3856,
      low_change: 0.0455,
      high_change: -0.0389,
      low_change_percent: 3.5,
      high_change_percent: -2.81,
      range: '1.3012 - 1.3856'
    }
  },
  'NZD/USD': {
    symbol: 'NZD/USD',
    name: 'New Zealand Dollar / US Dollar',
    exchange: 'Forex',
    datetime: new Date().toISOString().split('T')[0],
    timestamp: Math.floor(Date.now() / 1000),
    last_quote_at: Math.floor(Date.now() / 1000),
    open: 0.6123,
    high: 0.6156,
    low: 0.6098,
    close: 0.6134,
    bid: 0.6132,
    ask: 0.6136,
    volume: 90000,
    previous_close: 0.6119,
    change: 0.0015,
    percent_change: 0.245,
    is_market_open: true,
    fifty_two_week: {
      low: 0.5847,
      high: 0.6536,
      low_change: 0.0287,
      high_change: -0.0402,
      low_change_percent: 4.91,
      high_change_percent: -6.15,
      range: '0.5847 - 0.6536'
    }
  },
  'XAU/USD': {
    symbol: 'XAU/USD',
    name: 'Gold / US Dollar',
    exchange: 'Commodity',
    datetime: new Date().toISOString().split('T')[0],
    timestamp: Math.floor(Date.now() / 1000),
    last_quote_at: Math.floor(Date.now() / 1000),
    open: 1950.50,
    high: 1955.80,
    low: 1948.20,
    close: 1952.70,
    bid: 1952.60,
    ask: 1952.80,
    volume: 250000,
    previous_close: 1949.90,
    change: 2.80,
    percent_change: 0.144,
    is_market_open: true,
    fifty_two_week: {
      low: 1810.40,
      high: 2075.50,
      low_change: 142.30,
      high_change: -122.80,
      low_change_percent: 7.86,
      high_change_percent: -5.92,
      range: '1810.40 - 2075.50'
    }
  },
  'XAG/USD': {
    symbol: 'XAG/USD',
    name: 'Silver / US Dollar',
    exchange: 'Commodity',
    datetime: new Date().toISOString().split('T')[0],
    timestamp: Math.floor(Date.now() / 1000),
    last_quote_at: Math.floor(Date.now() / 1000),
    open: 24.55,
    high: 24.75,
    low: 24.45,
    close: 24.65,
    bid: 24.64,
    ask: 24.66,
    volume: 500000,
    previous_close: 24.50,
    change: 0.15,
    percent_change: 0.612,
    is_market_open: true,
    fifty_two_week: {
      low: 20.70,
      high: 26.15,
      low_change: 3.95,
      high_change: -1.50,
      low_change_percent: 19.08,
      high_change_percent: -5.74,
      range: '20.70 - 26.15'
    }
  }
};

// Store connected WebSocket clients
const clients = new Set();

// Function to generate realistic price movements
function generatePriceMovement(currentPrice, volatility = 0.001) {
  // Generate random movement between -volatility and +volatility
  const movement = (Math.random() - 0.5) * 2 * volatility * currentPrice;
  return currentPrice + movement;
}

// Function to update forex data with realistic changes
function updateForexData() {
  const symbols = Object.keys(forexData);
  const updatedData = {};
  
  symbols.forEach(symbol => {
    const current = forexData[symbol];
    const previous_close = current.close;
    
    // Generate new price with some volatility
    const volatility = symbol.includes('JPY') ? 0.002 : 0.0008; // JPY pairs are more volatile
    const newPrice = generatePriceMovement(current.close, volatility);
    
    // Calculate changes
    const change = newPrice - previous_close;
    const percent_change = (change / previous_close) * 100;
    
    // Update high and low if necessary
    const newHigh = Math.max(current.high, newPrice);
    const newLow = Math.min(current.low, newPrice);

    // Update bid, ask, and volume with realistic fluctuations
    const spread = symbol.includes('JPY') ? 0.02 : 0.0004;
    const newBid = newPrice - spread / 2;
    const newAsk = newPrice + spread / 2;
    const newVolume = current.volume + Math.floor(Math.random() * 5000 - 2000);

    // Dynamically update fifty_two_week data
    const fiftyTwoWeek = { ...current.fifty_two_week };
    if (newPrice > fiftyTwoWeek.high) {
      fiftyTwoWeek.high = newPrice;
    }
    if (newPrice < fiftyTwoWeek.low) {
      fiftyTwoWeek.low = newPrice;
    }
    fiftyTwoWeek.low_change = newPrice - fiftyTwoWeek.low;
    fiftyTwoWeek.high_change = newPrice - fiftyTwoWeek.high;
    fiftyTwoWeek.low_change_percent = (fiftyTwoWeek.low_change / fiftyTwoWeek.low) * 100;
    fiftyTwoWeek.high_change_percent = (fiftyTwoWeek.high_change / fiftyTwoWeek.high) * 100;
    fiftyTwoWeek.range = `${fiftyTwoWeek.low.toFixed(6)} - ${fiftyTwoWeek.high.toFixed(6)}`;
    
    updatedData[symbol] = {
      ...current,
      close: parseFloat(newPrice.toFixed(symbol.includes('JPY') ? 3 : 5)),
      previous_close: previous_close,
      change: parseFloat(change.toFixed(symbol.includes('JPY') ? 3 : 6)),
      percent_change: parseFloat(percent_change.toFixed(4)),
      high: parseFloat(newHigh.toFixed(symbol.includes('JPY') ? 3 : 5)),
      low: parseFloat(newLow.toFixed(symbol.includes('JPY') ? 3 : 5)),
      bid: parseFloat(newBid.toFixed(symbol.includes('JPY') ? 3 : 5)),
      ask: parseFloat(newAsk.toFixed(symbol.includes('JPY') ? 3 : 5)),
      volume: newVolume,
      fifty_two_week: fiftyTwoWeek,
      last_quote_at: Math.floor(Date.now() / 1000),
      timestamp: Math.floor(Date.now() / 1000)
    };
  });
  
  forexData = updatedData;
  
  // Broadcast to all WebSocket clients
  broadcastUpdate();
}

// Broadcast updates to all connected WebSocket clients
function broadcastUpdate() {
  const message = JSON.stringify({
    type: 'forex_update',
    data: forexData,
    timestamp: new Date().toISOString()
  });
  
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
  
  console.log(`📊 Broadcast update to ${clients.size} clients at ${new Date().toLocaleTimeString()}`);
}

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('🔌 New WebSocket client connected');
  clients.add(ws);
  
  // Send current data immediately
  ws.send(JSON.stringify({
    type: 'initial_data',
    data: forexData,
    timestamp: new Date().toISOString()
  }));
  
  ws.on('close', () => {
    console.log('🔌 WebSocket client disconnected');
    clients.delete(ws);
  });
  
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    clients.delete(ws);
  });
});

// API Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    connected_clients: clients.size,
    data_points: Object.keys(forexData).length
  });
});

// Get all forex quotes
app.get('/quote', (req, res) => {
  const { symbol } = req.query;
  
  if (!symbol) {
    return res.json(forexData);
  }
  
  // Handle multiple symbols
  const symbols = symbol.split(',').map(s => s.trim().toUpperCase());
  
  if (symbols.length === 1) {
    const singleSymbol = symbols[0];
    if (forexData[singleSymbol]) {
      res.json(forexData[singleSymbol]);
    } else {
      res.status(404).json({ error: `Symbol ${singleSymbol} not found` });
    }
  } else {
    // Multiple symbols
    const result = {};
    symbols.forEach(sym => {
      if (forexData[sym]) {
        result[sym] = forexData[sym];
      }
    });
    res.json(result);
  }
});

// Get exchange rate
app.get('/exchange_rate', (req, res) => {
  const { from, to } = req.query;
  
  if (!from || !to) {
    return res.status(400).json({ error: 'Missing from or to parameter' });
  }
  
  const symbol = `${from}/${to}`;
  const reverseSymbol = `${to}/${from}`;
  
  if (forexData[symbol]) {
    res.json({
      symbol: symbol,
      rate: forexData[symbol].close,
      timestamp: forexData[symbol].timestamp
    });
  } else if (forexData[reverseSymbol]) {
    // Calculate inverse rate
    const inverseRate = 1 / forexData[reverseSymbol].close;
    res.json({
      symbol: symbol,
      rate: parseFloat(inverseRate.toFixed(6)),
      timestamp: forexData[reverseSymbol].timestamp
    });
  } else {
    res.status(404).json({ error: `Exchange rate for ${from}/${to} not available` });
  }
});

// Get currency conversion
app.get('/currency_conversion', (req, res) => {
  const { from, to, amount } = req.query;
  
  if (!from || !to || !amount) {
    return res.status(400).json({ error: 'Missing from, to, or amount parameter' });
  }
  
  const symbol = `${from}/${to}`;
  const reverseSymbol = `${to}/${from}`;
  const inputAmount = parseFloat(amount);
  
  if (forexData[symbol]) {
    const convertedAmount = inputAmount * forexData[symbol].close;
    res.json({
      symbol: symbol,
      rate: forexData[symbol].close,
      amount: inputAmount,
      result: parseFloat(convertedAmount.toFixed(2)),
      timestamp: forexData[symbol].timestamp
    });
  } else if (forexData[reverseSymbol]) {
    const rate = 1 / forexData[reverseSymbol].close;
    const convertedAmount = inputAmount * rate;
    res.json({
      symbol: symbol,
      rate: parseFloat(rate.toFixed(6)),
      amount: inputAmount,
      result: parseFloat(convertedAmount.toFixed(2)),
      timestamp: forexData[reverseSymbol].timestamp
    });
  } else {
    res.status(404).json({ error: `Conversion rate for ${from}/${to} not available` });
  }
});

// Get market status
app.get('/market_state', (req, res) => {
  res.json({
    name: 'Forex Market',
    code: 'FOREX',
    country: 'Global',
    is_market_open: true,
    time_after_open: '09:30:00',
    time_to_open: '00:00:00',
    time_to_close: '14:30:00',
    timezone: 'UTC'
  });
});

// Get forex pairs list
app.get('/forex_pairs', (req, res) => {
  const pairs = Object.keys(forexData).map(symbol => ({
    symbol: symbol,
    currency_group: 'Major',
    currency_base: symbol.split('/')[0],
    currency_quote: symbol.split('/')[1]
  }));
  
  res.json({
    data: pairs,
    status: 'ok'
  });
});

// Manual trigger for price updates (for testing)
app.post('/trigger_update', (req, res) => {
  updateForexData();
  res.json({ 
    message: 'Price update triggered', 
    timestamp: new Date().toISOString(),
    connected_clients: clients.size 
  });
});

// Get specific symbol data
app.get('/symbol/:symbol', (req, res) => {
  const symbol = req.params.symbol.toUpperCase();
  
  if (forexData[symbol]) {
    res.json(forexData[symbol]);
  } else {
    res.status(404).json({ error: `Symbol ${symbol} not found` });
  }
});

// Start the price update interval (every 1 second for real-time updates)
setInterval(updateForexData, 1000);

// Start server
const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log('\n🚀 Dummy Forex API Server Started!');
  console.log('=' .repeat(50));
  console.log(`📡 HTTP Server: http://localhost:${PORT}`);
  console.log(`🔌 WebSocket Server: ws://localhost:${PORT}`);
  console.log('\n📊 Available Endpoints:');
  console.log(`  GET  /health - Server health check`);
  console.log(`  GET  /quote?symbol=EUR/USD - Get forex quotes`);
  console.log(`  GET  /exchange_rate?from=EUR&to=USD - Get exchange rate`);
  console.log(`  GET  /currency_conversion?from=USD&to=EUR&amount=100 - Convert currency`);
  console.log(`  GET  /market_state - Get market status`);
  console.log(`  GET  /forex_pairs - Get available pairs`);
  console.log(`  POST /trigger_update - Manually trigger price update`);
  console.log(`  GET  /symbol/:symbol - Get specific symbol data`);
  console.log('\n🔄 Real-time updates every 1 second');
  console.log(`📈 Tracking ${Object.keys(forexData).length} currency pairs`);
  console.log('=' .repeat(50));
});

module.exports = { app, server, wss };
