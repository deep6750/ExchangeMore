import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { API_CONFIG } from '../config/apiConfig';
import internalMockDataService from '../services/internalMockDataService';

const SimpleDebugTestScreen = () => {
  const [logs, setLogs] = useState([]);
  
  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `${timestamp}: ${message}`;
    setLogs(prev => [logEntry, ...prev].slice(0, 20)); // Keep last 20 logs
  };

  const testInternalMock = () => {
    try {
      addLog('🧪 Testing Internal Mock Service');
      addLog(`📋 USE_INTERNAL_MOCK: ${API_CONFIG.USE_INTERNAL_MOCK}`);
      addLog(`📋 USE_DUMMY_API: ${API_CONFIG.USE_DUMMY_API}`);
      
      // Set up event listeners
      internalMockDataService.on('pair_updated', (data) => {
        addLog(`📈 Mock pair update: ${data.symbol} = ${data.price}`);
      });
      
      internalMockDataService.on('service_started', () => {
        addLog(`✅ Mock service started`);
      });
      
      internalMockDataService.on('service_stopped', () => {
        addLog(`🛑 Mock service stopped`);
      });
      
      // Start the service
      const testPairs = [
        { symbol: 'EUR/USD' },
        { symbol: 'GBP/USD' },
        { symbol: 'USD/JPY' }
      ];
      
      addLog('🚀 Starting internal mock service...');
      internalMockDataService.start(testPairs);
      
      // Stop after 10 seconds
      setTimeout(() => {
        internalMockDataService.stop();
      }, 10000);
      
    } catch (error) {
      addLog(`❌ Internal Mock Test failed: ${error.message}`);
      console.error('Internal Mock Test Error:', error);
    }
  };

  const clearLogs = () => {
    setLogs([]);
    addLog('🧹 Logs cleared');
  };

  useEffect(() => {
    addLog('🚀 Simple Debug Test Screen loaded');
    addLog(`📱 Running in React Native: ${typeof navigator !== 'undefined' ? 'Yes' : 'No'}`);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Internal Mock Service Test</Text>
      
      <View style={styles.controls}>
        <TouchableOpacity style={styles.button} onPress={testInternalMock}>
          <Text style={styles.buttonText}>Start Test</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={clearLogs}>
          <Text style={styles.buttonText}>Clear Logs</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.info}>
        <Text style={styles.infoText}>Config:</Text>
        <Text style={styles.infoText}>USE_INTERNAL_MOCK: {String(API_CONFIG.USE_INTERNAL_MOCK)}</Text>
        <Text style={styles.infoText}>USE_DUMMY_API: {String(API_CONFIG.USE_DUMMY_API)}</Text>
      </View>

      <ScrollView style={styles.logContainer}>
        {logs.map((log, index) => (
          <Text key={index} style={styles.logText}>
            {log}
          </Text>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#333',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  info: {
    backgroundColor: '#111',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  infoText: {
    color: '#aaa',
    fontSize: 12,
    marginBottom: 4,
  },
  logContainer: {
    flex: 1,
    backgroundColor: '#111',
    borderRadius: 8,
    padding: 10,
  },
  logText: {
    color: '#fff',
    fontSize: 12,
    marginBottom: 4,
    fontFamily: 'monospace',
  },
});

export default SimpleDebugTestScreen;
