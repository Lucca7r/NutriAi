import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const FavoritesScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Receitas Fit favorita aqui 🍽️</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
  },
});
