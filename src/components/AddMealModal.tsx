// src/components/AddMealModal.tsx

import React, { useState, useEffect } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, KeyboardAvoidingView, Platform, ActivityIndicator,
  Keyboard
} from 'react-native';
import { useThemeColors } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { FIREBASE_DB } from '../services/firebaseConfig';
import firebase from 'firebase/compat/app';
import { estimateCaloriesFromText } from '../services/openaiService';

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
  const { user } = useAuth();

  const [selectedMealType, setSelectedMealType] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [calories, setCalories] = useState('0'); // Manter como string para o input
  const [isEstimating, setIsEstimating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Efeito que preenche o formulário se estivermos no modo de edição
  useEffect(() => {
    if (visible && editingMeal) {
      setSelectedMealType(editingMeal.type);
      setDescription(editingMeal.description);
      setCalories(editingMeal.calories.toString());
    }
  }, [visible, editingMeal]);

  const handleEstimateCalories = async () => {
    if (!description.trim()) {
      Alert.alert("Atenção", "Por favor, descreva a refeição primeiro.");
      return;
    }
    Keyboard.dismiss(); // Fecha o teclado
    setIsEstimating(true);
    setCalories('0');
    try {
      const estimatedCalories = await estimateCaloriesFromText(description);
      if (estimatedCalories > 0) {
        setCalories(estimatedCalories.toString());
      } else {
        Alert.alert("Ops!", "Não consegui estimar as calorias. Tente descrever com mais detalhes ou insira manualmente.");
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
    const dayRef = FIREBASE_DB.collection('users').doc(user.uid).collection('dailyEntries').doc(todayDocId);

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
            transaction.set(dayRef, { consumedCalories: caloriesValue, meals: [newMeal] });
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
        <View style={[styles.modalView, { backgroundColor: colors.iconBackground }]}>
          <Text style={[styles.title, { color: colors.text }]}>
            {editingMeal ? 'Editar Refeição' : 'Registrar Refeição'}
          </Text>

          <Text style={[styles.label, { color: colors.text }]}>Tipo de Refeição</Text>
          <View style={styles.mealTypeContainer}>
            {mealTypes.map(type => (
              <TouchableOpacity
                key={type}
                style={[styles.mealTypeButton, {
                  backgroundColor: selectedMealType === type ? colors.primary : 'transparent',
                  borderColor: colors.primary,
                }]}
                onPress={() => setSelectedMealType(type)}
              >
                <Text style={{ color: selectedMealType === type ? '#FFF' : colors.text }}>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.label, { color: colors.text }]}>O que você comeu?</Text>
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.iconInactive, height: 80 }]}
            placeholder="Ex: 2 ovos, 1 pão e 1 banana"
            placeholderTextColor={colors.textSecondary}
            value={description}
            onChangeText={setDescription}
            multiline
          />

          <TouchableOpacity
            style={[styles.estimateButton, { backgroundColor: colors.primary, opacity: isEstimating ? 0.6 : 1 }]}
            onPress={handleEstimateCalories}
            disabled={isEstimating}
          >
            {isEstimating ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveButtonText}>Estimar Calorias com IA</Text>}
          </TouchableOpacity>
          
          <Text style={[styles.label, { color: colors.text, textAlign: 'center', width: '100%' }]}>ou insira manualmente</Text>
          
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.iconInactive, textAlign: 'center' }]}
            placeholder="Kcal"
            placeholderTextColor={colors.textSecondary}
            keyboardType="numeric"
            value={calories}
            onChangeText={setCalories}
          />
          
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: colors.primary, opacity: parseInt(calories, 10) > 0 && !isSaving ? 1 : 0.5 }]}
            onPress={handleSaveMeal}
            disabled={parseInt(calories, 10) <= 0 || isSaving}
          >
            {isSaving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveButtonText}>Salvar Refeição</Text>}
          </TouchableOpacity>
          
          <TouchableOpacity onPress={handleClose} style={{marginTop: 10}}>
            <Text style={{ color: colors.textSecondary }}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)' },
  modalView: { width: '90%', borderRadius: 20, padding: 25, elevation: 5 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 16, fontWeight: '500', alignSelf: 'flex-start', marginBottom: 8, marginTop: 15 },
  input: { width: '100%', borderWidth: 1, borderRadius: 10, paddingHorizontal: 15, paddingVertical: 10, fontSize: 16 },
  mealTypeContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', marginBottom: 5 },
  mealTypeButton: { paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderRadius: 20, margin: 4 },
  estimateButton: { width: '100%', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 15 },
  saveButton: { width: '100%', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 20 },
  saveButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});