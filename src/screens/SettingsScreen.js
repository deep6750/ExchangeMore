import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import * as Animatable from 'react-native-animatable';

import {useAuth} from '../context/AuthContext';
import {colors} from '../constants/colors';

const SettingsScreen = () => {
  const {user, signOut} = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [priceAlerts, setPriceAlerts] = useState(true);
  const [biometrics, setBiometrics] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            const result = await signOut();
            if (!result.success) {
              Alert.alert('Error', result.error);
            }
          },
        },
      ]
    );
  };

  const SettingItem = ({icon, title, subtitle, onPress, rightComponent}) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={!onPress}>
      <View style={styles.settingIcon}>
        <Icon name={icon} size={20} color={colors.accent.primary} />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {rightComponent || (
        onPress && (
          <Icon name="chevron-right" size={20} color={colors.text.tertiary} />
        )
      )}
    </TouchableOpacity>
  );

  const SectionHeader = ({title}) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      {/* User Profile */}
      <Animatable.View animation="fadeInUp" style={styles.profileSection}>
        <LinearGradient
          colors={colors.gradient.card}
          style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>
              {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {user?.user_metadata?.full_name || 'User'}
            </Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
          </View>
          <TouchableOpacity style={styles.editButton}>
            <Icon name="edit-2" size={16} color={colors.accent.primary} />
          </TouchableOpacity>
        </LinearGradient>
      </Animatable.View>

      {/* Trading Settings */}
      <Animatable.View animation="fadeInUp" delay={100} style={styles.section}>
        <SectionHeader title="Trading" />
        
        <SettingItem
          icon="trending-up"
          title="Default Position Size"
          subtitle="$10,000"
          onPress={() => {}}
        />
        
        <SettingItem
          icon="shield"
          title="Risk Management"
          subtitle="Stop Loss & Take Profit"
          onPress={() => {}}
        />
        
        <SettingItem
          icon="clock"
          title="Auto Close Positions"
          subtitle="End of trading day"
          onPress={() => {}}
        />
        
        <SettingItem
          icon="dollar-sign"
          title="Base Currency"
          subtitle="USD"
          onPress={() => {}}
        />
      </Animatable.View>

      {/* Notifications */}
      <Animatable.View animation="fadeInUp" delay={200} style={styles.section}>
        <SectionHeader title="Notifications" />
        
        <SettingItem
          icon="bell"
          title="Push Notifications"
          subtitle="Market updates and alerts"
          rightComponent={
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{false: colors.border.primary, true: colors.accent.primary}}
              thumbColor={notifications ? colors.text.primary : colors.text.tertiary}
            />
          }
        />
        
        <SettingItem
          icon="alert-triangle"
          title="Price Alerts"
          subtitle="Get notified about price changes"
          rightComponent={
            <Switch
              value={priceAlerts}
              onValueChange={setPriceAlerts}
              trackColor={{false: colors.border.primary, true: colors.accent.primary}}
              thumbColor={priceAlerts ? colors.text.primary : colors.text.tertiary}
            />
          }
        />
        
        <SettingItem
          icon="mail"
          title="Email Notifications"
          subtitle="Weekly reports and updates"
          onPress={() => {}}
        />
      </Animatable.View>

      {/* Security */}
      <Animatable.View animation="fadeInUp" delay={300} style={styles.section}>
        <SectionHeader title="Security" />
        
        <SettingItem
          icon="fingerprint"
          title="Biometric Authentication"
          subtitle="Use Touch ID or Face ID"
          rightComponent={
            <Switch
              value={biometrics}
              onValueChange={setBiometrics}
              trackColor={{false: colors.border.primary, true: colors.accent.primary}}
              thumbColor={biometrics ? colors.text.primary : colors.text.tertiary}
            />
          }
        />
        
        <SettingItem
          icon="lock"
          title="Change Password"
          subtitle="Update your account password"
          onPress={() => {}}
        />
        
        <SettingItem
          icon="key"
          title="Two-Factor Authentication"
          subtitle="Add an extra layer of security"
          onPress={() => {}}
        />
        
        <SettingItem
          icon="activity"
          title="Login Activity"
          subtitle="View recent account activity"
          onPress={() => {}}
        />
      </Animatable.View>

      {/* Appearance */}
      <Animatable.View animation="fadeInUp" delay={400} style={styles.section}>
        <SectionHeader title="Appearance" />
        
        <SettingItem
          icon="moon"
          title="Dark Mode"
          subtitle="Use dark theme"
          rightComponent={
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{false: colors.border.primary, true: colors.accent.primary}}
              thumbColor={darkMode ? colors.text.primary : colors.text.tertiary}
            />
          }
        />
        
        <SettingItem
          icon="type"
          title="Font Size"
          subtitle="Medium"
          onPress={() => {}}
        />
        
        <SettingItem
          icon="palette"
          title="Chart Theme"
          subtitle="Customize chart appearance"
          onPress={() => {}}
        />
      </Animatable.View>

      {/* Support */}
      <Animatable.View animation="fadeInUp" delay={500} style={styles.section}>
        <SectionHeader title="Support" />
        
        <SettingItem
          icon="help-circle"
          title="Help Center"
          subtitle="FAQs and tutorials"
          onPress={() => {}}
        />
        
        <SettingItem
          icon="message-circle"
          title="Contact Support"
          subtitle="Get help from our team"
          onPress={() => {}}
        />
        
        <SettingItem
          icon="book-open"
          title="Trading Guide"
          subtitle="Learn forex trading"
          onPress={() => {}}
        />
        
        <SettingItem
          icon="star"
          title="Rate App"
          subtitle="Share your feedback"
          onPress={() => {}}
        />
      </Animatable.View>

      {/* Legal */}
      <Animatable.View animation="fadeInUp" delay={600} style={styles.section}>
        <SectionHeader title="Legal" />
        
        <SettingItem
          icon="file-text"
          title="Terms of Service"
          onPress={() => {}}
        />
        
        <SettingItem
          icon="shield"
          title="Privacy Policy"
          onPress={() => {}}
        />
        
        <SettingItem
          icon="info"
          title="About"
          subtitle="Version 1.0.0"
          onPress={() => {}}
        />
      </Animatable.View>

      {/* Sign Out */}
      <Animatable.View animation="fadeInUp" delay={700} style={styles.section}>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Icon name="log-out" size={20} color={colors.accent.danger} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </Animatable.View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Grover Forex v1.0.0</Text>
        <Text style={styles.footerSubtext}>Made with ❤️ for traders</Text>
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
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  profileSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  profileAvatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  editButton: {
    width: 40,
    height: 40,
    backgroundColor: colors.background.secondary,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: colors.background.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  settingIcon: {
    width: 40,
    height: 40,
    backgroundColor: colors.background.secondary,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: colors.background.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.accent.danger,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.accent.danger,
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  footerText: {
    fontSize: 14,
    color: colors.text.tertiary,
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: colors.text.tertiary,
  },
});

export default SettingsScreen;
