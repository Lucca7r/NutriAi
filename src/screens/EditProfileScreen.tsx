import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
  Platform,
  Modal,
  Image,
} from "react-native";
import { useThemeColors } from "../context/ThemeContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import { FIREBASE_DB, FIREBASE_STORAGE } from "../services/firebaseConfig";
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.container}>
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
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}
