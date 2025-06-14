// src/screens/EditProfileScreen.tsx

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeColors } from '../context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EditProfileScreen() {
  const colors = useThemeColors();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>
          Editar Perfil
        </Text>
        <Text style={{ color: colors.text }}>
          Aqui ficarão os campos para editar nome, e-mail, senha, etc.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});