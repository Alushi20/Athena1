import React, { useEffect, useState, useRef } from "react";
import { 
  View, Text, TextInput, FlatList, TouchableOpacity, SafeAreaView, StyleSheet, 
  KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback 
} from "react-native";
import { Account, Databases, Client, ID } from "react-native-appwrite";
import { client } from "../lib/appwrite";

const databases = new Databases(client);
const account = new Account(client);

export default function ChatScreen() {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const flatListRef = useRef<FlatList<any>>(null);

  useEffect(() => {
    account.get().then((user) => setUserEmail(user.email)).catch(console.error);

    const fetchMessages = async () => {
      try {
        const res = await databases.listDocuments("67bc1b9400215f978730", "67c31ffc003b2ae81fac");
        setMessages(res.documents.reverse()); // NEW MESSAGES GO TO THE TOP
      } catch (error) {
        console.error(error);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    flatListRef.current?.scrollToOffset({ animated: true, offset: 0 }); // SCROLL TO THE TOP
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

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 90}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView style={styles.container}>

          {/* Input Box at the Top */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              value={newMessage}
              onChangeText={setNewMessage}
              onSubmitEditing={sendMessage}
            />
            <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
              <Text style={styles.sendText}>Send</Text>
            </TouchableOpacity>
          </View>

          {/* Messages List (New messages appear at the top) */}
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.$id}
            renderItem={({ item }) => (
              <View style={[styles.messageBubble, item.email === userEmail ? styles.sent : styles.received]}>
                <Text style={styles.sender}>{item.email}</Text>
                <Text>{item.body}</Text>
              </View>
            )}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 100 }}
          />

        </SafeAreaView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
  
    messageBubble: { padding: 10, borderRadius: 10, marginVertical: 5, maxWidth: "80%" },
    sent: { alignSelf: "flex-end", backgroundColor: "#0084ff", color: "white" },
    received: { alignSelf: "flex-start", backgroundColor: "#e5e5ea" },
    sender: { fontSize: 12, fontWeight: "bold", marginBottom: 3 },
  
    inputContainer: { 
      flexDirection: "row",
      alignItems: "center",
      padding: 10,
      backgroundColor: "white",
      borderBottomWidth: 1,
      borderColor: "#ccc",
    },
    
    input: { 
      flex: 1, 
      borderWidth: 1, 
      borderColor: "#ccc", 
      padding: 12, 
      borderRadius: 5,
      backgroundColor: "white"
    },
  
    sendButton: { 
      marginLeft: 10, 
      backgroundColor: "#0084ff", 
      padding: 12, 
      borderRadius: 5 
    },
    sendText: { color: "white", fontWeight: "bold" },
  });

