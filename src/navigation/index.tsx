// src/navigation/index.tsx
import React from "react";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, View } from "react-native";

import CadastroScreen from "../screens/CadastroScreen";
import LoginScreen from "../screens/LoginScreen";
import FormularioScreen from "../screens/FormularioScreen";
import BottomTabs from "./BottomTabs";
import EditProfileScreen from "../screens/EditProfileScreen";
import FolderRecipesScreen from "../screens/FolderRecipesScreen";
import { useAuth } from "../context/AuthContext"; // Importe o hook
import { RootStackParamList } from "../@types/navigation";

import DailyLogScreen from "../screens/DailyLogScreen";
const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { user, loading, profile } = useAuth(); // Use o contexto

  // Mostra um indicador de carregamento enquanto o Firebase verifica a autenticação
  if (loading || (user && !profile)) {
    // ainda está carregando perfil ou estado de autenticação
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={
          user
            ? profile?.formularioConcluido
              ? "Main"
              : "Formulario"
            : "Login"
        }
      >
        {user ? (
          <>
            <Stack.Screen
              name="Formulario"
              component={FormularioScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Main"
              component={BottomTabs}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="DailyLog"
              component={DailyLogScreen}
              options={{
                headerShown: true,
                title: "Refeições do Dia",
              }}
            />
            <Stack.Screen
              name="EditProfile"
              component={EditProfileScreen}
              options={{
                presentation: "modal", // Efeito de tela subindo
                headerShown: true, // Mostra um cabeçalho para poder fechar
                title: "Editar Perfil",
              }}
            />
            <Stack.Screen 
              name="FolderRecipes" 
              component={FolderRecipesScreen} 
              options={{headerShown: false}}
              />
          </>
        ) : (
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
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
