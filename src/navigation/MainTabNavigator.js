import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {View, Text, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

// Screens
import DashboardScreen from '../screens/DashboardScreen';
import MarketsScreen from '../screens/MarketsScreen';
import PortfolioScreen from '../screens/PortfolioScreen';
import SettingsScreen from '../screens/SettingsScreen';
import WebSocketDebugScreen from '../screens/WebSocketDebugScreen';
import SimpleDebugTestScreen from '../screens/SimpleDebugTestScreen';

// Constants
import {colors} from '../constants/colors';

const Tab = createBottomTabNavigator();

const TabBarIcon = ({name, color, size = 24}) => (
  <Icon name={name} size={size} color={color} />
);

const TabBarLabel = ({label, focused}) => (
  <Text style={[
    styles.tabLabel, 
    {color: focused ? colors.accent.primary : colors.text.tertiary}
  ]}>
    {label}
  </Text>
);

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.accent.primary,
        tabBarInactiveTintColor: colors.text.tertiary,
        tabBarShowLabel: true,
        tabBarHideOnKeyboard: true,
      }}>
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({color, size}) => (
            <TabBarIcon name="home" color={color} size={size} />
          ),
          tabBarLabel: ({focused}) => (
            <TabBarLabel label="Home" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Markets"
        component={MarketsScreen}
        options={{
          tabBarIcon: ({color, size}) => (
            <TabBarIcon name="trending-up" color={color} size={size} />
          ),
          tabBarLabel: ({focused}) => (
            <TabBarLabel label="Markets" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Portfolio"
        component={PortfolioScreen}
        options={{
          tabBarIcon: ({color, size}) => (
            <TabBarIcon name="briefcase" color={color} size={size} />
          ),
          tabBarLabel: ({focused}) => (
            <TabBarLabel label="Portfolio" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({color, size}) => (
            <TabBarIcon name="settings" color={color} size={size} />
          ),
          tabBarLabel: ({focused}) => (
            <TabBarLabel label="Settings" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Debug"
        component={SimpleDebugTestScreen}
        options={{
          tabBarIcon: ({color, size}) => (
            <TabBarIcon name="activity" color={color} size={size} />
          ),
          tabBarLabel: ({focused}) => (
            <TabBarLabel label="Debug" focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.background.secondary,
    borderTopColor: colors.border.primary,
    borderTopWidth: 1,
    paddingBottom: 8,
    paddingTop: 8,
    height: 70,
    elevation: 0,
    shadowOpacity: 0,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
});

export default MainTabNavigator;
