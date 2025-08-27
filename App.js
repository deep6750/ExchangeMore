import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRealTimeForex } from './src/hooks/useRealTimeForex';
import { API_CONFIG } from './src/config/apiConfig';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  Dimensions,
  Animated,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { PanGestureHandler, PinchGestureHandler, State } from 'react-native-gesture-handler';
import 'react-native-gesture-handler';

// Interactive Candlestick Chart Component with Zoom
const DetailChart = ({ pair }) => {
  const [scale, setScale] = useState(1);
  const [panX, setPanX] = useState(-200);
  const [lastScale, setLastScale] = useState(1);
  const [lastPanX, setLastPanX] = useState(-200);

  const chartData = useMemo(() => {
    const data = [];
    const currentPrice = parseFloat(pair.price) || 0;
    let basePrice = parseFloat(pair.open) || currentPrice;

    for (let i = 0; i < 50; i++) {
      const open = basePrice;
      const close = basePrice + (Math.random() - 0.5) * 0.1;
      const high = Math.max(open, close) + Math.random() * 0.05;
      const low = Math.min(open, close) - Math.random() * 0.05;
      data.push({ open, high, low, close });
      basePrice = close;
    }

    if (data.length > 0) {
      data[data.length - 1].close = currentPrice;
    }

    return data;
  }, [pair.price, pair.open]);
  const currentPrice = parseFloat(pair.price) || 87.057;
  const latestClose = chartData.length > 0 && chartData[chartData.length - 1]?.close !== undefined ? chartData[chartData.length - 1].close : currentPrice;
  
  // Dynamic price range based on zoom
  const maxPrice = Math.max(...chartData.map(d => d.high));
  const minPrice = Math.min(...chartData.map(d => d.low));
  const priceRange = maxPrice - minPrice;
  const chartHeight = 280;
  
  // Calculate current price line position (based on latest close)
  const currentPricePosition = ((maxPrice - latestClose) / priceRange) * chartHeight;

  // Gesture handlers
  const onPinchGestureEvent = (event) => {
    // Fix: Invert scale logic - pinch in = zoom in, pinch out = zoom out
    const gestureScale = event.nativeEvent.scale;
    // Use division to invert: pinch in (scale<1) increases chart scale, pinch out (scale>1) decreases chart scale
    const newScale = Math.max(0.5, Math.min(lastScale / gestureScale, 5));
    setScale(newScale);
  };

  const onPinchHandlerStateChange = (event) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      setLastScale(scale);
    }
  };

  const onPanGestureEvent = (event) => {
    const newPanX = Math.max(-200, Math.min(lastPanX + event.nativeEvent.translationX, 200));
    setPanX(newPanX);
  };

  const onPanHandlerStateChange = (event) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      setLastPanX(panX);
    }
  };

  // Zoom control functions
  const zoomIn = () => {
    const newScale = Math.min(scale * 1.5, 5);
    setScale(newScale);
    setLastScale(newScale);
  };

  const zoomOut = () => {
    const newScale = Math.max(scale / 1.5, 0.5);
    setScale(newScale);
    setLastScale(newScale);
  };

  const resetZoom = () => {
    setScale(1);
    setPanX(-200); // Reset to show latest data
    setLastScale(1);
    setLastPanX(-200);
  };

  return (
    <View style={{
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      padding: 15,
      marginBottom: 16,
      elevation: 2,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      height: 450,
    }}>
      {/* Chart Header with Zoom Controls */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, paddingHorizontal: 5 }}>
        <Text style={{ fontSize: 14, fontWeight: '600', color: '#0F172A', flex: 1, marginRight: 10 }}>
          {pair.symbol} (FX - {pair.symbol}) (Bid), 1 hour
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={resetZoom} style={styles.resetButton}>
            <Text style={styles.resetButtonText}>Reset</Text>
          </TouchableOpacity>
        </View>
      </View>

      <PanGestureHandler
        onGestureEvent={onPanGestureEvent}
        onHandlerStateChange={onPanHandlerStateChange}>
        <PinchGestureHandler
          onGestureEvent={onPinchGestureEvent}
          onHandlerStateChange={onPinchHandlerStateChange}>
          <View style={{ 
            flex: 1, 
            backgroundColor: '#FAFAFA', 
            borderRadius: 8, 
            padding: 15,
            position: 'relative',
            overflow: 'hidden'
          }}>
            
            {/* Horizontal Grid Lines */}
            {Array.from({ length: 9 }, (_, index) => (
              <View key={`grid-h-${index}`} style={{
                position: 'absolute',
                left: 15,
                right: 50,
                top: 15 + (index * (chartHeight / 8)),
                height: 1,
                backgroundColor: '#E5E7EB',
                opacity: 0.6
              }} />
            ))}
            
            {/* Vertical Grid Lines with zoom effect */}
            {Array.from({ length: Math.floor(8 * scale) }, (_, index) => (
              <View key={`grid-v-${index}`} style={{
                position: 'absolute',
                left: 15 + panX + (index * (width - 140) / 7 / scale),
                top: 15,
                bottom: 45,
                width: 1,
                backgroundColor: '#E5E7EB',
                opacity: 0.6
              }} />
            ))}

            {/* Y-axis Labels */}
            <View style={{ 
              position: 'absolute', 
              right: 10, 
              top: 15,
              height: chartHeight,
              justifyContent: 'space-between',
              width: 35
            }}>
              {Array.from({ length: 9 }, (_, index) => {
                const price = maxPrice - (index * priceRange / 8);
                return (
                  <Text key={index} style={{ fontSize: 10, color: '#6B7280', textAlign: 'right' }}>
                    {price ? price.toFixed(1) : ''}
                  </Text>
                );
              })}
            </View>

            {/* Current Price Dotted Line - Horizontal across entire chart */}
            <View style={{
              position: 'absolute',
              left: 15,
              right: 50,
              top: 15 + currentPricePosition,
              height: 1,
              zIndex: 10,
              flexDirection: 'row',
              alignItems: 'center'
            }}>
              {/* Create proper dotted line */}
              {Array.from({ length: 80 }, (_, index) => (
                <View key={index} style={{
                  width: 2,
                  height: 1,
                  backgroundColor: '#3B82F6',
                  marginRight: 3,
                  opacity: 0.8
                }} />
              ))}
            </View>

            {/* Floating Current Price Label */}
            <View style={{
              position: 'absolute',
              right: 55,
              top: 15 + currentPricePosition - 12,
              backgroundColor: '#3B82F6',
              paddingHorizontal: 6,
              paddingVertical: 3,
              borderRadius: 4,
              elevation: 3,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              zIndex: 15
            }}>
              <Text style={{ fontSize: 9, color: '#FFFFFF', fontWeight: '700' }}>
                {latestClose ? latestClose.toFixed(3) : '0.000'}
              </Text>
              <View style={{
                position: 'absolute',
                right: -4,
                top: '50%',
                marginTop: -2,
                width: 0,
                height: 0,
                borderLeftWidth: 4,
                borderLeftColor: '#3B82F6',
                borderTopWidth: 2,
                borderTopColor: 'transparent',
                borderBottomWidth: 2,
                borderBottomColor: 'transparent',
              }} />
            </View>

            {/* Chart Clipping Container */}
            <View style={{
              position: 'absolute',
              left: 15,
              right: 50,
              top: 15,
              height: chartHeight,
              overflow: 'hidden'
            }}>
              {/* Candlesticks Container with zoom and pan */}
              <View style={{ 
                position: 'absolute',
                left: panX,
                width: (width - 140) * scale,
                height: chartHeight,
                flexDirection: 'row',
                alignItems: 'flex-end'
              }}>
                {chartData.map((candle, index) => {
                  const highPos = ((maxPrice - candle.high) / priceRange) * chartHeight;
                  const lowPos = ((maxPrice - candle.low) / priceRange) * chartHeight;
                  const openPos = ((maxPrice - candle.open) / priceRange) * chartHeight;
                  const closePos = ((maxPrice - candle.close) / priceRange) * chartHeight;
                  
                  const bodyTop = Math.min(openPos, closePos);
                  const bodyHeight = Math.abs(openPos - closePos);
                  const isGreen = candle.close >= candle.open;
                  
                  return (
                    <View key={index} style={{ 
                      width: Math.max(8, (width - 140) / chartData.length),
                      height: chartHeight,
                      alignItems: 'center',
                      position: 'relative'
                    }}>
                      {/* High-Low Wick */}
                      <View style={{
                        position: 'absolute',
                        top: highPos,
                        width: 1,
                        height: Math.max(lowPos - highPos, 1),
                        backgroundColor: isGreen ? '#10B981' : '#EF4444',
                      }} />
                      
                      {/* Open-Close Body */}
                      <View style={{
                        position: 'absolute',
                        top: bodyTop,
                        width: Math.max(3, 6 / scale),
                        height: Math.max(bodyHeight, 2),
                        backgroundColor: isGreen ? '#10B981' : '#EF4444',
                        borderWidth: isGreen && bodyHeight < 2 ? 1 : 0,
                        borderColor: '#10B981'
                      }} />
                    </View>
                  );
                })}
              </View>
            </View>

            {/* X-axis Time Labels */}
            <View style={{ 
              position: 'absolute',
              bottom: 20,
              left: 15,
              right: 50,
              flexDirection: 'row',
              justifyContent: 'space-between'
            }}>
              <Text style={{ fontSize: 9, color: '#6B7280' }}>20</Text>
              <Text style={{ fontSize: 9, color: '#6B7280' }}>19</Text>
              <Text style={{ fontSize: 9, color: '#6B7280' }}>15</Text>
              <Text style={{ fontSize: 9, color: '#6B7280' }}>12</Text>
              <Text style={{ fontSize: 9, color: '#6B7280' }}>10</Text>
              <Text style={{ fontSize: 9, color: '#6B7280' }}>06</Text>
              <Text style={{ fontSize: 9, color: '#6B7280' }}>21</Text>
            </View>
            
            {/* Date Label */}
            <View style={{ 
              position: 'absolute',
              bottom: 5,
              left: 0,
              right: 0,
              alignItems: 'center'
            }}>
              <Text style={{ fontSize: 8, color: '#9CA3AF' }}>Aug\11\25</Text>
            </View>

            {/* Zoom Level Indicator */}
            <View style={{
              position: 'absolute',
              top: 10,
              right: 10,
              backgroundColor: 'rgba(0,0,0,0.7)',
              paddingHorizontal: 6,
              paddingVertical: 2,
              borderRadius: 10
            }}>
              <Text style={{ fontSize: 8, color: '#FFFFFF', fontWeight: '600' }}>
                {scale ? scale.toFixed(1) : '1.0'}x
              </Text>
            </View>
          </View>
        </PinchGestureHandler>
      </PanGestureHandler>
    </View>
  );
};

