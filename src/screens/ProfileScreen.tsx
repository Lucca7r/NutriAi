// src/screens/ProfileScreen.tsx

import React from 'react';
import {
  View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView
} from 'react-native';
import { useTheme, useThemeColors } from '../context/ThemeContext';
import ProfileHeader from '../components/ProfileHeader';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../@types/navigation';
import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { FIREBASE_AUTH } from '../services/firebaseConfig';
import { Alert } from 'react-native';



type ProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Profile'>;

export default function ProfileScreen() {
  const { theme, toggleTheme } = useTheme();
  const colors = useThemeColors();
  const isDark = theme === 'dark';
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
    navigation.navigate('EditProfile');
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableOpacity style={styles.settingsButton} onPress={handleNavigateToEdit}>
        <Ionicons name="settings-outline" size={28} color={colors.icon} />
      </TouchableOpacity>
      
      <ProfileHeader />

      

      <View style={styles.section}>
        <Text style={[styles.label, { color: colors.text }]}>Modo Escuro</Text>
        <Switch value={isDark} onValueChange={toggleTheme} />
      </View>
      <View style={styles.section}>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={[styles.link, { color: colors.icon }]}>Sair da Conta</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// Estilos foram simplificados, removendo os do modal e do botão de registro
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  settingsButton: { 
    position: 'absolute', 
    top: 60, 
    right: 24, 
    zIndex: 1 
  },
  section: { 
    marginTop: 30, 
    paddingHorizontal: 12,
    marginBottom: 40, // Adicionado espaço no final
  },
  label: { 
    fontSize: 16, 
    marginBottom: 8 
  },
  link: { 
    fontSize: 16, 
    paddingVertical: 10 
  },
});