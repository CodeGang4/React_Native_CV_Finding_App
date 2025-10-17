import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { apiClient } from '../../shared/services/api/ApiClient';

/**
 * Rate Limit Monitor Component
 * Hiển thị trạng thái rate limiting trong development mode
 */
export const RateLimitMonitor = ({ enabled = __DEV__ }) => {
  const [status, setStatus] = useState({});
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(() => {
      const rateLimitStatus = apiClient.getRateLimitStatus();
      setStatus(rateLimitStatus);
    }, 1000);

    return () => clearInterval(interval);
  }, [enabled]);

  if (!enabled || !visible) {
    return (
      <TouchableOpacity 
        style={styles.toggleButton} 
        onPress={() => setVisible(true)}
      >
        <Text style={styles.toggleText}>📊</Text>
      </TouchableOpacity>
    );
  }

  const getStatusColor = () => {
    if (status.isThrottled) return '#ff4444';
    if (status.queueLength > 5) return '#ff8800';
    if (status.activeRequests > 8) return '#ffaa00';
    return '#44ff44';
  };

  return (
    <View style={[styles.container, { borderColor: getStatusColor() }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Rate Limit Monitor</Text>
        <TouchableOpacity onPress={() => setVisible(false)}>
          <Text style={styles.closeButton}>✕</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.stat}>
          🏃 Active: {status.activeRequests || 0}
        </Text>
        <Text style={styles.stat}>
          ⏳ Queue: {status.queueLength || 0}
        </Text>
        <Text style={styles.stat}>
          ✅ Success: {status.successCount || 0}
        </Text>
        <Text style={styles.stat}>
          ❌ Failed: {status.failedCount || 0}
        </Text>
        <Text style={styles.stat}>
          🔄 Retries: {status.retryCount || 0}
        </Text>
        
        {status.isThrottled && (
          <Text style={[styles.stat, styles.warning]}>
            🚫 THROTTLED
          </Text>
        )}
        
        {status.lastError && (
          <Text style={[styles.stat, styles.error]}>
            💥 Last Error: {status.lastError}
          </Text>
        )}
      </View>
      
      <View style={styles.controls}>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => apiClient.pauseRequests()}
        >
          <Text style={styles.buttonText}>⏸️ Pause</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.button}
          onPress={() => apiClient.resumeRequests()}
        >
          <Text style={styles.buttonText}>▶️ Resume</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 100,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 8,
    borderWidth: 2,
    padding: 10,
    minWidth: 200,
    zIndex: 9999,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  closeButton: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    marginBottom: 10,
  },
  stat: {
    color: 'white',
    fontSize: 11,
    marginBottom: 2,
  },
  warning: {
    color: '#ff8800',
    fontWeight: 'bold',
  },
  error: {
    color: '#ff4444',
    fontSize: 10,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: '#333',
    padding: 5,
    borderRadius: 4,
    flex: 1,
    marginHorizontal: 2,
  },
  buttonText: {
    color: 'white',
    fontSize: 10,
    textAlign: 'center',
  },
  toggleButton: {
    position: 'absolute',
    top: 100,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  toggleText: {
    fontSize: 20,
  },
});

export default RateLimitMonitor;