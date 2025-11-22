import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../shared/contexts/AuthContext';
import ChatbotApiService from '../../shared/services/api/ChatbotApiService';

const PRIMARY_COLOR = '#00b14f';

export default function ChatbotScreen() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const flatListRef = useRef(null);

  useEffect(() => {
    loadSuggestions();
    loadHistory();
  }, []);

  const loadSuggestions = async () => {
    try {
      const response = await ChatbotApiService.getSuggestions();
      if (response.success) {
        setSuggestions(response.suggestions);
      }
    } catch (error) {
      console.error('Error loading suggestions:', error);
    }
  };

  const loadHistory = async () => {
    try {
      const response = await ChatbotApiService.getHistory(20);
      if (response.success && response.conversations) {
        const historyMessages = [];
        response.conversations.reverse().forEach(conv => {
          historyMessages.push({
            id: `user-${conv.id}`,
            text: conv.user_message,
            sender: 'user',
            timestamp: conv.created_at
          });
          historyMessages.push({
            id: `bot-${conv.id}`,
            text: conv.bot_message,
            sender: 'bot',
            timestamp: conv.created_at,
            data: conv.metadata
          });
        });
        setMessages(historyMessages);
      }
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const sendMessage = async (text = inputText) => {
    if (!text.trim()) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      text: text.trim(),
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setShowSuggestions(false);
    setLoading(true);

    try {
      const response = await ChatbotApiService.sendMessage(text.trim());
      
      const botMessage = {
        id: `bot-${Date.now()}`,
        text: response.message,
        sender: 'bot',
        timestamp: new Date().toISOString(),
        data: response.data
      };

      setMessages(prev => [...prev, botMessage]);

      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);

    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert(
        'Lỗi',
        'Không thể gửi tin nhắn. Vui lòng thử lại.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionPress = (suggestion) => {
    sendMessage(suggestion.text);
  };

  const clearChat = () => {
    Alert.alert(
      'Xóa lịch sử chat',
      'Bạn có chắc muốn xóa toàn bộ lịch sử trò chuyện?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await ChatbotApiService.clearHistory();
              setMessages([]);
              setShowSuggestions(true);
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể xóa lịch sử chat');
            }
          }
        }
      ]
    );
  };

  const renderJobCard = (job) => (
    <View style={styles.jobCard} key={job.id}>
      <Text style={styles.jobTitle}>{job.title}</Text>
      <Text style={styles.jobCompany}>{job.companies?.name}</Text>
      <View style={styles.jobDetails}>
        <Text style={styles.jobDetail}>📍 {job.location}</Text>
        {job.salary_min && (
          <Text style={styles.jobDetail}>
            💰 {job.salary_min.toLocaleString()} - {job.salary_max?.toLocaleString() || 'Thỏa thuận'} VNĐ
          </Text>
        )}
      </View>
    </View>
  );

  const renderCompanyCard = (company) => (
    <View style={styles.companyCard} key={company.id}>
      <Text style={styles.companyName}>{company.name}</Text>
      <Text style={styles.companyIndustry}>🏢 {company.industry}</Text>
      <Text style={styles.companyJobs}>📋 Đang tuyển: {company.jobs?.length || 0} vị trí</Text>
    </View>
  );

  const renderMessage = ({ item }) => {
    const isUser = item.sender === 'user';

    return (
      <View style={[styles.messageContainer, isUser ? styles.userMessageContainer : styles.botMessageContainer]}>
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.botBubble]}>
          <Text style={[styles.messageText, isUser ? styles.userText : styles.botText]}>
            {item.text}
          </Text>
          
          {/* Render job cards if available */}
          {!isUser && item.data?.jobs?.length > 0 && (
            <View style={styles.dataContainer}>
              {item.data.jobs.map(job => renderJobCard(job))}
            </View>
          )}

          {/* Render company cards if available */}
          {!isUser && item.data?.companies?.length > 0 && (
            <View style={styles.dataContainer}>
              {item.data.companies.map(company => renderCompanyCard(company))}
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.botAvatar}>
            <MaterialIcons name="smart-toy" size={24} color="#fff" />
          </View>
          <View>
            <Text style={styles.headerTitle}>Trợ lý AI tìm việc</Text>
            <Text style={styles.headerSubtitle}>Luôn sẵn sàng hỗ trợ bạn</Text>
          </View>
        </View>
        <TouchableOpacity onPress={clearChat} style={styles.clearButton}>
          <MaterialIcons name="delete-outline" size={24} color="#666" />
        </TouchableOpacity>
      </View>
      
      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >

      {/* Messages List */}
      {messages.length === 0 ? (
        <ScrollView style={styles.emptyContainer} contentContainerStyle={styles.emptyContent}>
          <MaterialIcons name="chat-bubble-outline" size={80} color="#ddd" />
          <Text style={styles.emptyTitle}>Xin chào! 👋</Text>
          <Text style={styles.emptyText}>
            Tôi là trợ lý AI của bạn. Tôi có thể giúp bạn:
          </Text>
          <View style={styles.featureList}>
            <Text style={styles.featureItem}>🔍 Tìm việc làm phù hợp</Text>
            <Text style={styles.featureItem}>🏢 Tìm hiểu về các công ty</Text>
            <Text style={styles.featureItem}>💰 Tìm việc theo mức lương</Text>
            <Text style={styles.featureItem}>📍 Tìm việc theo địa điểm</Text>
          </View>
          
          {/* Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <View style={styles.suggestionsContainer}>
              <Text style={styles.suggestionsTitle}>Gợi ý câu hỏi:</Text>
              {suggestions.map(suggestion => (
                <TouchableOpacity
                  key={suggestion.id}
                  style={styles.suggestionChip}
                  onPress={() => handleSuggestionPress(suggestion)}
                >
                  <Text style={styles.suggestionIcon}>{suggestion.icon}</Text>
                  <Text style={styles.suggestionText}>{suggestion.text}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
      )}

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nhập câu hỏi của bạn..."
          placeholderTextColor="#999"
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
          editable={!loading}
        />
        <TouchableOpacity
          style={[styles.sendButton, (!inputText.trim() || loading) && styles.sendButtonDisabled]}
          onPress={() => sendMessage()}
          disabled={!inputText.trim() || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <MaterialIcons name="send" size={24} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  chatContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  botAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: PRIMARY_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  clearButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
  },
  emptyContent: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  featureList: {
    alignItems: 'flex-start',
    marginBottom: 32,
  },
  featureItem: {
    fontSize: 15,
    color: '#666',
    marginBottom: 8,
  },
  suggestionsContainer: {
    width: '100%',
    marginTop: 8,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  suggestionIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  suggestionText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: '80%',
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
  },
  botMessageContainer: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userBubble: {
    backgroundColor: PRIMARY_COLOR,
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  userText: {
    color: '#fff',
  },
  botText: {
    color: '#333',
  },
  dataContainer: {
    marginTop: 12,
  },
  jobCard: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: PRIMARY_COLOR,
  },
  jobTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  jobCompany: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  jobDetails: {
    gap: 4,
  },
  jobDetail: {
    fontSize: 12,
    color: '#666',
  },
  companyCard: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#2196F3',
  },
  companyName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  companyIndustry: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  companyJobs: {
    fontSize: 12,
    color: '#666',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    maxHeight: 100,
    fontSize: 15,
    color: '#333',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: PRIMARY_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
});
