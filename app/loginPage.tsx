import React, { useState } from "react";
import { View, Text, SafeAreaView, TextInput, Button, Alert } from "react-native";
import { Account } from "react-native-appwrite";
import { client } from "../lib/appwrite"; // Ensure correct path
import { ID } from "react-native-appwrite";

const account = new Account(client);

export default function LoginPage({ navigation }: { navigation: any }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const signup = async () => {
    try {
      // Ensure session is cleared before login
      await account.deleteSession("current");
    } catch (err) {
      console.log("No active session found, continuing...");
    }
    
    try {
      if (password.length < 8) {
        setError("Password must be at least 8 characters long.");
        return;
      }

      const userId = ID.unique();
      console.log(`Creating account for Email: ${email}`);

      const newUser = await account.create(userId, email, password, "New User");
      console.log("User created successfully:", newUser);

      //Wait  for Appwrite to fully register the user
      //await new Promise((resolve) => setTimeout(resolve, 5000));

      // Check if the user now exists
      

      // Now log in with the same credentials
      console.log(`Logging in newly created user: Email: ${email}`);
      let session = await account.createEmailPasswordSession(email, password);

      Alert.alert("Account Created", "Welcome!");
      navigation.replace("Home");
    } catch (createErr: any) {
      console.log("Account creation error:", createErr);
      setError(createErr.message);
    }
  };

  const handleLogin = async () => {
    try {
      // Ensure session is cleared before login
      await account.deleteSession("current");
    } catch (err) {
      console.log("No active session found, continuing...");
    }

    try {
      console.log(`Trying to log in with: Email: ${email}, Password: ${password}`);
      let session = await account.createEmailPasswordSession(email, password);
      Alert.alert("Login Successful", "Welcome back!");
      navigation.replace("Home");
    } 
    catch (err: any) 
    {
      console.log("Login error:", err);
      setError("Incorrect password. Please try again.");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 22 }}>Login</Text>
      {error && <Text style={{ color: "red" }}>{error}</Text>}
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={{ width: 200, height: 40, borderBottomWidth: 1, marginBottom: 20 }}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ width: 200, height: 40, borderBottomWidth: 1, marginBottom: 20 }}
      />
      <Button title="Login" onPress={handleLogin} />
      <Button title="Signup" onPress={signup} />
    </SafeAreaView>
  );
}
