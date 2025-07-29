import React from "react";
import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { NavigationProp } from "@react-navigation/native";
import { COLORS } from '../constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';

type WelcomeScreenProps = {
  navigation: NavigationProp<any>;
};

export default function WelcomeScreen({ navigation }: WelcomeScreenProps) {
  return (
    <LinearGradient
      colors={['#004D65', '#3D8399', '#BF587C']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.background}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Welcome to Athena</Text>
        <Text style={styles.subtitle}>Empowering Women in STEM</Text>
        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.85}
          onPress={() => navigation.navigate("LoginPage")}
        >
          <Text style={styles.buttonText}>Let's Get Started</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#004D65",
    width: "100%",
    height: "100%",
    paddingHorizontal: 16,
  },
  container: {
    backgroundColor: "rgba(249, 211, 224, 0.15)",
    padding: 40,
    borderRadius: 24,
    alignItems: "center",
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
    borderColor: "#F9D3E0",
    borderWidth: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFDF2",
    marginBottom: 12,
    letterSpacing: 1.2,
    textShadowColor: "#3D8399",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  subtitle: {
    fontSize: 18,
    color: "#F9D3E0",
    marginBottom: 22,
    textAlign: "center",
    fontStyle: "italic",
    letterSpacing: 0.6,
  },
  button: {
    backgroundColor: "#BF587C",
    paddingVertical: 16,
    paddingHorizontal: 42,
    borderRadius: 32,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    fontSize: 21,
    color: "#FFFDF2",
    fontWeight: "bold",
    letterSpacing: 1.1,
  },
});
