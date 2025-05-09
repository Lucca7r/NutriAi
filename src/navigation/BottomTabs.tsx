import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, StyleSheet } from "react-native";

import HomeScreen from "../screens/HomeScreen";
import { ChatScreen } from "../screens/ChatScreen";
import { FavoritesScreen } from "../screens/FavoritesScreen";
import ProfileScreen from "../screens/ProfileScreen";

import HomeIcon from "../../assets/home.svg";
import ChatIcon from "../../assets/message-circle.svg";
import FavoriteIcon from "../../assets/favorite.svg";
import UserIcon from "../../assets/user.svg";

import styles from "../styles/BottomTabs.style";

import { useTheme } from "../context/ThemeContext";

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <Tab.Navigator
      screenOptions={({ route }: { route: { name: string } }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          ...styles.tabBar,
          backgroundColor: isDark ? "#2c2c2e" : "#41424A",

        },
        tabBarIcon: ({ focused }: { focused: boolean }) => {
          let IconComponent;

          switch (route.name) {
            case "Home":
              IconComponent = HomeIcon;
              break;
            case "Chat":
              IconComponent = ChatIcon;
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

          if (IconComponent) {
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
          }

          return null;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="Favorites" component={FavoritesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
