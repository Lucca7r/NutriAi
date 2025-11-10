import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert, // <-- Verifique se o Alert está importado
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
  Platform,
  Modal,
  Image,
  ScrollView, // <-- Adicione ScrollView
} from "react-native";
import { useThemeColors } from "../context/ThemeContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import { FIREBASE_DB, FIREBASE_STORAGE, FIREBASE_AUTH } from "../services/firebaseConfig"; // <-- Adicione FIREBASE_AUTH
import * as ImagePicker from "expo-image-picker";
import { createGeralStyles } from "../styles/Geral.style";
import firebase from "firebase/compat";

export default function EditProfileScreen() {
  const colors = useThemeColors();
  const styles = createGeralStyles(colors);
  const { user, profile, setProfile, reloadProfile } = useAuth();

  const [name, setName] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newEmail, setNewEmail] = useState("");

  useEffect(() => {
    if (user && profile) {
      setName(profile.name || "");
    }
  }, [user, profile]);

  const handleImagePick = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Erro", "Precisamos de permissão para acessar sua galeria.");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const uploadImageAsync = async (
    uri: string,
    uid: string
  ): Promise<string> => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const ref = FIREBASE_STORAGE.ref().child(
      `profile_images/${uid}/profile.jpg`
    );
    const snapshot = await ref.put(blob);
    const url = await snapshot.ref.getDownloadURL();
    return url;
  };

  const handleSave = async () => {
    if (!user) return;

    if (password !== confirmPassword) {
      Alert.alert("Erro", "As senhas não coincidem");
      return;
    }

    setLoading(true);

    try {
      let newPhotoURL: string | undefined = undefined;
      if (imageUri) {
        newPhotoURL = await uploadImageAsync(imageUri, user.uid);
      }

      const dataToUpdate: { name: string; photoURL?: string } = { name };
      if (newPhotoURL) {
        dataToUpdate.photoURL = newPhotoURL;
      }

      await FIREBASE_DB.collection("users")
        .doc(user.uid)
        .set(dataToUpdate, { merge: true });
      
      setProfile({
        ...profile,
        name,
        email: profile?.email ?? "",
        createdAt: profile?.createdAt ?? firebase.firestore.Timestamp.now(),
    });

      if (password.trim().length > 0) {
        await user.updatePassword(password);
      }

      await reloadProfile();

      Alert.alert("Sucesso", "Perfil atualizado com sucesso!");
      setPassword("");
      setConfirmPassword("");
      setImageUri(null);
    } catch (error: any) {
      console.error("Erro ao atualizar perfil:", error);
      Alert.alert("Erro", error.message || "Falha ao atualizar perfil");
    } finally {
      setLoading(false);
    }
  };

  /* const handleEmailChange = (newEmail: string) => {
    if (!user) return;

    if (Platform.OS === 'ios') {
      Alert.prompt(
        'Alterar e-mail',
        'Digite o novo e-mail',
        async (novoEmail) => {
          if (!novoEmail) return;
          try {
            await user.verifyBeforeUpdateEmail(novoEmail.trim());
            Alert.alert('Verifique seu e-mail', 'Enviamos um link de verificação para o novo endereço.');
          } catch (error: any) {
            console.error('Erro ao alterar e-mail: Tente fazer login novamente');
            Alert.alert('Erro ao alterar e-mail tente fazer login novamente');
          }
        },
        'plain-text'
      );
    } else {
      setModalVisible(true);
    }
  }; */

  const openModal = () => {
    setModalVisible(true);
  };

  const chageEmail = async (newEmail: string) => {
    setModalVisible(true);
    if (!user) return;

    if (newEmail) {
      try {
        await user.verifyBeforeUpdateEmail(newEmail.trim());
        const message =
          "Verifique seu e-mail, enviamos um link de verificação para o novo endereço.";
        return message;
      } catch (error: any) {
        Alert.alert("Erro ao alterar e-mail: Tente fazer login novamente");
        console.error("Erro ao alterar e-mail:", error);
      }
    }
  };

  const onClose = () => {
    setModalVisible(false);
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      "Excluir Conta Permanentemente",
      "Tem certeza que deseja excluir sua conta? Todos os seus dados serão perdidos para sempre. Esta ação não pode ser desfeita.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            if (!user) {
              Alert.alert("Erro", "Você não está logado.");
              return;
            }

            setLoading(true); // Ativa o indicador de loading
            try {
              const uid = user.uid;
              const currentUser = FIREBASE_AUTH.currentUser; // Pega o usuário ATUAL da autenticação

              // 1. Excluir dados do Firestore
              // AVISO: Isso NÃO exclui subcoleções como 'dailyLogs' ou 'weightHistory'.
              // Para isso, você precisará de uma Cloud Function no Firebase.
              await FIREBASE_DB.collection("users").doc(uid).delete();
              
              // Tenta excluir o formResponses também
              try {
                await FIREBASE_DB.collection("formResponses").doc(uid).delete();
              } catch (e) {
                console.log("Nenhum formResponses para deletar.");
              }

              // 2. Excluir o usuário da Autenticação
              if (currentUser) {
                await currentUser.delete();
              } else {
                throw new Error("Não foi possível encontrar o usuário para deletar.");
              }

              Alert.alert("Conta Excluída", "Sua conta foi excluída com sucesso.");
              // O onAuthStateChanged no AuthContext vai cuidar de deslogar.
              
            } catch (error: any) {
              setLoading(false); // Para o loading se der erro
              console.error("Erro ao excluir conta:", error);
              if (error.code === 'auth/requires-recent-login') {
                Alert.alert(
                  "Erro de Segurança",
                  "Esta é uma operação sensível. Por favor, faça logout e login novamente antes de tentar excluir sua conta."
                );
              } else {
                Alert.alert("Erro", "Não foi possível excluir a conta. " + error.message);
              }
            }
          },
        },
      ]
    );
  };

