import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
  Modal,
  Image, // Importado
} from "react-native";
import { useThemeColors } from "../context/ThemeContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import { FIREBASE_DB, FIREBASE_STORAGE } from "../services/firebaseConfig"; // Agora importa FIREBASE_STORAGE
import { createGeralStyles } from "../styles/Geral.style";
import * as ImagePicker from 'expo-image-picker';

export default function EditProfileScreen() {
  const colors = useThemeColors();
  const styles = createGeralStyles(colors);
  const { user, profile, reloadProfile } = useAuth();

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setImageUri(profile.photoURL || null);
    }
  }, [profile]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à sua galeria para escolher uma foto.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setImageUri(uri); // Mostra a imagem na UI
      await uploadImage(uri); // Inicia o upload
    }
  };

  const uploadImage = async (uri: string) => {
    if (!user) return;
    setUploading(true);

    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const storageRef = FIREBASE_STORAGE.ref().child(`profile_pictures/${user.uid}`);
      
      await storageRef.put(blob);
      const downloadURL = await storageRef.getDownloadURL();

      await FIREBASE_DB.collection('users').doc(user.uid).update({ photoURL: downloadURL });
      await reloadProfile();

      Alert.alert('Sucesso!', 'Sua foto de perfil foi atualizada.');
    } catch (error) {
      console.error("Erro ao fazer upload da imagem: ", error);
      Alert.alert('Erro', 'Ocorreu um erro ao fazer o upload da sua foto.');
      setImageUri(profile?.photoURL || null);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    if (password && password !== confirmPassword) {
      Alert.alert("Erro", "As senhas não coincidem");
      return;
    }

    setLoading(true);

    try {
      await FIREBASE_DB.collection("users").doc(user.uid).set({ name }, { merge: true });

      if (password.trim().length > 0) {
        await user.updatePassword(password);
      }

      await reloadProfile();
      Alert.alert("Sucesso", "Perfil atualizado com sucesso!");
      setPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      console.error("Erro ao atualizar perfil:", error);
      Alert.alert("Erro", error.message || "Falha ao atualizar perfil");
    } finally {
      setLoading(false);
    }
  };

  const openModal = () => setModalVisible(true);

  const chageEmail = async (newEmail: string) => {
    if (!user || !newEmail) return;
    try {
      await user.verifyBeforeUpdateEmail(newEmail.trim());
      Alert.alert('Verifique seu e-mail', 'Enviamos um link de verificação para o novo endereço.');
      onClose();
    } catch (error: any) {
      Alert.alert("Erro ao alterar e-mail", "Tente fazer login novamente para realizar esta operação.");
      console.error("Erro ao alterar e-mail:", error);
    }
  };

  const onClose = () => setModalVisible(false);

  const avatarSource = imageUri 
    ? { uri: imageUri }
    : { uri: 'https://encrypted-tbn1.gstatic.com/licensed-image?q=tbn:ANd9GcSaQi2Zc9IYvTUy4j1rKPSdqm1u3DMNuW9Pq83Eim60Ahu8xs5auyY-Fne8SRP_0A7CMPL5W_jOIkMruY4' };

  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.container}>
          <Text style={styles.sectionTitle}>Editar Perfil</Text>

          <TouchableOpacity onPress={pickImage} disabled={uploading} style={styles.avatarContainer}>
              <Image source={avatarSource} style={styles.avatar} />
              {/* Reutilizando o estilo do botão de outline para manter o design */}
              <Text style={[styles.buttonTextOutline, { marginTop: 8 }]}>Alterar Foto</Text>
          </TouchableOpacity>

          {uploading && <ActivityIndicator size="large" color={colors.primary} style={{ marginBottom: 20 }} />}

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
                      <TouchableOpacity style={styles.button} onPress={() => chageEmail(newEmail)}>
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
            disabled={loading || uploading}
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