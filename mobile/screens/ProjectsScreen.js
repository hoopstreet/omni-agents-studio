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

export default function ProjectsScreen() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/projects.list`);
      setProjects(response.data.result.data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderProject = ({ item }) => (
    <TouchableOpacity style={styles.projectCard}>
      <View style={styles.projectIcon}>
        <Ionicons name="folder" size={32} color="#10a37f" />
      </View>
      <View style={styles.projectInfo}>
        <Text style={styles.projectName}>{item.name}</Text>
        <Text style={styles.projectDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.projectStats}>
          <Text style={styles.statText}>
            <Ionicons name="chatbubble-outline" size={12} color="#565869" /> {item.chatCount || 0}
          </Text>
          <Text style={styles.statText}>
            <Ionicons name="robot-outline" size={12} color="#565869" /> {item.agentCount || 0}
          </Text>
        </View>
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
        <Text style={styles.headerTitle}>Projects</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={24} color="#10a37f" />
        </TouchableOpacity>
      </View>

      {projects.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="folder" size={64} color="#565869" />
          <Text style={styles.emptyText}>No projects yet</Text>
          <Text style={styles.emptySubtext}>Create your first project to get started</Text>
        </View>
      ) : (
        <FlatList
          data={projects}
          renderItem={renderProject}
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
  projectCard: {
    flexDirection: 'row',
    backgroundColor: '#0a0e27',
    borderRadius: 12,
    padding: 12,
    marginVertical: 8,
    alignItems: 'center',
    borderColor: '#1a1f3a',
    borderWidth: 1,
  },
  projectIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#1a1f3a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  projectInfo: {
    flex: 1,
  },
  projectName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  projectDescription: {
    color: '#565869',
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 6,
  },
  projectStats: {
    flexDirection: 'row',
    gap: 12,
  },
  statText: {
    color: '#565869',
    fontSize: 11,
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
