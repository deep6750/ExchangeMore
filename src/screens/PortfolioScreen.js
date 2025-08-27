import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import * as Animatable from 'react-native-animatable';

import {colors} from '../constants/colors';
import PortfolioChart from '../components/PortfolioChart';

const PortfolioScreen = () => {
  const [portfolioData, setPortfolioData] = useState({
    totalValue: 53564.32,
    todayChange: 103.46,
    todayChangePercent: 2.3,
    totalGainLoss: 2547.89,
    totalGainLossPercent: 4.98,
  });

  const [positions, setPositions] = useState([
    {
      id: 1,
      symbol: 'EUR/USD',
      name: 'Euro / US Dollar',
      quantity: 10000,
      entryPrice: 1.1250,
      currentPrice: 1.1285,
      gainLoss: 35.00,
      gainLossPercent: 0.31,
      type: 'long',
    },
    {
      id: 2,
      symbol: 'GBP/JPY',
      name: 'British Pound / Japanese Yen',
      quantity: 5000,
      entryPrice: 186.50,
      currentPrice: 184.25,
      gainLoss: -112.50,
      gainLossPercent: -1.21,
      type: 'short',
    },
    {
      id: 3,
      symbol: 'USD/CAD',
      name: 'US Dollar / Canadian Dollar',
      quantity: 8000,
      entryPrice: 1.3580,
      currentPrice: 1.3625,
      gainLoss: 36.00,
      gainLossPercent: 0.33,
      type: 'long',
    },
  ]);

  const [timeframe, setTimeframe] = useState('1D');
  const timeframes = ['1D', '1W', '1M', '3M', '1Y', 'All'];

  const renderPosition = ({item}) => (
    <View style={styles.positionCard}>
      <View style={styles.positionHeader}>
        <View style={styles.positionInfo}>
          <Text style={styles.positionSymbol}>{item.symbol}</Text>
          <Text style={styles.positionName}>{item.name}</Text>
        </View>
        <View style={styles.positionBadge}>
          <Text style={[
            styles.positionType,
            {color: item.type === 'long' ? colors.chart.bullish : colors.chart.bearish}
          ]}>
            {item.type.toUpperCase()}
          </Text>
        </View>
      </View>
      
      <View style={styles.positionDetails}>
        <View style={styles.positionDetailItem}>
          <Text style={styles.positionDetailLabel}>Quantity</Text>
          <Text style={styles.positionDetailValue}>
            {item.quantity.toLocaleString()}
          </Text>
        </View>
        
        <View style={styles.positionDetailItem}>
          <Text style={styles.positionDetailLabel}>Entry</Text>
          <Text style={styles.positionDetailValue}>
            {item.entryPrice.toFixed(4)}
          </Text>
        </View>
        
        <View style={styles.positionDetailItem}>
          <Text style={styles.positionDetailLabel}>Current</Text>
          <Text style={styles.positionDetailValue}>
            {item.currentPrice.toFixed(4)}
          </Text>
        </View>
      </View>
      
      <View style={styles.positionFooter}>
        <View style={styles.positionPnL}>
          <Text style={styles.positionPnLLabel}>P&L</Text>
          <Text style={[
            styles.positionPnLValue,
            {color: item.gainLoss >= 0 ? colors.chart.bullish : colors.chart.bearish}
          ]}>
            ${item.gainLoss >= 0 ? '+' : ''}{item.gainLoss.toFixed(2)}
          </Text>
          <Text style={[
            styles.positionPnLPercent,
            {color: item.gainLoss >= 0 ? colors.chart.bullish : colors.chart.bearish}
          ]}>
            ({item.gainLossPercent >= 0 ? '+' : ''}{item.gainLossPercent.toFixed(2)}%)
          </Text>
        </View>
        
        <TouchableOpacity style={styles.closeButton}>
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderTimeframeButton = (tf) => (
    <TouchableOpacity
      key={tf}
      style={[
        styles.timeframeButton,
        timeframe === tf && styles.timeframeButtonActive
      ]}
      onPress={() => setTimeframe(tf)}>
      <Text style={[
        styles.timeframeButtonText,
        timeframe === tf && styles.timeframeButtonTextActive
      ]}>
        {tf}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Portfolio</Text>
        <TouchableOpacity style={styles.moreButton}>
          <Icon name="more-horizontal" size={24} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Portfolio Summary */}
      <Animatable.View animation="fadeInUp" style={styles.summaryCard}>
        <LinearGradient
          colors={colors.gradient.card}
          style={styles.summaryGradient}>
          <Text style={styles.portfolioValue}>
            ${portfolioData.totalValue.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Text>
          
          <View style={styles.changeContainer}>
            <Icon
              name={portfolioData.todayChange >= 0 ? 'trending-up' : 'trending-down'}
              size={16}
              color={portfolioData.todayChange >= 0 ? colors.chart.bullish : colors.chart.bearish}
            />
            <Text style={[
              styles.changeText,
              {color: portfolioData.todayChange >= 0 ? colors.chart.bullish : colors.chart.bearish}
            ]}>
              ${portfolioData.todayChange >= 0 ? '+' : ''}{portfolioData.todayChange.toFixed(2)}
              ({portfolioData.todayChangePercent >= 0 ? '+' : ''}{portfolioData.todayChangePercent.toFixed(2)}%)
            </Text>
          </View>
          
          <Text style={styles.todayLabel}>Today</Text>
        </LinearGradient>
      </Animatable.View>

      {/* Performance Stats */}
      <Animatable.View animation="fadeInUp" delay={100} style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total Gain/Loss</Text>
          <Text style={[
            styles.statValue,
            {color: portfolioData.totalGainLoss >= 0 ? colors.chart.bullish : colors.chart.bearish}
          ]}>
            ${portfolioData.totalGainLoss >= 0 ? '+' : ''}{portfolioData.totalGainLoss.toFixed(2)}
          </Text>
          <Text style={[
            styles.statPercent,
            {color: portfolioData.totalGainLoss >= 0 ? colors.chart.bullish : colors.chart.bearish}
          ]}>
            {portfolioData.totalGainLossPercent >= 0 ? '+' : ''}{portfolioData.totalGainLossPercent.toFixed(2)}%
          </Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Open Positions</Text>
          <Text style={styles.statValue}>{positions.length}</Text>
          <Text style={styles.statPercent}>Active</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Win Rate</Text>
          <Text style={styles.statValue}>78.5%</Text>
          <Text style={styles.statPercent}>Last 30 days</Text>
        </View>
      </Animatable.View>

      {/* Chart */}
      <Animatable.View animation="fadeInUp" delay={200} style={styles.chartSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Performance</Text>
          <View style={styles.timeframeContainer}>
            {timeframes.map(renderTimeframeButton)}
          </View>
        </View>
        
        <View style={styles.chartContainer}>
          <PortfolioChart timeframe={timeframe} />
        </View>
      </Animatable.View>

      {/* Open Positions */}
      <Animatable.View animation="fadeInUp" delay={300} style={styles.positionsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Open Positions</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={positions}
          renderItem={renderPosition}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
          contentContainerStyle={styles.positionsList}
        />
      </Animatable.View>

      {/* Quick Actions */}
      <Animatable.View animation="fadeInUp" delay={400} style={styles.actionsSection}>
        <TouchableOpacity style={styles.actionButton}>
          <LinearGradient
            colors={colors.gradient.primary}
            style={styles.actionButtonGradient}>
            <Icon name="plus" size={20} color={colors.text.primary} />
            <Text style={styles.actionButtonText}>Add Funds</Text>
          </LinearGradient>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <LinearGradient
            colors={colors.gradient.success}
            style={styles.actionButtonGradient}>
            <Icon name="trending-up" size={20} color={colors.text.primary} />
            <Text style={styles.actionButtonText}>New Trade</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animatable.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  moreButton: {
    width: 44,
    height: 44,
    backgroundColor: colors.background.card,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  summaryCard: {
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
  },
  summaryGradient: {
    padding: 24,
    alignItems: 'center',
  },
  portfolioValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 8,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  changeText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 4,
  },
  todayLabel: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.background.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 4,
  },
  statPercent: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  chartSection: {
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
  timeframeContainer: {
    flexDirection: 'row',
    backgroundColor: colors.background.card,
    borderRadius: 12,
    padding: 4,
  },
  timeframeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  timeframeButtonActive: {
    backgroundColor: colors.accent.primary,
  },
  timeframeButtonText: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  timeframeButtonTextActive: {
    color: colors.text.primary,
  },
  chartContainer: {
    height: 200,
    marginHorizontal: 24,
    backgroundColor: colors.background.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  positionsSection: {
    marginBottom: 32,
  },
  positionsList: {
    paddingHorizontal: 24,
  },
  positionCard: {
    backgroundColor: colors.background.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  positionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  positionInfo: {
    flex: 1,
  },
  positionSymbol: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  positionName: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
  positionBadge: {
    backgroundColor: colors.background.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  positionType: {
    fontSize: 12,
    fontWeight: '600',
  },
  positionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  positionDetailItem: {
    alignItems: 'center',
  },
  positionDetailLabel: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginBottom: 4,
  },
  positionDetailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  positionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  positionPnL: {
    flex: 1,
  },
  positionPnLLabel: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginBottom: 2,
  },
  positionPnLValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  positionPnLPercent: {
    fontSize: 12,
    fontWeight: '500',
  },
  closeButton: {
    backgroundColor: colors.accent.danger,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  closeButtonText: {
    color: colors.text.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  seeAllText: {
    fontSize: 14,
    color: colors.accent.primary,
    fontWeight: '500',
  },
  actionsSection: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 16,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  actionButtonText: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default PortfolioScreen;
