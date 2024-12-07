import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator ,VirtualizedList} from 'react-native';
import { db } from '../firebase';
import { collection, addDoc, query, where, orderBy, getDocs } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Comment {
    id: string;
    userId: string;
    userName: string;
    text: string;
    timestamp: any;
}

interface CommentsProps {
    eventId: string;
}

const Comments: React.FC<CommentsProps> = ({ eventId }) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [userName, setUserName] = useState('');
    const [userId ,setUser] = useState('')
    console.log('the eventid', eventId)
    // Fetch user info from AsyncStorage
    const fetchUser = async () => {
        const user = await AsyncStorage.getItem('user');
        if (user) {
            const parsedUser = JSON.parse(user);
            setUserName(parsedUser.FullName);
            setUser(parsedUser.uid)
        }
    };

    // Fetch all comments for the event
    const fetchComments = async () => {
        setIsLoading(true);
        try {
            const q = query(
                collection(db, 'comments'),
                where('eventId', '==', eventId),
            );
            const querySnapshot = await getDocs(q);
            const commentsData = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Comment[];
            console.log(querySnapshot)
            setComments(commentsData);
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
        setIsLoading(false);
    };

    // Add a new comment
    const addComment = async () => {
        if (!newComment.trim()) return;
        try {
            await addDoc(collection(db, 'comments'), {
                eventId,
                userId,
                userName,
                text: newComment,
                timestamp: new Date(),
            });
            setNewComment('');
            fetchComments(); // Refresh comments after adding a new one
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };

    useEffect(() => {
        fetchUser();
        fetchComments();
    }, [eventId]);

    const renderComment = ({ item }: { item: Comment }) => (
        <View style={styles.comment}>
            <Text style={styles.commentUser}>{item.userName || 'Anonymous'}</Text>
            <Text style={styles.commentText}>{item.text}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Comments</Text>
            {isLoading ? (
                <ActivityIndicator size="large" color="#ff4757" />
            ) : (
                <FlatList
                    data={comments}
                    renderItem={renderComment}
                    keyExtractor={(item) => item.id}
                    nestedScrollEnabled={true}
                />
            )}
            <TextInput
                style={styles.input}
                placeholder="Add a comment..."
                placeholderTextColor="#888"
                value={newComment}
                onChangeText={setNewComment}
            />
            <TouchableOpacity onPress={addComment} style={styles.button}>
                <Text style={styles.buttonText}>Post</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 10,
        backgroundColor: '#1c1c1c',
    },
    title: {
        fontSize: 18,
        color: '#fff',
        fontWeight: 'bold',
        marginBottom: 10,
    },
    comment: {
        padding: 10,
        backgroundColor: '#333',
        borderRadius: 5,
        marginBottom: 10,
    },
    commentUser: {
        color: '#cade7f',
        fontWeight: 'bold',
    },
    commentText: {
        color: '#fff',
        marginTop: 5,
    },
    input: {
        backgroundColor: '#444',
        color: '#fff',
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
    },
    button: {
        backgroundColor: '#ff4757',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default Comments;