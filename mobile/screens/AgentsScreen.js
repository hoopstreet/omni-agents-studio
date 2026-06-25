import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

const API_BASE_URL = 'https://omniagents-zycdtw8o.manus.space/api/trpc';

export default function AgentsScreen() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/agents.list`);
      setAgents(response.data.result.data || []);
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderAgent = ({ item }) => (
    <TouchableOpacity style={styles.agentCard}>
      <View style={styles.agentIcon}>
        <Ionicons name="robot" size={32} color="#10a37f" />
      </View>
      <View style={styles.agentInfo}>
        <Text style={styles.agentName}>{item.name}</Text>
        <Text style={styles.agentDescription} numberOfLines={2}>
          {item.description}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#565869" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#10a37f" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Agents</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={24} color="#10a37f" />
        </TouchableOpacity>
      </View>

      {agents.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="robot" size={64} color="#565869" />
          <Text style={styles.emptyText}>No agents yet</Text>
          <Text style={styles.emptySubtext}>Create your first agent to get started</Text>
        </View>
      ) : (
        <FlatList
          data={agents}
          renderItem={renderAgent}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomColor: '#1a1f3a',
    borderBottomWidth: 1,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '700',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#1a1f3a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  agentCard: {
    flexDirection: 'row',
    backgroundColor: '#0a0e27',
    borderRadius: 12,
    padding: 12,
    marginVertical: 8,
    alignItems: 'center',
    borderColor: '#1a1f3a',
    borderWidth: 1,
  },
  agentIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#1a1f3a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  agentInfo: {
    flex: 1,
  },
  agentName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  agentDescription: {
    color: '#565869',
    fontSize: 12,
    lineHeight: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
  },
  emptySubtext: {
    color: '#565869',
    fontSize: 14,
    marginTop: 4,
  },
});
