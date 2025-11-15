// src/components/AddMealModal.tsx

import React, { useState, useEffect } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, KeyboardAvoidingView, Platform, ActivityIndicator,
  Keyboard
} from 'react-native';
import { useThemeColors } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

// --- MUDANÇA 1: Importar FIREBASE_FUNCTIONS ---
import { FIREBASE_DB, FIREBASE_FUNCTIONS } from '../services/firebaseConfig';
import firebase from 'firebase/compat/app';

// --- MUDANÇA 2: Remover 'openaiService' e adicionar 'httpsCallable' ---
// import { estimateCaloriesFromText } from '../services/openaiService'; // <-- DELETADO
import { httpsCallable } from "firebase/functions"; // <-- ADICIONADO

import { createGeralStyles } from "../styles/Geral.style";

// Interface para definir a estrutura de uma refeição
interface Meal {
  id: string;
  type: string;
  description: string;
  calories: number;
}

interface AddMealModalProps {
  visible: boolean;
  onClose: () => void;
  editingMeal: Meal | null; // Prop para receber a refeição que está sendo editada
}

const mealTypes = ["Café da Manhã", "Almoço", "Jantar", "Lanche"];

export default function AddMealModal({ visible, onClose, editingMeal }: AddMealModalProps) {
  const colors = useThemeColors();
  const styles = createGeralStyles(colors);
  const { user } = useAuth();

  const [selectedMealType, setSelectedMealType] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [calories, setCalories] = useState('0'); // Manter como string para o input
  const [isEstimating, setIsEstimating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // --- MUDANÇA 3: Criar a referência da função ---
  const callEstimateCalories = httpsCallable(FIREBASE_FUNCTIONS, 'estimateCaloriesFromText');

  // Efeito que preenche o formulário se estivermos no modo de edição
  useEffect(() => {
    if (visible && editingMeal) {
      setSelectedMealType(editingMeal.type);
      setDescription(editingMeal.description);
      setCalories(editingMeal.calories.toString());
    }
  }, [visible, editingMeal]);

  // --- MUDANÇA 4: Atualizar a função 'handleEstimateCalories' ---
  const handleEstimateCalories = async () => {
    if (!description.trim()) {
      Alert.alert("Atenção", "Por favor, descreva a refeição primeiro.");
      return;
    }
    Keyboard.dismiss(); // Fecha o teclado
    setIsEstimating(true);
    setCalories('0');
    try {
      // --- LÓGICA ANTIGA REMOVIDA ---
      // const estimatedCalories = await estimateCaloriesFromText(description); 
      
      // --- LÓGICA NOVA (SEGURA) ---
      const result = await callEstimateCalories({ mealDescription: description });
      const estimatedCalories = (result.data as { calories: number }).calories;
      // --- FIM DA LÓGICA NOVA ---

      if (estimatedCalories > 0) {
        setCalories(estimatedCalories.toString());
      } else {
        Alert.alert("Ops!", "Não consegui estimar as calorias. Tente descrever com mais detalhes ou insira manually.");
      }
    } catch (error) {
      Alert.alert("Erro", "Houve um problema ao estimar as calorias.");
    } finally {
      setIsEstimating(false);
    }
  };

  const handleSaveMeal = async () => {
    const caloriesValue = parseInt(calories, 10);
    if (!selectedMealType || !description.trim() || isNaN(caloriesValue) || caloriesValue <= 0) {
      Alert.alert("Erro", "Todos os campos são obrigatórios e as calorias devem ser um número válido maior que zero.");
      return;
    }
    if (!user) return;

    setIsSaving(true);
    const todayDocId = new Date().toISOString().split('T')[0];
    
    // --- ESTA É A CORREÇÃO ---
    // O nome da coleção foi alterado para 'dailyLogs' para corresponder às regras de segurança.
    const dayRef = FIREBASE_DB.collection('users').doc(user.uid).collection('dailyLogs').doc(todayDocId);

    try {
      await FIREBASE_DB.runTransaction(async (transaction) => {
        const dayDoc = await transaction.get(dayRef);
        
        if (editingMeal) {
          // LÓGICA DE ATUALIZAÇÃO
          if (!dayDoc.exists) throw new Error("Documento do dia não encontrado para editar.");
          const currentData = dayDoc.data()!;
          const oldCalories = editingMeal.calories;
          const calorieDifference = caloriesValue - oldCalories;
          
          const updatedMeals = currentData.meals.map((meal: Meal) => 
            meal.id === editingMeal.id 
              ? { ...meal, type: selectedMealType!, description: description.trim(), calories: caloriesValue } 
              : meal
          );
          transaction.update(dayRef, {
            meals: updatedMeals,
            consumedCalories: firebase.firestore.FieldValue.increment(calorieDifference),
          });
          Alert.alert("Sucesso!", "Refeição atualizada.");
        } else {
          // LÓGICA DE CRIAÇÃO
          const newMeal = {
            id: Date.now().toString(),
            type: selectedMealType,
            description: description.trim(),
            calories: caloriesValue,
          };
          if (!dayDoc.exists) {
            transaction.set(dayRef, { consumedCalories: caloriesValue, meals: [newMeal], date: firebase.firestore.Timestamp.fromDate(new Date(todayDocId)) });
          } else {
            transaction.update(dayRef, {
              consumedCalories: firebase.firestore.FieldValue.increment(caloriesValue),
              meals: firebase.firestore.FieldValue.arrayUnion(newMeal),
            });
          }
          Alert.alert("Sucesso!", "Refeição registrada.");
        }
      });
      handleClose();
    } catch (error) {
      console.error("Erro ao salvar refeição: ", error);
      Alert.alert("Erro", "Não foi possível salvar sua refeição.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setSelectedMealType(null);
    setDescription('');
    setCalories('0');
    setIsEstimating(false);
    setIsSaving(false);
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.overlay}>
        <View style={styles.modalView}>
          <Text style={styles.sectionTitle}>
            {editingMeal ? 'Editar Refeição' : 'Registrar Refeição'}
          </Text>

          <Text style={[styles.label, { marginTop: 12 }]}>Tipo de Refeição</Text>
          <View style={styles.mealTypeContainer}>
            {mealTypes.map(type => (
              <TouchableOpacity
                key={type}
                style={[styles.mealTypeButton, {
                  backgroundColor: selectedMealType === type ? "#D9D9D9" : 'transparent',
                  borderColor: "#D9D9D9",
                }]}
                onPress={() => setSelectedMealType(type)}
              >
                <Text style={{ color: selectedMealType === type ? '#000' : "#C8C9D2" }}>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.label, { marginTop: 12, textAlign: 'center' }]}>O que você comeu?</Text>
          <TextInput
            style={[styles.input, { borderColor: colors.iconInactive }]}
            placeholder="Ex: 2 ovos, 1 pão e 1 banana"
            placeholderTextColor={styles.inputPlaceholder.color}
            value={description}
            onChangeText={setDescription}
            multiline
          />

          <TouchableOpacity
            style={[styles.button, { marginTop: 10, opacity: isEstimating ? 0.6 : 1 }]}
            onPress={handleEstimateCalories}
            disabled={isEstimating}
          >
            {isEstimating ? <ActivityIndicator color="#000" /> : <Text style={styles.saveButtonText}>Estimar Calorias com IA</Text>}
          </TouchableOpacity>
          
          <Text style={[styles.label, { marginVertical: 12 , textAlign: 'center', width: '100%' }]}>ou insira manualmente</Text>
          
          <TextInput
            style={[styles.input, { borderColor: colors.iconInactive, textAlign: 'center' }]}
            placeholder="Kcal"
            placeholderTextColor={colors.textSecondary}
            keyboardType="numeric"
            value={calories}
            onChangeText={setCalories}
          />
          
          <TouchableOpacity
            style={[styles.button, { marginTop: 10, opacity: parseInt(calories, 10) > 0 && !isSaving ? 1 : 0.5 }]}
            onPress={handleSaveMeal}
            disabled={parseInt(calories, 10) <= 0 || isSaving}
          >
            {isSaving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveButtonText}>Salvar Refeição</Text>}
          </TouchableOpacity>
          
          <TouchableOpacity onPress={handleClose} style={{marginTop: 10}}>
            <Text style={{ color: "#C8C9D2", fontFamily: styles.buttonText.fontFamily, marginTop: 12 }}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// O StyleSheet.create aqui é local e não depende do Geral.style.ts,
// então o mantemos como está no seu arquivo original.
const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)' },
  modalView: { width: '90%', borderRadius: 20, padding: 25, elevation: 5 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 16, fontWeight: '500', alignSelf: 'flex-start', marginBottom: 8, marginTop: 15 },
  input: { width: '100%', borderWidth: 1, borderRadius: 10, paddingHorizontal: 15, paddingVertical: 10, fontSize: 16 },
  estimateButton: { width: '100%', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 15 },
  saveButton: { width: '100%', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 20 },
  saveButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});