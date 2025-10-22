import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { useTheme, useThemeColors } from "../context/ThemeContext";
import ProfileHeader from "../components/ProfileHeader";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../@types/navigation";
import { Ionicons } from "@expo/vector-icons";
import { signOut } from "firebase/auth";
import { FIREBASE_AUTH } from "../services/firebaseConfig";
import { Alert } from "react-native";
import { createGeralStyles } from "../styles/Geral.style";

type ProfileScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Profile"
>;

export default function ProfileScreen() {
  const { theme, toggleTheme } = useTheme();
  const colors = useThemeColors();
  const styles = createGeralStyles(colors);
  const isDark = theme === "dark";
  const navigation = useNavigation<ProfileScreenNavigationProp>();

  // A lógica do modal e do peso foi removida daqui

  const handleLogout = async () => {
    try {
      await signOut(FIREBASE_AUTH);
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível sair da conta.");
    }
  };

  const handleNavigateToEdit = () => {
    navigation.navigate("EditProfile");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.profileContainer}>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={handleNavigateToEdit}
        >
          <Ionicons name="settings-outline" size={28} color="#C8C9D2" />
        </TouchableOpacity>

        <ProfileHeader />

        {/* <View style={styles.section}>
        <Text style={[styles.label, { color: colors.text }]}>Modo Escuro</Text>
        <Switch value={isDark} onValueChange={toggleTheme} />
      </View> */}
        <View style={{alignItems: "center"}}>
          <TouchableOpacity onPress={handleLogout} >
            <Text
              style={[styles.label, { marginTop: 100, textAlign: "center", backgroundColor: 'red', borderRadius: 10, width: 150, padding: 12}]}
            >
              Sair da Conta
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
