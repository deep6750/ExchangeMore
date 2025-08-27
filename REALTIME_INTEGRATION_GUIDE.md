# 🚀 Real-Time Integration Guide

## Overview
This guide explains how to use the integrated dummy API system with your GroverForex React Native app for development and testing of real-time features with enhanced animations.

## 🎯 What's Included

### ✅ **Complete Real-Time System:**
- **Local Dummy API Server** with WebSocket support
- **React Native WebSocket Client** for real-time connections
- **Enhanced Animations** that trigger on value changes
- **Portfolio Simulation** based on market movements
- **Integration Test Components** for verification

### ✅ **Key Features:**
- Real-time price updates every 3 seconds
- WebSocket connections with auto-reconnect
- Flash animations for value changes
- Glow effects and color transitions
- Portfolio value notifications
- Manual testing controls

## 🚀 Quick Start

### **Option 1: One-Command Setup (Recommended)**
```bash
npm run dev
```
This script automatically:
- Starts the dummy API server on port 3001
- Checks for dependencies
- Launches the React Native app
- Handles cleanup on exit

### **Option 2: Manual Setup**
```bash
# Terminal 1: Start dummy API server
npm run start-dummy-api

# Terminal 2: Start React Native app
npm start
```

### **Option 3: Individual Commands**
```bash
# Start dummy API server
cd server && npm start

# Test API health
curl http://localhost:3001/health

# Start React Native app
npm start
```

## 📊 API Endpoints

### **Dummy API Server (localhost:3001)**

#### **Real-Time Data**
- `GET /quote` - Get all forex quotes
- `GET /quote?symbol=EUR/USD` - Get specific pair
- `GET /quote?symbol=EUR/USD,GBP/USD` - Get multiple pairs

#### **Utility Endpoints**
- `GET /health` - Server health check
- `POST /trigger_update` - Manually trigger price update
- `GET /exchange_rate?from=EUR&to=USD` - Get exchange rate
- `GET /market_state` - Get market status

#### **WebSocket Connection**
- `ws://localhost:3001` - Real-time price updates

## 🎮 Testing the Integration

### **1. Use the Integration Test Component**
Add this to your navigation or replace a screen temporarily:
```javascript
import RealTimeIntegrationTest from './src/components/RealTimeIntegrationTest';

// In your navigation or screen
<RealTimeIntegrationTest />
```

### **2. Monitor Real-Time Updates**
Watch for:
- ✅ Connection status indicators
- ✅ Price flash animations every 3 seconds
- ✅ Portfolio value changes
- ✅ Notification popups for major changes
- ✅ Color-coded value changes (green/red)

### **3. Manual Testing Controls**
Use the test buttons to:
- **Trigger Update**: Force immediate price changes
- **Check Health**: Verify API server status
- **Restart**: Reconnect WebSocket connection

## 🔧 Configuration

### **Switch Between APIs**
In `src/config/apiConfig.js`:
```javascript
export const API_CONFIG = {
  // Set to true for dummy API, false for Twelve Data API
  USE_DUMMY_API: true,
  
  // Dummy API URLs
  DUMMY_API_URL: 'http://localhost:3001',
  DUMMY_API_WS_URL: 'ws://localhost:3001',
  
  // Original Twelve Data API
  TWELVE_DATA_API_KEY: 'your-key-here',
  DEMO_MODE: false,
};
```

### **Animation Settings**
In your components, you can customize:
```javascript
const {
  dataArray: forexData,
  priceChanges,
  isConnected
} = useRealTimeForex(MAJOR_PAIRS, {
  autoStart: true,
  updateInterval: 3000, // Match server update rate
  enableAnimations: true, // Enable flash effects
  onError: (error) => console.error(error)
});
```

## 💡 How It Works

### **1. Data Flow**
```
Dummy API Server (Node.js)
    ↓ (WebSocket)
DummyApiService (React Native)
    ↓ (Events)
RealTimeDataService
    ↓ (React Hook)
useRealTimeForex
    ↓ (Props)
UI Components (CurrencyPairCard, PortfolioSummary)
    ↓ (Animations)
Enhanced Visual Effects
```

### **2. Animation Triggers**
- **Price Changes**: Flash effects, color changes, glow
- **Portfolio Updates**: Value highlighting, notifications
- **Connection Events**: Status indicators, reconnection

### **3. WebSocket Events**
```javascript
// Server → Client Events
'initial_data'    // First data load
'forex_update'    // Real-time price updates
'connected'       // Connection established
'disconnected'    // Connection lost

// Client → Server Events
'connection'      // Client connects
'close'           // Client disconnects
```

## 🛠️ Development Commands

