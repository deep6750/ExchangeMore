import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import * as Animatable from 'react-native-animatable';

import {useAuth} from '../context/AuthContext';
import {colors} from '../constants/colors';

const {width, height} = Dimensions.get('window');

const onboardingData = [
  {
    id: 1,
    title: 'Smart Trading\nTechnology',
    subtitle: 'Advanced forex trading with AI-powered insights and real-time market analysis',
    icon: 'trending-up',
    gradient: colors.gradient.primary,
  },
  {
    id: 2,
    title: 'Real-time\nMarket Data',
    subtitle: 'Get live forex rates, charts, and market updates from global exchanges instantly',
    icon: 'activity',
    gradient: colors.gradient.success,
  },
  {
    id: 3,
    title: 'Secure &\nReliable',
    subtitle: 'Bank-level security with encrypted transactions and 24/7 monitoring',
    icon: 'shield',
    gradient: colors.gradient.primary,
  },
];

const OnboardingScreen = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const {completeOnboarding} = useAuth();
  const flatListRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      flatListRef.current?.scrollToIndex({index: nextIndex});
    } else {
      completeOnboarding();
    }
  };

  const handleSkip = () => {
    completeOnboarding();
  };

  const renderOnboardingItem = ({item, index}) => (
    <View style={styles.slide}>
      <LinearGradient
        colors={item.gradient}
        style={styles.iconContainer}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}>
        <Icon name={item.icon} size={60} color={colors.text.primary} />
      </LinearGradient>
      
      <Animatable.View 
        animation="fadeInUp" 
        delay={300}
        style={styles.textContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>
      </Animatable.View>

      {/* Floating Currency Symbols */}
      <Animatable.View 
        animation="fadeIn" 
        delay={500}
        style={styles.floatingElements}>
        <Animatable.View 
          animation="pulse" 
          iterationCount="infinite" 
          style={[styles.floatingItem, styles.floatingItem1]}>
          <Text style={styles.currencyText}>EUR/USD</Text>
        </Animatable.View>
        
        <Animatable.View 
          animation="pulse" 
          iterationCount="infinite" 
          delay={200}
          style={[styles.floatingItem, styles.floatingItem2]}>
          <Text style={styles.currencyText}>GBP/JPY</Text>
        </Animatable.View>
        
        <Animatable.View 
          animation="pulse" 
          iterationCount="infinite" 
          delay={400}
          style={[styles.floatingItem, styles.floatingItem3]}>
          <Text style={styles.currencyText}>USD/CHF</Text>
        </Animatable.View>
      </Animatable.View>
    </View>
  );

  const renderPagination = () => (
    <View style={styles.paginationContainer}>
      {onboardingData.map((_, index) => {
        const inputRange = [
          (index - 1) * width,
          index * width,
          (index + 1) * width,
        ];

        const dotWidth = scrollX.interpolate({
          inputRange,
          outputRange: [8, 24, 8],
          extrapolate: 'clamp',
        });

        const opacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.3, 1, 0.3],
          extrapolate: 'clamp',
        });

        return (
          <Animated.View
            key={index}
            style={[
              styles.paginationDot,
              {
                width: dotWidth,
                opacity,
              },
            ]}
          />
        );
      })}
    </View>
  );

  return (
    <LinearGradient
      colors={colors.gradient.dark}
      style={styles.container}>
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>Grover</Text>
        <TouchableOpacity onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <FlatList
        ref={flatListRef}
        data={onboardingData}
        renderItem={renderOnboardingItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item.id.toString()}
        onScroll={Animated.event(
          [{nativeEvent: {contentOffset: {x: scrollX}}}],
          {useNativeDriver: false},
        )}
        onMomentumScrollEnd={event => {
          const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(newIndex);
        }}
      />

      {/* Footer */}
      <View style={styles.footer}>
        {renderPagination()}
        
        <TouchableOpacity 
          style={styles.nextButton}
          onPress={handleNext}>
          <LinearGradient
            colors={colors.gradient.primary}
            style={styles.nextButtonGradient}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}>
            <Text style={styles.nextButtonText}>
              {currentIndex === onboardingData.length - 1 ? 'Get Started' : 'Next'}
            </Text>
            <Icon 
              name={currentIndex === onboardingData.length - 1 ? 'check' : 'arrow-right'} 
              size={20} 
              color={colors.text.primary} 
            />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Page Indicator */}
      <View style={styles.pageIndicator}>
        <Text style={styles.pageIndicatorText}>
          {currentIndex + 1}/{onboardingData.length}
        </Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  logo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  skipText: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  slide: {
    width: width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    elevation: 10,
    shadowColor: colors.accent.primary,
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  floatingElements: {
    position: 'absolute',
    top: '20%',
    width: '100%',
    height: '60%',
  },
  floatingItem: {
    position: 'absolute',
    backgroundColor: colors.background.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border.secondary,
  },
  floatingItem1: {
    top: '20%',
    right: '10%',
    transform: [{rotate: '15deg'}],
  },
  floatingItem2: {
    top: '60%',
    left: '10%',
    transform: [{rotate: '-10deg'}],
  },
  floatingItem3: {
    top: '40%',
    right: '20%',
    transform: [{rotate: '8deg'}],
  },
  currencyText: {
    color: colors.accent.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  paginationDot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent.primary,
    marginHorizontal: 4,
  },
  nextButton: {
    width: '100%',
    height: 56,
  },
  nextButtonGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginRight: 8,
  },
  pageIndicator: {
    position: 'absolute',
    bottom: 100,
    right: 24,
    backgroundColor: colors.background.modal,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  pageIndicatorText: {
    color: colors.text.secondary,
    fontSize: 12,
    fontWeight: '500',
  },
});

export default OnboardingScreen;
