import React, { useEffect, useRef, useState } from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Animated} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import * as Animatable from 'react-native-animatable';

import {colors} from '../constants/colors';

const PortfolioSummary = ({
  value,
  change,
  changePercent,
  onPress,
  style,
  valueChanged = false, // New prop to indicate value change
}) => {
  // Animation values
  const valueFlashAnim = useRef(new Animated.Value(0)).current;
  const changeFlashAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [isAnimating, setIsAnimating] = useState(false);
  const [lastValue, setLastValue] = useState(value);
  const [lastChange, setLastChange] = useState(change);
  const isPositive = change >= 0;
  const changeColor = isPositive ? colors.chart.bullish : colors.chart.bearish;
  
  // Trigger animations when values change
  useEffect(() => {
    if (value !== lastValue || change !== lastChange) {
      setIsAnimating(true);
      setLastValue(value);
      setLastChange(change);
      
      // Flash animation for value
      if (value !== lastValue) {
        Animated.sequence([
          Animated.timing(valueFlashAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: false,
          }),
          Animated.timing(valueFlashAnim, {
            toValue: 0,
            duration: 1200,
            useNativeDriver: false,
          })
        ]).start();
      }
      
      // Flash animation for change
      if (change !== lastChange) {
        Animated.sequence([
          Animated.timing(changeFlashAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: false,
          }),
          Animated.timing(changeFlashAnim, {
            toValue: 0,
            duration: 1200,
            useNativeDriver: false,
          })
        ]).start();
      }
      
      // Glow animation
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: false,
        })
      ]).start();
      
      // Pulse animation
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start(() => setIsAnimating(false));
    }
  }, [value, change, lastValue, lastChange]);
  
  // Dynamic background colors for flash effects
  const valueFlashColor = valueFlashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(0,0,0,0)', colors.accent.primary + '20']
  });
  
  const changeFlashColor = changeFlashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(0,0,0,0)', changeColor + '20']
  });
  
  // Dynamic glow effect
  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.6]
  });

  return (
    <Animatable.View
      animation="fadeInUp"
      style={[styles.container, style]}>
      <Animated.View style={{
        transform: [{ scale: pulseAnim }],
        shadowColor: changeColor,
        shadowOpacity: glowOpacity,
        shadowRadius: 25,
        elevation: isAnimating ? 20 : 12,
      }}>
        <TouchableOpacity
          onPress={onPress}
          disabled={!onPress}
          style={styles.card}>
        <LinearGradient
          colors={colors.gradient.card}
          style={styles.gradient}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}>
          
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Portfolio Value</Text>
              <View style={styles.userAvatar}>
                <Text style={styles.avatarText}>U</Text>
              </View>
            </View>
          </View>

          {/* Value */}
          <View style={styles.valueContainer}>
            <Animated.View style={[
              styles.valueWrapper,
              {
                backgroundColor: valueFlashColor,
                borderRadius: 12,
                paddingHorizontal: isAnimating ? 12 : 0,
                paddingVertical: isAnimating ? 6 : 0,
              }
            ]}>
              <Animatable.Text 
                style={[
                  styles.value,
                  isAnimating && { color: colors.accent.primary }
                ]}
                animation={isAnimating ? 'pulse' : null}
                duration={800}>
                ${value.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Animatable.Text>
            </Animated.View>
          </View>

          {/* Change */}
          <View style={styles.changeContainer}>
            <Animated.View style={[
              styles.changeWrapper,
              {
                backgroundColor: changeFlashColor,
                borderRadius: 10,
                paddingHorizontal: isAnimating ? 12 : 0,
                paddingVertical: isAnimating ? 6 : 0,
                borderWidth: isAnimating ? 1 : 0,
                borderColor: changeColor + '40',
              }
            ]}>
              <Animatable.View
                style={styles.changeContent}
                animation={isAnimating ? 'bounceIn' : null}
                duration={600}>
                <Icon
                  name={isPositive ? 'trending-up' : 'trending-down'}
                  size={16}
                  color={changeColor}
                  style={styles.changeIcon}
                />
                <Text style={[styles.changeValue, {color: changeColor}]}>
                  {isPositive ? '+' : ''}${Math.abs(change).toFixed(2)} ({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)
                </Text>
              </Animatable.View>
            </Animated.View>
          </View>

          {/* Statistics */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Today's High</Text>
              <Text style={styles.statValue}>$54,125.67</Text>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Today's Low</Text>
              <Text style={styles.statValue}>$53,298.45</Text>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.actionButton}>
              <LinearGradient
                colors={colors.gradient.success}
                style={styles.actionButtonGradient}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}>
                <Icon name="plus" size={16} color={colors.text.primary} />
                <Text style={styles.actionButtonText}>Deposit</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <View style={styles.actionButtonSecondary}>
                <Icon name="bar-chart-2" size={16} color={colors.accent.primary} />
                <Text style={styles.actionButtonSecondaryText}>Analyze</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Performance Indicator */}
          <View style={styles.performanceContainer}>
            <View style={styles.performanceBar}>
              <View style={[
                styles.performanceProgress,
                {
                  width: `${Math.min(Math.abs(changePercent) * 10, 100)}%`,
                  backgroundColor: changeColor,
                }
              ]} />
            </View>
            <Text style={styles.performanceText}>
              {isPositive ? 'Performing well' : 'Market correction'}
            </Text>
          </View>

        </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 24,
    marginBottom: 32,
  },
  card: {
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 12,
    shadowColor: colors.accent.primary,
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },
  gradient: {
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border.secondary,
    borderRadius: 24,
  },
  header: {
    marginBottom: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  valueContainer: {
    marginBottom: 12,
    position: 'relative',
  },
  valueWrapper: {
    alignSelf: 'flex-start',
  },
  value: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  changeContainer: {
    marginBottom: 24,
  },
  changeWrapper: {
    alignSelf: 'flex-start',
  },
  changeContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeIcon: {
    marginRight: 6,
  },
  changeValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: colors.background.secondary,
    borderRadius: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.border.primary,
    marginHorizontal: 16,
  },
  statLabel: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  actionsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginLeft: 6,
  },
  actionButtonSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  actionButtonSecondaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent.primary,
    marginLeft: 6,
  },
  performanceContainer: {
    alignItems: 'center',
  },
  performanceBar: {
    width: '100%',
    height: 4,
    backgroundColor: colors.background.secondary,
    borderRadius: 2,
    marginBottom: 8,
    overflow: 'hidden',
  },
  performanceProgress: {
    height: '100%',
    borderRadius: 2,
  },
  performanceText: {
    fontSize: 12,
    color: colors.text.tertiary,
    fontWeight: '500',
  },
});

export default PortfolioSummary;
