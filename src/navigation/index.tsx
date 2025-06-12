// src/navigation/index.tsx
import React from 'react';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_700Bold } from "@expo-google-fonts/poppins";
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';

import CadastroScreen from '../screens/CadastroScreen';
import LoginScreen from '../screens/LoginScreen';
import FormularioScreen from "../screens/FormularioScreen";
import BottomTabs from './BottomTabs';
import { useAuth } from '../context/AuthContext'; // Importe o hook
import { RootStackParamList } from '../@types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { user, loading } = useAuth(); // Use o contexto

  // Mostra um indicador de carregamento enquanto o Firebase verifica a autenticação
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user ? (
          // Se o usuário estiver logado, a tela principal é o BottomTabs
          <Stack.Screen
            name="Main"
            component={BottomTabs}
            options={{ headerShown: false }}
          />
        ) : (
          // Se não houver usuário, mostre as telas de Formulario e Cadastro
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Cadastro"
              component={CadastroScreen}
              options={{ headerShown: false }}
            />
          <Stack.Screen
          name="Formulario"
          component={FormularioScreen}
          options={{ headerShown: false }}
        />

        </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}