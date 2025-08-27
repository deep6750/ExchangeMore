import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { colors } from '../constants/colors';
import CurrencyPairCard from './CurrencyPairCard';
import PortfolioSummary from './PortfolioSummary';

/**
 * Demo component to showcase the enhanced animations
 * This can be used for testing and demonstration purposes
 */
const AnimationDemo = () => {
  const [demoPrice, setDemoPrice] = useState(1.2345);
  const [demoChange, setDemoChange] = useState(0.0012);
  const [demoChangePercent, setDemoChangePercent] = useState(0.97);
  const [priceChange, setPriceChange] = useState(null);

  const [portfolioValue, setPortfolioValue] = useState(53564.32);
  const [portfolioChange, setPortfolioChange] = useState(103.46);
  const [portfolioChangePercent, setPortfolioChangePercent] = useState(2.3);
  const [portfolioValueChanged, setPortfolioValueChanged] = useState(false);

  // Simulate price change
  const triggerPriceChange = (isIncrease) => {
    const newPrice = isIncrease ? demoPrice + 0.0045 : demoPrice - 0.0032;
    const change = newPrice - demoPrice;
    const changePercent = (change / demoPrice) * 100;
    
    setDemoPrice(newPrice);
    setDemoChange(change);
    setDemoChangePercent(changePercent);
    
    // Set price change animation data
    setPriceChange({
      type: isIncrease ? 'increase' : 'decrease',
      timestamp: Date.now(),
      previousPrice: demoPrice,
      newPrice: newPrice,
      change: change
    });
    
    // Clear animation state after delay
    setTimeout(() => {
      setPriceChange(null);
    }, 2000);
  };

  // Simulate portfolio value change
  const triggerPortfolioChange = (isIncrease) => {
    const changeAmount = isIncrease ? Math.random() * 500 + 200 : -(Math.random() * 400 + 150);
    const newValue = portfolioValue + changeAmount;
    const changePercent = (changeAmount / portfolioValue) * 100;
    
    setPortfolioValueChanged(true);
    setPortfolioValue(newValue);
    setPortfolioChange(changeAmount);
    setPortfolioChangePercent(changePercent);
    
    // Reset animation trigger after delay
    setTimeout(() => setPortfolioValueChanged(false), 2000);
  };

  // Auto demo mode
  useEffect(() => {
    const interval = setInterval(() => {
      const isIncrease = Math.random() > 0.5;
      triggerPriceChange(isIncrease);
      
      // Occasionally trigger portfolio changes
      if (Math.random() > 0.7) {
        setTimeout(() => triggerPortfolioChange(Math.random() > 0.5), 1000);
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [demoPrice, portfolioValue]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Animation Demo</Text>
      <Text style={styles.subtitle}>Watch the real-time value change animations</Text>
      
      {/* Demo Controls */}
      <View style={styles.controls}>
        <TouchableOpacity 
          style={[styles.button, styles.increaseButton]}
          onPress={() => triggerPriceChange(true)}
        >
          <Icon name="trending-up" size={16} color={colors.text.primary} />
          <Text style={styles.buttonText}>Price ↗</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.decreaseButton]}
          onPress={() => triggerPriceChange(false)}
        >
          <Icon name="trending-down" size={16} color={colors.text.primary} />
          <Text style={styles.buttonText}>Price ↘</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.portfolioButton]}
          onPress={() => triggerPortfolioChange(true)}
        >
          <Icon name="dollar-sign" size={16} color={colors.text.primary} />
          <Text style={styles.buttonText}>Portfolio ↗</Text>
        </TouchableOpacity>
      </View>

      {/* Demo Currency Card */}
      <View style={styles.demoSection}>
        <Text style={styles.sectionTitle}>Currency Pair Animation</Text>
        <CurrencyPairCard
          symbol="EUR/USD"
          name="Euro / US Dollar"
          price={demoPrice}
          change={demoChange}
          changePercent={demoChangePercent}
          priceChange={priceChange}
          lastUpdate={new Date()}
          isConnected={true}
          showChart={true}
        />
      </View>

      {/* Demo Portfolio Summary */}
      <View style={styles.demoSection}>
        <Text style={styles.sectionTitle}>Portfolio Value Animation</Text>
        <PortfolioSummary
          value={portfolioValue}
          change={portfolioChange}
          changePercent={portfolioChangePercent}
          valueChanged={portfolioValueChanged}
        />
      </View>

      <View style={styles.info}>
        <Icon name="info" size={16} color={colors.accent.primary} />
        <Text style={styles.infoText}>
          Animations include: Flash effects, glow highlights, scale transforms, 
          color transitions, and smooth value updates
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 32,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 100,
    justifyContent: 'center',
  },
  increaseButton: {
    backgroundColor: colors.chart.bullish,
  },
  decreaseButton: {
    backgroundColor: colors.chart.bearish,
  },
  portfolioButton: {
    backgroundColor: colors.accent.primary,
  },
  buttonText: {
    color: colors.text.primary,
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 12,
  },
  demoSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 12,
    paddingLeft: 4,
  },
  info: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.primary,
    marginTop: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: colors.text.secondary,
    lineHeight: 18,
    marginLeft: 8,
  },
});

export default AnimationDemo;
