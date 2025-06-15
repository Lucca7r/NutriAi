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

  const handleEmailChange = () => {
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
            console.error('Erro ao alterar e-mail:', error);
            Alert.alert('Erro', error.message || 'Não foi possível alterar o e-mail.');
          }
        },
        'plain-text'
      );
    } else {
      // Alternativa para Android (sem Alert.prompt nativo)
      let novoEmail = '';
      Alert.alert(
        'Alterar e-mail',
        'Funcionalidade disponível apenas em iOS ou implemente um modal personalizado para Android.'
      );
      // Em produção, você pode usar um Modal com TextInput.
    }
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
            onPress={handleEmailChange}
            style={[styles.buttonOutline, { borderColor: colors.primary }]}
          >
            <Text style={[styles.buttonTextOutline, { color: colors.primary }]}>Alterar E-mail</Text>
          </TouchableOpacity>

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
});