// Updated Detail Screen Component
const ForexDetailScreen = ({ route, navigation }) => {
  const { pair } = route.params;
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <StatusBar style="dark" />
      
      {/* Simple Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
      }}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={{
            width: 40,
            height: 40,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Text style={{ fontSize: 24, color: '#3B82F6' }}>‹</Text>
        </TouchableOpacity>
        
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={{ fontSize: 20, fontWeight: '700', color: '#0F172A' }}>
            {pair.symbol}
          </Text>
        </View>
        
        <TouchableOpacity style={{
          width: 40,
          height: 40,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <Text style={{ fontSize: 18, color: '#3B82F6' }}>⚙</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={{ flex: 1, padding: 20 }}>
        {/* Price Section */}
        <View style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 16,
          padding: 20,
          marginBottom: 16,
          elevation: 2,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#0F172A' }}>
              Overview
            </Text>
            <Text style={{ fontSize: 16, fontWeight: '500', color: '#94A3B8' }}>
              Statistics
            </Text>
          </View>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 48, fontWeight: '800', color: '#EF4444' }}>
                {pair.bid}
              </Text>
              <Text style={{ fontSize: 16, color: '#EF4444', marginTop: 4 }}>
                {pair.change >= 0 ? '+' : ''}{(pair.change || 0).toFixed(3)} %
              </Text>
            </View>
            
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 48, fontWeight: '800', color: '#0F172A' }}>
                {pair.ask}
              </Text>
              <Text style={{ fontSize: 16, color: '#EF4444', marginTop: 4 }}>
                {pair.changePercent >= 0 ? '+' : ''}{(pair.changePercent || 0).toFixed(2)} %
              </Text>
            </View>
          </View>
        </View>

        {/* Chart Section */}
        <DetailChart pair={pair} />

        {/* 52-Week Range */}
        <View style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 16,
          padding: 20,
          marginBottom: 16,
          elevation: 2,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#0F172A', marginBottom: 16 }}>
            52-Week Range
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontSize: 14, color: '#94A3B8' }}>Low:</Text>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#0F172A' }}>{pair.fifty_two_week?.low?.toFixed(5)}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontSize: 14, color: '#94A3B8' }}>High:</Text>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#0F172A' }}>{pair.fifty_two_week?.high?.toFixed(5)}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 14, color: '#94A3B8' }}>Range:</Text>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#0F172A' }}>{pair.fifty_two_week?.range}</Text>
          </View>
        </View>

        {/* Trading Data */}
        <View style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 16,
          padding: 20,
          marginBottom: 16,
          elevation: 2,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#0F172A', marginBottom: 16 }}>
            Trading Data
          </Text>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={{ fontSize: 14, color: '#94A3B8' }}>High:</Text>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#0F172A' }}>{pair.high}</Text>
          </View>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={{ fontSize: 14, color: '#94A3B8' }}>Low:</Text>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#0F172A' }}>{pair.low}</Text>
          </View>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={{ fontSize: 14, color: '#94A3B8' }}>Open:</Text>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#0F172A' }}>{(parseFloat(pair.price || 0) - parseFloat(pair.change || 0)).toFixed(3)}</Text>
          </View>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 14, color: '#94A3B8' }}>Close:</Text>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#0F172A' }}>{pair.price}</Text>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
            <Text style={{ fontSize: 14, color: '#94A3B8' }}>Volume:</Text>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#0F172A' }}>{pair.volume ? pair.volume.toLocaleString() : ''}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const { width } = Dimensions.get('window');

