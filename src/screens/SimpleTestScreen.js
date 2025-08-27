import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { colors } from '../constants/colors';

const SimpleTestScreen = () => {
  const [logs, setLogs] = useState([]);

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev.slice(-20), `${timestamp}: ${message}`]); // Keep last 20 logs
  };

  useEffect(() => {
    // Override console.log to capture logs
    const originalLog = console.log;
    console.log = (...args) => {
      originalLog(...args);
      addLog(args.join(' '));
    };

    // Start the test
    addLog('🚀 Starting WebSocket connection test...');
    
    // Test WebSocket directly
    try {
      const ws = new WebSocket('ws://localhost:3001');
      
      ws.onopen = () => {
        addLog('✅ WebSocket connected successfully');
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          addLog(`📨 Received: ${data.type} with ${Object.keys(data.data || {}).length} pairs`);
        } catch (e) {
          addLog('❌ Failed to parse message');
        }
      };
      
      ws.onerror = (error) => {
        addLog('❌ WebSocket error: ' + error.message);
      };
      
      ws.onclose = () => {
        addLog('🔌 WebSocket closed');
      };
      
      // Cleanup
      return () => {
        ws.close();
        console.log = originalLog;
      };
      
    } catch (error) {
      addLog('❌ WebSocket creation failed: ' + error.message);
    }
  }, []);

  const clearLogs = () => {
    setLogs([]);
  };

  const testHttpEndpoint = async () => {
    try {
      addLog('🌐 Testing HTTP endpoint...');
      const response = await fetch('http://localhost:3001/health');
      const data = await response.json();
      addLog(`✅ HTTP Response: ${JSON.stringify(data)}`);
    } catch (error) {
      addLog('❌ HTTP Error: ' + error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>WebSocket Test</Text>
        <Text style={styles.subtitle}>Direct connection test</Text>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.button} onPress={testHttpEndpoint}>
          <Text style={styles.buttonText}>Test HTTP</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={clearLogs}>
          <Text style={styles.buttonText}>Clear Logs</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.logContainer}>
        <Text style={styles.logTitle}>Console Logs:</Text>
        {logs.map((log, index) => (
          <Text key={index} style={styles.logText}>{log}</Text>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 4,
  },
  controls: {
    flexDirection: 'row',
    padding: 20,
    gap: 10,
  },
  button: {
    flex: 1,
    backgroundColor: colors.accent.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.text.primary,
    fontWeight: '600',
  },
  logContainer: {
    flex: 1,
    padding: 20,
  },
  logTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 10,
  },
  logText: {
    fontSize: 12,
    color: colors.text.secondary,
    fontFamily: 'monospace',
    marginBottom: 2,
    paddingVertical: 2,
  },
});

export default SimpleTestScreen;