### **API Server Management**
```bash
npm run start-dummy-api    # Start API server
npm run stop-dummy-api     # Stop API server
npm run test-dummy-api     # Test API health
```

### **API Testing**
```bash
# Test quote endpoint
curl http://localhost:3001/quote

# Test specific pair
curl "http://localhost:3001/quote?symbol=EUR/USD"

# Trigger manual update
curl -X POST http://localhost:3001/trigger_update

# Check server health
curl http://localhost:3001/health
```

### **Real-Time Monitoring**
```bash
# Watch WebSocket connections (in browser console)
const ws = new WebSocket('ws://localhost:3001');
ws.onmessage = (event) => console.log(JSON.parse(event.data));
```

## 📱 Integration in Your App

### **1. Add to Existing Screens**
Replace the real-time hook in `DashboardScreen.js`:
```javascript
// The app is already configured to use dummy API
// Just ensure USE_DUMMY_API: true in apiConfig.js
```

### **2. Custom Implementation**
```javascript
import { useRealTimeForex } from '../hooks/useRealTimeForex';
import CurrencyPairCard from '../components/CurrencyPairCard';

const MyScreen = () => {
  const { dataArray, priceChanges, isConnected } = useRealTimeForex([
    { symbol: 'EUR/USD', name: 'Euro / US Dollar' }
  ]);

  return (
    <View>
      {dataArray.map(pair => (
        <CurrencyPairCard
          key={pair.symbol}
          {...pair}
          priceChange={priceChanges[pair.symbol]}
          isConnected={isConnected}
        />
      ))}
    </View>
  );
};
```

### **3. Test Component Integration**
```javascript
// Add to your navigation
import RealTimeIntegrationTest from './src/components/RealTimeIntegrationTest';

// In your navigator
<Stack.Screen 
  name="IntegrationTest" 
  component={RealTimeIntegrationTest}
  options={{ title: 'Real-Time Test' }}
/>
```

## 🎨 Animation Features

### **Value Change Animations**
- **Flash Effects**: Background color flash on value changes
- **Glow Effects**: Dynamic shadows and highlights
- **Scale Animations**: Subtle size changes for emphasis
- **Color Transitions**: Smooth color changes (green/red)

### **Portfolio Animations**
- **Value Highlighting**: Flash effects for portfolio changes
- **Notifications**: Slide-in notifications for major changes
- **Progress Indicators**: Visual change magnitude bars

### **Connection Indicators**
- **Status Dots**: Real-time connection status
- **Loading States**: Smooth transitions during connection
- **Error Animations**: Shake effects for errors

## 🔍 Troubleshooting

### **Common Issues**

#### **"Connection Failed"**
```bash
# Check if API server is running
npm run test-dummy-api

# If not running, start it
npm run start-dummy-api
```

#### **"No Real-Time Updates"**
1. Verify `USE_DUMMY_API: true` in `apiConfig.js`
2. Check WebSocket connection in browser console
3. Restart the app and server

#### **"Port 3001 in Use"**
```bash
# Kill existing process
npm run stop-dummy-api

# Or find and kill manually
lsof -ti:3001 | xargs kill
```

#### **"WebSocket Connection Error"**
1. Check if running on physical device vs simulator
2. For physical device, use your computer's IP instead of localhost
3. Update `DUMMY_API_WS_URL` in `apiConfig.js`

### **Debug Mode**
Enable detailed logging by adding to your app:
```javascript
// In App.js or main component
console.log('Real-time service status:', useRealTimeForex().getStatus());
```

## 📈 Performance Notes

### **Optimizations**
- WebSocket connections are automatically managed
- Animations use native driver for 60fps performance
- Price updates are debounced to prevent flooding
- Memory leaks are prevented with proper cleanup

### **Resource Usage**
- **API Server**: ~50MB RAM, minimal CPU
- **WebSocket**: ~1KB/s data transfer
- **Animations**: Hardware accelerated
- **Battery Impact**: Minimal due to efficient WebSocket usage

## 🎉 Next Steps

### **Production Deployment**
1. Switch `USE_DUMMY_API: false`
2. Configure real Twelve Data API key
3. Remove test components
4. Optimize update intervals for production

### **Enhanced Features**
- Add haptic feedback for value changes
- Implement sound notifications
- Create custom animation presets
- Add user preference controls

---

## 📞 Quick Commands Reference

```bash
# Complete setup
npm run dev

# API commands
npm run start-dummy-api
npm run test-dummy-api
npm run stop-dummy-api

# Test API endpoints
curl http://localhost:3001/health
curl -X POST http://localhost:3001/trigger_update

# React Native
npm start
npm run android
npm run ios
```

**🎊 Your real-time forex app with enhanced animations is now ready for development and testing!**
