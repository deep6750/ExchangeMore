import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';

import { colors } from '../constants/colors';
import twelveDataApi from '../services/twelveDataApi';

const ApiTester = () => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [lastCall, setLastCall] = useState(null);

  // Test forex quotes
  const testForexQuotes = async () => {
    setLoading(true);
    setLastCall('Forex Quotes');
    
    try {
      const result = await twelveDataApi.getForexQuotes('EUR/USD,GBP/USD,USD/JPY');
      setResponse(result);
      
      if (result.success) {
        Alert.alert('Success', 'Forex quotes fetched successfully!');
      } else {
        Alert.alert('Error', `API Error: ${result.error}`);
      }
    } catch (error) {
      Alert.alert('Error', `Network Error: ${error.message}`);
      setResponse({ success: false, error: error.message });
    }
    
    setLoading(false);
  };

  // Test exchange rate
  const testExchangeRate = async () => {
    setLoading(true);
    setLastCall('Exchange Rate');
    
    try {
      const result = await twelveDataApi.getExchangeRate('EUR', 'USD');
      setResponse(result);
      
      if (result.success) {
        Alert.alert('Success', 'Exchange rate fetched successfully!');
      } else {
        Alert.alert('Error', `API Error: ${result.error}`);
      }
    } catch (error) {
      Alert.alert('Error', `Network Error: ${error.message}`);
      setResponse({ success: false, error: error.message });
    }
    
    setLoading(false);
  };

  // Test currency conversion
  const testCurrencyConversion = async () => {
    setLoading(true);
    setLastCall('Currency Conversion');
    
    try {
      const result = await twelveDataApi.convertCurrency('USD', 'EUR', 100);
      setResponse(result);
      
      if (result.success) {
        Alert.alert('Success', 'Currency conversion completed successfully!');
      } else {
        Alert.alert('Error', `API Error: ${result.error}`);
      }
    } catch (error) {
      Alert.alert('Error', `Network Error: ${error.message}`);
      setResponse({ success: false, error: error.message });
    }
    
    setLoading(false);
  };

  // Test market status
  const testMarketStatus = async () => {
    setLoading(true);
    setLastCall('Market Status');
    
    try {
      const result = await twelveDataApi.getMarketStatus();
      setResponse(result);
      
      if (result.success) {
        Alert.alert('Success', 'Market status fetched successfully!');
      } else {
        Alert.alert('Error', `API Error: ${result.error}`);
      }
    } catch (error) {
      Alert.alert('Error', `Network Error: ${error.message}`);
      setResponse({ success: false, error: error.message });
    }
    
    setLoading(false);
  };

  // Test time series
  const testTimeSeries = async () => {
    setLoading(true);
    setLastCall('Time Series');
    
    try {
      const result = await twelveDataApi.getForexTimeSeries('EUR/USD', '1min', 10);
      setResponse(result);
      
      if (result.success) {
        Alert.alert('Success', 'Time series data fetched successfully!');
      } else {
        Alert.alert('Error', `API Error: ${result.error}`);
      }
    } catch (error) {
      Alert.alert('Error', `Network Error: ${error.message}`);
      setResponse({ success: false, error: error.message });
    }
    
    setLoading(false);
  };

  // Test forex pairs list
  const testForexPairs = async () => {
    setLoading(true);
    setLastCall('Forex Pairs');
    
    try {
      const result = await twelveDataApi.getForexPairs();
      setResponse(result);
      
      if (result.success) {
        Alert.alert('Success', 'Forex pairs list fetched successfully!');
      } else {
        Alert.alert('Error', `API Error: ${result.error}`);
      }
    } catch (error) {
      Alert.alert('Error', `Network Error: ${error.message}`);
      setResponse({ success: false, error: error.message });
    }
    
    setLoading(false);
  };

  const formatJson = (obj) => {
    return JSON.stringify(obj, null, 2);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Twelve Data API Tester</Text>
        <Text style={styles.subtitle}>Test API endpoints and view responses</Text>
      </View>

      {/* API Status */}
      <View style={styles.statusContainer}>
        <View style={styles.statusItem}>
          <View style={[styles.statusDot, { backgroundColor: colors.chart.bullish }]} />
          <Text style={styles.statusText}>API Key: Configured</Text>
        </View>
        <View style={styles.statusItem}>
          <View style={[styles.statusDot, { backgroundColor: colors.chart.neutral }]} />
          <Text style={styles.statusText}>Base URL: https://api.twelvedata.com</Text>
        </View>
      </View>

      {/* Test Buttons */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity 
          style={styles.testButton}
          onPress={testForexQuotes}
          disabled={loading}
        >
          <LinearGradient
            colors={colors.gradient.primary}
            style={styles.buttonGradient}
          >
            <Icon name="trending-up" size={20} color={colors.text.primary} />
            <Text style={styles.buttonText}>Test Forex Quotes</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.testButton}
          onPress={testExchangeRate}
          disabled={loading}
        >
          <LinearGradient
            colors={colors.gradient.success}
            style={styles.buttonGradient}
          >
            <Icon name="refresh-cw" size={20} color={colors.text.primary} />
            <Text style={styles.buttonText}>Test Exchange Rate</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.testButton}
          onPress={testCurrencyConversion}
          disabled={loading}
        >
          <LinearGradient
            colors={colors.gradient.danger}
            style={styles.buttonGradient}
          >
            <Icon name="dollar-sign" size={20} color={colors.text.primary} />
            <Text style={styles.buttonText}>Test Currency Conversion</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.testButton}
          onPress={testMarketStatus}
          disabled={loading}
        >
          <View style={styles.buttonSecondary}>
            <Icon name="activity" size={20} color={colors.accent.primary} />
            <Text style={styles.buttonSecondaryText}>Test Market Status</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.testButton}
          onPress={testTimeSeries}
          disabled={loading}
        >
          <View style={styles.buttonSecondary}>
            <Icon name="bar-chart" size={20} color={colors.accent.primary} />
            <Text style={styles.buttonSecondaryText}>Test Time Series</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.testButton}
          onPress={testForexPairs}
          disabled={loading}
        >
          <View style={styles.buttonSecondary}>
            <Icon name="list" size={20} color={colors.accent.primary} />
            <Text style={styles.buttonSecondaryText}>Test Forex Pairs</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Loading Indicator */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent.primary} />
          <Text style={styles.loadingText}>Calling {lastCall} API...</Text>
        </View>
      )}

      {/* Response Display */}
      {response && (
        <View style={styles.responseContainer}>
          <View style={styles.responseHeader}>
            <Text style={styles.responseTitle}>API Response</Text>
            <View style={[
              styles.statusBadge,
              { backgroundColor: response.success ? colors.chart.bullish : colors.chart.bearish }
            ]}>
              <Text style={styles.statusBadgeText}>
                {response.success ? 'SUCCESS' : 'ERROR'}
              </Text>
            </View>
          </View>
          
          <Text style={styles.lastCallText}>Last Call: {lastCall}</Text>
          
          <ScrollView style={styles.jsonContainer} horizontal>
            <Text style={styles.jsonText}>{formatJson(response)}</Text>
          </ScrollView>
        </View>
      )}

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsTitle}>Instructions:</Text>
        <Text style={styles.instructionsText}>
          • Tap any button to test the corresponding API endpoint{'\n'}
          • View the full JSON response below{'\n'}
          • Check the status badge for success/error{'\n'}
          • Responses are formatted for easy reading{'\n'}
          • All calls use your configured API key
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
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
    padding: 16,
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  statusText: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  buttonsContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  testButton: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginLeft: 12,
  },
  buttonSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  buttonSecondaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.accent.primary,
    marginLeft: 12,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.text.secondary,
  },
  responseContainer: {
    margin: 24,
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.primary,
    overflow: 'hidden',
  },
  responseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  responseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  lastCallText: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 12,
    color: colors.text.tertiary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  jsonContainer: {
    maxHeight: 300,
    padding: 16,
  },
  jsonText: {
    fontSize: 12,
    color: colors.text.secondary,
    fontFamily: 'monospace',
    lineHeight: 18,
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

export default ApiTester;
