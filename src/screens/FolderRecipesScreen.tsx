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
import { useRoute, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../context/ThemeContext';
import { AuthContext, UserProfile } from '../context/AuthContext';
import { sendMessageToRecipeAI } from '../services/openaiService';
import {
  collection,
  addDoc,
  getDocs,
  orderBy,
  query,
  Timestamp,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { FIREBASE_DB } from '../services/firebaseConfig';

type Recipe = {
  id?: string;
  text: string;
  createdAt: Timestamp;
};

export default function FolderRecipesScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { folderName } = route.params as { folderName: string };
  const colors = useThemeColors();
  const authContext = useContext(AuthContext);

  const userProfile: UserProfile | null = authContext.user
    ? {
        ...(authContext.user as any),
        name: (authContext.user as any).name ?? '',
        createdAt: (authContext.user as any).createdAt ?? null,
      }
    : null;

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [inputText, setInputText] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  async function fetchRecipes(folder: string): Promise<Recipe[]> {
    const ref = collection(FIREBASE_DB, 'recipes', folder, 'items');
    const q = query(ref, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Recipe[];
  }

  async function saveRecipe(folder: string, text: string): Promise<void> {
    const ref = collection(FIREBASE_DB, 'recipes', folder, 'items');
    await addDoc(ref, {
      text,
      createdAt: Timestamp.now(),
    });
  }

  async function deleteRecipe(id: string) {
    try {
      const recipeRef = doc(FIREBASE_DB, 'recipes', folderName, 'items', id);
      await deleteDoc(recipeRef);
      setRecipes((prev) => prev.filter((r) => r.id !== id));
    } catch (error) {
      console.error('Erro ao deletar receita:', error);
    }
  }

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

  async function handleAddRecipe() {
    setErrorMsg(null);
    if (!inputText.trim()) {
      setErrorMsg('Por favor, insira detalhes da receita.');
      return;
    }

    setGenerating(true);
    try {
      const result = await sendMessageToRecipeAI(inputText.trim(), userProfile);

      if (result === 'Por favor, peça somente receitas.') {
        setErrorMsg('Por favor, peça somente receitas.');
        return;
      }

      await saveRecipe(folderName, result);
      const newRecipe: Recipe = {
        text: result,
        createdAt: Timestamp.now(),
      };

      setRecipes((old) => [newRecipe, ...old]);
      setInputText('');
      setAdding(false);
      Keyboard.dismiss();
    } catch (error: any) {
      console.error('Erro ao gerar receita:', error);
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Pasta: {folderName}</Text>
      </View>

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
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => item.id && deleteRecipe(item.id)}
            >
              <Ionicons name="trash" size={20} color="red" />
            </TouchableOpacity>
            <Text style={[styles.recipeText, { color: colors.text }]}>{item.text}</Text>
          </View>
        )}
      />

      {!adding && (
        <TouchableOpacity
          style={[styles.floatingButton, { backgroundColor: colors.primary }]}
          onPress={() => setAdding(true)}
        >
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    marginRight: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
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
    position: 'relative',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  recipeText: {
    fontSize: 16,
  },
  deleteButton: {
    position: 'absolute',
    right: 8,
    top: 8,
    padding: 4,
    zIndex: 1,
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
