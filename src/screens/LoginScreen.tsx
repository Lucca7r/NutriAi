import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors } from "../context/ThemeContext";
import { createGeralStyles } from "../styles/Geral.style";

import { Alert } from "react-native"; // Adicione o Alert

import { FIREBASE_AUTH } from "../services/firebaseConfig";

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
      // SINTAXE NOVA (estilo v8)
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
              placeholderTextColor={styles.inputPlaceholder.color}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Senha"
              placeholderTextColor={styles.inputPlaceholder.color}
              value={senha}
              onChangeText={setSenha}
              secureTextEntry
            />
            <TouchableOpacity style={[styles.button, { marginTop: 20 }]} onPress={handleLogin}>
              <Text style={styles.buttonText}>Entrar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.googleButton}
              onPress={() => console.log("Login com Google")}
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
