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
import { createGeralStyles } from "../styles/Geral.style";

import { Alert } from "react-native";
import { FIREBASE_AUTH, FIREBASE_DB } from "../services/firebaseConfig";
import firebase from "firebase/compat/app";

import type { StackNavigationProp } from "@react-navigation/stack";
import Logo from "../components/Logo";

type RootStackParamList = {
  Login: undefined;
  Formulario: undefined;
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
  const styles = createGeralStyles(colors);
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
      const response = await FIREBASE_AUTH.createUserWithEmailAndPassword(
        email,
        senha
      );

      if (response.user) {
        const uid = response.user.uid;

        await FIREBASE_DB.collection("users").doc(uid).set({
          name: nome,
          email: email,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          formularioConcluido: false,
        });

        console.log("Usuário criado e dados salvos no Firestore!");

      }
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
          <Logo />
          <View style={styles.formContainer}>
          <Text style={[styles.sectionTitle, { textAlign: "center" }]}>Crie Uma Nova Conta</Text>
          <TextInput
            style={styles.input}
            placeholder="Nome"
            placeholderTextColor={styles.inputPlaceholder.color}
            value={nome}
            onChangeText={setNome}
          />
          <TextInput
            style={styles.input}
            placeholder="E-mail"
            placeholderTextColor={styles.inputPlaceholder.color}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Senha"
            placeholderTextColor={styles.inputPlaceholder.color}
            value={senha}
            onChangeText={setSenha}
            secureTextEntry
          />
          <TextInput
            style={styles.input}
            placeholder="Confirmação de senha"
            placeholderTextColor={styles.inputPlaceholder.color}
            value={confirmarSenha}
            onChangeText={setConfirmarSenha}
            secureTextEntry
          />
          <TouchableOpacity
            style={[styles.button, { marginTop: 20 }]}
            onPress={handleCadastro} // Use a nova função aqui
            disabled={isLoading} // Desabilita o botão durante o carregamento
          >
            <Text style={[styles.buttonText, { fontSize: 18 }]}>
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
            <Ionicons name="logo-google" size={24} color="#000000" />
          </TouchableOpacity>
          </View>
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
