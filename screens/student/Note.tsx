import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { db } from '../../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Define navigation types
type RootStackParamList = {
    AddNote: undefined;
    NoteDetail: {
        title: string;
        date: string;
        color:string;

    }
};

type NavigationProps = NativeStackNavigationProp<RootStackParamList>;

interface Note {
    id: string;
    title: string;
    date: string;
    color: string;
}

const COLORS = ['#8e8efa', '#b0e57c', '#f9d26a', '#f89c8d', '#91d7ff'];

const NotesScreen = () => {
    const navigation = useNavigation<NavigationProps>();
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(false);

    // Function to fetch user UID from AsyncStorage
    const getUserUID = async () => {
        try {
            const user = await AsyncStorage.getItem('user');
            if (!user) {
                Alert.alert('Error', 'User UID not found. Please log in again.');
                return null;
            }
            const parsedUser = JSON.parse(user);
            return parsedUser.uid;
        } catch (error) {
            console.error('Error fetching user UID:', error);
            Alert.alert('Error', 'Failed to retrieve user information.');
            return null;
        }
    };

    // Function to fetch notes from Firestore
    const fetchNotes = async () => {
        setLoading(true);
        const userUID = await getUserUID();
        if (!userUID) return;

        try {
            const notesQuery = query(collection(db, 'notes'), where('author', '==', userUID));
            const querySnapshot = await getDocs(notesQuery);

            const fetchedNotes: Note[] = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                title: doc.data().title,
                date: doc.data().timestamp.toDate().toLocaleDateString(),
                color: COLORS[Math.floor(Math.random() * COLORS.length)],
            }));

            setNotes(fetchedNotes);
        } catch (error) {
            console.error('Error fetching notes:', error);
            Alert.alert('Error', 'Failed to load notes.');
        } finally {
            setLoading(false);
        }
    };

    // Navigate to note detail screen
    const navigateToDetail = (note: Note) => {
        navigation.navigate('NoteDetail', { title: note.title, date: note.date, color: note.color });
    };

    // Render a single note item
    const renderNote = ({ item }: { item: Note }) => (
        <TouchableOpacity
            style={[styles.noteContainer, { backgroundColor: item.color }]}
            onPress={() => navigateToDetail(item)}
        >
            <Text style={styles.noteTitle}>{item.title}</Text>
            <Text style={styles.noteDate}>{item.date}</Text>
        </TouchableOpacity>
    );

    // Use useFocusEffect to fetch notes when the screen is focused
    useFocusEffect(
        useCallback(() => {
            fetchNotes();
        }, [])
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <MaterialIcons name="arrow-back" size={28} color="white" onPress={() => navigation.goBack()} />
                <Text style={styles.headerTitle}>Notes</Text>
                <View style={styles.headerIcons}>
                    <MaterialIcons
                        name="add"
                        size={28}
                        color="white"
                        style={styles.icon}
                        onPress={() => navigation.navigate('AddNote')}
                    />
                </View>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#8e8efa" />
                    <Text style={styles.loadingText}>Loading notes...</Text>
                </View>
            ) : (
                <FlatList
                    data={notes}
                    keyExtractor={(item) => item.id}
                    renderItem={renderNote}
                    contentContainerStyle={styles.notesList}
                    numColumns={2}
                    ListEmptyComponent={<Text style={styles.emptyText}>No notes found. Add a new note!</Text>}
                />
            )}
        </View>
    );
};

export default NotesScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1c1c1c',
        paddingTop: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
        marginLeft: 16,
        flex: 1,
    },
    headerIcons: {
        flexDirection: 'row',
    },
    icon: {
        marginRight: 16,
    },
    notesList: {
        paddingHorizontal: 2,
    },
    noteContainer: {
        flex: 1,
        margin: 5,
        padding: 16,
        borderRadius: 12,
        minHeight: 100,
        justifyContent: 'space-between',
    },
    noteTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    noteDate: {
        color: '#dcdcdc',
        fontSize: 12,
        textAlign: 'right',
    },
    emptyText: {
        color: '#dcdcdc',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#dcdcdc',
        fontSize: 16,
        marginTop: 10,
    },
});