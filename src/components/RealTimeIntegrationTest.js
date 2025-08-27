import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import * as Animatable from 'react-native-animatable';

import { colors } from '../constants/colors';
import { useRealTimeForex } from '../hooks/useRealTimeForex';
import { MAJOR_PAIRS } from '../services/twelveDataApi';
import CurrencyPairCard from './CurrencyPairCard';
import PortfolioSummary from './PortfolioSummary';
import ValueChangeNotification from './ValueChangeNotification';
import dummyApiService from '../services/dummyApiService';
import { API_CONFIG } from '../config/apiConfig';

const RealTimeIntegrationTest = () => {
  // Real-time forex data hook
  const {
    dataArray: forexData,
    loading,
    error,
    lastUpdate,
    restart,
    priceChanges,
    isConnected
  } = useRealTimeForex(MAJOR_PAIRS.slice(0, 3), {
    autoStart: true,
    updateInterval: 3000, // Match server update interval
    enableAnimations: true,
    onError: (error) => {
      console.error('Real-time data error:', error);
    }
  });

  // Portfolio simulation
  const [portfolioValue, setPortfolioValue] = useState(53564.32);
  const [portfolioChange, setPortfolioChange] = useState(103.46);
  const [portfolioChangePercent, setPortfolioChangePercent] = useState(2.3);
  const [portfolioValueChanged, setPortfolioValueChanged] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  // Test stats
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [updateCount, setUpdateCount] = useState(0);
  const [lastPriceChange, setLastPriceChange] = useState(null);

  // Simulate portfolio value changes based on forex movements
  useEffect(() => {
    if (forexData.length > 0) {
      const interval = setInterval(() => {
        const baseValue = 53564.32;
        const marketMovement = forexData.reduce((acc, pair) => acc + (pair.changePercent || 0), 0) / forexData.length;
        const newValue = baseValue * (1 + marketMovement / 100);
        const change = newValue - portfolioValue;
        const changePercent = (change / portfolioValue) * 100;
        
        if (Math.abs(change) > 1) { // Lower threshold for testing
          setPortfolioValueChanged(true);
          setPortfolioValue(newValue);
          setPortfolioChange(change);
          setPortfolioChangePercent(changePercent);
          
          // Show notification for changes > 0.5%
          if (Math.abs(changePercent) > 0.5) {
            setShowNotification(true);
          }
          
          // Reset animation trigger after delay
          setTimeout(() => setPortfolioValueChanged(false), 2000);
        }
      }, 5000); // Update every 5 seconds
      
      return () => clearInterval(interval);
    }
  }, [forexData, portfolioValue]);

  // Track price changes for statistics
  useEffect(() => {
    if (Object.keys(priceChanges).length > 0) {
      setUpdateCount(prev => prev + 1);
      const latestChange = Object.values(priceChanges)[0];
      setLastPriceChange(latestChange);
    }
  }, [priceChanges]);

  // Monitor connection attempts
  useEffect(() => {
    if (isConnected) {
      setConnectionAttempts(0);
    }
  }, [isConnected]);

  // Manual trigger functions
  const triggerManualUpdate = async () => {
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

  const checkApiHealth = async () => {
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

  const restartConnection = () => {
    setConnectionAttempts(prev => prev + 1);
    restart();
  };

  const getConnectionStatusColor = () => {
    if (isConnected) return colors.chart.bullish;
    if (loading) return colors.accent.warning;
    return colors.chart.bearish;
  };

  const getConnectionStatusText = () => {
    if (isConnected) return 'Connected';
    if (loading) return 'Connecting...';
    return 'Disconnected';
  };

  return (
    <ScrollView style={styles.container}>
      {/* Value Change Notification */}
      <ValueChangeNotification
        visible={showNotification}
        value={portfolioValue}
        change={portfolioChange}
        changePercent={portfolioChangePercent}
        onHide={() => setShowNotification(false)}
      />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Real-Time Integration Test</Text>
        <Text style={styles.subtitle}>Testing dummy API with live animations</Text>
      </View>

      {/* API Status */}
      <Animatable.View animation="fadeInUp" style={styles.statusContainer}>
        <LinearGradient
          colors={colors.gradient.card}
          style={styles.statusGradient}
        >
          <View style={styles.statusHeader}>
            <Text style={styles.statusTitle}>API Status</Text>
            <View style={[
              styles.statusDot,
              { backgroundColor: getConnectionStatusColor() }
            ]} />
          </View>
          
          <View style={styles.statusGrid}>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Connection</Text>
              <Text style={[styles.statusValue, { color: getConnectionStatusColor() }]}>
                {getConnectionStatusText()}
              </Text>
            </View>
            
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>API Type</Text>
              <Text style={styles.statusValue}>
                {API_CONFIG.USE_DUMMY_API ? 'Dummy API' : 'Twelve Data'}
              </Text>
            </View>
            
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Updates Received</Text>
              <Text style={styles.statusValue}>{updateCount}</Text>
            </View>
            
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Last Update</Text>
              <Text style={styles.statusValue}>
                {lastUpdate ? new Date(lastUpdate).toLocaleTimeString() : 'None'}
              </Text>
            </View>
          </View>

          {lastPriceChange && (
            <View style={styles.lastChangeContainer}>
              <Text style={styles.lastChangeTitle}>Last Price Change:</Text>
              <Text style={[
                styles.lastChangeText,
                { color: lastPriceChange.type === 'increase' ? colors.chart.bullish : colors.chart.bearish }
              ]}>
                {lastPriceChange.type === 'increase' ? '↗' : '↘'} {lastPriceChange.change.toFixed(4)}
              </Text>
            </View>
          )}
        </LinearGradient>
      </Animatable.View>

      {/* Control Buttons */}
      <Animatable.View animation="fadeInUp" delay={100} style={styles.controlsContainer}>
        <TouchableOpacity 
          style={styles.controlButton}
          onPress={triggerManualUpdate}
        >
          <LinearGradient
            colors={colors.gradient.primary}
            style={styles.controlButtonGradient}
          >
            <Icon name="zap" size={16} color={colors.text.primary} />
            <Text style={styles.controlButtonText}>Trigger Update</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.controlButton}
          onPress={checkApiHealth}
        >
          <LinearGradient
            colors={colors.gradient.success}
            style={styles.controlButtonGradient}
          >
            <Icon name="heart" size={16} color={colors.text.primary} />
            <Text style={styles.controlButtonText}>Check Health</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.controlButton}
          onPress={restartConnection}
        >
          <View style={styles.controlButtonSecondary}>
            <Icon name="refresh-cw" size={16} color={colors.accent.primary} />
            <Text style={styles.controlButtonSecondaryText}>Restart</Text>
          </View>
        </TouchableOpacity>
      </Animatable.View>

      {/* Portfolio Summary */}
      <Animatable.View animation="fadeInUp" delay={200}>
        <PortfolioSummary
          value={portfolioValue}
          change={portfolioChange}
          changePercent={portfolioChangePercent}
          valueChanged={portfolioValueChanged}
        />
      </Animatable.View>

      {/* Currency Pairs */}
      <Animatable.View animation="fadeInUp" delay={300} style={styles.pairsContainer}>
        <Text style={styles.sectionTitle}>Live Currency Pairs</Text>
        {loading && forexData.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.accent.primary} />
            <Text style={styles.loadingText}>Connecting to real-time data...</Text>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {forexData.map((pair, index) => (
              <CurrencyPairCard
                key={pair.symbol}
                symbol={pair.symbol}
                name={pair.name}
                price={pair.price}
                change={pair.change}
                changePercent={pair.changePercent}
                priceChange={priceChanges[pair.symbol]}
                lastUpdate={lastUpdate}
                isConnected={isConnected}
                showChart={true}
                style={{ marginLeft: index === 0 ? 24 : 0 }}
              />
            ))}
          </ScrollView>
        )}
      </Animatable.View>

      {/* Error Display */}
      {error && (
        <Animatable.View animation="shake" style={styles.errorContainer}>
          <Icon name="alert-triangle" size={20} color={colors.chart.bearish} />
          <Text style={styles.errorText}>{error}</Text>
        </Animatable.View>
      )}

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsTitle}>Test Instructions:</Text>
        <Text style={styles.instructionsText}>
          • Watch for real-time price updates every 3 seconds{'\n'}
          • Observe flash animations on value changes{'\n'}
          • Portfolio values update based on market movements{'\n'}
          • Notifications appear for significant changes{'\n'}
          • Use control buttons to test manual updates
        </Text>
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
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statusItem: {
    width: '48%',
    marginBottom: 12,
  },
  statusLabel: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  lastChangeContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastChangeTitle: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  lastChangeText: {
    fontSize: 14,
    fontWeight: 'bold',
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
  pairsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginLeft: 24,
    marginBottom: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: colors.text.secondary,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 24,
    padding: 16,
    backgroundColor: colors.chart.bearish + '20',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.chart.bearish,
  },
  errorText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: colors.chart.bearish,
  },
  instructionsContainer: {
    margin: 24,
    padding: 16,
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 12,
    color: colors.text.secondary,
    lineHeight: 18,
  },
});

export default RealTimeIntegrationTest;
