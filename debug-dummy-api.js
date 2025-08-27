// Simple Node.js test to verify dummy API integration
const WebSocket = require('ws');

console.log('🔍 Testing Dummy API Connection...\n');

// Test 1: HTTP endpoint
console.log('📡 Testing HTTP endpoint...');
fetch('http://localhost:3001/health')
  .then(response => response.json())
  .then(data => {
    console.log('✅ HTTP Response:', data);
    console.log('👥 Connected clients:', data.connected_clients);
    console.log('📊 Data points:', data.data_points);
  })
  .catch(error => {
    console.error('❌ HTTP Error:', error.message);
  });

// Test 2: WebSocket connection
console.log('\n🔌 Testing WebSocket connection...');
const ws = new WebSocket('ws://localhost:3001');

let updateCount = 0;

ws.on('open', function open() {
  console.log('✅ WebSocket connected successfully');
});

ws.on('message', function message(data) {
  try {
    const parsed = JSON.parse(data);
    updateCount++;
    
    console.log(`📊 Update #${updateCount} - Type: ${parsed.type}`);
    
    if (parsed.type === 'forex_update' && parsed.data) {
      const symbols = Object.keys(parsed.data);
      console.log(`💱 Updated ${symbols.length} pairs:`);
      
      symbols.slice(0, 3).forEach(symbol => {
        const data = parsed.data[symbol];
        const changeEmoji = data.change >= 0 ? '📈' : '📉';
        console.log(`   ${changeEmoji} ${symbol}: ${data.close} (${data.change >= 0 ? '+' : ''}${data.change.toFixed(4)})`);
      });
    }
    
    console.log('---');
  } catch (error) {
    console.error('❌ Parse error:', error.message);
  }
});

ws.on('error', function error(err) {
  console.error('❌ WebSocket error:', err.message);
});

ws.on('close', function close() {
  console.log('🔌 WebSocket connection closed');
  process.exit(0);
});

// Auto-close after 15 seconds
setTimeout(() => {
  console.log('\n⏰ Test complete! Closing connection...');
  ws.close();
}, 15000);

console.log('⏳ Waiting for updates... (15 seconds)\n');
