# Floating AI Chat Bot - Integration Guide

## 📌 Tổng quan

Component **FloatingChatBot** tạo một AI chatbot nổi ở góc dưới màn hình, luôn hiển thị trên mọi màn hình của app.

### ✨ Tính năng:
- 🎈 Nút tròn nổi ở góc dưới phải màn hình
- 💬 Click để mở cửa sổ chat đầy đủ
- 🤖 Tích hợp AI (OpenAI GPT, Google Gemini, hoặc backend riêng)
- ⚡ Quick actions để gửi câu hỏi nhanh
- 📱 Responsive, keyboard-aware
- 🎨 UI hiện đại với animations mượt mà

## 🚀 Cách sử dụng

### Bước 1: Import vào App.js hoặc Root Navigator

```javascript
import FloatingChatBot from './src/shared/components/FloatingChatBot';

export default function App() {
  return (
    <View style={{ flex: 1 }}>
      {/* Your app content */}
      <NavigationContainer>
        <YourNavigator />
      </NavigationContainer>

      {/* Floating Chat Bot - Always on top */}
      <FloatingChatBot />
    </View>
  );
}
```

### Bước 2: Hoặc trong Navigator (Recommended)

```javascript
// src/navigation/RootNavigator.js
import FloatingChatBot from '../shared/components/FloatingChatBot';

export default function RootNavigator() {
  return (
    <>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        {/* ... other screens */}
      </Stack.Navigator>

      {/* Floating Chat Bot */}
      <FloatingChatBot />
    </>
  );
}
```

### Bước 3: Configure AI Service (Optional)

Nếu muốn dùng AI API thật (OpenAI hoặc Gemini):

```javascript
// src/shared/config/aiConfig.js
import AIChatService from '../services/AIChatService';

// Option 1: OpenAI GPT
AIChatService.setConfig('YOUR_OPENAI_API_KEY', 'openai');

// Option 2: Google Gemini
AIChatService.setConfig('YOUR_GEMINI_API_KEY', 'gemini');

// Option 3: Custom Backend
AIChatService.setConfig(null, 'custom');
// Then update callCustomBackend() in AIChatService.js
```

Import config vào App.js:
```javascript
import './src/shared/config/aiConfig';
```

## 🎨 Customization

### 1. Thay đổi vị trí button

```javascript
// FloatingChatBot.js - styles.floatingButton
floatingButton: {
  position: 'absolute',
  bottom: 20,  // Thay đổi khoảng cách từ dưới
  right: 20,   // Thay đổi khoảng cách từ phải
  // left: 20, // Hoặc đặt bên trái
  zIndex: 9999,
},
```

### 2. Thay đổi màu sắc

```javascript
// Màu nút chính
floatingButtonInner: {
  backgroundColor: '#00b14f', // Đổi màu
}

// Màu tin nhắn user
userBubble: {
  backgroundColor: '#00b14f', // Đổi màu
}

// Màu nút gửi
sendButton: {
  backgroundColor: '#00b14f', // Đổi màu
}
```

### 3. Thay đổi kích thước cửa sổ chat

```javascript
chatWindow: {
  width: SCREEN_WIDTH - 40,  // Chiều rộng
  maxWidth: 380,             // Tối đa
  height: SCREEN_HEIGHT * 0.65, // 65% chiều cao màn hình
  maxHeight: 600,            // Tối đa
}
```

### 4. Thêm Quick Actions mới

```javascript
<QuickAction
  icon="star-outline"
  text="Top Jobs"
  onPress={() => setInputText('Hiện các công việc hot nhất')}
/>
<QuickAction
  icon="location-outline"
  text="Việc gần đây"
  onPress={() => setInputText('Tìm việc gần vị trí của tôi')}
/>
```

### 5. Custom AI Responses

Sửa `getMockResponse()` trong `AIChatService.js`:

```javascript
const responses = {
  'keyword1|keyword2': [
    'Response 1',
    'Response 2',
  ],
  'new_keyword': [
    'Custom response for new keyword',
  ],
};
```

## 🔌 Integrate với Backend

### Option 1: OpenAI API

```javascript
// AIChatService.js - callOpenAI()
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${this.apiKey}`, // Your OpenAI API Key
  },
  body: JSON.stringify({
    model: 'gpt-3.5-turbo', // or 'gpt-4'
    messages: [
      { role: 'system', content: systemPrompt },
      ...this.conversationHistory,
    ],
  }),
});
```

**Cost**: ~$0.002 per 1K tokens (GPT-3.5)

### Option 2: Google Gemini API (Free tier available)

```javascript
// AIChatService.js - callGemini()
const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.apiKey}`,
  {
    method: 'POST',
    body: JSON.stringify({
      contents: [{ parts: [{ text: message }] }],
    }),
  }
);
```

**Free tier**: 60 requests/minute

### Option 3: Custom Backend (Recommended)

```javascript
// Your backend API
POST http://your-backend.com/api/ai/chat

Request:
{
  "message": "User's question",
  "context": {
    "userRole": "candidate",
    "userId": "123"
  },
  "history": [...]
}

Response:
{
  "response": "AI's answer"
}
```

Update `callCustomBackend()` trong `AIChatService.js`:

