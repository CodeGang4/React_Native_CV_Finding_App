import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import * as Linking from 'expo-linking';
import { testDeepLinks, createDeepLink } from '../services/DeepLinkService';
import config from '../config/environment';

/**
 * Deep Link Debugger Component
 * Chỉ hiển thị trong development mode
 */
export default function DeepLinkDebugger() {
  const [lastUrl, setLastUrl] = useState(null);

  if (!__DEV__) {
    return null; // Don't show in production
  }

  const handleTestLink = async (name, path, params) => {
    try {
      const url = createDeepLink(path, params);
      console.log(`🧪 Testing: ${name}`);
      console.log(`🔗 URL: ${url}`);
      
      setLastUrl(url);
      
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
        Alert.alert('Success', `Opened: ${name}`);
      } else {
        Alert.alert('Error', `Cannot open URL: ${url}`);
      }
    } catch (error) {
      console.error('Error testing deep link:', error);
      Alert.alert('Error', error.message);
    }
  };

  const handleRunAllTests = async () => {
    try {
      await testDeepLinks();
      Alert.alert('Tests Complete', 'Check console for results');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const testCases = [
    {
      name: 'Payment Success',
      path: 'payment/success',
      params: { session_id: 'cs_test_123abc' },
    },
    {
      name: 'Payment Failed',
      path: 'payment/failed',
      params: { reason: 'cancelled' },
    },
    {
      name: 'Payment History',
      path: 'payment/history',
      params: {},
    },
    {
      name: 'Upgrade Account',
      path: 'upgrade',
      params: {},
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔗 Deep Link Debugger</Text>
      
      <View style={styles.configSection}>
        <Text style={styles.sectionTitle}>Configuration:</Text>
        <Text style={styles.configText}>Scheme: {config.deepLinkScheme}://</Text>
        <Text style={styles.configText}>Prefix: {config.deepLinkPrefix}</Text>
        <Text style={styles.configText}>API: {config.apiUrl}</Text>
      </View>

      <ScrollView style={styles.testSection}>
        <Text style={styles.sectionTitle}>Test Cases:</Text>
        
        {testCases.map((test, index) => (
          <TouchableOpacity
            key={index}
            style={styles.testButton}
            onPress={() => handleTestLink(test.name, test.path, test.params)}
          >
            <Text style={styles.testButtonText}>{test.name}</Text>
            <Text style={styles.testButtonSubtext}>
              {test.path}
              {Object.keys(test.params).length > 0 && '?...'}
            </Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={[styles.testButton, styles.runAllButton]}
          onPress={handleRunAllTests}
        >
          <Text style={styles.testButtonText}>🧪 Run All Tests</Text>
          <Text style={styles.testButtonSubtext}>Check console for results</Text>
        </TouchableOpacity>
      </ScrollView>

      {lastUrl && (
        <View style={styles.lastUrlSection}>
          <Text style={styles.sectionTitle}>Last Tested URL:</Text>
          <Text style={styles.urlText} numberOfLines={2}>
            {lastUrl}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  configSection: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  testSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  configText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  testButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  testButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  testButtonSubtext: {
    fontSize: 11,
    color: '#999',
    fontFamily: 'monospace',
  },
  runAllButton: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  lastUrlSection: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  urlText: {
    fontSize: 11,
    color: '#666',
    fontFamily: 'monospace',
  },
});
