// src/styles/CadastroScreen.style.ts
import { StyleSheet } from "react-native";
import { ThemeColors } from '../theme/colors';

export const createCadastroStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
      justifyContent: "center",
      padding: 20,
    },
    container: {
      alignItems: "center",
    },
    logoContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 20,
    },
    logoText: {
      fontSize: 28,
      fontWeight: "bold",
      color: colors.text,
      marginLeft: 8,
    },
    title: {
      fontSize: 20,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 30,
    },
    input: {
      width: "100%",
      height: 40,
      borderColor: colors.iconInactive,
      borderBottomWidth: 1,
      marginBottom: 20,
      color: colors.text,
      paddingHorizontal: 10,
    },
    button: {
      backgroundColor: colors.primary,
      paddingVertical: 12,
      borderRadius: 5,
      alignItems: "center",
      marginBottom: 15,
      width: "100%",
    },
    buttonText: {
      color: "#fff",
      fontWeight: "bold",
      fontSize: 16,
    },
    googleButton: {
      backgroundColor: "#e0e0e0",
      paddingVertical: 12,
      borderRadius: 5,
      alignItems: "center",
      marginBottom: 20,
      width: "100%",
      flexDirection: "row",
      justifyContent: "center",
    },
    googleButtonText: {
      color: "#333",
      fontWeight: "bold",
      fontSize: 16,
      marginLeft: 10,
    },
    linkContainer: {
      marginTop: 20,
      alignItems: "center",
    },
    linkText: {
      color: colors.textSecondary,
      textAlign: "center",
    },
    link: {
      color: colors.primary,
      fontWeight: "bold",
    },
  });