```javascript
async callCustomBackend(message, context) {
  const response = await fetch('YOUR_BACKEND_URL/api/ai/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`, // If needed
    },
    body: JSON.stringify({
      message,
      context,
      history: this.conversationHistory.slice(-10),
    }),
  });

  const data = await response.json();
  return data.response;
}
```

## 📊 Context-Aware Responses

Bot tự động nhận context từ user:

```javascript
const context = {
  userRole: userRole,      // 'candidate' or 'employer'
  userId: user?.id,
  userName: user?.name,
};

const aiResponse = await AIChatService.sendMessage(message, context);
```

AI sẽ trả lời khác nhau dựa trên:
- **Candidate**: Tìm việc, CV, phỏng vấn
- **Employer**: Tuyển dụng, đăng tin, tìm ứng viên

## 🎯 Advanced Features

### 1. Persistent Chat History

```javascript
// Save to AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';

useEffect(() => {
  // Load history on mount
  loadChatHistory();
}, []);

const saveChatHistory = async (messages) => {
  await AsyncStorage.setItem('chat_history', JSON.stringify(messages));
};

const loadChatHistory = async () => {
  const history = await AsyncStorage.getItem('chat_history');
  if (history) {
    setMessages(JSON.parse(history));
  }
};
```

### 2. Voice Input

```javascript
import Voice from '@react-native-voice/voice';

const startVoiceRecording = async () => {
  await Voice.start('vi-VN');
};

Voice.onSpeechResults = (e) => {
  setInputText(e.value[0]);
};
```

### 3. Action Buttons in Messages

```javascript
const ActionButton = ({ text, onPress }) => (
  <TouchableOpacity style={styles.actionButton} onPress={onPress}>
    <Text>{text}</Text>
  </TouchableOpacity>
);

// In bot response
{
  id: '1',
  text: 'Bạn muốn làm gì?',
  sender: 'bot',
  actions: [
    { text: 'Tìm việc', action: () => navigation.navigate('Jobs') },
    { text: 'Tạo CV', action: () => navigation.navigate('CVBuilder') },
  ]
}
```

### 4. Typing Animation

Đã có sẵn với 3 dots animation:

```javascript
{isTyping && (
  <View style={styles.typingIndicator}>
    <View style={styles.typingDot} />
    <View style={[styles.typingDot, styles.typingDot2]} />
    <View style={[styles.typingDot, styles.typingDot3]} />
  </View>
)}
```

## 🐛 Troubleshooting

### Bot không hiện
- Check zIndex trong styles (phải > zIndex của các components khác)
- Đảm bảo FloatingChatBot được render sau các components khác

### Keyboard che input
- Component đã dùng `KeyboardAvoidingView`
- Nếu vẫn bị, thử thay đổi `keyboardVerticalOffset`

### AI response chậm
- Tăng/giảm `setTimeout` delay (hiện tại: 1500ms)
- Check network speed với AI API
- Cache responses thường dùng

### Position bị sai trên iOS/Android
- Test trên cả 2 platform
- Adjust `bottom`, `right` values trong styles
- Check SafeAreaView nếu dùng

## 📱 Screenshots Demo

```
┌─────────────────────────┐
│                         │
│   Your App Content      │
│                         │
│                         │
│                         │
│                         │
│                  ┌────┐ │  <- Floating button (collapsed)
│                  │ 💬 │ │
│                  └────┘ │
└─────────────────────────┘

When clicked:

┌─────────────────────────┐
│  ┌────────────────────┐ │
│  │ 🤖 AI Assistant   X│ │  <- Chat window (expanded)
│  ├────────────────────┤ │
│  │ Bot: Hi! How can  │ │
│  │      I help?      │ │
│  │                    │ │
│  │      You: Find job│ │
│  ├────────────────────┤ │
│  │ [Quick Actions]    │ │
│  ├────────────────────┤ │
│  │ Type message... 📤 │ │
│  └────────────────────┘ │
│                  ┌────┐ │
│                  │ ✕  │ │  <- Close button
│                  └────┘ │
└─────────────────────────┘
```

## 🎓 Best Practices

1. **Không block main thread**: AI calls nên async
2. **Handle errors gracefully**: Luôn có fallback response
3. **Limit conversation history**: Chỉ gửi 10 messages gần nhất
4. **Debounce input**: Tránh spam requests
5. **Clear history**: Khi user logout
6. **Test on both platforms**: iOS và Android có behaviors khác

## 🔐 Security

- **NEVER** hardcode API keys trong code
- Dùng environment variables: `process.env.OPENAI_API_KEY`
- Hoặc store trong secure storage: `expo-secure-store`
- Call AI qua backend proxy để bảo mật API keys

```javascript
// .env
OPENAI_API_KEY=sk-xxx...

// Load in app
import Constants from 'expo-constants';
const apiKey = Constants.expoConfig.extra.openaiApiKey;
```

## 📚 Resources

- OpenAI API: https://platform.openai.com/docs
- Google Gemini: https://ai.google.dev/docs
- React Native Animations: https://reactnative.dev/docs/animated
- Expo Vector Icons: https://icons.expo.fyi

## 🎉 Done!

Bây giờ bạn có một AI chatbot nổi hiện đại trong app!
