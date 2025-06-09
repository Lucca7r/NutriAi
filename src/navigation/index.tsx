import React from "react";
import { View, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Contexto para verificar o status de autenticação do Firebase
import { useAuth } from "../context/AuthContext";

// Importa todas as suas telas e o navegador de abas
import CadastroScreen from "../screens/CadastroScreen";
import LoginScreen from "../screens/LoginScreen";
import BottomTabs from "./BottomTabs";
import { HomeScreen } from "../screens/HomeScreen";
import { ChatScreen } from "../screens/ChatScreen";
import ProfileScreen from "../screens/ProfileScreen";
import { FavoritesScreen } from "../screens/FavoritesScreen";
import type { RootStackParamList } from "../@types/navigation";

// Cria o navegador Stack
const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Este é o componente de navegação principal.
 * Ele usa o hook `useAuth` para verificar se um usuário está logado.
 * - Se estiver carregando, mostra uma tela de loading.
 * - Se o usuário estiver logado, mostra o navegador principal com abas (`BottomTabs`).
 * - Se não estiver logado, mostra as telas de Login e Cadastro.
 */
export default function AppNavigator() {
  const { user, isLoading } = useAuth();

  // Enquanto o Firebase verifica o estado de autenticação, exibimos um indicador de carregamento.
  // Isso previne que a tela de login pisque rapidamente ao abrir o app já logado.
  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#1a1a1a",
        }}
      >
        <ActivityIndicator size="large" color="#3C9A5B" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user ? (
          // O usuário está LOGADO. O app começa na tela "Main" que contém as abas inferiores.
          // As outras telas (Home, Chat, etc.) são acessadas através do BottomTabs.
          <>
            <Stack.Screen
              name="Main"
              component={BottomTabs}
              options={{ headerShown: false }}
            />
            {/* Telas que podem ser abertas A PARTIR do BottomTabs, se necessário, podem ser declaradas aqui.
                Por exemplo, uma tela de "Detalhes da Receita" que não está na barra de abas.
                Por enquanto, todas as suas telas principais estão no BottomTabs, então não precisamos adicioná-las aqui. */}
          </>
        ) : (
          // O usuário NÃO está LOGADO. O app mostra apenas as telas de autenticação.
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
