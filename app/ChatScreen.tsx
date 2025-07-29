import React, { useEffect, useState, useRef } from "react";
import { 
  View, Text, TextInput, FlatList, TouchableOpacity, SafeAreaView, StyleSheet, 
  KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback, Animated
} from "react-native";
import { Account, Databases, ID } from "react-native-appwrite";
import { client } from "../lib/appwrite";
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

const databases = new Databases(client);
const account = new Account(client);

export default function ChatScreen() {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const flatListRef = useRef<FlatList<any>>(null);
  const [animMessages, setAnimMessages] = useState<{ [id: string]: Animated.Value }>({});

  useEffect(() => {
    account.get().then((user) => setUserEmail(user.email)).catch(console.error);

    const fetchMessages = async () => {
      try {
        const res = await databases.listDocuments("67bc1b9400215f978730", "67c31ffc003b2ae81fac");
        setMessages(res.documents.reverse());
      } catch (error) {
        console.error(error);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Animate new messages
    if (messages.length > 0) {
      const latest = messages[0];
      if (!animMessages[latest.$id]) {
        const anim = new Animated.Value(0);
        setAnimMessages((prev) => ({ ...prev, [latest.$id]: anim }));
        Animated.timing(anim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }).start();
      }
    }
    flatListRef.current?.scrollToOffset({ animated: true, offset: 0 });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    await databases.createDocument(
      "67bc1b9400215f978730",
      "67c31ffc003b2ae81fac",
      ID.unique(),
      { body: newMessage, userID: userEmail, email: userEmail }
    );
    setNewMessage("");
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isSent = item.email === userEmail;
    const anim = animMessages[item.$id] || new Animated.Value(1);
    return (
      <Animated.View
        style={[
          styles.messageRow,
          { justifyContent: isSent ? 'flex-end' : 'flex-start' },
          { opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }] }
        ]}
      >
        {!isSent && (
          <View style={styles.avatar}>
            <MaterialCommunityIcons name="account-circle" size={32} color="#b983ff" />
          </View>
        )}
        <View style={[styles.messageBubble, isSent ? styles.sent : styles.received]}>
          <Text style={styles.sender}>{isSent ? "You" : item.email}</Text>
          <Text style={styles.messageText}>{item.body}</Text>
        </View>
        {isSent && (
          <View style={styles.avatar}>
            <MaterialCommunityIcons name="account-circle" size={32} color="#a66cff" />
          </View>
        )}
      </Animated.View>
    );
  };

  return (
    <LinearGradient
      colors={["#f6e6ff", "#e7c6ff", "#b983ff"]}
      style={{ flex: 1 }}
    >
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 90}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView style={styles.container}>
            {/* Messages List */}
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item) => item.$id}
              renderItem={renderMessage}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 100, paddingTop: 16 }}
              inverted={false}
              showsVerticalScrollIndicator={false}
            />
            {/* Floating Input Bar */}
            <View style={styles.inputBarWrapper}>
              <View style={styles.inputBar}>
            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              value={newMessage}
              onChangeText={setNewMessage}
              onSubmitEditing={sendMessage}
                  placeholderTextColor="#b983ff"
            />
                <TouchableOpacity style={styles.sendButton} onPress={sendMessage} activeOpacity={0.8}>
                  <Feather name="send" size={22} color="#fff" />
            </TouchableOpacity>
              </View>
            </View>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
    justifyContent: 'flex-end',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 4,
    paddingHorizontal: 12,
  },
  avatar: {
    marginHorizontal: 4,
    marginBottom: 2,
  },
  messageBubble: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    maxWidth: '75%',
    shadowColor: '#b983ff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 2,
  },
  sent: {
    backgroundColor: '#a66cff',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 6,
  },
  received: {
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 6,
    borderWidth: 1.5,
    borderColor: '#e7c6ff',
  },
  sender: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#b983ff',
    marginBottom: 2,
  },
  messageText: {
    fontSize: 15,
    color: '#4a375d',
  },
  inputBarWrapper: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    alignItems: 'center',
    paddingBottom: 10,
    backgroundColor: 'transparent',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    width: '94%',
    shadowColor: '#b983ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 4,
  },
    input: { 
      flex: 1, 
    fontSize: 16,
    color: '#7f5283',
    backgroundColor: 'transparent',
    paddingVertical: 8,
    paddingHorizontal: 8,
    },
    sendButton: { 
    backgroundColor: '#a66cff',
    borderRadius: 20,
    padding: 10,
    marginLeft: 8,
    shadowColor: '#a66cff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  });

