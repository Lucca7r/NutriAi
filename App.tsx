import React, { useEffect } from 'react'; // <--- PRECISA DO useEffect
import AppNavigator from './src/navigation';
import { ThemeProvider } from './src/context/ThemeContext';
import { AuthProvider } from './src/context/AuthContext';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_400Regular_Italic,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_600SemiBold_Italic,
  Poppins_500Medium_Italic,
  Poppins_700Bold,
  Poppins_700Bold_Italic,
} from '@expo-google-fonts/poppins';

import { Text, View } from 'react-native';

// --- IMPORTE O GOOGLE SIGNIN ---
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// --- COLOQUE SEU WEB_CLIENT_ID AQUI ---
// (Pegue do google-services.json, aquele com client_type: 3)
const WEB_CLIENT_ID = "772370063523-gaa0k879vhnq8re4jn1e6dkh81n3rqej.apps.googleusercontent.com"; 

export default function App() {
  // --- ADICIONE ESTE BLOCO ---
  useEffect(() => {
    try {
      GoogleSignin.configure({
        webClientId: WEB_CLIENT_ID,
      });
      console.log("Google Sign-In Configurado!"); // Para vermos se funcionou
    } catch (error) {
      console.error("Erro ao configurar Google Sign-In:", error);
    }
  }, []);
  // --- FIM DO BLOCO ---

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_400Regular_Italic,
    Poppins_500Medium,
    Poppins_500Medium_Italic,
    Poppins_600SemiBold,
    Poppins_600SemiBold_Italic,
    Poppins_700Bold,
    Poppins_700Bold_Italic,
  });

  if (!fontsLoaded) {
    return (
      <View>
        <Text>Carregando fontes...</Text>
      </View>
    );
  }

  return (
    <AuthProvider>
      <ThemeProvider>
        <AppNavigator />
      </ThemeProvider>
    </AuthProvider>
  );
}