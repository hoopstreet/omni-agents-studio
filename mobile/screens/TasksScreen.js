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

export default function TasksScreen() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchTasks();
  }, [filter]);

  const fetchTasks = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/tasks.list`, {
        status: filter === 'all' ? undefined : filter,
      });
      setTasks(response.data.result.data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#10a37f';
      case 'running':
        return '#fbbf24';
      case 'failed':
        return '#ef4444';
      default:
        return '#565869';
    }
  };

  const renderTask = ({ item }) => (
    <TouchableOpacity style={styles.taskCard}>
      <View style={styles.taskHeader}>
        <Text style={styles.taskName}>{item.name}</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) },
          ]}
        >
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      <Text style={styles.taskDescription} numberOfLines={2}>
        {item.description}
      </Text>
      <View style={styles.taskFooter}>
        <Text style={styles.taskDate}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
        <Ionicons name="chevron-forward" size={20} color="#565869" />
      </View>
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
        <Text style={styles.headerTitle}>Tasks</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={24} color="#10a37f" />
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        {['all', 'pending', 'running', 'completed', 'failed'].map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterButton, filter === f && styles.filterButtonActive]}
            onPress={() => setFilter(f)}
          >
            <Text
              style={[
                styles.filterText,
                filter === f && styles.filterTextActive,
              ]}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {tasks.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="checkmark-done" size={64} color="#565869" />
          <Text style={styles.emptyText}>No tasks</Text>
          <Text style={styles.emptySubtext}>Create a new task to get started</Text>
        </View>
      ) : (
        <FlatList
          data={tasks}
          renderItem={renderTask}
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
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomColor: '#1a1f3a',
    borderBottomWidth: 1,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 8,
    backgroundColor: '#1a1f3a',
  },
  filterButtonActive: {
    backgroundColor: '#10a37f',
  },
  filterText: {
    color: '#565869',
    fontSize: 12,
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#ffffff',
  },
  list: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  taskCard: {
    backgroundColor: '#0a0e27',
    borderRadius: 12,
    padding: 12,
    marginVertical: 8,
    borderColor: '#1a1f3a',
    borderWidth: 1,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  taskDescription: {
    color: '#565869',
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 8,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskDate: {
    color: '#565869',
    fontSize: 12,
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
