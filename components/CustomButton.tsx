import React from "react";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { COLORS } from '../constants/Colors';

type CustomButtonProps = {
  title: string;
  onPress: () => void;
  style?: object;
  textStyle?: object;
  icon?: React.ReactNode;
};

export default function CustomButton({ title, onPress, style, textStyle, icon }: CustomButtonProps) {
  return (
    <TouchableOpacity style={[styles.button, style]} onPress={onPress}>
      {icon && <View style={{ marginRight: 8 }}>{icon}</View>}
      <Text style={[styles.buttonText, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.secondary,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 15,
  },
  buttonText: {
    fontSize: 18,
    color: COLORS.white,
    fontWeight: "bold",
    textAlign: "center",
  },
});
