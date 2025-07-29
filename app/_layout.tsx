import React from "react";
import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="Home" />
      <Stack.Screen name="EventsWorkshops" />
      <Stack.Screen name="Mentorship" />
      <Stack.Screen name="Profile" />
      <Stack.Screen name="LearningCenter" />
      <Stack.Screen name="Communities" />
    </Stack>
  );
}
