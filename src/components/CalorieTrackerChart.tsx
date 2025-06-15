// src/components/CalorieTrackerChart.tsx

import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { PieChart } from "react-native-gifted-charts";
import { useAuth } from "../context/AuthContext";
import { useThemeColors } from "../context/ThemeContext";
import { FIREBASE_DB } from "../services/firebaseConfig";

export default function CalorieTrackerChart() {
  const { user, profile } = useAuth();
  const colors = useThemeColors();

  // Estados para controlar os dados do gráfico
  const [consumed, setConsumed] = useState(0);
  const [goal, setGoal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Garante que temos o usuário e o perfil antes de buscar os dados
    if (!user || !profile?.dailyCalorieGoal) {
      setLoading(false);
      return;
    }

    // Define a meta de calorias a partir do perfil do usuário
    setGoal(profile.dailyCalorieGoal);

    // Cria o ID do documento para o dia de hoje (ex: "2025-06-15")
    const todayDocId = new Date().toISOString().split("T")[0];

    // Configura um listener em tempo real para o consumo de calorias do dia
    const unsubscribe = FIREBASE_DB.collection("users")
      .doc(user.uid)
      .collection("dailyEntries")
      .doc(todayDocId)
      .onSnapshot((doc) => {
        if (doc.exists) {
          // Se o documento do dia existe, pega as calorias consumidas
          setConsumed(doc.data()?.consumedCalories || 0);
        } else {
          // Se não existe, significa que nenhuma refeição foi registrada hoje
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
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>Consumo Diário</Text>
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
              <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                {/* ✨ CORREÇÃO APLICADA AQUI ✨ */}
                <Text style={{ fontSize: 22, color: colors.text, fontWeight: 'bold' }}>
                  {Math.round(consumed)}
                </Text>
                {/* ✨ E AQUI ✨ */}
                <Text style={{ fontSize: 14, color: colors.textSecondary }}>
                  de {goal} kcal
                </Text>
              </View>
            );
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
    padding: 20,
    alignItems: "center",
  },
  chartContainer: {
    marginTop: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  messageText: {
    fontSize: 16,
    textAlign: "center",
    paddingVertical: 40,
  },
});
