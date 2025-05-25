import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";
import { TouchableOpacity, Text } from "react-native";

import BottomTabs from "./BottomTabs";
import { ChatScreen } from "../screens/ChatScreen";

import { useTheme } from "../context/ThemeContext";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <NavigationContainer theme={isDark ? DarkTheme : DefaultTheme}>
      <Stack.Navigator initialRouteName="Main">
        <Stack.Screen
          name="Main"
          component={BottomTabs}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="Chat"
          component={ChatScreen}
          options={({ navigation }: any) => ({
            title: "Chat",
            headerShown: true,
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={{ marginLeft: 12 }}
              >
                <Text style={{ fontSize: 20 }}>☰</Text>
              </TouchableOpacity>
            ),
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
