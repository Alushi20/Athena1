import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { COLORS } from '../constants/Colors';
import { Feather } from '@expo/vector-icons';

// Mock messages for UI
const MOCK_MESSAGES = [
  { id: '1', senderId: 'me', content: 'Hi! I’m excited to start our mentorship.', timestamp: '2024-06-01T10:00:00Z' },
  { id: '2', senderId: 'them', content: 'Welcome! Looking forward to working with you.', timestamp: '2024-06-01T10:01:00Z' },
  { id: '3', senderId: 'me', content: 'How do you recommend I get started in AI?', timestamp: '2024-06-01T10:02:00Z' },
  { id: '4', senderId: 'them', content: 'Start with Python and basic ML courses. I can send you some resources!', timestamp: '2024-06-01T10:03:00Z' },
];

const MentorshipChatScreen: React.FC = () => {
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [input, setInput] = useState('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Scroll to bottom on new message
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleSend = () => {
    if (input.trim()) {
      setMessages(prev => [
        ...prev,
        {
          id: (prev.length + 1).toString(),
          senderId: 'me',
          content: input,
          timestamp: new Date().toISOString(),
        },
      ]);
      setInput('');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: COLORS.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      <View style={styles.container}>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View
              style={[styles.messageRow, item.senderId === 'me' ? styles.myMessageRow : styles.theirMessageRow]}
            >
              <View style={[styles.bubble, item.senderId === 'me' ? styles.myBubble : styles.theirBubble]}>
                <Text style={[styles.messageText, item.senderId === 'me' ? styles.myText : styles.theirText]}>{item.content}</Text>
                <Text style={styles.timestamp}>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
              </View>
            </View>
          )}
          contentContainerStyle={{ paddingVertical: 16, paddingHorizontal: 8 }}
          showsVerticalScrollIndicator={false}
        />
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor={COLORS.textSecondary}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={handleSend}
            returnKeyType="send"
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend} disabled={!input.trim()}>
            <Feather name="send" size={22} color={input.trim() ? COLORS.white : COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  myMessageRow: {
    justifyContent: 'flex-end',
  },
  theirMessageRow: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 18,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  myBubble: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 6,
  },
  theirBubble: {
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  messageText: {
    fontSize: 16,
    marginBottom: 4,
  },
  myText: {
    color: COLORS.white,
  },
  theirText: {
    color: COLORS.text,
  },
  timestamp: {
    fontSize: 11,
    color: COLORS.textSecondary,
    alignSelf: 'flex-end',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.accent,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: 'transparent',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 16,
  },
  sendButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    padding: 8,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MentorshipChatScreen; 