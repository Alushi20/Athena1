import React, { useEffect, useState } from "react";
import { View, Text, SafeAreaView, Image, ActivityIndicator } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import CustomButton from "../components/CustomButton"; 
import { Account } from "react-native-appwrite";
import { client, config } from "../lib/appwrite"; // Import your existing Appwrite setup

// Define the screen params for type safety
type RootStackParamList = {
  Home: undefined;
  Profile: undefined;
  LoginPage: undefined;
};

// Type the props using NativeStackScreenProps
type ProfileScreenProps = NativeStackScreenProps<RootStackParamList, "Profile">;

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  const [email, setEmail] = useState<string | null>(null);
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const account = new Account(client);

  useEffect(() => {
    async function fetchUserData() {
      try {
        const user = await account.get();
        setEmail(user.email);

        // If user has a profile picture, fetch it
        if (user.prefs && user.prefs.profilePic) {
          setProfilePic(user.prefs.profilePic);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchUserData();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 20 }}>
      {/* Profile Picture */}
      <View 
        style={{
          width: 120,
          height: 120,
          borderRadius: 60,
          backgroundColor: "#ccc",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          marginBottom: 20,
        }}
      >
        {profilePic ? (
          <Image source={{ uri: profilePic }} style={{ width: "100%", height: "100%" }} />
        ) : (
          <Text style={{ fontSize: 40, color: "#fff" }}>👤</Text> // Default avatar
        )}
      </View>

      {/* Email Box */}
      <View 
        style={{
          width: "80%",
          padding: 20,
          backgroundColor: "#f5f5f5",
          borderRadius: 10,
          alignItems: "center",
        }}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#ff8c00" />
        ) : (
          <Text style={{ fontSize: 18, fontWeight: "bold" }}>Email: {email || "N/A"}</Text>
        )}
      </View>

      {/* Logout Button */}
      <CustomButton 
        title="Logout" 
        onPress={async () => {
          try {
            await account.deleteSession("current");
            navigation.replace("LoginPage");
          } catch (error) {
            console.error("Logout failed", error);
          }
        }} 
      />
    </SafeAreaView>
  );
}