return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
          <View style={[styles.container, { justifyContent: 'center' }]}>
            <Text style={styles.sectionTitle}>Editar Perfil</Text>

            <TouchableOpacity
              onPress={handleImagePick}
              style={styles.profileImageContainer}
            >
              <Image
                source={{
                  uri:
                    imageUri ||
                    profile?.photoURL ||
                    "URL_DA_SUA_IMAGEM_PADRAO_AQUI",
                }}
                style={styles.profileImage}
              />
              <Text style={styles.changeImageText}>Alterar Foto</Text>
            </TouchableOpacity>

            <TextInput
              placeholder="Nome"
              placeholderTextColor={colors.iconInactive}
              value={name}
              onChangeText={setName}
              style={styles.input}
              autoCapitalize="words"
            />

            <TextInput
              placeholder="Nova senha (deixe vazio para manter)"
              placeholderTextColor={colors.iconInactive}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
            />

            <TextInput
              placeholder="Confirmar nova senha"
              placeholderTextColor={colors.iconInactive}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              style={styles.input}
            />

            <TouchableOpacity onPress={openModal} style={styles.buttonOutline}>
              <Text style={styles.buttonTextOutline}>Alterar E-mail</Text>
            </TouchableOpacity>

            <Modal visible={modalVisible} transparent animationType="fade">
              
              <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.modalOverlay}>
                  <TouchableWithoutFeedback>
                    <View style={styles.modalView}>
                      <Text style={styles.sectionTitle}>Alterar E-mail</Text>
                      <TextInput
                        placeholder="Digite o novo e-mail"
                        placeholderTextColor={colors.iconInactive}
                        value={newEmail}
                        onChangeText={setNewEmail}
                        style={styles.input}
                      />
                      <View style={styles.modalButtons}>
                        <TouchableOpacity style={styles.button} onPress={onClose}>
                          <Text style={styles.saveButtonText}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.button}
                          onPress={() => {
                            chageEmail(newEmail);
                          }}
                        >
                          <Text style={styles.saveButtonText}>Confirmar</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableWithoutFeedback>
                </View>
              </TouchableWithoutFeedback>
            </Modal>

            <TouchableOpacity
              onPress={handleSave}
              style={styles.button}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Salvar</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleDeleteAccount}
              style={styles.buttonDelete}
              disabled={loading}
            >
              <Text style={styles.buttonTextDelete}>Excluir Conta</Text>
            </TouchableOpacity>
            
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}