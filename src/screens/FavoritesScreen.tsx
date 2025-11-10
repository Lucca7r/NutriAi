import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useThemeColors } from "../context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../@types/navigation";
import { FIREBASE_DB } from "../services/firebaseConfig";
import { useAuth } from "../context/AuthContext";
import { createGeralStyles } from "../styles/Geral.style";

export type FavoritesScreenNavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

type Folder = {
  id: string;
  userId: string;
  title: string;
  count?: number;
};

export const FavoritesScreen = () => {
  const colors = useThemeColors();
  const styles = createGeralStyles(colors);
  const navigation = useNavigation<FavoritesScreenNavigationProp>();
  const auth = useAuth();
  const user = auth.user;

  const [folders, setFolders] = useState<Folder[]>([]);
  const [newFolderTitle, setNewFolderTitle] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [menuVisibleId, setMenuVisibleId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const firestore = FIREBASE_DB;

  const loadFolders = useCallback(() => {
    if (!user) return;

    const foldersRef = firestore
      .collection("folders")
      .where("userId", "==", user.uid)
      .orderBy("title");

    const unsubscribe = foldersRef.onSnapshot(async (snapshot) => {
  console.log("Snapshot recebido:", snapshot.docs.map(doc => doc.data()));

  try {
    const fetchedFolders: Folder[] = [];
    for (const doc of snapshot.docs) {
      const folderData = doc.data() as Omit<Folder, "id">;
      const folderId = doc.id;

     const recipesSnapshot = await firestore
        .collection("folders")
        .doc(folderId)
        .collection("recipes")
        .get();

        fetchedFolders.push({
          id: folderId,
          title: folderData.title,
          userId: folderData.userId,
          count: recipesSnapshot.size,
        });
      }

    console.log("Folders processados:", fetchedFolders);
    setFolders(fetchedFolders);
  } catch (error) {
    console.error("Erro ao processar folders:", error);
  }
});
    return unsubscribe;
  }, [firestore, user]);

  useFocusEffect(
    useCallback(() => {
      const unsubscribe = loadFolders();
      return () => unsubscribe && unsubscribe();
    }, [loadFolders])
  );

  const filteredFolders = folders.filter((folder) =>
    folder.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFolderPress = (folderId: string, folderTitle: string) => {
    navigation.navigate("FolderRecipes", { folderId: folderId, folderName: folderTitle });
  };

  const handleAddOrEditFolder = async () => {
    if (!newFolderTitle.trim() || !user) return;

    try {
      if (editingFolderId) {
        await firestore.collection("folders").doc(editingFolderId).update({
          title: newFolderTitle.trim(),
        });
      } else {
        await firestore.collection("folders").add({
          title: newFolderTitle.trim(),
          userId: user.uid,
        });
      }

      setNewFolderTitle("");
      setShowInput(false);
      setEditingFolderId(null);
    } catch (error) {
      console.error("Erro ao salvar pasta:", error);
    }
  };

  const handleDeleteFolder = async (id: string) => {
    try {
      await firestore.collection("folders").doc(id).delete();
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
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={20} color="#C8C9D2" />
            <TextInput
              placeholder="Busque suas pastas"
              placeholderTextColor="#C8C9D2"
              style={[styles.searchInput, { width: "100%", paddingLeft: 8 }]}
              keyboardAppearance={
                colors.background === "#1a1a1a" ? "dark" : "light"
              }
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity
            style={[styles.addFolderButton, { backgroundColor: "#41424A" }]}
            onPress={() => {
              setShowInput(true);
              setEditingFolderId(null);
            }}
          >
            <Ionicons name="add" size={24} color="#C8C9D2" />
          </TouchableOpacity>
        </View>

        {showInput && (
          <View style={styles.newFolderContainer}>
            <TextInput
              placeholder="Nome da pasta"
              placeholderTextColor={styles.inputPlaceholder.color}
              value={newFolderTitle}
              onChangeText={setNewFolderTitle}
              style={styles.newFolderInput}
            />
            <TouchableOpacity
              onPress={handleAddOrEditFolder}
              style={styles.iconButton}
            >
              <Ionicons name="checkmark-circle" size={28} color="green" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setShowInput(false);
                setNewFolderTitle("");
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
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.grid}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.folderCard}
                onPress={() => handleFolderPress(item.id, item.title)}
                activeOpacity={0.9}
              >
                <Text
                  style={[
                    styles.sectionTitle,
                    { marginBottom: 0, fontSize: 18 },
                  ]}
                >
                  {item.title}
                </Text>
                <Text style={styles.label}>
                  {item.count ?? 0} receita{item.count === 1 ? "" : "s"}
                </Text>
                <TouchableOpacity
                  style={styles.menuButton}
                  onPress={() =>
                    setMenuVisibleId((prev) =>
                      prev === item.id ? null : item.id
                    )
                  }
                >
                  <Ionicons
                    name="ellipsis-vertical"
                    size={18}
                    color="#C8C9D2"
                  />
                </TouchableOpacity>

                {menuVisibleId === item.id && (
                  <View style={styles.menuOptions}>
                    <TouchableOpacity
                      onPress={() => handleEditFolder(item.id, item.title)}
                    >
                      <Text
                        style={[
                          styles.label,
                          {
                            color: "#C8C9D2",
                            paddingHorizontal: 8,
                            paddingVertical: 4,
                          },
                        ]}
                      >
                        Editar
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDeleteFolder(item.id)}
                    >
                      <Text
                        style={[
                          styles.label,
                          {
                            color: "red",
                            paddingHorizontal: 8,
                            paddingVertical: 4,
                          },
                        ]}
                      >
                        Excluir
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </TouchableOpacity>
            )}
          />
        ) : (
          <View style={{ alignItems: "center", marginTop: 40 }}>
            <Text style={{ color: colors.textSecondary }}>
              Nenhuma pasta encontrada
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
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
    position: "relative",
    minWidth: 140,
    maxWidth: "48%",
    aspectRatio: 1,
  },
  folderTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  folderCount: {
    fontSize: 14,
  },
  menuButton: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  menuOptions: {
    position: "absolute",
    top: 40,
    right: 8,
    backgroundColor: "white",
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
