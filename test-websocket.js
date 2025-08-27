const WebSocket = require('ws');

console.log('🔌 Testing WebSocket connection to dummy API...\n');

const ws = new WebSocket('ws://localhost:3001');

ws.on('open', function open() {
  console.log('✅ Connected to WebSocket server');
  console.log('📡 Waiting for real-time updates...\n');
});

ws.on('message', function message(data) {
  try {
    const parsed = JSON.parse(data);
    console.log('📊 Received update:', parsed.type);
    console.log('🕐 Timestamp:', parsed.timestamp);
    
    if (parsed.type === 'forex_update' && parsed.data) {
      console.log('💱 Updated pairs:');
      Object.entries(parsed.data).forEach(([symbol, data]) => {
        const changeColor = data.change >= 0 ? '🟢' : '🔴';
        console.log(`   ${changeColor} ${symbol}: ${data.close} (${data.change >= 0 ? '+' : ''}${data.change.toFixed(5)})`);
      });
    }
    console.log('-'.repeat(50));
  } catch (error) {
    console.log('❌ Error parsing message:', error.message);
    console.log('Raw data:', data.toString());
  }
});

ws.on('error', function error(err) {
  console.error('❌ WebSocket error:', err.message);
});

ws.on('close', function close() {
  console.log('🔌 WebSocket connection closed');
});

// Keep the script running
console.log('Press Ctrl+C to stop...\n');
