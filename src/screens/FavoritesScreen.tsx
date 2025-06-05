import React from 'react';
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

const folders = [
  { id: '1', title: 'Doces', count: 5 },
  { id: '2', title: 'Saladas', count: 2 },
  { id: '3', title: 'Almoço', count: 6 },
  { id: '4', title: 'Jantar', count: 3 },
];

export const FavoritesScreen = () => {
  const colors = useThemeColors();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
    <View >
      {/* Header de busca e botão adicionar */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBox, { backgroundColor: colors.iconBackground }]}>
          <Ionicons name="search" size={20} color={colors.icon} />
          <TextInput
            placeholder="Busque suas pastas"
            placeholderTextColor={colors.textSecondary || '#999'}
            style={[styles.input, { color: colors.text }]}
            keyboardAppearance= {colors.background==='#1a1a1a'? 'dark' : 'light'}
          />
        </View>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.iconBackground }]}
        >
          <Ionicons name="add" size={24} color={colors.icon} />
        </TouchableOpacity>
      </View>

      {/* Lista de pastas */}
      <FlatList
        data={folders}
        numColumns={2}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => (
          <View style={[styles.folderCard, { backgroundColor: colors.iconBackground }]}>
            <Text style={[styles.folderTitle, { color: colors.text }]}>
              {item.title}
            </Text>
            <Text style={[styles.folderCount, { color: colors.textSecondary }]}>
              {item.count} receitas
            </Text>
            <TouchableOpacity style={styles.menuButton}>
              <Ionicons name="ellipsis-vertical" size={18} color={colors.icon} />
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
     </SafeAreaView>
  );
}

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
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 40,
    borderColor: 'white',
    borderWidth: 1
  },
  input: {
    flex: 1,
    marginLeft: 8,
  },
  addButton: {
    marginLeft: 12,
    borderRadius: 20,
    padding: 8,
    height: 40,
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  grid: {
    gap: 16,
    justifyContent: 'space-between',
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
    fontSize: 16,
    fontWeight: 'bold',
  },
  folderCount: {
    marginTop: 4,
    fontSize: 14,
  },
  menuButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
});
