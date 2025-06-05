import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
} from 'react-native';
import { useTheme, useThemeColors } from '../context/ThemeContext';
import ProfileHeader from '../components/ProfileHeader';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../@types/navigation';

export default function ProfileScreen() {
  const { theme, toggleTheme } = useTheme();
  const colors = useThemeColors();
  const isDark = theme === 'dark';

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleLogout = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ProfileHeader />
      <View style={styles.section}>
        <Text style={[styles.label, { color: colors.text }]}>Modo Escuro</Text>
        <Switch value={isDark} onValueChange={toggleTheme} />
      </View>
      <View style={styles.section}>
        <TouchableOpacity>
          <Text style={[styles.link, { color: colors.icon }]}>Editar Perfil</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={[styles.link, { color: colors.icon }]}>Sair da Conta</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  section: {
    marginTop: 30,
    paddingHorizontal: 12,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  link: {
    fontSize: 16,
    paddingVertical: 10,
  },
});
