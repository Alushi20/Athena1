import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/Colors';

const FeedbackScreen = () => (
  <View style={styles.container}>
    <Text style={styles.text}>Feedback coming soon!</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  text: {
    fontSize: 20,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
});

export default FeedbackScreen;
