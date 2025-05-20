import React, { useState, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
  Alert,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';  // Import icon library
import NoteCard from '../components/NoteCard';
import NoteToolbar from '../components/NoteToolbar';
import { fetchNotes, deleteNote, updateNote } from '../utils/api';

export default function HomeScreen({ navigation }) {
  const [notes, setNotes] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Helper to sort notes so pinned ones are on top
  const sortNotes = (notesArray) => {
    return notesArray.slice().sort((a, b) => b.pinned - a.pinned);
  };

  const loadNotes = async () => {
    setRefreshing(true);
    try {
      const data = await fetchNotes();
      setNotes(sortNotes(data));
      setSelectedIds([]);
    } catch (error) {
      Alert.alert('Error', 'Failed to load notes');
    } finally {
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadNotes();
    }, [])
  );

  const togglePin = async (note) => {
    try {
      const updatedPin = note.pinned ? 0 : 1;
      await updateNote(note.id, {
        title: note.title,
        content: note.content,
        pinned: updatedPin,
      });
      setNotes((prevNotes) =>
        sortNotes(
          prevNotes.map((n) =>
            n.id === note.id ? { ...n, pinned: updatedPin } : n
          )
        )
      );
    } catch {
      Alert.alert('Error', 'Failed to toggle pin');
    }
  };

  const onNotePress = (note) => {
    if (selectedIds.length > 0) {
      toggleSelect(note.id);
    } else {
      navigation.navigate('NoteEditor', { note });
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((sid) => sid !== id)
        : [...prevSelected, id]
    );
  };

  const onNoteLongPress = (id) => {
    toggleSelect(id);
  };

  const onDelete = () => {
    Alert.alert(
      'Delete Notes',
      `Are you sure you want to delete ${selectedIds.length} note(s)?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await Promise.all(selectedIds.map((id) => deleteNote(id)));
              setNotes((prevNotes) =>
                prevNotes.filter((note) => !selectedIds.includes(note.id))
              );
              setSelectedIds([]);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete notes');
            }
          },
        },
      ]
    );
  };

  const onCancelSelection = () => {
    setSelectedIds([]);
  };

  // Fix: use safe fallback for title and searchQuery to avoid null errors
  const filteredNotes = notes
    .filter(note => note.archived === 0)
    .filter(note =>
      (note.title || '').toLowerCase().includes((searchQuery || '').toLowerCase())
    );

  return (
    <View style={styles.container}>
      <NoteToolbar
        selected={selectedIds}
        onDelete={onDelete}
        onCancel={onCancelSelection}
      />

      <View style={styles.searchContainer}>
        <Icon name="search" size={22} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search notes..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#888"
        />
      </View>

      <FlatList
        data={filteredNotes}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadNotes} />
        }
        renderItem={({ item }) => (
          <NoteCard
            note={item}
            onPress={onNotePress}
            onLongPress={onNoteLongPress}
            selected={selectedIds.includes(item.id)}
            onTogglePin={() => togglePin(item)}
          />
        )}
        contentContainerStyle={{ paddingBottom: 80 }}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('NoteEditor')}
      >
        <Text style={styles.fabText}>＋</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f0f0', padding: 12 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 40,
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginBottom: 16,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    padding: 0,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    backgroundColor: '#ff6b6b',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  fabText: {
    color: '#fff',
    fontSize: 32,
    lineHeight: 36,
  },
});
