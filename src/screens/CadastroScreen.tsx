import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet, // Importei o StyleSheet
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Linking, // Importei o Linking
  ScrollView, // Importei o ScrollView
  ActivityIndicator, // Importei o ActivityIndicator
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
  const [isChecked, setIsChecked] = useState(false); // <-- NOVO ESTADO

  // --- Função para abrir o link ---
  const openPolicy = () => {
    Linking.openURL("https://lucca7r.github.io/nutriai-politica/").catch(
      (err) => console.error("Não foi possível abrir o link: ", err)
    );
  };

  const handleCadastro = async () => {
    // --- Verificação do checkbox ---
    if (!isChecked) {
      Alert.alert(
        "Atenção",
        "Você deve aceitar a Política de Privacidade para continuar."
      );
      return;
    }
    // --- Fim da verificação ---

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
        // Você pode querer navegar para o Formulário aqui, como no outro arquivo:
        // navigation.navigate("Formulario");
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
        {/* Adicionei o ScrollView para evitar que o teclado cubra o checkbox */}
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        >
          <View style={[styles.container, { justifyContent: "center" }]}>
            <Logo />
            <View style={styles.formContainer}>
              <Text style={[styles.sectionTitle, { textAlign: "center" }]}>
                Crie Uma Nova Conta
              </Text>
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

              {/* --- INÍCIO DO CHECKBOX E POLÍTICA (com estilos inline) --- */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 20,
                  marginTop: 10,
                  paddingHorizontal: 5, // Ajuste leve
                }}
              >
                <TouchableOpacity
                  style={{
                    width: 22,
                    height: 22,
                    borderWidth: 2,
                    borderColor: colors.iconInactive, // Usei a cor do seu tema
                    borderRadius: 4,
                    marginRight: 12,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  onPress={() => setIsChecked(!isChecked)}
                >
                  {/* O "check" */}
                  {isChecked && (
                    <View
                      style={{
                        width: 14,
                        height: 14,
                        backgroundColor: colors.primary, // Usei a cor do seu tema
                        borderRadius: 2,
                      }}
                    />
                  )}
                </TouchableOpacity>
                <Text
                  style={{
                    flex: 1,
                    color: colors.text,
                    fontSize: 14,
                  }}
                >
                  Eu li e concordo com a{" "}
                  <Text
                    style={{
                      color: colors.primary, // Usei a cor do seu tema
                      textDecorationLine: "underline",
                      fontWeight: "bold",
                    }}
                    onPress={openPolicy}
                  >
                    Política de Privacidade
                  </Text>
                  .
                </Text>
              </View>
              {/* --- FIM DO CHECKBOX E POLÍTICA --- */}

              <TouchableOpacity
                // Adiciona o estilo de desabilitado se não estiver checado
                style={[
                  styles.button,
                  { marginTop: 20 },
                  (!isChecked || isLoading) && {
                    backgroundColor: "#5A5B63",
                    opacity: 0.7,
                  }, // Estilo inline para desabilitado
                ]}
                onPress={handleCadastro}
                disabled={isLoading || !isChecked} // Atualizado
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" /> // Adicionado ActivityIndicator
                ) : (
                  <Text style={[styles.buttonText, { fontSize: 18 }]}>
                    Criar Conta
                  </Text>
                )}
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
        </ScrollView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};
export default CadastroScreen;
