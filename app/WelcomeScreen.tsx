import React from "react";
import { Text, View, StyleSheet, ImageBackground, TouchableOpacity } from "react-native";
import { NavigationProp } from "@react-navigation/native";

type WelcomeScreenProps = {
  navigation: NavigationProp<any>;
};

export default function WelcomeScreen({ navigation }: WelcomeScreenProps) {
  return (
    <ImageBackground
      source={require("./HOME_PAGE.jpg")}
      style={styles.background}
    >
      {/* Geometric Overlay */}
      <View style={styles.overlay}>
        <View style={styles.diamond} />
        <View style={styles.borderLayer} />
        <View style={[styles.borderLayer, styles.borderLayer2]} />
      </View>

      {/* Content */}
      <View style={styles.container}>
        <Text style={styles.title}>Welcome to Athena</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("LoginPage")}
        >
          <Text style={styles.buttonText}>Let's Get Started</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
  overlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  diamond: {
    position: "absolute",
    width: "70%",
    height: "40%",
    backgroundColor: "#dcdfe4",
    transform: [{ rotate: "45deg" }],
  },
  borderLayer: {
    position: "absolute",
    width: "75%",
    height: "45%",
    borderWidth: 10,
    borderColor: "#7b7191",
    transform: [{ rotate: "45deg" }],
  },
  borderLayer2: {
    width: "80%",
    height: "50%",
    borderColor: "#4a375d",
  },
  container: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#ff8c00",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  buttonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
});
