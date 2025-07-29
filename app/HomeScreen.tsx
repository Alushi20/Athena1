import React, { useState, useEffect } from "react";
import { View, Text, SafeAreaView, ActivityIndicator } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import CustomButton from "../components/CustomButton"; 
import InfoCard from "../components/InfoCard"; 

// Define the screen params for type safety
type RootStackParamList = {
  LoginPage: undefined;
  Home: undefined;
  Chat: undefined;
  Profile: undefined; // Added Profile screen
};

// Type the props using NativeStackScreenProps
type HomeScreenProps = NativeStackScreenProps<RootStackParamList, "Home">;

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const [message, setMessage] = useState("Loading latest updates...");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setMessage("Empowering women in STEM, one step at a time.");
      setLoading(false);
    }, 2000);
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold" }}>Welcome to the Home Page!</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#ff8c00" style={{ marginVertical: 20 }} />
      ) : (
        <Text style={{ fontSize: 16, color: "#ff8c00", marginVertical: 10 }}>{message}</Text>
      )}

      <InfoCard 
        title="About Us"
        content="Despite progress in gender equality, women remain underrepresented in STEM fields. Deep-rooted stereotypes, lack of role models, and systemic biases often discourage young girls from pursuing STEM careers."
      />

      <InfoCard 
        title="Our Mission"
        content="GalWise is here to break barriers! We foster inclusive environments, provide mentorship, and promote STEM education for young women, empowering the next generation of female tech leaders."
      />

      {/* Navigation Buttons */}
      <CustomButton title="Go to Chat" onPress={() => navigation.navigate("Chat")} />
      <CustomButton title="Go to Profile" onPress={() => navigation.navigate("Profile")} /> {/* Added Profile button */}
      <CustomButton title="Logout" onPress={() => navigation.replace("LoginPage")} />
    </SafeAreaView>
  );
}
