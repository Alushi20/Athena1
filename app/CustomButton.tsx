import React from "react";
import { Text, TouchableOpacity, StyleSheet } from "react-native";

// Define types for the props
type CustomButtonProps = {
  title: string; // 'title' must be a string
  onPress: () => void; // 'onPress' must be a function with no arguments that returns void
};

// Reusable Button Component with Custom Design
const CustomButton: React.FC<CustomButtonProps> = ({ title, onPress }) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
};

export default CustomButton;

// Styles
const styles = StyleSheet.create({
  button: {
    backgroundColor: "#4CAF50", // Green background
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 5, // Add some spacing between buttons
  },
  text: {
    color: "#FFFFFF", // White text
    fontSize: 16,
    fontWeight: "bold",
  },
});
