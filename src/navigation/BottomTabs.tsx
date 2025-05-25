import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";

import HomeScreen from "../screens/HomeScreen";
import { FavoritesScreen } from "../screens/FavoritesScreen";
import ProfileScreen from "../screens/ProfileScreen";

import HomeIcon from "../../assets/home.svg";
import FavoriteIcon from "../../assets/favorite.svg";
import UserIcon from "../../assets/user.svg";

import styles from "../styles/BottomTabs.style";
import { useTheme } from "../context/ThemeContext";

const Tab = createBottomTabNavigator();

export default function BottomTabs({ navigation }: any) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <Tab.Navigator
      screenOptions={({ route }: any) => ({
        headerShown: true,
        headerTitle: '', // remove o título do topo
        tabBarShowLabel: false,
        tabBarStyle: {
          ...styles.tabBar,
          backgroundColor: isDark ? "#2c2c2e" : "#41424A",
        },
        headerRight: () => (
          <TouchableOpacity
            onPress={() => navigation.navigate("Chat")}
            style={{ marginRight: 16 }}
          >
            <Text style={{ fontSize: 18 }}>💬</Text>
          </TouchableOpacity>
        ),
        tabBarIcon: ({ focused }: { focused: boolean }) => {
          let IconComponent;

          switch (route.name) {
            case "Home":
              IconComponent = HomeIcon;
              break;
            case "Favorites":
              IconComponent = FavoriteIcon;
              break;
            case "Profile":
              IconComponent = UserIcon;
              break;
            default:
              return null;
          }

          return (
            <View
              style={[
                styles.iconWrapper,
                { backgroundColor: isDark ? "#41424A" : "#53545D" },
                focused && styles.activeIcon,
              ]}
            >
              <IconComponent
                width={24}
                height={24}
                fill={focused ? (isDark ? "#fff" : "#000") : "#ccc"}
              />
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Favorites" component={FavoritesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
