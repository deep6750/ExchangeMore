import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, Dimensions} from 'react-native';
import Svg, {Path, Defs, LinearGradient, Stop, Circle, G, Line, Text as SvgText} from 'react-native-svg';
import {colors} from '../constants/colors';

const {width: screenWidth} = Dimensions.get('window');

const PortfolioChart = ({
  timeframe = '1D',
  width = screenWidth - 80,
  height = 160,
  style,
}) => {
  const [data, setData] = useState([]);
  const [selectedPoint, setSelectedPoint] = useState(null);

  useEffect(() => {
    generateChartData();
  }, [timeframe]);

  const generateChartData = () => {
    // Generate mock data based on timeframe
    let dataPoints = 24; // Default for 1D
    let baseValue = 53564.32;
    
    switch (timeframe) {
      case '1W':
        dataPoints = 7;
        break;
      case '1M':
        dataPoints = 30;
        break;
      case '3M':
        dataPoints = 90;
        break;
      case '1Y':
        dataPoints = 365;
        break;
      case 'All':
        dataPoints = 500;
        break;
    }

    const mockData = Array.from({length: dataPoints}, (_, i) => {
      const variation = (Math.random() - 0.5) * 2000;
      return {
        x: i,
        y: baseValue + variation + (i * 10), // Slight upward trend
        timestamp: Date.now() + i * 86400000, // Daily intervals
      };
    });

    setData(mockData);
  };

  if (!data || data.length === 0) {
    return (
      <View style={[styles.container, {width, height}, style]}>
        <Text style={styles.noDataText}>Loading chart...</Text>
      </View>
    );
  }

  // Calculate chart dimensions
  const chartWidth = width - 40;
  const chartHeight = height - 40;
  const padding = 20;

  // Find min and max values for scaling
  const values = data.map(point => point.y);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const valueRange = maxValue - minValue || 1;

  // Create path data for the line chart
  const pathData = data
    .map((point, index) => {
      const x = padding + (index / (data.length - 1)) * (chartWidth - 2 * padding);
      const y = padding + (1 - (point.y - minValue) / valueRange) * (chartHeight - 2 * padding);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  // Create filled area path for gradient
  const filledPathData = `${pathData} L ${padding + chartWidth - 2 * padding} ${chartHeight - padding} L ${padding} ${chartHeight - padding} Z`;

  // Calculate performance
  const firstValue = values[0];
  const lastValue = values[values.length - 1];
  const change = lastValue - firstValue;
  const changePercent = (change / firstValue) * 100;
  const isPositive = change >= 0;

  return (
    <View style={[styles.container, {width, height}, style]}>
      {/* Chart Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.currentValue}>
            ${lastValue.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Text>
          <Text style={[
            styles.changeText,
            {color: isPositive ? colors.chart.bullish : colors.chart.bearish}
          ]}>
            {isPositive ? '+' : ''}${Math.abs(change).toFixed(2)} ({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)
          </Text>
        </View>
        <Text style={styles.timeframeText}>{timeframe}</Text>
      </View>

      {/* SVG Chart */}
      <Svg width={chartWidth} height={chartHeight} style={styles.chart}>
        <Defs>
          <LinearGradient id="portfolioGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop 
              offset="0%" 
              stopColor={isPositive ? colors.chart.bullish : colors.chart.bearish} 
              stopOpacity={0.3} 
            />
            <Stop 
              offset="100%" 
              stopColor={isPositive ? colors.chart.bullish : colors.chart.bearish} 
              stopOpacity={0.05} 
            />
          </LinearGradient>
        </Defs>
        
        {/* Grid Lines */}
        <G>
          {/* Horizontal grid lines */}
          {[0.25, 0.5, 0.75].map((ratio, index) => {
            const y = padding + ratio * (chartHeight - 2 * padding);
            return (
              <Line
                key={`h-grid-${index}`}
                x1={padding}
                y1={y}
                x2={chartWidth - padding}
                y2={y}
                stroke={colors.border.primary}
                strokeWidth={0.5}
                strokeDasharray="2,2"
              />
            );
          })}
          
          {/* Vertical grid lines */}
          {[0.25, 0.5, 0.75].map((ratio, index) => {
            const x = padding + ratio * (chartWidth - 2 * padding);
            return (
              <Line
                key={`v-grid-${index}`}
                x1={x}
                y1={padding}
                x2={x}
                y2={chartHeight - padding}
                stroke={colors.border.primary}
                strokeWidth={0.5}
                strokeDasharray="2,2"
              />
            );
          })}
        </G>
        
        {/* Gradient fill */}
        <Path
          d={filledPathData}
          fill="url(#portfolioGradient)"
        />
        
        {/* Chart line */}
        <Path
          d={pathData}
          stroke={isPositive ? colors.chart.bullish : colors.chart.bearish}
          strokeWidth={2}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Data points */}
        {data.map((point, index) => {
          const x = padding + (index / (data.length - 1)) * (chartWidth - 2 * padding);
          const y = padding + (1 - (point.y - minValue) / valueRange) * (chartHeight - 2 * padding);
          
          return (
            <Circle
              key={index}
              cx={x}
              cy={y}
              r={2}
              fill={isPositive ? colors.chart.bullish : colors.chart.bearish}
              opacity={0.7}
            />
          );
        })}
      </Svg>

      {/* Chart Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {timeframe === '1D' ? '24h' : timeframe} Performance
        </Text>
        <Text style={styles.footerSubtext}>
          Last updated: {new Date().toLocaleTimeString()}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  currentValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  changeText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  timeframeText: {
    fontSize: 12,
    color: colors.text.tertiary,
    backgroundColor: colors.background.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  chart: {
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  footerSubtext: {
    fontSize: 10,
    color: colors.text.tertiary,
  },
  noDataText: {
    fontSize: 14,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginTop: height / 2 - 20,
  },
});

export default PortfolioChart;
