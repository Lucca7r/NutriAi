import React from "react";
import { View, Image, Text, StyleSheet } from "react-native";
import { useThemeColors } from "../context/ThemeContext";

import { useAuth } from "../context/AuthContext";
import { createGeralStyles } from "../styles/Geral.style";

export default function ProfileHeader() {
  const colors = useThemeColors();
  const styles = createGeralStyles(colors);
  const { user, profile } = useAuth();
  
  return (
    <View style={styles.avatarContainer}>
      <Image
        source={{
          uri: profile?.photoURL || "URL_DA_SUA_IMAGEM_PADRAO_AQUI",
        }}
        style={styles.profileImage}
      />
      <Text style={styles.userName}>
        {profile ? profile.name : "carregando ... "}
      </Text>
    </View>
  );
}
