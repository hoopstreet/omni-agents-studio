import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', onPress: () => {} },
      { text: 'Logout', onPress: () => {}, style: 'destructive' },
    ]);
  };

  const renderSettingItem = (icon, title, description, value, onToggle) => (
    <View style={styles.settingItem}>
      <View style={styles.settingContent}>
        <Ionicons name={icon} size={24} color="#10a37f" />
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingDescription}>{description}</Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#1a1f3a', true: '#10a37f' }}
        thumbColor={value ? '#ffffff' : '#565869'}
      />
    </View>
  );

  const renderMenuItem = (icon, title, onPress) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuContent}>
        <Ionicons name={icon} size={24} color="#10a37f" />
        <Text style={styles.menuTitle}>{title}</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#565869" />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        {renderSettingItem(
          'notifications',
          'Notifications',
          'Receive push notifications',
          notificationsEnabled,
          setNotificationsEnabled
        )}
        {renderSettingItem(
          'moon',
          'Dark Mode',
          'Use dark theme',
          darkMode,
          setDarkMode
        )}
        {renderSettingItem(
          'cloud-offline',
          'Offline Mode',
          'Work offline with local data',
          offlineMode,
          setOfflineMode
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        {renderMenuItem('person', 'Profile', () => {})}
        {renderMenuItem('lock-closed', 'Privacy & Security', () => {})}
        {renderMenuItem('key', 'API Keys', () => {})}
        {renderMenuItem('shield-checkmark', 'Two-Factor Authentication', () => {})}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        {renderMenuItem('information-circle', 'About Omni-Agents', () => {})}
        {renderMenuItem('document-text', 'Terms of Service', () => {})}
        {renderMenuItem('shield', 'Privacy Policy', () => {})}
        {renderMenuItem('bug', 'Report a Bug', () => {})}
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out" size={20} color="#ef4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>Omni-Agents Studio v1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    paddingVertical: 12,
  },
  section: {
    marginVertical: 8,
    borderTopColor: '#1a1f3a',
    borderTopWidth: 1,
  },
  sectionTitle: {
    color: '#10a37f',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    paddingVertical: 12,
    letterSpacing: 0.5,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomColor: '#1a1f3a',
    borderBottomWidth: 1,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  settingTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  settingDescription: {
    color: '#565869',
    fontSize: 12,
    marginTop: 4,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomColor: '#1a1f3a',
    borderBottomWidth: 1,
  },
  menuContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#1a1f3a',
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  versionContainer: {
    paddingVertical: 16,
    alignItems: 'center',
    borderTopColor: '#1a1f3a',
    borderTopWidth: 1,
  },
  versionText: {
    color: '#565869',
    fontSize: 12,
  },
});
