import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  Animated,
} from 'react-native';
import { useThemeColors } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

const tips = [
  'Beba pelo menos 2 litros de água por dia.',
  'Inclua vegetais coloridos nas suas refeições.',
  'Evite pular o café da manhã.',
  'Pratique exercícios físicos regularmente.',
  'Durma ao menos 7 horas por noite.',
];

export const HomeScreen = () => {
  const colors = useThemeColors();
  const [currentIndex, setCurrentIndex] = useState(0);
  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
  const interval = setInterval(() => {
    setCurrentIndex((prev) => (prev + 1) % tips.length);
  }, 10000);

  return () => clearInterval(interval);
}, []);

  return (
   <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
  <View style={styles.header}>
    <Text style={[styles.logo, { color: colors.text }]}>
      <Text style={{ fontWeight: 'bold' }}>Nutri</Text>AI
    </Text>
  </View>

  <View style={styles.carouselContainer}>
    <View style={[styles.card, { backgroundColor: colors.iconBackground }]}>
      <Text style={[styles.tipText, { color: colors.text }]}>
        {tips[currentIndex]}
      </Text>
    </View>
  </View>
</SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center'
  },
  header: {
    marginTop: 40,
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    fontSize: 32,
    fontStyle: 'italic',
  },
 carouselContainer: {
  justifyContent: 'center',
  alignItems: 'center',
  height: 180,
  paddingHorizontal: 20,
},
  slider: {
    flexDirection: 'row',
  },
  card: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    padding: 50,
    margin: 10,
    borderRadius: 15
  },
  tipText: {
    fontSize: 18,
    textAlign: 'center',
  },
});
