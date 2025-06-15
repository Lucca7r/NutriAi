// src/components/FAB.tsx

import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors } from "../context/ThemeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface FABProps {
  onPress: () => void;
}

export default function FAB({ onPress }: FABProps) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: colors.primary, top: insets.top + 16 },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons name="add" size={32} color="#FFFFFF" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 24,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
