import React from 'react';
import {View, StyleSheet, Dimensions} from 'react-native';
import Svg, {Path, Defs, LinearGradient, Stop, Rect} from 'react-native-svg';
import {colors} from '../constants/colors';

const {width: screenWidth} = Dimensions.get('window');

const MiniChart = ({
  data = [],
  width = screenWidth * 0.6,
  height = 60,
  color = colors.chart.bullish,
  showGradient = false,
  strokeWidth = 2,
  style,
}) => {
  if (!data || data.length === 0) {
    return <View style={[styles.container, {width, height}, style]} />;
  }

  // Find min and max values for scaling
  const values = data.map(point => point.y);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const valueRange = maxValue - minValue || 1;

  // Create path data
  const pathData = data
    .map((point, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((point.y - minValue) / valueRange) * height;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  // Create filled area path for gradient
  const filledPathData = showGradient
    ? `${pathData} L ${width} ${height} L 0 ${height} Z`
    : '';

  return (
    <View style={[styles.container, {width, height}, style]}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <Stop offset="100%" stopColor={color} stopOpacity={0.05} />
          </LinearGradient>
        </Defs>
        
        {/* Gradient fill */}
        {showGradient && filledPathData && (
          <Path
            d={filledPathData}
            fill="url(#chartGradient)"
          />
        )}
        
        {/* Chart line */}
        <Path
          d={pathData}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
  },
});

export default MiniChart;
