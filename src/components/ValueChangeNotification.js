import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import * as Animatable from 'react-native-animatable';

import { colors } from '../constants/colors';

const { width } = Dimensions.get('window');

const ValueChangeNotification = ({
  visible = false,
  value,
  change,
  changePercent,
  duration = 3000,
  onHide,
}) => {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  const isPositive = change >= 0;
  const changeColor = isPositive ? colors.chart.bullish : colors.chart.bearish;
  const gradientColors = isPositive ? colors.gradient.success : colors.gradient.danger;

  useEffect(() => {
    if (visible) {
      // Slide in animation
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 120,
          friction: 7,
          useNativeDriver: true,
        })
      ]).start();

      // Auto hide after duration
      const hideTimer = setTimeout(() => {
        hideNotification();
      }, duration);

      return () => clearTimeout(hideTimer);
    } else {
      hideNotification();
    }
  }, [visible, duration]);

  const hideNotification = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 250,
        useNativeDriver: true,
      })
    ]).start(() => {
      if (onHide) onHide();
    });
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim }
          ],
          opacity: fadeAnim,
        }
      ]}
    >
      <LinearGradient
        colors={gradientColors}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.content}>
          {/* Icon */}
          <Animatable.View
            animation="pulse"
            iterationCount="infinite"
            duration={1500}
            style={[styles.iconContainer, { backgroundColor: changeColor + '30' }]}
          >
            <Icon
              name={isPositive ? 'trending-up' : 'trending-down'}
              size={24}
              color={colors.text.primary}
            />
          </Animatable.View>

          {/* Content */}
          <View style={styles.textContainer}>
            <Text style={styles.title}>Portfolio Update</Text>
            <Text style={styles.value}>
              ${value.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
            <View style={styles.changeContainer}>
              <Text style={[styles.change, { color: changeColor }]}>
                {isPositive ? '+' : ''}${Math.abs(change).toFixed(2)}
              </Text>
              <Text style={[styles.changePercent, { color: changeColor }]}>
                ({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)
              </Text>
            </View>
          </View>

          {/* Progress bar */}
          <View style={styles.progressContainer}>
            <Animatable.View
              animation="fadeInRight"
              duration={2000}
              style={[
                styles.progressBar,
                {
                  width: `${Math.min(Math.abs(changePercent) * 20, 100)}%`,
                  backgroundColor: changeColor,
                }
              ]}
            />
          </View>
        </View>

        {/* Floating particles effect */}
        <Animatable.View
          animation="fadeInUp"
          delay={300}
          style={styles.particlesContainer}
        >
          {[...Array(5)].map((_, index) => (
            <Animatable.View
              key={index}
              animation="pulse"
              delay={index * 200}
              iterationCount="infinite"
              style={[
                styles.particle,
                {
                  left: `${20 + index * 15}%`,
                  backgroundColor: changeColor,
                  opacity: 0.6 - index * 0.1,
                }
              ]}
            />
          ))}
        </Animatable.View>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    zIndex: 1000,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 15,
    shadowColor: colors.accent.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  gradient: {
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border.secondary,
    borderRadius: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: colors.text.primary + '20',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '500',
    marginBottom: 2,
  },
  value: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 4,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  change: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  changePercent: {
    fontSize: 12,
    fontWeight: '500',
  },
  progressContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: colors.background.secondary,
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 1.5,
  },
  particlesContainer: {
    position: 'absolute',
    top: -5,
    left: 0,
    right: 0,
    height: 10,
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});

export default ValueChangeNotification;
