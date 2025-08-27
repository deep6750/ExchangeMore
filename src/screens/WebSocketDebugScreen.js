import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { API_CONFIG } from '../config/apiConfig';
import internalMockDataService from '../services/internalMockDataService';

const WebSocketDebugScreen = () => {
  const [logs, setLogs] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const wsRef = useRef(null);
  const scrollViewRef = useRef(null);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = {
      id: Date.now(),
      timestamp,
      message,
      type,
    };
    setLogs(prev => [logEntry, ...prev].slice(0, 100)); // Keep last 100 logs
  };

  const connectWebSocket = () => {
    try {
      const wsUrl = API_CONFIG.DUMMY_API_WS_URL;
      addLog(`🔌 Connecting to: ${wsUrl}`, 'info');
      setConnectionAttempts(prev => prev + 1);

      if (wsRef.current) {
        wsRef.current.close();
      }

      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        setIsConnected(true);
        addLog('✅ WebSocket connected successfully!', 'success');
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastMessage(data);
          addLog(`📨 Received: ${data.type} - ${JSON.stringify(data).substring(0, 100)}...`, 'message');
          
          if (data.type === 'forex_update') {
            const pairCount = data.data?.pairs?.length || 0;
            addLog(`💱 Forex update: ${pairCount} pairs`, 'data');
          }
        } catch (error) {
          addLog(`⚠️ Message parse error: ${error.message}`, 'error');
          addLog(`Raw: ${event.data.substring(0, 200)}...`, 'error');
        }
      };

      wsRef.current.onerror = (error) => {
        addLog(`❌ WebSocket error: ${error.message || 'Connection failed'}`, 'error');
        setIsConnected(false);
      };

      wsRef.current.onclose = (event) => {
        setIsConnected(false);
        addLog(`🔌 WebSocket closed: Code ${event.code} - ${event.reason || 'Unknown reason'}`, 'warning');
      };

    } catch (error) {
      addLog(`💥 Connection setup error: ${error.message}`, 'error');
    }
  };

  const testInternalMock = () => {
    try {
      addLog(`🧪 Testing Internal Mock Service`, 'info');
      addLog(`📋 USE_INTERNAL_MOCK: ${API_CONFIG.USE_INTERNAL_MOCK}`, 'info');
      
      // Set up event listeners
      internalMockDataService.on('pair_updated', (data) => {
        addLog(`📈 Mock pair update: ${data.symbol} = ${data.price}`, 'data');
      });
      
      internalMockDataService.on('service_started', () => {
        addLog(`✅ Mock service started`, 'success');
      });
      
      // Start the service
      const testPairs = [
        { symbol: 'EUR/USD' },
        { symbol: 'GBP/USD' },
        { symbol: 'USD/JPY' }
      ];
      
      internalMockDataService.start(testPairs);
      
      // Stop after 10 seconds
      setTimeout(() => {
        internalMockDataService.stop();
        addLog(`🛑 Mock service stopped`, 'info');
      }, 10000);
      
    } catch (error) {
      addLog(`❌ Internal Mock Test failed: ${error.message}`, 'error');
    }
  };

  const testHTTP = async () => {
    try {
      const httpUrl = API_CONFIG.DUMMY_API_URL;
      addLog(`🌐 Testing HTTP: ${httpUrl}/health`, 'info');
      
      const response = await fetch(`${httpUrl}/health`);
      const data = await response.json();
      
      addLog(`✅ HTTP Health: ${JSON.stringify(data)}`, 'success');
      
      // Test quotes endpoint
      const quotesResponse = await fetch(`${httpUrl}/quote`);
      const quotesData = await quotesResponse.json();
      const pairCount = Object.keys(quotesData).length;
      
      addLog(`📊 HTTP Quotes: ${pairCount} pairs available`, 'success');
      
    } catch (error) {
      addLog(`❌ HTTP Test failed: ${error.message}`, 'error');
    }
  };

  const disconnect = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
    addLog('🔌 Manually disconnected', 'info');
  };

  const clearLogs = () => {
    setLogs([]);
    setLastMessage(null);
    addLog('🧹 Logs cleared', 'info');
  };

  useEffect(() => {
    addLog('🚀 WebSocket Debug Screen loaded', 'info');
    addLog(`📋 Config: ${API_CONFIG.DUMMY_API_WS_URL}`, 'info');
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const getLogColor = (type) => {
    switch (type) {
      case 'success': return '#4CAF50';
      case 'error': return '#F44336';
      case 'warning': return '#FF9800';
      case 'message': return '#2196F3';
      case 'data': return '#9C27B0';
      default: return '#666';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>WebSocket Debug</Text>
        <View style={[styles.status, { backgroundColor: isConnected ? '#4CAF50' : '#F44336' }]}>
          <Text style={styles.statusText}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </Text>
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.button} onPress={testInternalMock}>
          <Text style={styles.buttonText}>Test Mock</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={testHTTP}>
          <Text style={styles.buttonText}>Test HTTP</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={connectWebSocket}>
          <Text style={styles.buttonText}>Connect WS</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={clearLogs}>
          <Text style={styles.buttonText}>Clear</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.stats}>
        <Text style={styles.statText}>Attempts: {connectionAttempts}</Text>
        <Text style={styles.statText}>Logs: {logs.length}</Text>
        {lastMessage && (
          <Text style={styles.statText}>Last: {lastMessage.type}</Text>
        )}
      </View>

      <ScrollView 
        ref={scrollViewRef}
        style={styles.logContainer}
        contentContainerStyle={styles.logContent}
      >
        {logs.map((log) => (
          <View key={log.id} style={styles.logEntry}>
            <Text style={[styles.timestamp, { color: getLogColor(log.type) }]}>
              {log.timestamp}
            </Text>
            <Text style={[styles.logMessage, { color: getLogColor(log.type) }]}>
              {log.message}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  status: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#333',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 70,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
    paddingVertical: 8,
    backgroundColor: '#111',
    borderRadius: 6,
  },
  statText: {
    color: '#aaa',
    fontSize: 12,
  },
  logContainer: {
    flex: 1,
    backgroundColor: '#111',
    borderRadius: 6,
  },
  logContent: {
    padding: 10,
  },
  logEntry: {
    marginBottom: 4,
    paddingVertical: 2,
  },
  timestamp: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  logMessage: {
    fontSize: 12,
    marginTop: 2,
  },
});

export default WebSocketDebugScreen;
