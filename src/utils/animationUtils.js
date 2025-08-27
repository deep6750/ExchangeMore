import { Animated } from 'react-native';
import { colors } from '../constants/colors';

/**
 * Enhanced animation utilities for value changes and highlights
 */

export const AnimationUtils = {
  /**
   * Creates a flash animation for value changes
   * @param {Animated.Value} animValue - The animated value to use
   * @param {Object} options - Animation options
   */
  createFlashAnimation: (animValue, options = {}) => {
    const {
      duration = 1000,
      intensity = 1,
      useNativeDriver = false,
    } = options;

    return Animated.sequence([
      Animated.timing(animValue, {
        toValue: intensity,
        duration: duration * 0.2,
        useNativeDriver,
      }),
      Animated.timing(animValue, {
        toValue: 0,
        duration: duration * 0.8,
        useNativeDriver,
      })
    ]);
  },

  /**
   * Creates a glow animation effect
   * @param {Animated.Value} animValue - The animated value to use
   * @param {Object} options - Animation options
   */
  createGlowAnimation: (animValue, options = {}) => {
    const {
      duration = 1500,
      maxOpacity = 0.8,
      useNativeDriver = false,
    } = options;

    return Animated.sequence([
      Animated.timing(animValue, {
        toValue: maxOpacity,
        duration: duration * 0.3,
        useNativeDriver,
      }),
      Animated.timing(animValue, {
        toValue: 0,
        duration: duration * 0.7,
        useNativeDriver,
      })
    ]);
  },

  /**
   * Creates a scale pulse animation
   * @param {Animated.Value} animValue - The animated value to use
   * @param {Object} options - Animation options
   */
  createPulseAnimation: (animValue, options = {}) => {
    const {
      duration = 400,
      scale = 1.05,
      useNativeDriver = true,
    } = options;

    return Animated.sequence([
      Animated.timing(animValue, {
        toValue: scale,
        duration: duration * 0.4,
        useNativeDriver,
      }),
      Animated.timing(animValue, {
        toValue: 1,
        duration: duration * 0.6,
        useNativeDriver,
      })
    ]);
  },

  /**
   * Creates a bounce animation for new values
   * @param {Animated.Value} animValue - The animated value to use
   * @param {Object} options - Animation options
   */
  createBounceAnimation: (animValue, options = {}) => {
    const {
      duration = 600,
      damping = 8,
      useNativeDriver = true,
    } = options;

    return Animated.spring(animValue, {
      toValue: 1,
      damping,
      useNativeDriver,
    });
  },

  /**
   * Creates a slide-in animation for value changes
   * @param {Animated.Value} animValue - The animated value to use
   * @param {Object} options - Animation options
   */
  createSlideAnimation: (animValue, options = {}) => {
    const {
      duration = 300,
      fromValue = -50,
      toValue = 0,
      useNativeDriver = true,
    } = options;

    animValue.setValue(fromValue);
    return Animated.timing(animValue, {
      toValue,
      duration,
      useNativeDriver,
    });
  },

  /**
   * Creates a color transition animation
   * @param {Animated.Value} animValue - The animated value to use
   * @param {string} changeType - 'increase' or 'decrease'
   * @returns {string} - Interpolated color value
   */
  getColorTransition: (animValue, changeType = 'increase') => {
    const baseColor = changeType === 'increase' ? colors.chart.bullish : colors.chart.bearish;
    
    return animValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['rgba(0,0,0,0)', baseColor + '30']
    });
  },

  /**
   * Creates a shimmer effect for loading states
   * @param {Animated.Value} animValue - The animated value to use
   * @param {Object} options - Animation options
   */
  createShimmerAnimation: (animValue, options = {}) => {
    const {
      duration = 1500,
      useNativeDriver = true,
    } = options;

    return Animated.loop(
      Animated.sequence([
        Animated.timing(animValue, {
          toValue: 1,
          duration,
          useNativeDriver,
        }),
        Animated.timing(animValue, {
          toValue: 0,
          duration,
          useNativeDriver,
        })
      ])
    );
  },

  /**
   * Combines multiple animations for complex value change effects
   * @param {Object} animValues - Object containing multiple Animated.Value instances
   * @param {string} changeType - 'increase', 'decrease', or 'neutral'
   * @param {Object} options - Animation options
   */
  createValueChangeAnimation: (animValues, changeType = 'increase', options = {}) => {
    const {
      flashDuration = 1000,
      glowDuration = 1500,
      pulseDuration = 400,
    } = options;

    const animations = [];

    // Flash animation
    if (animValues.flash) {
      animations.push(
        AnimationUtils.createFlashAnimation(animValues.flash, { duration: flashDuration })
      );
    }

    // Glow animation
    if (animValues.glow) {
      animations.push(
        AnimationUtils.createGlowAnimation(animValues.glow, { duration: glowDuration })
      );
    }

    // Pulse animation
    if (animValues.scale) {
      animations.push(
        AnimationUtils.createPulseAnimation(animValues.scale, { duration: pulseDuration })
      );
    }

    return Animated.parallel(animations);
  },

  /**
   * Creates a particle-like burst animation for significant changes
   * @param {Array} animValues - Array of Animated.Value instances for particles
   * @param {Object} options - Animation options
   */
  createBurstAnimation: (animValues, options = {}) => {
    const {
      duration = 800,
      spread = 30,
      useNativeDriver = true,
    } = options;

    const animations = animValues.map((animValue, index) => {
      const angle = (index / animValues.length) * 2 * Math.PI;
      const x = Math.cos(angle) * spread;
      const y = Math.sin(angle) * spread;

      return Animated.sequence([
        Animated.timing(animValue, {
          toValue: { x, y },
          duration: duration * 0.6,
          useNativeDriver,
        }),
        Animated.timing(animValue, {
          toValue: { x: 0, y: 0 },
          duration: duration * 0.4,
          useNativeDriver,
        })
      ]);
    });

    return Animated.parallel(animations);
  },

  /**
   * Easing functions for different animation styles
   */
  easings: {
    // Smooth ease out for value changes
    valueChange: (t) => 1 - Math.pow(1 - t, 3),
    
    // Bouncy easing for highlights
    bounce: (t) => {
      if (t < 1 / 2.75) {
        return 7.5625 * t * t;
      } else if (t < 2 / 2.75) {
        return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
      } else if (t < 2.5 / 2.75) {
        return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
      } else {
        return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
      }
    },
    
    // Elastic easing for attention-grabbing effects
    elastic: (t) => {
      if (t === 0 || t === 1) return t;
      return -(Math.pow(2, 10 * (t - 1)) * Math.sin((t - 1.1) * 5 * Math.PI));
    }
  },

  /**
   * Predefined animation configurations for common scenarios
   */
  presets: {
    // Subtle value change
    subtle: {
      flash: { duration: 800, intensity: 0.3 },
      glow: { duration: 1000, maxOpacity: 0.4 },
      pulse: { duration: 300, scale: 1.02 }
    },
    
    // Moderate value change
    moderate: {
      flash: { duration: 1000, intensity: 0.6 },
      glow: { duration: 1500, maxOpacity: 0.6 },
      pulse: { duration: 400, scale: 1.05 }
    },
    
    // Dramatic value change
    dramatic: {
      flash: { duration: 1200, intensity: 1.0 },
      glow: { duration: 2000, maxOpacity: 0.8 },
      pulse: { duration: 500, scale: 1.08 }
    }
  }
};

export default AnimationUtils;
