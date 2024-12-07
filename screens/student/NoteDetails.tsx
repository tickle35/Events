import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';

interface NoteDetailParams {
    title: string;
    date: string;
    color: string;
}

const NoteDetailScreen = () => {
    const route = useRoute<RouteProp<{ params: NoteDetailParams }, 'params'>>();
    const { title, date, color } = route.params;

    return (
        <View style={[styles.container, { backgroundColor: color }]}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.date}>{date}</Text>
            <Text style={styles.content}>This is the detailed content of the note...</Text>
        </View>
    );
};

export default NoteDetailScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    title: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    date: {
        color: '#dcdcdc',
        fontSize: 14,
        marginBottom: 20,
    },
    content: {
        color: '#fff',
        fontSize: 16,
    },
});