const getThemeColors = (isDark) => ({
  background: {
    primary: '#FFFFFF', // Fixed solid white background
    secondary: '#F8FAFC', // Light gray background
    card: '#FFFFFF', // Pure white cards
    cardGradient: ['#FFFFFF', '#F8FAFC'],
    overlay: 'rgba(248, 250, 252, 0.8)', // Light overlay
  },
  text: {
    primary: '#0F172A', // Dark text
    secondary: '#475569', // Medium gray text
    tertiary: '#94A3B8', // Light gray text
    accent: '#0EA5E9', // Blue accent text
  },
  accent: {
    primary: '#00D4AA', // Teal green
    primaryGradient: ['#00D4AA', '#00E5B8'],
    secondary: '#3B82F6', // Blue
    secondaryGradient: ['#3B82F6', '#60A5FA'],
    danger: '#EF4444', // Red
    dangerGradient: ['#EF4444', '#F87171'],
    warning: '#F59E0B', // Orange
    success: '#10B981', // Green
  },
  border: 'rgba(226, 232, 240, 0.8)', // Light border
  borderAccent: 'rgba(14, 165, 233, 0.3)', // Blue accent border
  shadow: 'rgba(15, 23, 42, 0.08)', // Light shadow
  shadowAccent: 'rgba(0, 212, 170, 0.12)', // Teal shadow
  chart: {
    bullish: '#00D4AA', // Green for up
    bearish: '#EF4444', // Red for down
    bullishGradient: ['#00D4AA', '#34D399'],
    bearishGradient: ['#EF4444', '#F87171'],
  },
});

