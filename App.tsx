import React from 'react';
import AppNavigator from './src/navigation';
import { ThemeProvider } from './src/context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function App() {
  return (
    
      <ThemeProvider>
        <AppNavigator />
    </ThemeProvider>
      
  );
}
