// src/screens/ProfileScreen.tsx

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Switch, TouchableOpacity, Alert,
  Modal, TextInput, Button, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { useTheme, useThemeColors } from '../context/ThemeContext';
import ProfileHeader from '../components/ProfileHeader';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../@types/navigation';
import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { FIREBASE_AUTH, FIREBASE_DB } from '../services/firebaseConfig';
import firebase from 'firebase/compat/app';

import WeightChart from '../components/WeightChart'; // <-- IMPORTE O NOVO COMPONENTE

type ProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Profile'>;

export default function ProfileScreen() {
  const { theme, toggleTheme } = useTheme();
  const colors = useThemeColors();
  const isDark = theme === 'dark';
  

  const [modalVisible, setModalVisible] = useState(false);
  const [currentWeight, setCurrentWeight] = useState('');

  const handleLogout = async () => { /* ... (código existente) */ };
  const handleNavigateToEdit = () => { /* ... (código existente) */ };

  const handleSaveWeight = async () => {
    const weightValue = parseFloat(currentWeight.replace(',', '.'));
    if (!weightValue || isNaN(weightValue)) {
      Alert.alert('Erro', 'Por favor, insira um peso válido.');
      return;
    }
    
    const uid = FIREBASE_AUTH.currentUser?.uid;
    if (!uid) return;

    try {
      await FIREBASE_DB.collection('users').doc(uid).collection('weightHistory').add({
        weight: weightValue,
        date: firebase.firestore.FieldValue.serverTimestamp(),
      });
      setCurrentWeight('');
      setModalVisible(false);
      Alert.alert('Sucesso', 'Seu peso foi registrado!');
    } catch (error) {
      console.error("Erro ao registrar peso:", error);
      Alert.alert('Erro', 'Não foi possível registrar seu peso.');
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableOpacity style={styles.settingsButton} onPress={handleNavigateToEdit}>
        <Ionicons name="settings-outline" size={28} color={colors.icon} />
      </TouchableOpacity>
      
      <ProfileHeader />

      {/* Componente do Gráfico */}
      <WeightChart />
      
      {/* Botão para Registrar Peso */}
      <TouchableOpacity style={[styles.registerButton, { backgroundColor: colors.primary }]} onPress={() => setModalVisible(true)}>
        <Text style={styles.registerButtonText}>Registrar Peso Atual</Text>
      </TouchableOpacity>

      <View style={styles.section}>
        <Text style={[styles.label, { color: colors.text }]}>Modo Escuro</Text>
        <Switch value={isDark} onValueChange={toggleTheme} />
      </View>
      <View style={styles.section}>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={[styles.link, { color: colors.icon }]}>Sair da Conta</Text>
        </TouchableOpacity>
      </View>

      {/* Modal para Entrada de Peso */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
          <View style={[styles.modalView, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Qual seu peso hoje?</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.iconInactive }]}
              placeholder="Ex: 75,5"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              value={currentWeight}
              onChangeText={setCurrentWeight}
            />
            <View style={styles.modalButtons}>
              <Button title="Cancelar" onPress={() => setModalVisible(false)} color={colors.primary} />
              <Button title="Salvar" onPress={handleSaveWeight} />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24, // Use padding horizontal para evitar ScrollView vs padding
  },
  settingsButton: { position: 'absolute', top: 60, right: 24, zIndex: 1 },
  section: { marginTop: 30, paddingHorizontal: 12 },
  label: { fontSize: 16, marginBottom: 8 },
  link: { fontSize: 16, paddingVertical: 10 },
  registerButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 12,
    marginTop: 20,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // --- Modal Styles ---
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalView: { margin: 20, borderRadius: 20, padding: 35, alignItems: 'center', elevation: 5 },
  modalTitle: { fontSize: 20, marginBottom: 15 },
  input: {
    height: 50,
    width: 200,
    marginVertical: 10,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    textAlign: 'center',
    fontSize: 18
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20
  },
});