const BigMoverItem = ({ symbol, name, percentage = 0, isPositive, colors, priceChange }) => {
  const [prevPercentage, setPrevPercentage] = useState(percentage);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Animation refs
  const flashAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  // Improved height calculation with better scaling
  const maxHeight = 100;
  const minHeight = 20;
  const normalizedPercentage = Math.abs(percentage);
  const barHeight = Math.max(minHeight, Math.min((normalizedPercentage / 5) * maxHeight, maxHeight));
  
  // Trigger animations when percentage changes
  useEffect(() => {
    if (percentage !== prevPercentage && prevPercentage !== 0) {
      setIsAnimating(true);
      setPrevPercentage(percentage);
      
      // Flash animation
      Animated.sequence([
        Animated.timing(flashAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.timing(flashAnim, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: false,
        })
      ]).start(() => setIsAnimating(false));
      
      // Scale animation
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [percentage, prevPercentage]);
  
  // Dynamic background color for flash effect
  const flashBackgroundColor = flashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(0,0,0,0)', (isPositive ? colors.chart.bullish : colors.chart.bearish) + '15']
  });
  
  return (
    <Animated.View style={{transform: [{ scale: scaleAnim }]}}>
      <TouchableOpacity style={[styles.bigMoverCard, {
        backgroundColor: colors.background.card,
        borderColor: colors.border.secondary,
        shadowColor: colors.shadowAccent,
      }]}>
        <Animated.View style={[
          styles.flashOverlay,
          { backgroundColor: flashBackgroundColor }
        ]} />
        
        {/* Top Section - Percentage */}
        <View style={styles.moverTopSection}>
          <Animatable.Text 
            style={[styles.bigMoverPercentage, { 
              color: isPositive ? colors.chart.bullish : colors.chart.bearish 
            }]}
            animation={isAnimating ? 'pulse' : null}
            duration={600}>
            {isPositive ? '+' : ''}{(percentage || 0).toFixed(1)}%
          </Animatable.Text>
          <View style={[styles.trendIcon, {
            backgroundColor: isPositive ? colors.chart.bullish + '20' : colors.chart.bearish + '20'
          }]}>
            <Text style={[styles.trendIconText, {
              color: isPositive ? colors.chart.bullish : colors.chart.bearish
            }]}>
              {isPositive ? '↗' : '↘'}
            </Text>
          </View>
        </View>
        
        {/* Middle Section - Bar Chart */}
        <View style={styles.barSection}>
          <View style={styles.barContainer}>
            <Animatable.View 
              style={[
                styles.modernBar,
                {
                  height: barHeight,
                  backgroundColor: isPositive ? colors.chart.bullish : colors.chart.bearish,
                }
              ]}
              animation={isAnimating ? 'bounceIn' : null}
              duration={800}>
              {/* Gradient overlay */}
              <View style={[styles.barGradient, {
                backgroundColor: isPositive ? colors.chart.bullish + '80' : colors.chart.bearish + '80',
              }]} />
            </Animatable.View>
            <View style={[styles.modernBarBase, { backgroundColor: colors.border.primary }]} />
          </View>
        </View>
        
        {/* Bottom Section - Symbol */}
        <View style={styles.moverBottomSection}>
          <View style={[styles.symbolContainer, { 
            backgroundColor: colors.background.secondary,
            borderColor: colors.border.primary,
          }]}>
            <Text style={[styles.bigMoverSymbol, { color: colors.text.primary }]}>
              {symbol.split('/')[0]}
            </Text>
            <Text style={[styles.symbolSeparator, { color: colors.text.tertiary }]}>
              /
            </Text>
            <Text style={[styles.bigMoverSymbol, { color: colors.text.secondary }]}>
              {symbol.split('/')[1]}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const ForexPairCard = ({ symbol, name, price, change, changePercent, spread, bid, ask, high, low, volume, colors, onPress, navigation }) => {
  const isPositive = (change || 0) >= 0;
  const changeColor = isPositive ? colors.chart.bullish : colors.chart.bearish;
  
  // Generate mini chart data points with smoother curves
  const chartPoints = Array.from({ length: 15 }, (_, i) => 
    Math.sin(i * 0.35) * (isPositive ? 1 : -1) + Math.random() * 0.25
  );
  
  return (
    <TouchableOpacity 
      style={[styles.pairCard, { 
        shadowColor: colors.shadowAccent,
        borderColor: colors.borderAccent,
      }]} 
      onPress={onPress}>
      
      {/* Gradient Background */}
      <View style={[styles.cardGradient, { backgroundColor: colors.background.card }]}>
        
        {/* Main Row */}
        <View style={styles.pairMainRow}>
          <View style={styles.pairLeft}>
            <View style={styles.pairSymbolContainer}>
              <View style={[styles.modernCurrencyIcon, { 
                backgroundColor: colors.accent.primary,
                shadowColor: colors.accent.primary,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 3,
              }]}>
                <Text style={styles.currencyIconText}>{symbol.substring(0, 3)}</Text>
              </View>
              <View style={styles.pairTextContainer}>
                <Text style={[styles.modernPairSymbol, { color: colors.text.primary }]}>{symbol}</Text>
                <Text style={[styles.modernPairName, { color: colors.text.tertiary }]}>{name}</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.pairCenter}>
            <View style={[styles.modernMiniChart, { backgroundColor: colors.background.overlay }]}>
              {chartPoints.map((point, index) => (
                <View
                  key={index}
                  style={[
                    styles.modernChartBar,
                    {
                      height: Math.abs(point) * 12 + 4,
                      backgroundColor: changeColor,
                      opacity: 0.5 + (index / chartPoints.length) * 0.5,
                      shadowColor: changeColor,
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.2,
                      shadowRadius: 1,
                    }
                  ]}
                />
              ))}
            </View>
          </View>
          
          <View style={styles.pairRight}>
            <Text style={[styles.modernPrice, { color: colors.text.primary }]}>{price || ''}</Text>
            <View style={[styles.modernChangeContainer, { 
              backgroundColor: changeColor + '15',
              borderColor: changeColor + '30',
            }]}>
              <Text style={[styles.modernChange, { color: changeColor }]}>
                {isPositive ? '+' : ''}{(change || 0).toFixed(4)}
              </Text>
              <Text style={[styles.modernChangePercent, { color: changeColor }]}>
                ({isPositive ? '+' : ''}{(changePercent || 0).toFixed(2)}%)
              </Text>
            </View>
          </View>
        </View>
        
        {/* Modern Separator */}
        <View style={[styles.modernSeparator, { backgroundColor: colors.border }]} />
        
        {/* Trading Data Row */}
        <View style={styles.modernTradingDataRow}>
          <View style={styles.modernDataItem}>
            <Text style={[styles.modernDataLabel, { color: colors.text.tertiary }]}>BID</Text>
            <Text style={[styles.modernDataValue, { color: colors.chart.bearish }]}>{bid || ''}</Text>
          </View>
          
          <View style={styles.modernDataItem}>
            <Text style={[styles.modernDataLabel, { color: colors.text.tertiary }]}>ASK</Text>
            <Text style={[styles.modernDataValue, { color: colors.chart.bullish }]}>{ask || ''}</Text>
          </View>
          
          <View style={styles.modernDataItem}>
            <Text style={[styles.modernDataLabel, { color: colors.text.tertiary }]}>HIGH</Text>
            <Text style={[styles.modernDataValue, { color: colors.text.secondary }]}>{high || ''}</Text>
          </View>
          
          <View style={styles.modernDataItem}>
            <Text style={[styles.modernDataLabel, { color: colors.text.tertiary }]}>LOW</Text>
            <Text style={[styles.modernDataValue, { color: colors.text.secondary }]}>{low || ''}</Text>
          </View>
          
          <View style={styles.modernDataItem}>
            <Text style={[styles.modernDataLabel, { color: colors.text.tertiary }]}>VOL</Text>
            <Text style={[styles.modernDataValue, { color: colors.text.accent }]}>{volume || ''}</Text>
          </View>
        </View>
        
        {/* Modern Spread Badge */}
        {spread !== undefined && spread !== null && (
          <View style={[styles.modernSpreadBadge, { 
            backgroundColor: colors.accent.primary,
            shadowColor: colors.accent.primary,
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.3,
            shadowRadius: 2,
          }]}>
            <Text style={styles.modernSpreadText}>{spread}</Text>
          </View>
        )}
        
      </View>
    </TouchableOpacity>
  );
};

const Stack = createStackNavigator();

function HomeScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  // FIXED: Light mode only - no more dark mode issues
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const colors = getThemeColors(isDarkMode);
  
  const DUMMY_PAIRS = useMemo(() => [
    { symbol: 'EUR/USD', name: 'Euro / US Dollar' },
    { symbol: 'GBP/USD', name: 'British Pound / US Dollar' },
    { symbol: 'USD/JPY', name: 'US Dollar / Japanese Yen' },
    { symbol: 'USD/CHF', name: 'US Dollar / Swiss Franc' },
    { symbol: 'AUD/USD', name: 'Australian Dollar / US Dollar' },
    { symbol: 'USD/CAD', name: 'US Dollar / Canadian Dollar' },
    { symbol: 'NZD/USD', name: 'New Zealand Dollar / US Dollar' },
    { symbol: 'EUR/GBP', name: 'Euro / British Pound' },
    { symbol: 'EUR/JPY', name: 'Euro / Japanese Yen' },
    { symbol: 'GBP/JPY', name: 'British Pound / Japanese Yen' },
    { symbol: 'XAU/USD', name: 'Gold / US Dollar' },
    { symbol: 'XAG/USD', name: 'Silver / US Dollar' },
  ], []);

  const { dataArray: forexData, loading, error, priceChanges, isConnected } = useRealTimeForex(DUMMY_PAIRS, {
    autoStart: true,
    enableAnimations: true,
  });

  const filteredData = forexData.filter(pair =>
    pair.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pair.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get top 5 movers for the Big Movers section
  const bigMovers = [...forexData]
    .sort((a, b) => Math.abs(b.changePercent || 0) - Math.abs(a.changePercent || 0))
    .slice(0, 5);

  // Calculate dynamic market statistics
  const marketStats = useMemo(() => {
    const totalInstruments = forexData.length;
    const rising = forexData.filter(pair => (pair.changePercent || 0) > 0).length;
    const falling = forexData.filter(pair => (pair.changePercent || 0) < 0).length;
    const unchanged = forexData.filter(pair => (pair.changePercent || 0) === 0).length;
    
    return {
      totalInstruments,
      rising,
      falling,
      unchanged
    };
  }, [forexData]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <StatusBar style="dark" backgroundColor={colors.background.primary} />
      
      {/* Fixed Header - Always at top */}
      <View style={[styles.modernHeader, { backgroundColor: colors.background.card }]}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Text style={[styles.modernLogo, { color: colors.text.primary }]}>Grover</Text>
            <View style={[styles.modernSubtitle, { backgroundColor: colors.accent.primary }]}>
              <Text style={styles.modernSubtitleText}>PRO</Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={[styles.modernHeaderButton, { 
              backgroundColor: colors.background.overlay,
              borderColor: colors.borderAccent,
            }]}>
              <Text style={[styles.modernHeaderButtonText, { color: colors.text.accent }]}>⚙</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Modern Search Bar */}
        <View style={[styles.modernSearchContainer, { 
          backgroundColor: colors.background.overlay,
          borderColor: colors.borderAccent,
          shadowColor: colors.shadowAccent,
        }]}>
          <View style={[styles.searchIconContainer, { backgroundColor: colors.accent.primary }]}>
            <Text style={styles.modernSearchIcon}>⌕</Text>
          </View>
          <TextInput
            style={[styles.modernSearchInput, { color: colors.text.primary }]}
            placeholder="Search forex pairs..."
            placeholderTextColor={colors.text.tertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity 
              style={styles.clearSearchButton}
              onPress={() => setSearchQuery('')}>
              <Text style={[styles.clearSearchText, { color: colors.text.tertiary }]}>×</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Normal Scrollable Content - No Sticky Headers */}
      <ScrollView 
        style={styles.mainScrollView}
        showsVerticalScrollIndicator={false}>
        
        {/* Big Movers Section */}
        <View style={[styles.modernBigMoversCard, { 
          backgroundColor: colors.background.card,
          shadowColor: colors.shadowAccent,
          borderColor: colors.borderAccent,
        }]}>
          <View style={styles.modernSectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Text style={[styles.modernSectionTitle, { color: colors.text.primary }]}>
                Big Movers
              </Text>
              <View style={[styles.trendBadge, { backgroundColor: colors.accent.primary }]}>
                <Text style={styles.trendBadgeText}>LIVE</Text>
              </View>
            </View>
            <TouchableOpacity style={[styles.modernInfoButton, { 
              backgroundColor: colors.background.overlay,
              borderColor: colors.borderAccent,
            }]}>
              <Text style={[styles.modernInfoButtonText, { color: colors.text.accent }]}>?</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.modernBigMoversContainer}
            style={styles.bigMoversScrollView}>
            {bigMovers.map((mover, index) => (
              <BigMoverItem
                key={mover.symbol}
                symbol={mover.symbol}
                name={mover.name}
                percentage={mover.changePercent || mover.percent_change || 0}
                isPositive={(mover.changePercent || mover.percent_change || 0) >= 0}
                priceChange={priceChanges[mover.symbol]}
                colors={colors}
              />
            ))}
          </ScrollView>
        </View>

        {/* Market Stats */}
        <View style={[styles.modernMarketStats, { 
          backgroundColor: colors.background.card,
          shadowColor: colors.shadowAccent,
          borderColor: colors.borderAccent,
        }]}>
          <View style={[styles.modernStatItem, { borderRightColor: colors.border }]}>
            <Animatable.Text 
              style={[styles.modernStatValue, { color: colors.text.primary }]}
              animation="fadeIn"
              duration={1000}
              key={marketStats.totalInstruments}>
              {marketStats.totalInstruments}
            </Animatable.Text>
            <Text style={[styles.modernStatLabel, { color: colors.text.tertiary }]}>Instruments</Text>
            <View style={[styles.statIndicator, { backgroundColor: colors.accent.primary }]} />
          </View>
          
          <View style={[styles.modernStatItem, { borderRightColor: colors.border }]}>
            <Animatable.Text 
              style={[styles.modernStatValue, { color: colors.chart.bullish }]}
              animation="pulse"
              duration={800}
              key={marketStats.rising}>
              {marketStats.rising}
            </Animatable.Text>
            <Text style={[styles.modernStatLabel, { color: colors.text.tertiary }]}>Rising</Text>
            <Animatable.View 
              style={[styles.statIndicator, { backgroundColor: colors.chart.bullish }]}
              animation="pulse"
              duration={1200}
              iterationCount="infinite" />
          </View>
          
          <View style={[styles.modernStatItem, { borderRightColor: colors.border }]}>
            <Animatable.Text 
              style={[styles.modernStatValue, { color: colors.chart.bearish }]}
              animation="pulse"
              duration={800}
              key={marketStats.falling}>
              {marketStats.falling}
            </Animatable.Text>
            <Text style={[styles.modernStatLabel, { color: colors.text.tertiary }]}>Falling</Text>
            <Animatable.View 
              style={[styles.statIndicator, { backgroundColor: colors.chart.bearish }]}
              animation="pulse"
              duration={1200}
              iterationCount="infinite" />
          </View>
          
          <View style={styles.modernStatItem}>
            <Animatable.Text 
              style={[styles.modernStatValue, { color: colors.text.secondary }]}
              animation="fadeIn"
              duration={1000}
              key={marketStats.unchanged}>
              {marketStats.unchanged}
            </Animatable.Text>
            <Text style={[styles.modernStatLabel, { color: colors.text.tertiary }]}>Unchanged</Text>
            <View style={[styles.statIndicator, { backgroundColor: colors.text.tertiary }]} />
          </View>
        </View>

        {/* Forex Pairs Header */}
        <View style={[styles.scrollableForexHeader, { 
          backgroundColor: colors.background.primary,
        }]}>
          <View style={styles.modernSectionHeader}>
            <Text style={[styles.modernSectionTitle, { color: colors.text.primary }]}>
              All Forex Pairs
            </Text>
            <View style={[styles.trendBadge, { backgroundColor: colors.accent.secondary }]}>
              <Text style={styles.trendBadgeText}>REAL-TIME</Text>
            </View>
          </View>
        </View>

        {/* Forex Pairs List */}
        {filteredData.map((pair, index) => (
          <ForexPairCard
            key={pair.symbol}
            symbol={pair.symbol}
            name={pair.name}
            price={pair.price ? pair.price.toFixed(pair.symbol.includes('JPY') ? 3 : 5) : ''}
            change={pair.change}
            changePercent={pair.percent_change}
            spread={pair.spread}
            bid={pair.bid ? pair.bid.toFixed(pair.symbol.includes('JPY') ? 3 : 5) : ''}
            ask={pair.ask ? pair.ask.toFixed(pair.symbol.includes('JPY') ? 3 : 5) : ''}
            high={pair.high ? pair.high.toFixed(pair.symbol.includes('JPY') ? 3 : 5) : ''}
            low={pair.low ? pair.low.toFixed(pair.symbol.includes('JPY') ? 3 : 5) : ''}
            volume={pair.volume ? pair.volume.toLocaleString() : ''}
            colors={colors}
            navigation={navigation}
            onPress={() => navigation.navigate('ForexDetail', { pair })}
          />
        ))}
        
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.text.tertiary }]}>
            Live market data • Real-time prices
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  // Modern Header Styles
  modernHeader: {
    paddingTop: 15,
    paddingBottom: 20,
    borderBottomWidth: 0,
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modernLogo: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -1.5,
    marginRight: 12,
  },
  modernSubtitle: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  modernSubtitleText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modernHeaderButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  modernHeaderButtonText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 2,
  },
  modernSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    borderRadius: 20,
    height: 56,
    borderWidth: 1,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    paddingHorizontal: 4,
  },
  searchIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  modernSearchIcon: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  modernSearchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    paddingVertical: 12,
  },
  clearSearchButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  clearSearchText: {
    fontSize: 20,
    fontWeight: '300',
  },
  // Main Scroll View
  mainScrollView: {
    flex: 1,
  },
  
  // Scrollable Forex Header - In content
  scrollableForexHeader: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginTop: 8,
  },
  
  // Modern Big Movers Styles
  modernBigMoversCard: {
    marginHorizontal: 20,
    marginVertical: 16,
    borderRadius: 24,
    paddingVertical: 24,
    borderWidth: 1,
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },
  modernSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modernSectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginRight: 12,
    letterSpacing: -0.5,
  },
  trendBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    elevation: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  trendBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  modernInfoButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  modernInfoButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  bigMoversScrollView: {
    paddingHorizontal: 15,
  },
  modernBigMoversContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  bigMoverCard: {
    width: 120,
    height: 180,
    marginHorizontal: 8,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    elevation: 6,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    position: 'relative',
    justifyContent: 'space-between',
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
  moverTopSection: {
    alignItems: 'center',
    marginBottom: 8,
  },
  bigMoverPercentage: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  trendIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendIconText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  barSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 12,
  },
  barContainer: {
    height: 120,
    width: 40,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modernBar: {
    width: 40,
    borderRadius: 20,
    marginBottom: 6,
    position: 'relative',
    overflow: 'hidden',
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  barGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '30%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modernBarBase: {
    width: 40,
    height: 6,
    borderRadius: 3,
    opacity: 0.3,
  },
  moverBottomSection: {
    alignItems: 'center',
  },
  symbolContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  bigMoverSymbol: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  symbolSeparator: {
    fontSize: 12,
    fontWeight: '400',
    marginHorizontal: 2,
  },
  // Modern Market Stats Styles
  modernMarketStats: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginVertical: 12,
    borderRadius: 20,
    paddingVertical: 20,
    borderWidth: 1,
    elevation: 6,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  modernStatItem: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
    borderRightWidth: 1,
    paddingVertical: 4,
  },
  modernStatValue: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  modernStatLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '600',
  },
  statIndicator: {
    position: 'absolute',
    bottom: -8,
    width: 16,
    height: 3,
    borderRadius: 1.5,
  },
  allPairsSection: {
    paddingBottom: 20,
  },
  
  // Modern Forex Pair Card Styles
  pairCard: {
    marginHorizontal: 20,
    marginVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    elevation: 6,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  cardGradient: {
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  pairMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  pairLeft: {
    flex: 1.4,
  },
  pairSymbolContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modernCurrencyIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  currencyIconText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  pairTextContainer: {
    flex: 1,
  },
  modernPairSymbol: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 3,
    letterSpacing: -0.3,
  },
  modernPairName: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  pairCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  modernMiniChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 32,
    width: 70,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  modernChartBar: {
    width: 3,
    marginHorizontal: 0.8,
    borderRadius: 1.5,
  },
  pairRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  modernPrice: {
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  modernChangeContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  modernChange: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  modernChangePercent: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
    letterSpacing: 0.1,
  },
  // Modern Separator
  modernSeparator: {
    height: 1,
    marginVertical: 12,
    opacity: 0.3,
  },
  
  // Modern Trading Data Styles
  modernTradingDataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
  },
  modernDataItem: {
    alignItems: 'center',
    flex: 1,
  },
  modernDataLabel: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 4,
    letterSpacing: 1.2,
  },
  modernDataValue: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  modernSpreadBadge: {
    position: 'absolute',
    top: -12,
    right: 12,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    elevation: 2,
  },
  modernSpreadText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  
  // Section Title (used in All Forex Pairs)
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  
  // Footer
  footer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  
  // Zoom Control Styles
  zoomButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  zoomButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  resetButton: {
    paddingHorizontal: 8,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#6B7280',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '600',
  },
});

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#FFFFFF' },
          presentation: 'card',
          animationTypeForReplace: 'push',
        }}>
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ 
            title: 'Grover Forex',
            presentation: 'card',
          }}
        />
        <Stack.Screen 
          name="ForexDetail" 
          component={ForexDetailScreen}
          options={{ 
            title: 'Forex Detail',
            presentation: 'card',
            animationTypeForReplace: 'push',
            cardStyleInterpolator: ({ current, layouts }) => {
              return {
                cardStyle: {
                  transform: [
                    {
                      translateX: current.progress.interpolate({
                        inputRange: [0, 1],
                        outputRange: [layouts.screen.width, 0],
                      }),
                    },
                  ],
                },
              };
            },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}