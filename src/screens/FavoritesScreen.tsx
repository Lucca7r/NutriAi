import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useThemeColors } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../@types/navigation';
import { FIREBASE_DB } from "../services/firebaseConfig";
import { useAuth } from "../context/AuthContext";

export type FavoritesScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

type Folder = {
  id: string;
  userId: string;
  title: string;
  count: number;
};

export const FavoritesScreen = () => {
  const colors = useThemeColors();
  const navigation = useNavigation<FavoritesScreenNavigationProp>();

  const auth = useAuth();  // <-- hook no topo do componente
  const user = auth.user;

  const [folders, setFolders] = useState<Folder[]>([]);
  const [newFolderTitle, setNewFolderTitle] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [menuVisibleId, setMenuVisibleId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const firestore = FIREBASE_DB;

  useEffect(() => {
    if (!user) return;

    const foldersRef = firestore
      .collection('folders')
      .where('userId', '==', user.uid)
      .orderBy('title');

    const unsubscribe = foldersRef.onSnapshot(snapshot => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<Folder, 'id'>),
      }));
      setFolders(data);
    });

    return () => unsubscribe();
  }, [firestore, user]);

  const filteredFolders = folders.filter(folder =>
    folder.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFolderPress = (folderTitle: string) => {
    navigation.navigate('FolderRecipes', { folderName: folderTitle });
  };

  const handleAddOrEditFolder = async () => {
    if (!newFolderTitle.trim()) return;
    if (!user) return;

    try {
      if (editingFolderId) {
        await firestore.collection('folders').doc(editingFolderId).update({
          title: newFolderTitle.trim(),
        });
      } else {
        await firestore.collection('folders').add({
          title: newFolderTitle.trim(),
          count: 0,
          userId: user.uid,
        });
      }
      setNewFolderTitle('');
      setShowInput(false);
      setEditingFolderId(null);
    } catch (error) {
      console.error("Erro ao salvar pasta:", error);
    }
  };

  const handleDeleteFolder = async (id: string) => {
    try {
      await firestore.collection('folders').doc(id).delete();
      setMenuVisibleId(null);
    } catch (error) {
      console.error("Erro ao deletar pasta:", error);
    }
  };

  const handleEditFolder = (id: string, title: string) => {
    setEditingFolderId(id);
    setNewFolderTitle(title);
    setShowInput(true);
    setMenuVisibleId(null);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View>
        <View style={styles.searchContainer}>
          <View style={[styles.searchBox, { backgroundColor: colors.iconBackground }]}>
            <Ionicons name="search" size={20} color={colors.icon} />
            <TextInput
              placeholder="Busque suas pastas"
              placeholderTextColor={colors.textSecondary || '#999'}
              style={[styles.input, { color: colors.text }]}
              keyboardAppearance={colors.background === '#1a1a1a' ? 'dark' : 'light'}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.iconBackground }]}
            onPress={() => {
              setShowInput(true);
              setEditingFolderId(null);
            }}
          >
            <Ionicons name="add" size={24} color={colors.icon} />
          </TouchableOpacity>
        </View>

        {showInput && (
          <View style={styles.newFolderContainer}>
            <TextInput
              placeholder="Nome da pasta"
              placeholderTextColor={colors.textSecondary}
              value={newFolderTitle}
              onChangeText={setNewFolderTitle}
              style={[
                styles.newFolderInput,
                { color: colors.text, borderColor: colors.textSecondary },
              ]}
            />
            <TouchableOpacity onPress={handleAddOrEditFolder} style={styles.iconButton}>
              <Ionicons name="checkmark-circle" size={28} color="green" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setShowInput(false);
                setNewFolderTitle('');
                setEditingFolderId(null);
              }}
              style={styles.iconButton}
            >
              <Ionicons name="close-circle" size={28} color="red" />
            </TouchableOpacity>
          </View>
        )}

        {filteredFolders.length > 0 ? (
          <FlatList
            data={filteredFolders}
            numColumns={2}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.grid}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.folderCard, { backgroundColor: colors.iconBackground }]}
                onPress={() => handleFolderPress(item.title)}
                activeOpacity={0.9}
              >
                <Text style={[styles.folderTitle, { color: colors.text }]}>
                  {item.title}
                </Text>
                <Text style={[styles.folderCount, { color: colors.textSecondary }]}>
                  {item.count} receitas
                </Text>
                <TouchableOpacity
                  style={styles.menuButton}
                  onPress={() =>
                    setMenuVisibleId(prev => (prev === item.id ? null : item.id))
                  }
                >
                  <Ionicons name="ellipsis-vertical" size={18} color={colors.icon} />
                </TouchableOpacity>

                {menuVisibleId === item.id && (
                  <View style={styles.menuOptions}>
                    <TouchableOpacity onPress={() => handleEditFolder(item.id, item.title)}>
                      <Text style={[styles.menuItem, { color: colors.text }]}>Editar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteFolder(item.id)}>
                      <Text style={[styles.menuItem, { color: 'red' }]}>Excluir</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </TouchableOpacity>
            )}
          />
        ) : (
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <Text style={{ color: colors.textSecondary }}>Nenhuma pasta encontrada</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRadius: 8,
    height: 40,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  newFolderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  newFolderInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  iconButton: {
    marginLeft: 8,
  },
  grid: {
    paddingBottom: 16,
  },
  folderCard: {
    flex: 1,
    margin: 8,
    padding: 16,
    borderRadius: 12,
    position: 'relative',
    minWidth: 140,
    maxWidth: '48%',
    aspectRatio: 1,
  },
  folderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  folderCount: {
    fontSize: 14,
  },
  menuButton: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  menuOptions: {
    position: 'absolute',
    top: 40,
    right: 8,
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 5,
    padding: 6,
    zIndex: 100,
  },
  menuItem: {
    padding: 6,
    fontSize: 14,
  },
});
