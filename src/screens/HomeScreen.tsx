import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { useThemeColors } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { generatePersonalizedTips } from '../services/openaiService';
import { FIREBASE_DB } from '../services/firebaseConfig';
import firebase from 'firebase/compat/app';

// --- Nossos componentes ---
import CalorieTrackerChart from '../components/CalorieTrackerChart';
import WeightChart from '../components/WeightChart';
import AddMealModal from '../components/AddMealModal';

const { width } = Dimensions.get('window');

export const HomeScreen = () => {
  const colors = useThemeColors();
  const { user, profile, reloadProfile } = useAuth();

  const [isModalVisible, setModalVisible] = useState(false);
  
  // --- LÓGICA DO CARROSSEL DE GRÁFICOS ---
  const [activeChartIndex, setActiveChartIndex] = useState(0);
  const chartComponents = [
    <CalorieTrackerChart onAddPress={() => setModalVisible(true)} />, 
    <WeightChart />
  ];

  const onChartScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    // Calcula o slide atual com base na posição do scroll
    const slide = Math.ceil(event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width);
    if (slide !== activeChartIndex) {
      setActiveChartIndex(slide);
    }
  };
  
  // --- LÓGICA PARA DICAS PERSONALIZADAS ---
  const [tips, setTips] = useState<string[]>([]);
  const [loadingTips, setLoadingTips] = useState(true);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  useEffect(() => {
    const manageTips = async () => {
      if (!profile || !user) return;

      const oneWeekInMs = 7 * 24 * 60 * 60 * 1000;
      const now = new Date();
      
      if (profile.cachedTips) {
        const lastGenerated = profile.cachedTips.generatedAt?.toDate();
        if (lastGenerated && (now.getTime() - lastGenerated.getTime() < oneWeekInMs)) {
          setTips(profile.cachedTips.tips);
          setLoadingTips(false);
          return;
        }
      }

      setLoadingTips(true);
      const newTips = await generatePersonalizedTips(profile);
      setTips(newTips);
      
      await FIREBASE_DB.collection('users').doc(user.uid).update({
        cachedTips: {
          tips: newTips,
          generatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }
      });

      await reloadProfile();
      setLoadingTips(false);
    };

    manageTips();
  }, [profile, user]);

  useEffect(() => {
    if (tips.length === 0) return;
    const interval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % tips.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [tips]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.logo, { color: colors.text }]}>
          <Text style={{ fontWeight: 'bold' }}>NutriX Pro </Text>AI
        </Text>
      </View>
      
      <ScrollView>
        <View style={styles.chartCarouselContainer}>
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
                  { backgroundColor: activeChartIndex === index ? colors.primary : colors.iconInactive }
                ]}
              />
            ))}
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.tipsContainer}>
          <Text style={[styles.tipsTitle, { color: colors.text }]}>Dica do Dia</Text>
          <View style={[styles.card, { backgroundColor: colors.iconBackground }]}>
            {loadingTips ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <Text style={[styles.tipText, { color: colors.text }]}>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { marginTop: 40, alignItems: 'center', marginBottom: 12 },
  logo: { fontSize: 32, fontStyle: 'italic' },
  chartCarouselContainer: {
    height: 350,
    justifyContent: 'center',
  },
  horizontalScrollView: {
    width: width,
  },
  chartPage: {
    width: width,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  divider: { height: 1, backgroundColor: '#e0e0e0', marginHorizontal: 20, marginVertical: 15 },
  tipsContainer: { paddingHorizontal: 20, marginTop: 10, marginBottom: 20 },
  tipsTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  card: { justifyContent: 'center', alignItems: 'center', padding: 20, borderRadius: 15, minHeight: 120 },
  tipText: { fontSize: 18, textAlign: 'center', fontStyle: 'italic' },
});