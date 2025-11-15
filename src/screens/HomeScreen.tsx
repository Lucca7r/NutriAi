// src/screens/HomeScreen.tsx

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useThemeColors } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { FIREBASE_DB } from "../services/firebaseConfig";
import firebase from "firebase/compat/app";
import { createGeralStyles } from "../styles/Geral.style";

import { FIREBASE_FUNCTIONS } from "../services/firebaseConfig";
import { httpsCallable } from "firebase/functions";

import CalorieTrackerChart from "../components/CalorieTrackerChart";
import WeightChart from "../components/WeightChart";
import AddMealModal from "../components/AddMealModal";
import Logo from "../components/Logo";

const { width } = Dimensions.get("window");

export const HomeScreen = () => {
  const colors = useThemeColors();
  const styles = createGeralStyles(colors);
  const { user, profile, reloadProfile } = useAuth();

  const [isModalVisible, setModalVisible] = useState(false);

  // --- LÓGICA DO CARROSSEL DE GRÁFICOS ---
  const [activeChartIndex, setActiveChartIndex] = useState(0);
  const chartComponents = [
    <CalorieTrackerChart onAddPress={() => setModalVisible(true)} />,
    <WeightChart />,
  ];

  const onChartScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slide = Math.ceil(
      event.nativeEvent.contentOffset.x /
        event.nativeEvent.layoutMeasurement.width
    );
    if (slide !== activeChartIndex) {
      setActiveChartIndex(slide);
    }
  };

  // --- LÓGICA PARA DICAS PERSONALIZADAS (ATUALIZADA) ---
  const [tips, setTips] = useState<string[]>([]);
  const [loadingTips, setLoadingTips] = useState(true);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  // --- 2. REFERÊNCIA DA CLOUD FUNCTION ---
  const callGeneratePersonalizedTips = httpsCallable(
    FIREBASE_FUNCTIONS,
    "generatePersonalizedTips"
  );
  // --- FIM DA REFERÊNCIA ---

  useEffect(() => {
    const manageTips = async () => {
      try {
        if (!profile || !user) return;

        const oneWeekInMs = 7 * 24 * 60 * 60 * 1000;
        const now = new Date();

        // Lógica de cache (continua a mesma)
        if (profile.cachedTips) {
          const lastGenerated = profile.cachedTips.generatedAt?.toDate();
          if (
            lastGenerated &&
            now.getTime() - lastGenerated.getTime() < oneWeekInMs
          ) {
            setTips(profile.cachedTips.tips);
            setLoadingTips(false);
            return;
          }
        }

        setLoadingTips(true);

        // --- 3. CHAMADA SEGURA À CLOUD FUNCTION ---
        const result = await callGeneratePersonalizedTips({
          userProfile: { formResponses: profile?.formResponses }, // <-- CORRIGIDO
        });
        const newTips = (result.data as { tips: string[] }).tips;
        // --- FIM DA CHAMADA ---

        if (!newTips || newTips.length === 0) {
          throw new Error("A IA não retornou dicas.");
        }

        setTips(newTips);

        // Salva as novas dicas no cache do Firestore
        await FIREBASE_DB.collection("users")
          .doc(user.uid)
          .update({
            cachedTips: {
              tips: newTips,
              generatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            },
          });

        await reloadProfile(); // Recarrega o perfil para ter o cache mais novo
      } catch (error) {
        console.error("Erro ao buscar dicas:", error);
        // Se falhar, usa dicas genéricas para o usuário não ficar sem
        setTips([
          "Beba pelo menos 2 litros de água por dia.",
          "Uma boa noite de sono é fundamental para seus resultados.",
          "Tente consumir mais frutas e vegetais no seu dia a dia.",
        ]);
      } finally {
        setLoadingTips(false);
      }
    };

    manageTips();
  }, [profile, user]); // Dependências estão corretas

  useEffect(() => {
    if (tips.length === 0) return;
    const interval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % tips.length);
    }, 10000); // 10 segundos por dica
    return () => clearInterval(interval);
  }, [tips]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.homeContainer}>
        <Logo />

        <ScrollView>
          <View>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={onChartScroll}
              style={styles.horizontalScrollView}
            >
              {chartComponents.map((chart, index) => (
                <View key={index} style={styles.chartPage}>
                  {chart}
                </View>
              ))}
            </ScrollView>
            <View style={styles.pagination}>
              {chartComponents.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    {
                      backgroundColor:
                        activeChartIndex === index
                          ? "#C8C9D2"
                          : colors.iconInactive,
                    },
                  ]}
                />
              ))}
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.tipsContainer}>
            <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>
              Dica do Dia
            </Text>
            <View style={styles.card}>
              {loadingTips ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <Text style={styles.tipText}>
                  {tips[currentTipIndex] ?? "Bem-vindo ao NutriAI!"}
                </Text>
              )}
            </View>
          </View>
        </ScrollView>

        <AddMealModal
          visible={isModalVisible}
          onClose={() => setModalVisible(false)}
          editingMeal={null}
        />
      </View>
    </SafeAreaView>
  );
};
