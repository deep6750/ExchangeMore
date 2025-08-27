import React, { useEffect, useRef, useState } from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Animated} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import * as Animatable from 'react-native-animatable';

import {colors} from '../constants/colors';
import MiniChart from './MiniChart';

const CurrencyPairCard = ({
  symbol,
  name,
  price,
  change,
  changePercent,
  bid,
  ask,
  volume,
  high,
  low,
  open,
  showChart = true,
  onPress,
  onFavoritePress,
  isFavorite = false,
  style,
  priceChange = null, // Real-time price change indicator
  lastUpdate = null, // Last update timestamp
  isConnected = true, // Connection status
}) => {
  // Animation values
  const flashAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [isAnimating, setIsAnimating] = useState(false);
  const [lastPrice, setLastPrice] = useState(price);
  const isPositive = change >= 0;
  const changeColor = isPositive ? colors.chart.bullish : colors.chart.bearish;
  
  // Enhanced animation state for price changes
  const getAnimationColor = () => {
    if (!priceChange) return null;
    return priceChange.type === 'increase' ? colors.chart.bullish : colors.chart.bearish;
  };

  const shouldShowPulse = priceChange && (Date.now() - priceChange.timestamp < 2000);
  
  // Trigger animations when price changes
  useEffect(() => {
    if (priceChange && price !== lastPrice) {
      setIsAnimating(true);
      setLastPrice(price);
      
      // Flash animation
      Animated.sequence([
        Animated.timing(flashAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: false,
        }),
        Animated.timing(flashAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        })
      ]).start(() => setIsAnimating(false));
      
      // Glow animation
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: false,
        })
      ]).start();
      
      // Scale animation
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.02,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [priceChange, price, lastPrice]);
  
  // Dynamic background color for flash effect
  const flashBackgroundColor = flashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(0,0,0,0)', getAnimationColor() || colors.accent.primary + '20']
  });
  
  // Dynamic glow effect
  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.8]
  });

  // Generate mock chart data
  const chartData = Array.from({length: 20}, (_, i) => ({
    x: i,
    y: Math.random() * 0.1 + (price || 1.1),
  }));

  return (
    <Animatable.View
      animation="fadeInUp"
      style={[styles.container, style]}>
      <Animated.View style={{
        transform: [{ scale: scaleAnim }],
        shadowColor: getAnimationColor() || colors.accent.primary,
        shadowOpacity: glowOpacity,
        shadowRadius: 20,
        elevation: isAnimating ? 15 : 8,
      }}>
        <TouchableOpacity
          onPress={onPress}
          disabled={!onPress}
          style={styles.card}>
          <Animated.View style={[
            styles.flashOverlay,
            { backgroundColor: flashBackgroundColor }
          ]} />
        <LinearGradient
          colors={colors.gradient.card}
          style={styles.gradient}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}>
          
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.currencyInfo}>
              <View style={styles.symbolRow}>
                <Text style={styles.symbol}>{symbol}</Text>
                {/* Connection indicator */}
                <View style={[
                  styles.connectionIndicator,
                  { backgroundColor: isConnected ? colors.chart.bullish : colors.text.tertiary }
                ]} />
              </View>
              <Text style={styles.name} numberOfLines={1}>
                {name}
              </Text>
              {lastUpdate && (
                <Text style={styles.lastUpdate}>
                  Updated: {new Date(lastUpdate).toLocaleTimeString()}
                </Text>
              )}
            </View>
            
            {onFavoritePress && (
              <TouchableOpacity
                onPress={onFavoritePress}
                style={styles.favoriteButton}>
                <Icon
                  name={isFavorite ? 'heart' : 'heart'}
                  size={18}
                  color={isFavorite ? colors.accent.danger : colors.text.tertiary}
                  fill={isFavorite ? colors.accent.danger : 'none'}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* Price */}
          <View style={styles.priceContainer}>
            <Animated.View style={[
              styles.priceWrapper,
              isAnimating && {
                backgroundColor: flashBackgroundColor,
                borderRadius: 8,
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderWidth: 1,
                borderColor: getAnimationColor() || 'transparent',
              }
            ]}>
              <Animatable.Text 
                style={[
                  styles.price,
                  shouldShowPulse && { color: getAnimationColor() },
                  isAnimating && { fontWeight: 'bold' }
                ]}
                animation={shouldShowPulse ? 'pulse' : null}
                duration={800}>
                {typeof price === 'number' ? price.toFixed(4) : '0.0000'}
              </Animatable.Text>
              
              {/* Price change indicator with enhanced animation */}
              {priceChange && shouldShowPulse && (
                <Animatable.View 
                  style={styles.priceChangeIndicator}
                  animation="bounceIn"
                  duration={600}>
                  <View style={[
                    styles.changeChip,
                    { backgroundColor: getAnimationColor() + '20', borderColor: getAnimationColor() }
                  ]}>
                    <Icon
                      name={priceChange.type === 'increase' ? 'trending-up' : 'trending-down'}
                      size={14}
                      color={getAnimationColor()}
                    />
                    <Text style={[styles.priceChangeText, { color: getAnimationColor() }]}>
                      {priceChange.type === 'increase' ? '+' : ''}{priceChange.change.toFixed(4)}
                    </Text>
                  </View>
                </Animatable.View>
              )}
            </Animated.View>
          </View>

          {/* Change */}
          <View style={styles.changeContainer}>
            <View style={styles.changeWrapper}>
              <Icon
                name={isPositive ? 'arrow-up-right' : 'arrow-down-right'}
                size={14}
                color={changeColor}
                style={styles.changeIcon}
              />
              <Text style={[styles.changeValue, {color: changeColor}]}>
                {isPositive ? '+' : ''}{typeof change === 'number' ? change.toFixed(4) : '0.0000'}
              </Text>
            </View>
            <Text style={[styles.changePercent, {color: changeColor}]}>
              {isPositive ? '+' : ''}{typeof changePercent === 'number' ? changePercent.toFixed(2) : '0.00'}%
            </Text>
          </View>

          {/* BID/ASK Section */}
          <View style={styles.bidAskContainer}>
            <View style={styles.bidAskRow}>
              <View style={styles.bidContainer}>
                <Text style={styles.bidAskLabel}>BID</Text>
                <Animatable.Text 
                  style={[styles.bidAskValue, styles.bidValue]}
                  animation={priceChange ? 'pulse' : null}
                  duration={600}>
                  {typeof bid === 'number' ? bid.toFixed(5) : '0.00000'}
                </Animatable.Text>
              </View>
              <View style={styles.askContainer}>
                <Text style={styles.bidAskLabel}>ASK</Text>
                <Animatable.Text 
                  style={[styles.bidAskValue, styles.askValue]}
                  animation={priceChange ? 'pulse' : null}
                  duration={600}>
                  {typeof ask === 'number' ? ask.toFixed(5) : '0.00000'}
                </Animatable.Text>
              </View>
              <View style={styles.spreadContainer}>
                <Text style={styles.bidAskLabel}>SPREAD</Text>
                <Text style={styles.spreadValue}>
                  {typeof bid === 'number' && typeof ask === 'number' 
                    ? ((ask - bid) * 10000).toFixed(1) + ' pips'
                    : '0.0 pips'}
                </Text>
              </View>
            </View>
          </View>

          {/* High/Low/Volume Section */}
          <View style={styles.statsContainer}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>HIGH</Text>
                <Animatable.Text 
                  style={styles.statValue}
                  animation={priceChange ? 'fadeIn' : null}
                  duration={800}>
                  {typeof high === 'number' ? high.toFixed(4) : '0.0000'}
                </Animatable.Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>LOW</Text>
                <Animatable.Text 
                  style={styles.statValue}
                  animation={priceChange ? 'fadeIn' : null}
                  duration={800}>
                  {typeof low === 'number' ? low.toFixed(4) : '0.0000'}
                </Animatable.Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>VOLUME</Text>
                <Animatable.Text 
                  style={styles.statValue}
                  animation={priceChange ? 'fadeIn' : null}
                  duration={800}>
                  {typeof volume === 'number' ? (volume / 1000000).toFixed(1) + 'M' : '0.0M'}
                </Animatable.Text>
              </View>
            </View>
          </View>

          {/* Chart */}
          {showChart && (
            <View style={styles.chartContainer}>
              <MiniChart
                data={chartData}
                color={changeColor}
                showGradient={true}
              />
            </View>
          )}

          {/* Action Button */}
          <TouchableOpacity style={styles.tradeButton}>
            <LinearGradient
              colors={colors.gradient.primary}
              style={styles.tradeButtonGradient}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}>
              <Text style={styles.tradeButtonText}>Trade</Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginRight: 16,
  },
  card: {
    width: 320,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: colors.accent.primary,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  gradient: {
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border.secondary,
    borderRadius: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  currencyInfo: {
    flex: 1,
  },
  symbolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  symbol: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  connectionIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  name: {
    fontSize: 12,
    color: colors.text.secondary,
    lineHeight: 16,
    marginBottom: 2,
  },
  lastUpdate: {
    fontSize: 10,
    color: colors.text.tertiary,
    fontStyle: 'italic',
  },
  favoriteButton: {
    padding: 4,
  },
  priceContainer: {
    marginBottom: 12,
    position: 'relative',
  },
  priceWrapper: {
    position: 'relative',
  },
  flashOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
    zIndex: 1,
    pointerEvents: 'none',
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  priceChangeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    justifyContent: 'center',
  },
  changeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  priceChangeText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  changeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  changeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeIcon: {
    marginRight: 4,
  },
  changeValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  changePercent: {
    fontSize: 14,
    fontWeight: '600',
  },
  bidAskContainer: {
    marginBottom: 16,
    backgroundColor: colors.background.secondary + '30',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border.secondary,
  },
  bidAskRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bidContainer: {
    flex: 1,
    alignItems: 'center',
  },
  askContainer: {
    flex: 1,
    alignItems: 'center',
  },
  spreadContainer: {
    flex: 1,
    alignItems: 'center',
  },
  bidAskLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.text.tertiary,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  bidAskValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  bidValue: {
    color: colors.chart.bearish,
  },
  askValue: {
    color: colors.chart.bullish,
  },
  spreadValue: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  statsContainer: {
    marginBottom: 16,
    backgroundColor: colors.background.primary + '20',
    borderRadius: 8,
    padding: 10,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: colors.text.tertiary,
    marginBottom: 3,
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.text.secondary,
  },
  chartContainer: {
    height: 60,
    marginBottom: 16,
  },
  tradeButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  tradeButtonGradient: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tradeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
});

export default CurrencyPairCard;
