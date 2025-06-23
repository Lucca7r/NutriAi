// src/screens/DailyLogScreen.tsx

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { useThemeColors } from "../context/ThemeContext";
import { FIREBASE_DB } from "../services/firebaseConfig";
import { RootStackParamList } from "../@types/navigation";
import { Ionicons } from "@expo/vector-icons";
import firebase from "firebase/compat/app";
import AddMealModal from "../components/AddMealModal";
import { createGeralStyles } from "../styles/Geral.style";

type DailyLogScreenRouteProp = RouteProp<RootStackParamList, "DailyLog">;

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
  const styles = createGeralStyles(colors);

  const [meals, setMeals] = useState<Meal[]>([]);
  const [totalCalories, setTotalCalories] = useState(0);

  const [isModalVisible, setModalVisible] = useState(false);
  const [mealToEdit, setMealToEdit] = useState<Meal | null>(null);

  const { date } = route.params;

  useEffect(() => {
    const formattedDate = new Date(date + "T00:00:00").toLocaleDateString(
      "pt-BR",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    );
    navigation.setOptions({ title: formattedDate });
  }, [date, navigation]);

  useEffect(() => {
    if (!user) return;
    const docRef = FIREBASE_DB.collection("users")
      .doc(user.uid)
      .collection("dailyEntries")
      .doc(date);

    const unsubscribe = docRef.onSnapshot((doc) => {
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
            const docRef = FIREBASE_DB.collection("users")
              .doc(user.uid)
              .collection("dailyEntries")
              .doc(date);
            await docRef.update({
              meals: firebase.firestore.FieldValue.arrayRemove(mealToDelete),
              consumedCalories: firebase.firestore.FieldValue.increment(
                -mealToDelete.calories
              ),
            });
          },
        },
      ]
    );
  };

  const openEditModal = (meal: Meal) => {
    setMealToEdit(meal);
    setModalVisible(true);
  };

  const renderMealItem = ({ item }: { item: Meal }) => (
    <View style={styles.mealCard}>
      <View style={styles.mealInfo}>
        <Text style={styles.mealType}>
          {item.type}
        </Text>
        <Text style={styles.mealDescription}>
          {item.description}
        </Text>
      </View>
      <View style={styles.mealActions}>
        <Text style={[styles.mealCalories, { color: "#FFF" }]}>
          {item.calories} kcal
        </Text>
        <TouchableOpacity
          onPress={() => openEditModal(item)}
          style={{ marginLeft: 8 }}
        >
          <Ionicons
            name="pencil-outline"
            size={22}
            color="#C8C9D2"
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDeleteMeal(item)}
          style={{ marginLeft: 16 }}
        >
          <Ionicons
            name="trash-outline"
            size={24}
            color="#C8C9D2"
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View
      style={[styles.container, { padding: 16, backgroundColor: "#282A30" }]}
    >
      <FlatList
        data={meals}
        renderItem={renderMealItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <Text style={styles.sectionTitle}>
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
