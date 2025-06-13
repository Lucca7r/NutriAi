// src/components/WeightChart.tsx

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { useAuth } from '../context/AuthContext';
import { useThemeColors } from '../context/ThemeContext';
import { FIREBASE_DB } from '../services/firebaseConfig';
import firebase from 'firebase/compat/app';

interface WeightData {
  value: number;
  date: string;
  label: string;
}

export default function WeightChart() {
  const { user } = useAuth();
  const colors = useThemeColors();
  const [chartData, setChartData] = useState<WeightData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Listener para buscar dados em tempo real
    const unsubscribe = FIREBASE_DB.collection('users')
      .doc(user.uid)
      .collection('weightHistory')
      .orderBy('date', 'asc') // Ordena por data para a linha do gráfico ficar correta
      .onSnapshot(querySnapshot => {
        const data: WeightData[] = [];
        querySnapshot.forEach(doc => {
          const weightEntry = doc.data() as { weight: number, date: firebase.firestore.Timestamp };
          data.push({
            value: weightEntry.weight,
            date: weightEntry.date.toDate().toISOString(), // Data completa para tooltip, etc.
            label: weightEntry.date.toDate().toLocaleDateString('pt-BR', { day: 'numeric', month: 'numeric' }),
          });
        });
        setChartData(data);
        setLoading(false);
      });

    // Limpa o listener ao desmontar o componente
    return () => unsubscribe();
  }, [user]);

  if (loading) {
    return <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 40 }} />;
  }

  if (chartData.length < 2) {
    return (
      <View style={styles.container}>
        <Text style={[styles.title, { color: colors.text }]}>Evolução do Peso</Text>
        <Text style={[styles.noDataText, { color: colors.text }]}>
          Registre seu peso pelo menos duas vezes para ver sua evolução.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>Evolução do Peso</Text>
      <LineChart
        areaChart
        data={chartData}
        curved
        height={200}
        // --- Cores e Estilo ---
        color={colors.primary}
        startFillColor={colors.primary}
        endFillColor={colors.background}
        startOpacity={0.4}
        endOpacity={0.1}
        // --- Eixo Y (Peso) ---
        yAxisColor={colors.iconInactive}
        yAxisTextStyle={{ color: colors.text }}
        // --- Eixo X (Data) ---
        xAxisColor={colors.iconInactive}
        xAxisLabelTextStyle={{ color: colors.text }}
        // --- Pontos e Tooltips ---
        pointerConfig={{
          pointerColor: colors.iconInactive,
          pointerStripColor: colors.primary,
          radius: 5,
          activatePointersOnLongPress: true,
          autoAdjustPointerLabelPosition: true,
          pointerLabelComponent: (items: WeightData[]) => (
            <View style={styles.tooltip}>
              <Text style={{ color: 'white', fontWeight: 'bold' }}>{items[0].value} kg</Text>
              <Text style={{ color: 'white' }}>{new Date(items[0].date).toLocaleDateString('pt-BR')}</Text>
            </View>
          ),
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    padding: 20,
    borderRadius: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  noDataText: {
    textAlign: 'center',
    marginTop: 30,
    fontSize: 16,
  },
  tooltip: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 8,
    borderRadius: 6,
  }
});