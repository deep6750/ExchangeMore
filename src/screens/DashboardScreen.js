import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  FlatList,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import * as Animatable from 'react-native-animatable';

import {colors} from '../constants/colors';
import twelveDataApi, {MAJOR_PAIRS} from '../services/twelveDataApi';
import MiniChart from '../components/MiniChart';
import CurrencyPairCard from '../components/CurrencyPairCard';
import PortfolioSummary from '../components/PortfolioSummary';
import RealTimeStatus from '../components/RealTimeStatus';
import ValueChangeNotification from '../components/ValueChangeNotification';
import { useRealTimeForex } from '../hooks/useRealTimeForex';
import internalMockDataService from '../services/internalMockDataService';
import { API_CONFIG } from '../config/apiConfig';

const DashboardScreen = () => {
  const [portfolioValue, setPortfolioValue] = useState(53564.32);
  const [portfolioChange, setPortfolioChange] = useState(103.46);
  const [portfolioChangePercent, setPortfolioChangePercent] = useState(2.3);
  const [portfolioValueChanged, setPortfolioValueChanged] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [testLogs, setTestLogs] = useState([]);

  // Use real-time forex data hook
  const {
    dataArray: forexData,
    loading,
    error,
    lastUpdate,
    restart,
    priceChanges,
    isConnected
  } = useRealTimeForex(MAJOR_PAIRS, {
    autoStart: true,
    updateInterval: 3000, // Match dummy API interval
    enableAnimations: true,
    onError: (error) => {
      console.error('Real-time data error:', error);
      Alert.alert('Error', 'Failed to load real-time market data');
    }
  });

  // Debug logging for real-time data
  useEffect(() => {
    console.log('📊 DashboardScreen: forexData updated, length:', forexData.length);
    console.log('🔌 DashboardScreen: isConnected:', isConnected);
    console.log('⏰ DashboardScreen: lastUpdate:', lastUpdate);
    if (forexData.length > 0) {
      console.log('💱 DashboardScreen: First pair data:', forexData[0]);
    }
  }, [forexData, isConnected, lastUpdate]);

  // Simulate portfolio value changes based on forex movements
  useEffect(() => {
    if (forexData.length > 0) {
      const interval = setInterval(() => {
        const baseValue = 53564.32;
        const marketMovement = forexData.reduce((acc, pair) => acc + (pair.changePercent || 0), 0) / forexData.length;
        const newValue = baseValue * (1 + marketMovement / 100);
        const change = newValue - portfolioValue;
        const changePercent = (change / portfolioValue) * 100;
        
        if (Math.abs(change) > 10) { // Only trigger animation for significant changes
          setPortfolioValueChanged(true);
          setPortfolioValue(newValue);
          setPortfolioChange(change);
          setPortfolioChangePercent(changePercent);
          
          // Show notification for major changes
          if (Math.abs(changePercent) > 1) {
            setShowNotification(true);
          }
          
          // Reset animation trigger after delay
          setTimeout(() => setPortfolioValueChanged(false), 2000);
        }
      }, 15000); // Update every 15 seconds
      
      return () => clearInterval(interval);
    }
  }, [forexData, portfolioValue]);

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    restart();
    setTimeout(() => setRefreshing(false), 2000);
  };

  const addTestLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `${timestamp}: ${message}`;
    setTestLogs(prev => [logEntry, ...prev].slice(0, 10)); // Keep last 10 logs
  };

  const testInternalMock = () => {
    try {
      addTestLog('🧪 Testing Internal Mock Service');
      addTestLog(`📋 USE_INTERNAL_MOCK: ${API_CONFIG.USE_INTERNAL_MOCK}`);
      addTestLog(`📋 USE_DUMMY_API: ${API_CONFIG.USE_DUMMY_API}`);
      
      // Set up event listeners
      internalMockDataService.on('pair_updated', (data) => {
        addTestLog(`📈 Mock update: ${data.symbol} = ${data.price}`);
      });
      
      internalMockDataService.on('service_started', () => {
        addTestLog(`✅ Mock service started`);
      });
      
      // Start the service
      const testPairs = [{ symbol: 'EUR/USD' }, { symbol: 'GBP/USD' }];
      addTestLog('🚀 Starting internal mock service...');
      internalMockDataService.start(testPairs);
      
      // Stop after 5 seconds
      setTimeout(() => {
        internalMockDataService.stop();
        addTestLog('🛑 Mock service stopped');
      }, 5000);
      
    } catch (error) {
      addTestLog(`❌ Test failed: ${error.message}`);
    }
  };

  const renderCurrencyPair = ({item}) => (
    <CurrencyPairCard
      symbol={item.symbol}
      name={item.name}
      price={item.price}
      change={item.change}
      changePercent={item.changePercent || item.percent_change}
      bid={item.bid}
      ask={item.ask}
      volume={item.volume}
      high={item.high}
      low={item.low}
      open={item.open}
      priceChange={priceChanges[item.symbol]}
      lastUpdate={lastUpdate}
      isConnected={isConnected}
    />
  );

  const renderWatchlistItem = ({item}) => (
    <View style={styles.watchlistItem}>
      <View style={styles.watchlistInfo}>
        <Text style={styles.watchlistSymbol}>{item.symbol}</Text>
        <Text style={styles.watchlistName}>{item.name}</Text>
      </View>
      <View style={styles.watchlistChart}>
        <MiniChart data={generateMockChartData()} />
      </View>
      <View style={styles.watchlistPrice}>
        <Text style={styles.price}>{item.price.toFixed(4)}</Text>
        <Text style={[
          styles.change,
          {color: item.change >= 0 ? colors.chart.bullish : colors.chart.bearish}
        ]}>
          {item.change >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
        </Text>
      </View>
    </View>
  );

  // Mock data generator for charts
  const generateMockChartData = () => {
    return Array.from({length: 20}, (_, i) => ({
      x: i,
      y: Math.random() * 0.1 + 1.1,
    }));
  };

  const featuredPairs = forexData.slice(0, 3);
  const watchlistPairs = forexData.slice(3, 8);

  return (
    <View style={styles.container}>
      {/* Value Change Notification */}
      <ValueChangeNotification
        visible={showNotification}
        value={portfolioValue}
        change={portfolioChange}
        changePercent={portfolioChangePercent}
        onHide={() => setShowNotification(false)}
      />
      
      <ScrollView
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent.primary}
            colors={[colors.accent.primary]}
          />
        }>
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good Morning</Text>
          <Text style={styles.userName}>Trader</Text>
        </View>
        <View style={styles.headerRight}>
          <RealTimeStatus 
            isConnected={isConnected}
            lastUpdate={lastUpdate}
            size="medium"
            style={styles.realTimeStatus}
          />
          

          <TouchableOpacity style={styles.notificationButton}>
            <Icon name="bell" size={24} color={colors.text.primary} />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Portfolio Summary */}
      <Animatable.View animation="fadeInUp" delay={100}>
        <PortfolioSummary
          value={portfolioValue}
          change={portfolioChange}
          changePercent={portfolioChangePercent}
          valueChanged={portfolioValueChanged}
        />
      </Animatable.View>

      {/* Debug Test Section - Highly visible location */}
      <View style={styles.debugSection}>
        <TouchableOpacity 
          style={styles.testButton} 
          onPress={testInternalMock}
        >
          <Text style={styles.testButtonText}>🧪 Test Internal Mock Service</Text>
        </TouchableOpacity>
        
        {testLogs.length > 0 && (
          <View style={styles.logsContainer}>
            <Text style={styles.logsTitle}>Test Logs:</Text>
            {testLogs.map((log, index) => (
              <Text key={index} style={styles.logText}>{log}</Text>
            ))}
          </View>
        )}
      </View>

      {/* Quick Actions */}
      <Animatable.View animation="fadeInUp" delay={200} style={styles.quickActions}>
        <TouchableOpacity style={styles.actionButton}>
          <LinearGradient
            colors={colors.gradient.primary}
            style={styles.actionButtonGradient}>
            <Icon name="trending-up" size={24} color={colors.text.primary} />
          </LinearGradient>
          <Text style={styles.actionButtonText}>Trade</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <LinearGradient
            colors={colors.gradient.success}
            style={styles.actionButtonGradient}>
            <Icon name="plus" size={24} color={colors.text.primary} />
          </LinearGradient>
          <Text style={styles.actionButtonText}>Deposit</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <LinearGradient
            colors={colors.gradient.danger}
            style={styles.actionButtonGradient}>
            <Icon name="minus" size={24} color={colors.text.primary} />
          </LinearGradient>
          <Text style={styles.actionButtonText}>Withdraw</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <View style={styles.actionButtonSecondary}>
            <Icon name="bar-chart-2" size={24} color={colors.accent.primary} />
          </View>
          <Text style={styles.actionButtonText}>Analyze</Text>
        </TouchableOpacity>
      </Animatable.View>

      {/* Featured Pairs */}
      <Animatable.View animation="fadeInUp" delay={300} style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Pairs</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={featuredPairs}
          renderItem={renderCurrencyPair}
          keyExtractor={(item) => item.symbol}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.featuredList}
        />
      </Animatable.View>

      {/* Watchlist */}
      <Animatable.View animation="fadeInUp" delay={400} style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Watchlist</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.watchlistContainer}>
          {watchlistPairs.map((item, index) => (
            <View key={item.symbol} style={styles.watchlistItem}>
              <View style={styles.watchlistInfo}>
                <Text style={styles.watchlistSymbol}>{item.symbol}</Text>
                <Text style={styles.watchlistName}>{item.name}</Text>
              </View>
              <View style={styles.watchlistChart}>
                <MiniChart data={generateMockChartData()} />
              </View>
              <View style={styles.watchlistPrice}>
                <Text style={styles.price}>{item.price.toFixed(4)}</Text>
                <Text style={[
                  styles.change,
                  {color: item.change >= 0 ? colors.chart.bullish : colors.chart.bearish}
                ]}>
                  {item.change >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
                </Text>
              </View>
            </View>
          ))}
        </View>
      </Animatable.View>

      {/* Market News */}
      <Animatable.View animation="fadeInUp" delay={500} style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Market News</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.newsContainer}>
          <View style={styles.newsItem}>
            <View style={styles.newsIcon}>
              <Icon name="trending-up" size={16} color={colors.chart.bullish} />
            </View>
            <View style={styles.newsContent}>
              <Text style={styles.newsTitle}>USD Strengthens Against Major Currencies</Text>
              <Text style={styles.newsTime}>2 hours ago</Text>
            </View>
          </View>
          
          <View style={styles.newsItem}>
            <View style={styles.newsIcon}>
              <Icon name="info" size={16} color={colors.accent.primary} />
            </View>
            <View style={styles.newsContent}>
              <Text style={styles.newsTitle}>ECB Meeting Results Expected Today</Text>
              <Text style={styles.newsTime}>4 hours ago</Text>
            </View>
          </View>
        </View>
      </Animatable.View>
      </ScrollView>
    </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  realTimeStatus: {
    marginRight: 12,
  },
  greeting: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginTop: 4,
  },
  notificationButton: {
    width: 48,
    height: 48,
    backgroundColor: colors.background.card,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    backgroundColor: colors.accent.danger,
    borderRadius: 4,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionButtonGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionButtonSecondary: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.card,
    borderWidth: 1,
    borderColor: colors.border.primary,
    marginBottom: 8,
  },
  actionButtonText: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  seeAllText: {
    fontSize: 14,
    color: colors.accent.primary,
    fontWeight: '500',
  },
  featuredList: {
    paddingLeft: 24,
  },
  watchlistContainer: {
    paddingHorizontal: 24,
  },
  watchlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  watchlistInfo: {
    flex: 1,
  },
  watchlistSymbol: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  watchlistName: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
  watchlistChart: {
    width: 60,
    height: 30,
    marginHorizontal: 16,
  },
  watchlistPrice: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  change: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  newsContainer: {
    paddingHorizontal: 24,
  },
  newsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  newsIcon: {
    width: 32,
    height: 32,
    backgroundColor: colors.background.secondary,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  newsContent: {
    flex: 1,
  },
  newsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  newsTime: {
    fontSize: 12,
    color: colors.text.tertiary,
  },
  debugSection: {
    marginHorizontal: 24,
    marginTop: 16,
    padding: 16,
    backgroundColor: colors.background.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  testButton: {
    backgroundColor: colors.accent.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
    shadowColor: colors.accent.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  testButtonText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  logsContainer: {
    marginTop: 10,
    padding: 8,
    backgroundColor: colors.background.primary,
    borderRadius: 4,
    maxHeight: 150,
  },
  logsTitle: {
    color: colors.text.secondary,
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  logText: {
    color: colors.text.tertiary,
    fontSize: 8,
    fontFamily: 'monospace',
    marginBottom: 2,
  },
});

export default DashboardScreen;
