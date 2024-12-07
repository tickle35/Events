import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, Image, ActivityIndicator } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import { collection, query, where, getDocs ,getDoc,doc} from 'firebase/firestore';
import { db } from '../../firebase'; // Adjust import based on your project
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
    EventDetails: { eventId: string };
    MyEvents: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList, 'MyEvents'>;


interface Event {
    id: string;
    eventName: string;
    eventType: string;
    eventDate: Date;
    eventTime: Date;
    description: string;
    coverImage?: string; // Optional since it might not exist in some events
    locationName?: string; // Optional
}


const MyEventsScreen = () => {
const navigation = useNavigation<NavigationProp>();
    const [activeTab, setActiveTab] = useState<'MyEvents' | 'RSVPd'>('MyEvents');
    const [myEvents, setMyEvents] = useState<Event[]>([]);
    const [rsvpEvents, setRsvpEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');


    useEffect(() => {
        fetchAllEvents();
    }, []);

    const fetchAllEvents = async () => {
        setLoading(true);
        setError('');
        console.log('Fetching all events...');
        try {
            const user = await AsyncStorage.getItem('user');
            if (!user) {
                throw new Error('User not found in AsyncStorage.');
            }
            const parsedUser = JSON.parse(user);
            const uid = parsedUser.uid;

            // Fetch My Events
            const myEventsQuery = query(collection(db, 'events'), where('author', '==', uid));
            const myEventsSnapshot = await getDocs(myEventsQuery);
            const myEventsData = myEventsSnapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    eventName: data.eventName,
                    eventType: data.eventType,
                    eventDate: data.eventDate?.toDate(),
                    eventTime: data.eventTime?.toDate(),
                    description: data.description,
                };
            });
            console.log('My Events Data:', myEventsData);
            setMyEvents(myEventsData);

            // Fetch RSVP'd Events
            const rsvpQuery = query(collection(db, 'attendees'), where('userId', '==', uid));
            const rsvpSnapshot = await getDocs(rsvpQuery);
            const eventIds = rsvpSnapshot.docs.map((doc) => doc.data().eventId);
            console.log('RSVP Event IDs:', eventIds);

            const rsvpdEventsData = [];
            for (const eventId of eventIds) {
                const eventDocRef = doc(db, 'events', eventId);
                const eventDoc = await getDoc(eventDocRef);
                if (eventDoc.exists()) {
                    const data = eventDoc.data();
                    rsvpdEventsData.push({
                        id: eventDoc.id,
                        eventName: data.eventName,
                        eventType: data.eventType,
                        eventDate: data.eventDate?.toDate(),
                        eventTime: data.eventTime?.toDate(),
                        description: data.description,
                        coverImage: data.coverImage,
                        locationName: data.locationName,
                    });
                }
            }
            setRsvpEvents(rsvpdEventsData)
            console.log('RSVP’d Events Data:', rsvpdEventsData);

            console.log('My Events:', myEvents);
        } catch (err) {
            setError('Failed to fetch events. Please try again.');
            console.error('Error fetching events:', err);
        } finally {
            setLoading(false);
        }
    };

    const renderEvent = ({ item }: { item: Event }) => (
        <TouchableOpacity style={styles.eventCard} onPress={() => navigation.navigate('EventDetails', { eventId: item.id })}>
            <Image source={{ uri: item.coverImage || 'default-image-uri' }} style={styles.eventImage} />
            <View style={styles.eventInfo}>
                <Text style={styles.eventName}>{item.eventName}</Text>
                <Text style={styles.eventType}>{item.eventType}</Text>
                <Text style={styles.eventDate}>{item.eventDate ? item.eventDate.toLocaleDateString() : ''}</Text>
                <Text style={styles.eventLocation}>{item.locationName || 'Unknown Location'}</Text>
            </View>
        </TouchableOpacity>
    );

    const renderContent = () => {
        if (loading) return <ActivityIndicator size="large" color="#ffffff" />;
        if (error) return <Text style={styles.errorText}>{error}</Text>;

        const data = activeTab === 'MyEvents' ? myEvents : rsvpEvents;
        if (data.length === 0)
            return <Text style={styles.emptyText}>{activeTab === 'MyEvents' ? 'No events created by you.' : 'No events RSVP’d by you.'}</Text>;

        return <FlatList data={data} renderItem={renderEvent} keyExtractor={(item) => item.id} />;
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Feather name="arrow-left" size={24} color="#fff" onPress={() => useNavigation().goBack()} />
                <Text style={styles.headerTitle}>My Events</Text>
            </View>

            {/* Custom Tabs */}
            <View style={styles.tabsContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'MyEvents' && styles.activeTab]}
                    onPress={() => setActiveTab('MyEvents')}
                >
                    <Text style={styles.tabText}>My Events</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'RSVPd' && styles.activeTab]}
                    onPress={() => setActiveTab('RSVPd')}
                >
                    <Text style={styles.tabText}>RSVP’d</Text>
                </TouchableOpacity>
            </View>

            {/* Events List */}
            <View style={styles.contentContainer}>{renderContent()}</View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1c1c1c',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 20,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 22,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    tabsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginVertical: 10,
    },
    tab: {
        paddingVertical: 10,
        paddingHorizontal: 20,
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: '#dc4904',
    },
    tabText: {
        color: '#fff',
        fontSize: 16,
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: 15,
    },
    eventCard: {
        backgroundColor: '#706656',
        borderRadius: 10,
        overflow: 'hidden',
        marginBottom: 15,
    },
    eventImage: {
        width: '100%',
        height: 180,
    },
    eventInfo: {
        padding: 15,
    },
    eventName: {
        color: '#cade7f',
        fontSize: 18,
        fontWeight: 'bold',
    },
    eventType: {
        color: '#a0a0a0',
        fontSize: 14,
    },
    eventDate: {
        color: '#fff',
        fontSize: 14,
    },
    eventLocation: {
        color: '#fff',
        fontSize: 14,
    },
    errorText: {
        color: '#f00',
        textAlign: 'center',
        marginTop: 20,
    },
    emptyText: {
        color: '#fff',
        textAlign: 'center',
        marginTop: 20,
    },
});

export default MyEventsScreen;