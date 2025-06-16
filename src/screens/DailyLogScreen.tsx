// src/screens/DailyLogScreen.tsx

import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useThemeColors } from '../context/ThemeContext';
import { FIREBASE_DB } from '../services/firebaseConfig';
import { RootStackParamList } from '../@types/navigation';
import { Ionicons } from '@expo/vector-icons';
import firebase from 'firebase/compat/app';
import AddMealModal from '../components/AddMealModal';

type DailyLogScreenRouteProp = RouteProp<RootStackParamList, 'DailyLog'>;

interface Meal {
  id: string;
  type: string;
  description: string;
  calories: number;
}

export default function DailyLogScreen() {
  const route = useRoute<DailyLogScreenRouteProp>();
  const navigation = useNavigation();
  const { user } = useAuth();
  const colors = useThemeColors();
  
  const [meals, setMeals] = useState<Meal[]>([]);
  const [totalCalories, setTotalCalories] = useState(0);
  
  const [isModalVisible, setModalVisible] = useState(false);
  const [mealToEdit, setMealToEdit] = useState<Meal | null>(null);

  const { date } = route.params;

  useEffect(() => {
    const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString('pt-BR', {
      day: '2-digit', month: 'long', year: 'numeric'
    });
    navigation.setOptions({ title: formattedDate });
  }, [date, navigation]);

  useEffect(() => {
    if (!user) return;
    const docRef = FIREBASE_DB.collection('users').doc(user.uid).collection('dailyEntries').doc(date);

    const unsubscribe = docRef.onSnapshot(doc => {
      const data = doc.data();
      setMeals(data?.meals || []);
      setTotalCalories(data?.consumedCalories || 0);
    });

    return () => unsubscribe();
  }, [user, date]);
  
  const handleDeleteMeal = (mealToDelete: Meal) => {
    Alert.alert(
      "Confirmar Exclusão",
      `Tem certeza que deseja excluir "${mealToDelete.description}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            if (!user) return;
            const docRef = FIREBASE_DB.collection('users').doc(user.uid).collection('dailyEntries').doc(date);
            await docRef.update({
              meals: firebase.firestore.FieldValue.arrayRemove(mealToDelete),
              consumedCalories: firebase.firestore.FieldValue.increment(-mealToDelete.calories),
            });
          }
        }
      ]
    );
  };

  const openEditModal = (meal: Meal) => {
    setMealToEdit(meal);
    setModalVisible(true);
  };

  const renderMealItem = ({ item }: { item: Meal }) => (
    <View style={[styles.mealCard, { backgroundColor: colors.iconBackground }]}>
      <View style={styles.mealInfo}>
        <Text style={[styles.mealType, { color: colors.text }]}>{item.type}</Text>
        <Text style={[styles.mealDescription, { color: colors.textSecondary }]}>{item.description}</Text>
      </View>
      <View style={styles.mealActions}>
        <Text style={[styles.mealCalories, { color: colors.primary }]}>{item.calories} kcal</Text>
        <TouchableOpacity onPress={() => openEditModal(item)} style={{ marginLeft: 8 }}>
          <Ionicons name="pencil-outline" size={22} color={colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDeleteMeal(item)} style={{ marginLeft: 16 }}>
          <Ionicons name="trash-outline" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={meals}
        renderItem={renderMealItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <Text style={[styles.totalCalories, { color: colors.text }]}>
            Total Consumido: {totalCalories} kcal
          </Text>
        }
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Nenhuma refeição registrada para este dia.
          </Text>
        }
        contentContainerStyle={{ paddingBottom: 20 }}
      />
      <AddMealModal
        visible={isModalVisible}
        onClose={() => {
          setModalVisible(false);
          setMealToEdit(null);
        }}
        editingMeal={mealToEdit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  mealCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 12, marginBottom: 12 },
  mealInfo: { flex: 1, marginRight: 8 },
  mealActions: { flexDirection: 'row', alignItems: 'center' },
  mealType: { fontSize: 16, fontWeight: 'bold' },
  mealDescription: { fontSize: 14, marginTop: 4 },
  mealCalories: { fontSize: 16, fontWeight: 'bold' },
  totalCalories: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16 },
});