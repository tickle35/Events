import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { db } from '../../firebase'; // Your Firebase setup
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
export default function AddNote() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);

    // Function to handle note submission
    const handleAddNote = async () => {
        if (!title.trim() || !content.trim()) {
            Alert.alert('Error', 'Please fill out both the title and content.');
            return;
        }

        setLoading(true);
        // Retrieve the user UID from AsyncStorage
        const user = await AsyncStorage.getItem('user'); // Assuming you store UID under 'userUID'
        if (!user) {
            alert('User UID not found. Please log in again.');
            setLoading(false);
            return;
        }
        const parsedUser = JSON.parse(user);
        const userUID = parsedUser.uid;
        try {
            // Create the note data
            const noteData = {
                title,
                content,
                timestamp: Timestamp.now(),
                author: userUID,
            };

            // Add the note to Firestore
            await addDoc(collection(db, 'notes'), noteData);

            Alert.alert('Success', 'Note added successfully!');
            // Reset fields after adding
            setTitle('');
            setContent('');
        } catch (error) {
            console.error('Error adding note: ', error);
            Alert.alert('Error', 'Failed to add the note.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Note Title</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter note title"
                value={title}
                onChangeText={setTitle}
            />

            <Text style={styles.label}>Note Content</Text>
            <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Write your note here..."
                value={content}
                onChangeText={setContent}
                multiline
            />

            <TouchableOpacity
                style={styles.button}
                onPress={handleAddNote}
                disabled={loading}
            >
                <Feather name="save" size={20} color="#fff" />
                <Text style={styles.buttonText}>{loading ? 'Saving...' : 'Add Note'}</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#1c1c1c',
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: '#6A5ACD',
        borderRadius: 5,
        padding: 10,
        fontSize: 16,
        marginBottom: 20,
        color: '#fff',
    },
    textArea: {
        height: 150,
        textAlignVertical: 'top',
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
        backgroundColor: '#6A5ACD',
        borderRadius: 5,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        marginLeft: 10,
    },
});