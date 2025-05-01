import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function ProfileScreen() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <View style={[styles.container, isDark && styles.darkContainer]}>
      <Text style={[styles.title, isDark && styles.darkText]}>Perfil</Text>
      <Button
        title={`Alternar para modo ${isDark ? 'claro' : 'escuro'}`}
        onPress={toggleTheme}
        color={isDark ? '#fff' : '#000'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  darkContainer: {
    backgroundColor: '#1a1a1a',
  },
  title: {
    fontSize: 22,
    marginBottom: 20,
    color: '#000',
  },
  darkText: {
    color: '#fff',
  },
});
