import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { useThemeColors } from '../context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { FIREBASE_DB } from '../services/firebaseConfig';

export default function EditProfileScreen() {
  const colors = useThemeColors();
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newEmail, setNewEmail] = useState('');

  useEffect(() => {
    if (user) {
      const userDocRef = FIREBASE_DB.collection('users').doc(user.uid);
      userDocRef.get().then((doc) => {
        if (doc.exists) {
          const data = doc.data();
          setName(data?.name || '');
        }
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }

    setLoading(true);

    try {
      await FIREBASE_DB.collection('users').doc(user.uid).set(
        { name },
        { merge: true }
      );

      if (password.trim().length > 0) {
        await user.updatePassword(password);
      }

      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
      setPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);
      Alert.alert('Erro', error.message || 'Falha ao atualizar perfil');
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
  }

  const chageEmail = async (newEmail: string) => {
    setModalVisible(true)
    if (!user) return;

    if (newEmail) {
          try {
            await user.verifyBeforeUpdateEmail(newEmail.trim());
            const message = 'Verifique seu e-mail, enviamos um link de verificação para o novo endereço.';
            return  message;
          } catch (error: any) {
            Alert.alert('Erro ao alterar e-mail: Tente fazer login novamente');
            console.error('Erro ao alterar e-mail:', error);
          }
    }
  };
  
    const onClose = () => {
      setModalVisible(false);
    };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]}>Editar Perfil</Text>

          <TextInput
            placeholder="Nome"
            placeholderTextColor={colors.iconInactive}
            value={name}
            onChangeText={setName}
            style={[styles.input, { borderColor: colors.text, color: colors.text }]}
            autoCapitalize="words"
          />

          <TouchableOpacity
            onPress={openModal}
            style={[styles.buttonOutline, { borderColor: colors.primary }]}>
            <Text style={[styles.buttonTextOutline, { color: colors.primary }]}>Alterar E-mail</Text>
          </TouchableOpacity>

  <Modal visible={modalVisible} transparent animationType="fade">
    <TouchableWithoutFeedback onPress={onClose}>
    <View style={styles.overlay}>
      <TouchableWithoutFeedback>
    <View style={styles.modal}>
      <Text style={styles.modalTitle}>Alterar E-mail</Text>
      <TextInput
        placeholder="Digite o novo e-mail"
        placeholderTextColor={colors.iconInactive}
        value={newEmail}
        onChangeText={setNewEmail}
        style={[styles.input, { borderColor: colors.text, color: colors.text }]}
      />
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.modalButton, { backgroundColor: '#e53935' }]} // vermelho
          onPress={onClose}
        >
          <Text style={[styles.modalButtonText, { color: 'white' }]}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modalButton, { backgroundColor: '#2e7d32' }]} // verde escuro
          onPress={ () => {chageEmail(newEmail)}}
        >
          <Text style={[styles.modalButtonText, { color: 'white' }]}>Confirmar</Text>
        </TouchableOpacity>
      </View>
    </View>
    </TouchableWithoutFeedback>
  </View>
  </TouchableWithoutFeedback>
</Modal>

          <TextInput
            placeholder="Nova senha (deixe vazio para manter)"
            placeholderTextColor={colors.iconInactive}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={[styles.input, { borderColor: colors.text, color: colors.text }]}
          />

          <TextInput
            placeholder="Confirmar nova senha"
            placeholderTextColor={colors.iconInactive}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            style={[styles.input, { borderColor: colors.text, color: colors.text }]}
          />

          <TouchableOpacity
            onPress={handleSave}
            style={[styles.button, { backgroundColor: colors.primary }]}
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

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    alignSelf: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 15,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonOutline: {
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonTextOutline: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  overlay: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'rgba(0,0,0,0.5)',
},
modal: {
  backgroundColor: 'white',
  padding: 24,
  borderRadius: 16,
  width: '85%',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 4,
  elevation: 5,
},
modalTitle: {
  fontSize: 20,
  fontWeight: 'bold',
  marginBottom: 15,
  textAlign: 'center',
},
buttonRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: 20,
},
modalButton: {
  flex: 1,
  paddingVertical: 12,
  borderRadius: 8,
  marginHorizontal: 5,
  alignItems: 'center',
},
modalButtonText: {
  fontSize: 16,
  fontWeight: 'bold',
},
});
