import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors } from "../context/ThemeContext";
import { createGeralStyles } from "../styles/Geral.style";

import { GoogleSignin } from "@react-native-google-signin/google-signin";

import { FIREBASE_AUTH, FIREBASE_DB } from "../services/firebaseConfig";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";

import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "../@types/navigation";
import Logo from "../components/Logo";

type LoginScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Cadastro" // Or "Main" if login is successful
>;

interface LoginScreenProps {
  navigation: LoginScreenNavigationProp;
}

const LoginScreen = ({ navigation }: LoginScreenProps) => {
  const colors = useThemeColors();
  const styles = createGeralStyles(colors);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (email === "" || senha === "") {
      Alert.alert("Erro", "Preencha e-mail e senha.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await FIREBASE_AUTH.signInWithEmailAndPassword(
        email,
        senha
      );
      console.log("Login realizado com sucesso!", response);
    } catch (error: any) {
      console.error(error);
      Alert.alert("Erro no Login", "E-mail ou senha inválidos.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- FUNÇÃO 100% CORRIGIDA ---
  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await GoogleSignin.hasPlayServices();

      // 1. signIn() retorna um objeto que contém 'idToken' e um objeto 'user'
      const signInResult = await GoogleSignin.signIn();

      if (!signInResult.idToken) {
        throw new Error("Não foi possível obter o idToken do Google.");
      }

      // 2. Usamos o 'idToken' para a credencial
      const googleCredential = firebase.auth.GoogleAuthProvider.credential(
        signInResult.idToken
      );

      const userCredential = await FIREBASE_AUTH.signInWithCredential(
        googleCredential
      );

      const userAuth = userCredential.user;
      const isNewUser = userCredential.additionalUserInfo?.isNewUser;

      if (isNewUser && userAuth) {
        console.log(
          "Novo usuário do Google, criando documento no Firestore..."
        );
        await FIREBASE_DB.collection("users")
          .doc(userAuth.uid)
          .set(
            {
              // 3. Usamos o objeto 'signInResult.user' para os dados do perfil
              name: signInResult.user.name || userAuth.displayName || "Usuário",
              email: signInResult.user.email,
              createdAt: new Date(),
              photoURL: signInResult.user.photo || userAuth.photoURL || null,
              formularioConcluido: false,
            },
            { merge: true }
          );
      }
    } catch (error: any) {
      if (error.code === "SIGN_IN_CANCELLED") {
        console.log("Login com Google cancelado");
      } else {
        console.error("Erro no login com Google:", error);
        Alert.alert("Erro", "Não foi possível fazer login com o Google.");
      }
    } finally {
      setIsLoading(false);
    }
  };
  // --- FIM DA CORREÇÃO ---

  const navigateToCadastro = () => {
    navigation.navigate("Cadastro");
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Logo />
          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>Entre em Sua Conta</Text>
            <TextInput
              style={styles.input}
              placeholder="E-mail"
              // --- CORREÇÃO DO ERRO DE 'color' ---
              placeholderTextColor={colors.iconInactive}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Senha"
              // --- CORREÇÃO DO ERRO DE 'color' ---
              placeholderTextColor={colors.iconInactive}
              value={senha}
              onChangeText={setSenha}
              secureTextEntry
            />
            <TouchableOpacity
              style={[styles.button, { marginTop: 20 }]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text style={[styles.buttonText, { fontSize: 18 }]}>Entrar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.googleButton}
              onPress={handleGoogleSignIn}
              disabled={isLoading}
            >
              <Text style={styles.googleButtonText}>Entrar com o Google</Text>
              <Ionicons name="logo-google" size={24} color="#000000" />
            </TouchableOpacity>
          </View>
          <View style={styles.linkContainer}>
            <Text style={styles.linkText}>Não tem uma conta?</Text>
            <TouchableOpacity onPress={navigateToCadastro}>
              <Text style={styles.link}>{"Crie aqui"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default LoginScreen;