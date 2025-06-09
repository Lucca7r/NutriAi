import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors } from "../context/ThemeContext";
import { createFormularioStyles } from "../styles/FormularioScreen.style";

const Logo = () => {
  const colors = useThemeColors();
  const styles = createFormularioStyles(colors);

  return (
    <View style={styles.logoContainer}>
      <Ionicons name="leaf" size={32} color={"#C8C9D2"} />
      <Text style={styles.logoText}>NutriAI</Text>
    </View>
  );
};

export default Logo;
