// src/screens/DailyLogScreen.tsx

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
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

// Interface ajustada para corresponder ao que o AddMealModal salva
interface Meal {
  name: string;
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
  const [loading, setLoading] = useState(true);

  const [isModalVisible, setModalVisible] = useState(false);
  // Ajustado para o tipo de dado correto
  const [mealToEdit, setMealToEdit] = useState<{ name: string; calories: number; } | null>(null);

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
    if (!user) {
        setLoading(false);
        return;
    };

    // --- CORREÇÃO 1: Nome da coleção ---
    // Alterado de "dailyEntries" para "dailyLogs" para corresponder às regras
    const docRef = FIREBASE_DB.collection("users")
      .doc(user.uid)
      .collection("dailyLogs") // <-- NOME CORRIGIDO
      .doc(date);

    const unsubscribe = docRef.onSnapshot((doc) => {
      const data = doc.data();
      setMeals(data?.meals || []);
      setTotalCalories(data?.consumedCalories || 0);
      setLoading(false);
    }, (error) => {
        console.error("Erro ao carregar dados do dia:", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [user, date]);

  const handleDeleteMeal = (mealToDelete: Meal) => {
    Alert.alert(
      "Confirmar Exclusão",
      `Tem certeza que deseja excluir "${mealToDelete.name}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            if (!user) return;
            // --- CORREÇÃO 2: Nome da coleção na função de deletar ---
            const docRef = FIREBASE_DB.collection("users")
              .doc(user.uid)
              .collection("dailyLogs") // <-- NOME CORRIGIDO
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
        {/* CORREÇÃO 3: Usando 'name' em vez de 'description' e removendo 'type' */}
        <Text style={styles.mealDescription}>
          {item.name}
        </Text>
      </View>
      <View style={styles.mealActions}>
        <Text style={[styles.mealCalories, { color: "#FFF" }]}>
          {item.calories} kcal
        </Text>
        {/* A função de editar precisará ser implementada no futuro */}
        {/* <TouchableOpacity
          onPress={() => openEditModal(item)}
          style={{ marginLeft: 8 }}
        >
          <Ionicons
            name="pencil-outline"
            size={22}
            color="#C8C9D2"
          />
        </TouchableOpacity> */}
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

  if (loading) {
    return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: "#282A30"}}>
            <ActivityIndicator size="large" color={colors.primary} />
        </View>
    );
  }

  return (
    <View
      style={[styles.container, { padding: 16, backgroundColor: "#282A30" }]}
    >
      <FlatList
        data={meals}
        renderItem={renderMealItem}
        // CORREÇÃO 4: Chave mais robusta para evitar erros
        keyExtractor={(item, index) => `${item.name}-${index}`}
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