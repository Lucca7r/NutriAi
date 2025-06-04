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
import { createLoginStyles } from "../styles/LoginScreen.style";

import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from '../@types/navigation'; 


type LoginScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Cadastro" // Or "Main" if login is successful
>;

interface LoginScreenProps {
  navigation: LoginScreenNavigationProp;
}

const LoginScreen = ({ navigation }: LoginScreenProps) => {
  const colors = useThemeColors();
  const styles = createLoginStyles(colors);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const handleLogin = () => {
    
    console.log("Email:", email, "Senha:", senha);
    
    navigation.reset({
      index: 0,
      routes: [{ name: "Main" }], 
    });
  };

  const navigateToCadastro = () => {
    navigation.navigate("Cadastro"); 
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.logoContainer}>
            <Ionicons name="nutrition" size={32} color={colors.text} />
            <Text style={styles.logoText}>NutriAI</Text>
          </View>
          <Text style={styles.title}>Acesse Sua Conta</Text>
          <TextInput
            style={styles.input}
            placeholder="E-mail"
            placeholderTextColor={colors.textSecondary || colors.text} 
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Senha"
            placeholderTextColor={colors.textSecondary || colors.text} 
            value={senha}
            onChangeText={setSenha}
            secureTextEntry
          />
          <TouchableOpacity
            style={styles.button}
            onPress={handleLogin}
          >
            <Text style={styles.buttonText}>Entrar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.googleButton}
            onPress={() => console.log("Login com Google")}
          >
          
            <Text style={styles.googleButtonText}>
              Entrar com o Google
            </Text>
          </TouchableOpacity>
          <View style={styles.linkContainer}>
            <Text style={styles.linkText}>
              Não tem uma conta?{" "}
              <TouchableOpacity onPress={navigateToCadastro}>
                <Text style={styles.link}>Crie aqui</Text>
              </TouchableOpacity>
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default LoginScreen;