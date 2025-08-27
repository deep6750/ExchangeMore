import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import * as Animatable from 'react-native-animatable';
import { colors } from '../constants/colors';

const RealTimeStatus = ({ 
  isConnected, 
  lastUpdate, 
  style,
  showText = true,
  size = 'small' // 'small', 'medium', 'large'
}) => {
  const getStatusText = () => {
    if (!isConnected) return 'Disconnected';
    if (!lastUpdate) return 'Connecting...';
    
    const now = Date.now();
    const updateTime = new Date(lastUpdate).getTime();
    const diffSeconds = Math.floor((now - updateTime) / 1000);
    
    if (diffSeconds < 30) return 'Live';
    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    return 'Stale data';
  };

  const getStatusColor = () => {
    if (!isConnected) return colors.accent.danger;
    if (!lastUpdate) return colors.accent.warning;
    
    const now = Date.now();
    const updateTime = new Date(lastUpdate).getTime();
    const diffSeconds = Math.floor((now - updateTime) / 1000);
    
    if (diffSeconds < 30) return colors.chart.bullish;
    if (diffSeconds < 60) return colors.accent.warning;
    return colors.accent.danger;
  };

  const getIconName = () => {
    if (!isConnected) return 'wifi-off';
    if (!lastUpdate) return 'loader';
    return 'wifi';
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'large':
        return {
          indicator: { width: 12, height: 12, borderRadius: 6 },
          icon: 20,
          text: 16,
          container: { paddingVertical: 8, paddingHorizontal: 12 }
        };
      case 'medium':
        return {
          indicator: { width: 10, height: 10, borderRadius: 5 },
          icon: 16,
          text: 14,
          container: { paddingVertical: 6, paddingHorizontal: 10 }
        };
      default: // small
        return {
          indicator: { width: 8, height: 8, borderRadius: 4 },
          icon: 12,
          text: 12,
          container: { paddingVertical: 4, paddingHorizontal: 8 }
        };
    }
  };

  const sizeStyles = getSizeStyles();
  const statusColor = getStatusColor();
  const statusText = getStatusText();
  const shouldPulse = isConnected && lastUpdate && statusText === 'Live';

  return (
    <View style={[styles.container, sizeStyles.container, style]}>
      <Animatable.View
        animation={shouldPulse ? 'pulse' : null}
        iterationCount="infinite"
        duration={2000}
        style={[
          styles.indicator,
          sizeStyles.indicator,
          { backgroundColor: statusColor }
        ]}
      />
      
      {showText && (
        <Text style={[styles.statusText, { fontSize: sizeStyles.text, color: statusColor }]}>
          {statusText}
        </Text>
      )}
      
      <Icon 
        name={getIconName()} 
        size={sizeStyles.icon} 
        color={statusColor}
        style={styles.icon}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  indicator: {
    marginRight: 6,
  },
  statusText: {
    fontWeight: '500',
    marginRight: 6,
  },
  icon: {
    opacity: 0.8,
  },
});

export default RealTimeStatus;
