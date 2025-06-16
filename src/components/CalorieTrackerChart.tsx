import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { PieChart } from "react-native-gifted-charts";
import { useAuth } from "../context/AuthContext";
import { useThemeColors } from "../context/ThemeContext";
import { FIREBASE_DB } from "../services/firebaseConfig";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../@types/navigation";
import { Ionicons } from "@expo/vector-icons";

type ChartNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface CalorieTrackerChartProps {
  onAddPress: () => void;
}

export default function CalorieTrackerChart({
  onAddPress,
}: CalorieTrackerChartProps) {
  const { user, profile } = useAuth();
  const colors = useThemeColors();

  const navigation = useNavigation<ChartNavigationProp>();

  const handleNavigateToDetails = () => {
    const todayDocId = new Date().toISOString().split("T")[0];
    navigation.navigate("DailyLog", { date: todayDocId });
  };

  const [consumed, setConsumed] = useState(0);
  const [goal, setGoal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !profile?.dailyCalorieGoal) {
      setLoading(false);
      return;
    }

    setGoal(profile.dailyCalorieGoal);

    const todayDocId = new Date().toISOString().split("T")[0];

    const unsubscribe = FIREBASE_DB.collection("users")
      .doc(user.uid)
      .collection("dailyEntries")
      .doc(todayDocId)
      .onSnapshot((doc) => {
        if (doc.exists) {
          setConsumed(doc.data()?.consumedCalories || 0);
        } else {
          setConsumed(0);
        }
        setLoading(false);
      });

    return () => unsubscribe();
  }, [user, profile]); // Roda o efeito quando o usuário ou o perfil mudam

  if (loading) {
    return (
      <ActivityIndicator
        size="large"
        color={colors.primary}
        style={styles.container}
      />
    );
  }

  if (goal === 0) {
    return (
      <Text style={[styles.messageText, { color: colors.text }]}>
        Preencha o formulário para ver sua meta de calorias.
      </Text>
    );
  }

  const remaining = Math.max(0, goal - consumed);
  const pieData = [
    // O valor consumido (em verde)
    { value: consumed, color: colors.primary, focused: true },
    // O valor restante (em cinza)
    { value: remaining, color: colors.iconInactive },
  ];

  return (
    <TouchableOpacity onPress={handleNavigateToDetails} activeOpacity={0.8}>
      <View style={styles.container}>
        <View style={styles.container}>
          {/* 👇 PASSO 2: Criar o novo cabeçalho com o botão */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              Consumo Diário
            </Text>
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: colors.primary }]}
              onPress={onAddPress}
            >
              <Ionicons name="add" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <View style={styles.chartContainer}>
            <PieChart
              key={colors.background}
              data={pieData}
              donut
              showGradient
              radius={80}
              innerRadius={60}
              // Componente central que mostra os números
              centerLabelComponent={() => {
                return (
                  <View
                    style={{ justifyContent: "center", alignItems: "center" }}
                  >
                    <Text
                      style={{
                        fontSize: 22,
                        color: colors.text,
                        fontWeight: "bold",
                      }}
                    >
                      {Math.round(consumed)}
                    </Text>

                    <Text style={{ fontSize: 14, color: colors.textSecondary }}>
                      de {goal} kcal
                    </Text>
                  </View>
                );
              }}
            />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
    padding: 20,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 10, // Ajuste para alinhar com o gráfico
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartContainer: {
    marginTop: 20,
  },
  messageText: {
    fontSize: 16,
    textAlign: 'center',
    paddingVertical: 40,
  }
});
