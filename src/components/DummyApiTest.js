import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';

import { colors } from '../constants/colors';
import dummyApiService from '../services/dummyApiService';

const DummyApiTest = () => {
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const [latestData, setLatestData] = useState({});
  const [updateCount, setUpdateCount] = useState(0);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    // Set up event listeners
    const handleConnected = () => {
      console.log('✅ DummyApiTest: Connected to WebSocket');
      setConnectionStatus('Connected');
    };

    const handleDisconnected = () => {
      console.log('🔌 DummyApiTest: Disconnected from WebSocket');
      setConnectionStatus('Disconnected');
    };

    const handlePairUpdate = (updateData) => {
      console.log('📊 DummyApiTest: Received pair update:', updateData.symbol);
      setLatestData(prev => ({
        ...prev,
        [updateData.symbol]: updateData.data
      }));
      setUpdateCount(prev => prev + 1);
      setLastUpdate(new Date());
    };

    const handleError = (error) => {
      console.error('❌ DummyApiTest: WebSocket error:', error);
      setConnectionStatus('Error');
    };

    // Subscribe to events
    dummyApiService.on('connected', handleConnected);
    dummyApiService.on('disconnected', handleDisconnected);
    dummyApiService.on('pair_updated', handlePairUpdate);
    dummyApiService.on('error', handleError);

    // Start the service
    console.log('🚀 DummyApiTest: Starting dummy API service...');
    dummyApiService.start([
      { symbol: 'EUR/USD', name: 'Euro / US Dollar' },
      { symbol: 'GBP/USD', name: 'British Pound / US Dollar' },
      { symbol: 'USD/JPY', name: 'US Dollar / Japanese Yen' }
    ]);

    return () => {
      // Clean up event listeners
      dummyApiService.off('connected', handleConnected);
      dummyApiService.off('disconnected', handleDisconnected);
      dummyApiService.off('pair_updated', handlePairUpdate);
      dummyApiService.off('error', handleError);
      
      // Stop the service
      dummyApiService.stop();
    };
  }, []);

  const testApiHealth = async () => {
    try {
      const result = await dummyApiService.checkHealth();
      if (result.success) {
        Alert.alert('API Health', 
          `Status: ${result.data.status}\n` +
          `Connected Clients: ${result.data.connected_clients}\n` +
          `Data Points: ${result.data.data_points}`
        );
      } else {
        Alert.alert('API Error', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to check API health');
    }
  };

  const triggerUpdate = async () => {
    try {
      const result = await dummyApiService.triggerUpdate();
      if (result.success) {
        Alert.alert('Success', 'Manual update triggered!');
      } else {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to trigger update');
    }
  };

  const reconnect = () => {
    setConnectionStatus('Connecting...');
    dummyApiService.stop();
    setTimeout(() => {
      dummyApiService.start([
        { symbol: 'EUR/USD', name: 'Euro / US Dollar' },
        { symbol: 'GBP/USD', name: 'British Pound / US Dollar' },
        { symbol: 'USD/JPY', name: 'US Dollar / Japanese Yen' }
      ]);
    }, 1000);
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'Connected': return colors.chart.bullish;
      case 'Connecting...': return colors.accent.warning;
      case 'Error': return colors.chart.bearish;
      default: return colors.text.tertiary;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dummy API Test</Text>
        <Text style={styles.subtitle}>Real-time WebSocket connection test</Text>
      </View>

      {/* Connection Status */}
      <View style={styles.statusContainer}>
        <LinearGradient
          colors={colors.gradient.card}
          style={styles.statusGradient}
        >
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Status:</Text>
            <View style={styles.statusValue}>
              <View style={[
                styles.statusDot,
                { backgroundColor: getStatusColor() }
              ]} />
              <Text style={[styles.statusText, { color: getStatusColor() }]}>
                {connectionStatus}
              </Text>
            </View>
          </View>

          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Updates Received:</Text>
            <Text style={styles.statusText}>{updateCount}</Text>
          </View>

          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Last Update:</Text>
            <Text style={styles.statusText}>
              {lastUpdate ? lastUpdate.toLocaleTimeString() : 'None'}
            </Text>
          </View>
        </LinearGradient>
      </View>

      {/* Control Buttons */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity style={styles.controlButton} onPress={testApiHealth}>
          <LinearGradient
            colors={colors.gradient.primary}
            style={styles.controlButtonGradient}
          >
            <Icon name="heart" size={16} color={colors.text.primary} />
            <Text style={styles.controlButtonText}>Health Check</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton} onPress={triggerUpdate}>
          <LinearGradient
            colors={colors.gradient.success}
            style={styles.controlButtonGradient}
          >
            <Icon name="zap" size={16} color={colors.text.primary} />
            <Text style={styles.controlButtonText}>Trigger Update</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton} onPress={reconnect}>
          <View style={styles.controlButtonSecondary}>
            <Icon name="refresh-cw" size={16} color={colors.accent.primary} />
            <Text style={styles.controlButtonSecondaryText}>Reconnect</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Live Data */}
      <View style={styles.dataContainer}>
        <Text style={styles.dataTitle}>Live Data</Text>
        {Object.keys(latestData).length === 0 ? (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>No data received yet...</Text>
            <Text style={styles.noDataSubtext}>
              {connectionStatus === 'Connected' 
                ? 'Waiting for updates...' 
                : 'Please check connection'}
            </Text>
          </View>
        ) : (
          Object.entries(latestData).map(([symbol, data]) => (
            <View key={symbol} style={styles.dataItem}>
              <View style={styles.dataHeader}>
                <Text style={styles.dataSymbol}>{symbol}</Text>
                <Text style={[
                  styles.dataPrice,
                  { color: data.change >= 0 ? colors.chart.bullish : colors.chart.bearish }
                ]}>
                  {data.close.toFixed(4)}
                </Text>
              </View>
              <View style={styles.dataDetails}>
                <Text style={styles.dataDetail}>
                  Change: {data.change >= 0 ? '+' : ''}{data.change.toFixed(4)} 
                  ({data.percent_change >= 0 ? '+' : ''}{data.percent_change.toFixed(2)}%)
                </Text>
                <Text style={styles.dataDetail}>
                  High: {data.high.toFixed(4)} | Low: {data.low.toFixed(4)}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  statusContainer: {
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  statusGradient: {
    padding: 20,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusLabel: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  statusValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  controlsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  controlButton: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  controlButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  controlButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.primary,
    marginLeft: 6,
  },
  controlButtonSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  controlButtonSecondaryText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.accent.primary,
    marginLeft: 6,
  },
  dataContainer: {
    marginHorizontal: 24,
    marginBottom: 24,
  },
  dataTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 16,
  },
  noDataContainer: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  noDataText: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: 8,
  },
  noDataSubtext: {
    fontSize: 12,
    color: colors.text.tertiary,
  },
  dataItem: {
    backgroundColor: colors.background.secondary,
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  dataHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dataSymbol: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  dataPrice: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  dataDetails: {
    gap: 4,
  },
  dataDetail: {
    fontSize: 12,
    color: colors.text.tertiary,
  },
});

export default DummyApiTest;
