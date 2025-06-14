// src/components/WeightChart.tsx

import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ActivityIndicator, TouchableOpacity,
  Modal, TextInput, Button, KeyboardAvoidingView, Platform, Alert
} from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useThemeColors } from '../context/ThemeContext';
import { FIREBASE_DB, FIREBASE_AUTH } from '../services/firebaseConfig';
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

  // --- LÓGICA MOVIDA DE ProfileScreen PARA CÁ ---
  const [modalVisible, setModalVisible] = useState(false);
  const [currentWeight, setCurrentWeight] = useState('');

  const handleSaveWeight = async () => {
    const weightValue = parseFloat(currentWeight.replace(',', '.'));
    if (!weightValue || isNaN(weightValue)) {
      Alert.alert('Erro', 'Por favor, insira um peso válido.');
      return;
    }
    
    if (!user) return;

    try {
      await FIREBASE_DB.collection('users').doc(user.uid).collection('weightHistory').add({
        weight: weightValue,
        date: firebase.firestore.FieldValue.serverTimestamp(),
      });
      setCurrentWeight('');
      setModalVisible(false);
      Alert.alert('Sucesso', 'Seu peso foi registrado!');
    } catch (error) {
      console.error("Erro ao registrar peso:", error);
      Alert.alert('Erro', 'Não foi possível registrar seu peso.');
    }
  };
  // --- FIM DA LÓGICA MOVIDA ---

  useEffect(() => {
    if (!user) return;

    const unsubscribe = FIREBASE_DB.collection('users')
      .doc(user.uid)
      .collection('weightHistory')
      .orderBy('date', 'asc')
      .onSnapshot(querySnapshot => {
        const data: WeightData[] = [];
        querySnapshot.forEach(doc => {
          const weightEntry = doc.data() as { weight: number, date: firebase.firestore.Timestamp | null };
          if (!weightEntry.date) {
            return; 
          }
          data.push({
            value: weightEntry.weight,
            date: weightEntry.date.toDate().toISOString(),
            label: weightEntry.date.toDate().toLocaleDateString('pt-BR', { day: 'numeric', month: 'numeric' }),
          });
        });
        setChartData(data);
        setLoading(false);
      });
    
    return () => unsubscribe();
  }, [user]);

  if (loading) {
    return <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 40 }} />;
  }

  return (
    <View style={styles.container}>
      {/* NOVO CABEÇALHO COM TÍTULO E BOTÃO */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Evolução do Peso</Text>
        <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.primary }]} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {chartData.length < 2 ? (
        <Text style={[styles.noDataText, { color: colors.text }]}>
          Registre seu peso pelo menos duas vezes para ver sua evolução.
        </Text>
      ) : (
        <LineChart
          areaChart
          data={chartData}
          curved
            height={200}
          // --- PROPRIEDADES DE COR RESTAURADAS ---
          color={colors.primary}
          startFillColor={colors.primary}
          endFillColor={colors.background}
          startOpacity={0.4}
          endOpacity={0.1}
          yAxisColor={colors.iconInactive}
          yAxisTextStyle={{ color: colors.text }}
          xAxisColor={colors.iconInactive}
          xAxisLabelTextStyle={{ color: colors.text }}
          pointerConfig={{
            pointerColor: colors.iconInactive,
            pointerStripColor: colors.primary,
            radius: 5,
            activatePointersOnLongPress: true,
            autoAdjustPointerLabelPosition: true,
            pointerLabelComponent: (items: any) => ( // 'any' para evitar conflito de tipo da lib
              <View style={styles.tooltip}>
                <Text style={{ color: 'white', fontWeight: 'bold' }}>{items[0].value} kg</Text>
                <Text style={{ color: 'white' }}>{new Date(items[0].date).toLocaleDateString('pt-BR')}</Text>
              </View>
            ),
          }}
        />
      )}
      
      {/* MODAL MOVIDO PARA CÁ */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
          <View style={[styles.modalView, { backgroundColor: colors.iconBackground }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Qual seu peso hoje?</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.iconInactive }]}
              placeholder="Ex: 75,5"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              value={currentWeight}
              onChangeText={setCurrentWeight}
            />
            <View style={styles.modalButtons}>
              <Button title="Cancelar" onPress={() => setModalVisible(false)} color={colors.primary} />
              <Button title="Salvar" onPress={handleSaveWeight} />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    padding: 20,
    borderRadius: 12,
  },
  header: { // NOVO ESTILO
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  addButton: { // NOVO ESTILO
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    textAlign: 'center',
    marginTop: 30,
    fontSize: 16,
    paddingVertical: 40, // Adiciona espaço quando não há gráfico
  },
  // --- Estilos do Modal (movidos e ajustados) ---
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalView: { margin: 20, borderRadius: 20, padding: 35, alignItems: 'center', elevation: 5 },
  modalTitle: { fontSize: 20, marginBottom: 15 },
  input: {
    height: 50,
    width: 200,
    marginVertical: 10,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    textAlign: 'center',
    fontSize: 18
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20
  },
  tooltip: { // NOVO ESTILO
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 8,
    borderRadius: 6,
  },
});