import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors } from "../context/ThemeContext";
import { createCadastroStyles } from "../styles/CadastroScreen.style";

import { Alert } from "react-native"; // Adicione o Alert
import { FIREBASE_AUTH } from "../services/firebaseConfig";

import type { StackNavigationProp } from "@react-navigation/stack";

type RootStackParamList = {
  Login: undefined;
};

type CadastroScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Login"
>;

interface CadastroScreenProps {
  navigation: CadastroScreenNavigationProp;
}

const CadastroScreen = ({ navigation }: CadastroScreenProps) => {
  const colors = useThemeColors();
  const styles = createCadastroStyles(colors);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleCadastro = async () => {
    if (senha !== confirmarSenha) {
      Alert.alert("Erro", "As senhas não conferem.");
      return;
    }
    if (email === "" || senha === "") {
      Alert.alert("Erro", "Preencha e-mail e senha.");
      return;
    }

    setIsLoading(true);
    try {
      // SINTAXE NOVA (estilo v8)
      const response = await FIREBASE_AUTH.createUserWithEmailAndPassword(
        email,
        senha
      );
      console.log("Usuário criado com sucesso!", response);
    } catch (error: any) {
      console.error(error);
      Alert.alert("Erro no Cadastro", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.logoContainer}>
            <Ionicons name="nutrition" size={32} color={colors.text} />
            <Text style={styles.logoText}>NutriAI</Text>
          </View>
          <Text style={styles.title}>Crie Uma Nova Conta</Text>
          <TextInput
            style={styles.input}
            placeholder="Nome"
            placeholderTextColor={colors.text}
            value={nome}
            onChangeText={setNome}
          />
          <TextInput
            style={styles.input}
            placeholder="E-mail"
            placeholderTextColor={colors.text}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Senha"
            placeholderTextColor={colors.text}
            value={senha}
            onChangeText={setSenha}
            secureTextEntry
          />
          <TextInput
            style={styles.input}
            placeholder="Confirmação de senha"
            placeholderTextColor={colors.text}
            value={confirmarSenha}
            onChangeText={setConfirmarSenha}
            secureTextEntry
          />
          <TouchableOpacity
            style={styles.button}
            onPress={handleCadastro} // Use a nova função aqui
            disabled={isLoading} // Desabilita o botão durante o carregamento
          >
            <Text style={styles.buttonText}>
              {isLoading ? "Criando..." : "Criar Conta"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.googleButton}
            onPress={() => console.log("Cadastrar com Google")}
          >
            <Text style={styles.googleButtonText}>
              Cadastre-se com o Google
            </Text>
            <Ionicons name="logo-google" size={24} color={colors.activeIcon} />
          </TouchableOpacity>
          <View style={styles.linkContainer}>
            <Text style={styles.linkText}>Já possui uma conta?</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={styles.link}>Entre</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};
export default CadastroScreen;
