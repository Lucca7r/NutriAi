import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors } from "../context/ThemeContext";
import { createCadastroStyles } from "../styles/CadastroScreen.style";

// Importações de Navegação
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "../@types/navigation";
import { auth, db } from '../services/firebaseConfig';

type CadastroScreenNavigationProp = StackNavigationProp<RootStackParamList, "Login">;

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

  
const handleCriarConta = async () => {
  if (senha !== confirmarSenha) {
    alert("As senhas não conferem!");
    return;
  }
  try {
    const userCredential = await auth.createUserWithEmailAndPassword(email, senha);
    const user = userCredential.user;

    if (user) {
      // A sintaxe para Firestore 'compat' é um pouco diferente
      await db.collection("users").doc(user.uid).set({
        nome: nome,
        email: user.email,
        createdAt: new Date(),
      });
    }
  } catch (error: any) {
    alert(`Erro ao criar conta: ${error.message}`);
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
          <TouchableOpacity style={styles.button} onPress={handleCriarConta}>
            <Text style={styles.buttonText}>Criar Conta</Text>
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
