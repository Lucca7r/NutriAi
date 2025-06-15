import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useThemeColors } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { FIREBASE_DB } from "../services/firebaseConfig";
import firebase from "firebase/compat/app";
import { estimateCaloriesFromText } from "../services/openaiService";

interface AddMealModalProps {
  visible: boolean;
  onClose: () => void;
}

const mealTypes = ["Café da Manhã", "Almoço", "Jantar", "Lanche"];

export default function AddMealModal({ visible, onClose }: AddMealModalProps) {
  const colors = useThemeColors();
  const { user } = useAuth();

  const [selectedMealType, setSelectedMealType] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [calories, setCalories] = useState(0);
  const [isEstimating, setIsEstimating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleEstimateCalories = async () => {
    if (!description.trim()) {
      Alert.alert("Atenção", "Por favor, descreva a refeição primeiro.");
      return;
    }
    setIsEstimating(true);
    setCalories(0);
    try {
      const estimatedCalories = await estimateCaloriesFromText(description);
      if (estimatedCalories > 0) {
        setCalories(estimatedCalories);
      } else {
        Alert.alert(
          "Ops!",
          "Não consegui estimar as calorias. Tente descrever com mais detalhes."
        );
      }
    } catch (error) {
      Alert.alert("Erro", "Houve um problema ao estimar as calorias.");
    } finally {
      setIsEstimating(false);
    }
  };

  const handleSaveMeal = async () => {
    if (!selectedMealType || !description.trim() || calories <= 0) {
      Alert.alert(
        "Erro",
        "Preencha o tipo, a descrição e estime as calorias antes de salvar."
      );
      return;
    }
    if (!user) return;
    setIsSaving(true);
    const todayDocId = new Date().toISOString().split("T")[0];
    const dayRef = FIREBASE_DB.collection("users")
      .doc(user.uid)
      .collection("dailyEntries")
      .doc(todayDocId);
    try {
      await FIREBASE_DB.runTransaction(async (transaction) => {
        const dayDoc = await transaction.get(dayRef);
        const newMeal = {
          id: Date.now().toString(),
          type: selectedMealType,
          description: description.trim(),
          calories: calories,
        };
        if (!dayDoc.exists) {
          transaction.set(dayRef, {
            consumedCalories: calories,
            meals: [newMeal],
          });
        } else {
          transaction.update(dayRef, {
            consumedCalories: firebase.firestore.FieldValue.increment(calories),
            meals: firebase.firestore.FieldValue.arrayUnion(newMeal),
          });
        }
      });
      Alert.alert("Sucesso!", "Refeição registrada.");
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
    setDescription("");
    setCalories(0);
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.overlay}
      >
        <View
          style={[styles.modalView, { backgroundColor: colors.iconBackground }]}
        >
          <Text style={[styles.title, { color: colors.text }]}>
            Registrar Refeição
          </Text>

          <Text style={[styles.label, { color: colors.text }]}>
            Tipo de Refeição
          </Text>
          <View style={styles.mealTypeContainer}>
            {mealTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.mealTypeButton,
                  {
                    backgroundColor:
                      selectedMealType === type
                        ? colors.primary
                        : "transparent",
                    borderColor: colors.primary,
                  },
                ]}
                onPress={() => setSelectedMealType(type)}
              >
                <Text
                  style={{
                    color: selectedMealType === type ? "#FFF" : colors.text,
                  }}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.label, { color: colors.text }]}>
            O que você comeu?
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                color: colors.text,
                borderColor: colors.iconInactive,
                height: 80,
              },
            ]}
            placeholder="Ex: 2 ovos mexidos, 1 fatia de pão integral e 1 xícara de café sem açúcar"
            placeholderTextColor={colors.textSecondary}
            value={description}
            onChangeText={setDescription}
            multiline
          />

          <TouchableOpacity
            style={[
              styles.estimateButton,
              {
                backgroundColor: colors.primary,
                opacity: isEstimating ? 0.6 : 1,
              },
            ]}
            onPress={handleEstimateCalories}
            disabled={isEstimating}
          >
            {isEstimating ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.saveButtonText}>Estimar Calorias com IA</Text>
            )}
          </TouchableOpacity>

          {calories > 0 && (
            <Text style={[styles.resultText, { color: colors.text }]}>
              Estimativa:{" "}
              <Text style={{ fontWeight: "bold" }}>{calories} kcal</Text>
            </Text>
          )}

          <TouchableOpacity
            style={[
              styles.saveButton,
              {
                backgroundColor: colors.primary,
                opacity: calories > 0 && !isSaving ? 1 : 0.5,
              },
            ]}
            onPress={handleSaveMeal}
            disabled={calories === 0 || isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.saveButtonText}>Salvar Refeição</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={handleClose} style={{ marginTop: 10 }}>
            <Text style={{ color: colors.textSecondary }}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  modalView: { width: "90%", borderRadius: 20, padding: 25, elevation: 5 },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    // ✨ ESTILO ADICIONADO AQUI ✨
    fontSize: 16,
    fontWeight: "500",
    alignSelf: "flex-start",
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
  },
  mealTypeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    marginBottom: 5,
  },
  mealTypeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 20,
    margin: 4,
  },
  estimateButton: {
    width: "100%",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 15,
  },
  resultText: { fontSize: 18, marginTop: 15, textAlign: "center" },
  saveButton: {
    width: "100%",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
});
