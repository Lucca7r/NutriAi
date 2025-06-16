import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../context/ThemeContext';
import { AuthContext, UserProfile } from '../context/AuthContext'; // seu contexto
import { sendMessageToAI } from '../services/openaiService'; // sua função para chamar OpenAI
import { saveRecipe, fetchRecipes, Recipe } from '../services/recipeService';
import { Timestamp } from 'firebase/firestore';

export default function FolderRecipesScreen() {
  const route = useRoute();
  const { folderName } = route.params as { folderName: string };
  const colors = useThemeColors();

  const { userProfile } = useContext(AuthContext) as unknown as { userProfile: UserProfile | null };

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [inputText, setInputText] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    async function loadRecipes() {
      setLoading(true);
      try {
        const data = await fetchRecipes(folderName);
        setRecipes(data);
      } catch (e) {
        console.error('Erro ao buscar receitas:', e);
      } finally {
        setLoading(false);
      }
    }
    loadRecipes();
  }, [folderName]);

  async function generateRecipe(prompt: string): Promise<string> {
    const recipePrompt = `
      Gere uma receita detalhada baseada no pedido a seguir, considerando as restrições e preferências do usuário.
      Pedido: "${prompt}"
      Forneça uma receita clara, segura e adequada às restrições alimentares do usuário.
      Caso o pedido não seja algo relacionado a receitas, retorne uma mensagem dizendo que não é possível gerar uma receita.
      Mande somente a receita, sem explicações adicionais, nem mensagens.
    `;
    try {
      const response = await sendMessageToAI(recipePrompt, userProfile);
      return response;
    } catch (error) {
      console.error('Erro ao gerar receita:', error);
      throw new Error('Erro ao gerar receita');
    }
  }

  async function handleAddRecipe() {
    setErrorMsg(null);
    if (!inputText.trim()) {
      setErrorMsg('Por favor, insira detalhes da receita.');
      return;
    }

    setGenerating(true);
    try {
      const result = await generateRecipe(inputText.trim());

      // Salva no Firestore
      await saveRecipe(folderName, result);

      // Atualiza localmente a lista
      setRecipes((old) => [
        { text: result, createdAt: Timestamp.now() },
        ...old,
      ]);
      setInputText('');
      setAdding(false);
      Keyboard.dismiss();
    } catch (error: any) {
      setErrorMsg(error.message || 'Erro desconhecido');
    } finally {
      setGenerating(false);
    }
  }

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Pasta: {folderName}</Text>

      {adding && (
        <View style={[styles.inputContainer, { borderColor: colors.textSecondary || '#888' }]}>
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Descreva sua receita (ex: receita de bolo de chocolate)"
            placeholderTextColor={colors.textSecondary}
            value={inputText}
            onChangeText={setInputText}
            editable={!generating}
            multiline
          />
          {errorMsg && <Text style={styles.error}>{errorMsg}</Text>}
          <View style={styles.buttonsRow}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: 'green' }]}
              onPress={handleAddRecipe}
              disabled={generating}
            >
              {generating ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Gerar Receita</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: 'red' }]}
              onPress={() => {
                setAdding(false);
                setInputText('');
                setErrorMsg(null);
              }}
              disabled={generating}
            >
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <FlatList
        data={recipes}
        keyExtractor={(item) => item.id || item.createdAt.toMillis().toString()}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: colors.iconBackground }]}>
            <Text style={[styles.recipeText, { color: colors.text }]}>{item.text}</Text>
          </View>
        )}
      />

      {!adding && (
        <TouchableOpacity style={[styles.floatingButton, { backgroundColor: colors.primary }]} onPress={() => setAdding(true)}>
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputContainer: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
  },
  input: {
    minHeight: 80,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  error: {
    color: 'red',
    marginTop: 6,
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  card: {
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  recipeText: {
    fontSize: 16,
  },
  floatingButton: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
});
