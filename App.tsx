import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import BottomTabs from './src/navigation/BottomTabs';
import { ThemeProvider } from './src/context/ThemeContext';

export default function App() {
  return (
    <ThemeProvider>
      <NavigationContainer>
        <BottomTabs />
      </NavigationContainer>
    </ThemeProvider>
  );
}