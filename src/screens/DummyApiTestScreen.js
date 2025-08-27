import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  SafeAreaView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import * as Animatable from 'react-native-animatable';

import { colors } from '../constants/colors';
import CurrencyPairCard from '../components/CurrencyPairCard';
import PortfolioSummary from '../components/PortfolioSummary';
import ValueChangeNotification from '../components/ValueChangeNotification';
import { useRealTimeForex } from '../hooks/useRealTimeForex';
import { MAJOR_PAIRS } from '../services/twelveDataApi';

const DummyApiTestScreen = () => {
  // Portfolio state
  const [portfolioValue, setPortfolioValue] = useState(53564.32);
  const [portfolioChange, setPortfolioChange] = useState(103.46);
  const [portfolioChangePercent, setPortfolioChangePercent] = useState(2.3);
  const [portfolioValueChanged, setPortfolioValueChanged] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  // Use real-time forex data hook with dummy API
  const {
    dataArray: forexData,
    loading,
    error,
    lastUpdate,
    restart,
    priceChanges,
    isConnected
  } = useRealTimeForex(MAJOR_PAIRS.slice(0, 3), { // Only first 3 pairs for testing
    autoStart: true,
    updateInterval: 3000, // Match dummy API update interval
    enableAnimations: true,
    onError: (error) => {
      console.error('🚨 DummyApiTestScreen error:', error);
    }
  });

  // Debug logging
  useEffect(() => {
    console.log('🔍 DummyApiTestScreen Debug:');
    console.log('  📊 forexData length:', forexData.length);
    console.log('  🔌 isConnected:', isConnected);
    console.log('  📡 loading:', loading);
    console.log('  ❌ error:', error);
    console.log('  ⏰ lastUpdate:', lastUpdate);
    console.log('  🎬 priceChanges count:', Object.keys(priceChanges).length);
    
    if (forexData.length > 0) {
      console.log('  💱 Sample data:', {
        symbol: forexData[0].symbol,
        price: forexData[0].price,
        change: forexData[0].change
      });
    }
  }, [forexData, isConnected, loading, error, lastUpdate, priceChanges]);

  // Simulate portfolio value changes
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
          
          if (Math.abs(changePercent) > 0.5) {
            setShowNotification(true);
          }
          
          setTimeout(() => setPortfolioValueChanged(false), 2000);
        }
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [forexData, portfolioValue]);

  const getConnectionStatus = () => {
    if (loading) return { text: 'Connecting...', color: colors.accent.warning };
    if (isConnected) return { text: 'Connected', color: colors.chart.bullish };
    if (error) return { text: 'Error', color: colors.chart.bearish };
    return { text: 'Disconnected', color: colors.text.tertiary };
  };

  const status = getConnectionStatus();

  return (
    <SafeAreaView style={styles.container}>
      {/* Notification */}
      <ValueChangeNotification
        visible={showNotification}
        value={portfolioValue}
        change={portfolioChange}
        changePercent={portfolioChangePercent}
        onHide={() => setShowNotification(false)}
      />

      <ScrollView style={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Dummy API Integration Test</Text>
          <Text style={styles.subtitle}>Real-time data with enhanced animations</Text>
        </View>

        {/* Status Card */}
        <Animatable.View animation="fadeInUp" style={styles.statusContainer}>
          <LinearGradient
            colors={colors.gradient.card}
            style={styles.statusGradient}
          >
            <View style={styles.statusHeader}>
              <Text style={styles.statusTitle}>Connection Status</Text>
              <View style={[styles.statusDot, { backgroundColor: status.color }]} />
            </View>
            
            <View style={styles.statusGrid}>
              <View style={styles.statusItem}>
                <Text style={styles.statusLabel}>Status</Text>
                <Text style={[styles.statusValue, { color: status.color }]}>
                  {status.text}
                </Text>
              </View>
              
              <View style={styles.statusItem}>
                <Text style={styles.statusLabel}>Data Points</Text>
                <Text style={styles.statusValue}>{forexData.length}</Text>
              </View>
              
              <View style={styles.statusItem}>
                <Text style={styles.statusLabel}>Updates</Text>
                <Text style={styles.statusValue}>
                  {Object.keys(priceChanges).length} active
                </Text>
              </View>
              
              <View style={styles.statusItem}>
                <Text style={styles.statusLabel}>Last Update</Text>
                <Text style={styles.statusValue}>
                  {lastUpdate ? new Date(lastUpdate).toLocaleTimeString() : 'None'}
                </Text>
              </View>
            </View>

            {error && (
              <View style={styles.errorContainer}>
                <Icon name="alert-triangle" size={16} color={colors.chart.bearish} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
          </LinearGradient>
        </Animatable.View>

        {/* Controls */}
        <Animatable.View animation="fadeInUp" delay={100} style={styles.controlsContainer}>
          <TouchableOpacity 
            style={styles.controlButton}
            onPress={() => {
              console.log('🔄 Manual restart triggered');
              restart();
            }}
          >
            <LinearGradient
              colors={colors.gradient.primary}
              style={styles.controlButtonGradient}
            >
              <Icon name="refresh-cw" size={16} color={colors.text.primary} />
              <Text style={styles.controlButtonText}>Restart</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.controlButton}
            onPress={() => {
              Alert.alert('Debug Info', 
                `Connected: ${isConnected}\n` +
                `Data Points: ${forexData.length}\n` +
                `Loading: ${loading}\n` +
                `Error: ${error || 'None'}\n` +
                `Last Update: ${lastUpdate ? new Date(lastUpdate).toLocaleTimeString() : 'None'}`
              );
            }}
          >
            <View style={styles.controlButtonSecondary}>
              <Icon name="info" size={16} color={colors.accent.primary} />
              <Text style={styles.controlButtonSecondaryText}>Debug</Text>
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
        <Animatable.View animation="fadeInUp" delay={300}>
          <Text style={styles.sectionTitle}>Live Currency Pairs</Text>
          
          {loading && forexData.length === 0 ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Connecting to real-time data...</Text>
              <Text style={styles.loadingSubtext}>
                Make sure the dummy API server is running on localhost:3001
              </Text>
            </View>
          ) : forexData.length === 0 ? (
            <View style={styles.noDataContainer}>
              <Icon name="wifi-off" size={48} color={colors.text.tertiary} />
              <Text style={styles.noDataText}>No data available</Text>
              <Text style={styles.noDataSubtext}>
                Check dummy API server and WebSocket connection
              </Text>
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
                  style={{ marginLeft: index === 0 ? 24 : 0, marginRight: 16 }}
                />
              ))}
            </ScrollView>
          )}
        </Animatable.View>

        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>Instructions:</Text>
          <Text style={styles.instructionsText}>
            1. Ensure dummy API server is running: npm run start-dummy-api{'\n'}
            2. Watch for real-time updates every 3 seconds{'\n'}
            3. Observe flash animations on value changes{'\n'}
            4. Portfolio updates based on market movements{'\n'}
            5. Check console logs for debug information
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollContainer: {
    flex: 1,
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
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    padding: 12,
    backgroundColor: colors.chart.bearish + '20',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.chart.bearish,
  },
  errorText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 12,
    color: colors.chart.bearish,
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
  },
  controlButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginLeft: 8,
  },
  controlButtonSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  controlButtonSecondaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent.primary,
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginLeft: 24,
    marginBottom: 16,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 12,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
  noDataContainer: {
    padding: 40,
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 16,
    color: colors.text.secondary,
    marginTop: 16,
    marginBottom: 8,
  },
  noDataSubtext: {
    fontSize: 12,
    color: colors.text.tertiary,
    textAlign: 'center',
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

export default DummyApiTestScreen;
