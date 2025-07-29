import React, { useState, useRef } from "react";
import { View, Text, SafeAreaView, TextInput, Alert, Animated, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import { Account, ID } from "react-native-appwrite";
import { client } from "../lib/appwrite";
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { COLORS } from '../constants/Colors';
import {auth} from '../lib/firebase-config'
import { signInWithEmailAndPassword } from "firebase/auth";
const account = new Account(client);

export default function LoginPage({ navigation }: { navigation: any }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [focused, setFocused] = useState<{ email: boolean; password: boolean }>({ email: false, password: false });
  const formAnim = useRef(new Animated.Value(0)).current;
  const errorAnim = useRef(new Animated.Value(0)).current;
  const loginBtnScale = useRef(new Animated.Value(1)).current;
  const signupBtnScale = useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    Animated.timing(formAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  React.useEffect(() => {
    Animated.timing(errorAnim, {
      toValue: error ? 1 : 0,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [error]);

  const signup = async () => {
    try {
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
      await account.create(userId, email, password, "New User");
      await account.createEmailPasswordSession(email, password);
      Alert.alert("Account Created", "Welcome!");
      navigation.replace("Main");
    } catch (createErr: any) {
      setError(createErr.message);
    }
  };

  const handleLogin = async () => {
    try {
      await account.deleteSession("current");
    } catch (err) {
      console.log("No active session found, continuing...");
    }
    try {
      await account.createEmailPasswordSession(email, password);
      Alert.alert("Login Successful", "Welcome back!");
      navigation.replace("Main");
    } catch (err: any) {
      setError("Incorrect password. Please try again.");
    }
  };

  // Button press animation helpers
  const animateBtnIn = (btnScale: Animated.Value) => {
    Animated.spring(btnScale, { toValue: 0.96, useNativeDriver: true }).start();
  };
  const animateBtnOut = (btnScale: Animated.Value) => {
    Animated.spring(btnScale, { toValue: 1, friction: 3, useNativeDriver: true }).start();
  };

  return (
    <LinearGradient
      colors={[COLORS.gradient[0], COLORS.gradient[1]]}
      style={styles.gradient}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Animated.View
            style={[
              styles.formContainer,
              {
                opacity: formAnim,
                transform: [
                  { translateY: formAnim.interpolate({ inputRange: [0, 1], outputRange: [60, 0] }) }
                ]
              }
            ]}
          >
            <Text style={styles.title}>Welcome Back!</Text>
            <Text style={styles.subtitle}>Login to your Athena account</Text>
            <Animated.View
              style={{
                opacity: errorAnim,
                transform: [
                  { translateY: errorAnim.interpolate({ inputRange: [0, 1], outputRange: [-10, 0] }) }
                ],
                marginBottom: error ? 10 : 0
              }}
            >
              {error && <Text style={styles.errorText}>{error}</Text>}
            </Animated.View>
            {/* Email Input */}
            <View style={[styles.inputWrapper, focused.email && styles.inputFocused]}>
              <MaterialIcons name="email" size={22} color={focused.email ? COLORS.primary : COLORS.secondary} style={{ marginRight: 8 }} />
              <TextInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                onFocus={() => setFocused(f => ({ ...f, email: true }))}
                onBlur={() => setFocused(f => ({ ...f, email: false }))}
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={COLORS.secondary}
              />
            </View>
            {/* Password Input */}
            <View style={[styles.inputWrapper, focused.password && styles.inputFocused]}>
              <Feather name="lock" size={22} color={focused.password ? COLORS.primary : COLORS.secondary} style={{ marginRight: 8 }} />
              <TextInput
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                onFocus={() => setFocused(f => ({ ...f, password: true }))}
                onBlur={() => setFocused(f => ({ ...f, password: false }))}
                secureTextEntry
                style={styles.input}
                placeholderTextColor={COLORS.secondary}
              />
            </View>
            {/* Login Button */}
            <Animated.View style={{ width: '100%', marginTop: 18, transform: [{ scale: loginBtnScale }] }}>
              <TouchableOpacity
                style={styles.button}
                activeOpacity={0.85}
                onPressIn={() => animateBtnIn(loginBtnScale)}
                onPressOut={() => animateBtnOut(loginBtnScale)}
                onPress={handleLogin}
              >
                <Feather name="log-in" size={20} color={COLORS.white} style={{ marginRight: 8 }} />
                <Text style={styles.buttonText}>Login</Text>
              </TouchableOpacity>
            </Animated.View>
            {/* Signup Button */}
            <Animated.View style={{ width: '100%', marginTop: 10, transform: [{ scale: signupBtnScale }] }}>
              <TouchableOpacity
                style={[styles.button, styles.signupButton]}
                activeOpacity={0.85}
                onPressIn={() => animateBtnIn(signupBtnScale)}
                onPressOut={() => animateBtnOut(signupBtnScale)}
                onPress={() => navigation.navigate('SignUp')}
              >
                <Feather name="user-plus" size={20} color={COLORS.primary} style={{ marginRight: 8 }} />
                <Text style={[styles.buttonText, { color: COLORS.primary }]}>Sign Up</Text>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  formContainer: {
    width: 320,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 6,
    letterSpacing: 1.1,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 18,
    fontWeight: '500',
  },
  errorText: {
    color: COLORS.error,
    fontWeight: 'bold',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 16,
    paddingHorizontal: 14,
    marginBottom: 14,
    borderWidth: 2,
    borderColor: COLORS.background,
    width: '100%',
    height: 48,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  inputFocused: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
    shadowOpacity: 0.18,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textSecondary,
    paddingVertical: 8,
    backgroundColor: 'transparent',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 18,
    paddingVertical: 12,
    justifyContent: 'center',
    width: '100%',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 17,
    letterSpacing: 1,
  },
  signupButton: {
    backgroundColor: COLORS.background,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
});
