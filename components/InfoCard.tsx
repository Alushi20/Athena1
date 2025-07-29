import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS, FONTS } from "../constants/Colors";

type InfoCardProps = {
  title: string;
  content: string;
};

export default function InfoCard({ title, content }: InfoCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.content}>{content}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.aboutUs,
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    width: "90%",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.white,
    marginBottom: 5,
    fontFamily: FONTS.title,
  },
  content: {
    fontSize: 14,
    color: COLORS.white,
    fontFamily: FONTS.body,
  },
});
