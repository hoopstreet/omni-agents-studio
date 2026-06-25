import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import ChatScreen from './screens/ChatScreen';
import AgentsScreen from './screens/AgentsScreen';
import TasksScreen from './screens/TasksScreen';
import ProjectsScreen from './screens/ProjectsScreen';
import SettingsScreen from './screens/SettingsScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Initialize app
    setIsReady(true);
  }, []);

  if (!isReady) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0a0e27" />
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;

              if (route.name === 'Chat') {
                iconName = focused ? 'chatbubble' : 'chatbubble-outline';
              } else if (route.name === 'Agents') {
                iconName = focused ? 'robot' : 'robot-outline';
              } else if (route.name === 'Tasks') {
                iconName = focused ? 'checkmark-done' : 'checkmark-done-outline';
              } else if (route.name === 'Projects') {
                iconName = focused ? 'folder' : 'folder-outline';
              } else if (route.name === 'Settings') {
                iconName = focused ? 'settings' : 'settings-outline';
              }

              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#10a37f',
            tabBarInactiveTintColor: '#565869',
            tabBarStyle: styles.tabBar,
            headerStyle: styles.header,
            headerTintColor: '#ffffff',
            headerTitleStyle: styles.headerTitle,
          })}
        >
          <Tab.Screen
            name="Chat"
            component={ChatScreen}
            options={{ title: 'Chat' }}
          />
          <Tab.Screen
            name="Agents"
            component={AgentsScreen}
            options={{ title: 'Agents' }}
          />
          <Tab.Screen
            name="Tasks"
            component={TasksScreen}
            options={{ title: 'Tasks' }}
          />
          <Tab.Screen
            name="Projects"
            component={ProjectsScreen}
            options={{ title: 'Projects' }}
          />
          <Tab.Screen
            name="Settings"
            component={SettingsScreen}
            options={{ title: 'Settings' }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBar: {
    backgroundColor: '#0a0e27',
    borderTopColor: '#1a1f3a',
    borderTopWidth: 1,
  },
  header: {
    backgroundColor: '#0a0e27',
    borderBottomColor: '#1a1f3a',
    borderBottomWidth: 1,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
});
