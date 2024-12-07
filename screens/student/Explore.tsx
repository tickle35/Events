import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { getFirestore, collection, onSnapshot } from 'firebase/firestore';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
    EventDetails: { eventId: string };
    MyEvents: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList, 'MyEvents'>;
// Define types
type Event = {
    id: string;
    author: string;
    coverImage: string;
    description: string;
    eventDate: any; // Use 'any' or a more specific type based on your Firestore data
    eventName: string;
    eventTime: any; // Use 'any' or a more specific type based on your Firestore data
    eventType: string;
    isFree: boolean;
    location: {
        latitude: number;
        longitude: number;
        locationName: string;
    };
    price: number;
};

const db = getFirestore();
const eventTypes = ['All', 'Sports', 'Food', 'Entertainment', 'Educational'];

export default function Explore() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState<string>('All');
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [imageLoading, setImageLoading] = useState<{ [key: string]: boolean }>({});
    const navigation = useNavigation<NavigationProp>();

    // Fetch events from Firestore
    useFocusEffect(
        useCallback(() => {
            const unsubscribe = onSnapshot(collection(db, 'events'), (snapshot) => {
                const events: Event[] = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data() as Omit<Event, 'id'>, // Ensure correct typing
                })) as Event[];

                setEvents(events);
                setLoading(false);
            }, (error) => {
                console.error("Error fetching events:", error);
                setLoading(false);
            });

            return () => unsubscribe();
        }, [])
    );

    // Filter events based on type and search query
    const filteredEvents = events.filter((event) => {
        const matchesType = selectedType === 'All' || event.eventType === selectedType;
        const matchesSearch = event.eventName.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesType && matchesSearch;
    });

    const renderEvent = ({ item }: { item: Event }) => (
        <TouchableOpacity
            style={styles.eventCard}
            onPress={() => navigation.navigate('EventDetails', { eventId: item.id })}
        >
            {imageLoading[item.id] && (
                <ActivityIndicator size="large" color="#cade7f" style={styles.imageLoader} />
            )}
            <Image
                source={{ uri: item.coverImage }}
                style={[styles.eventImage, imageLoading[item.id] && { display: 'none' }]}
                onLoadStart={() => setImageLoading((prev) => ({ ...prev, [item.id]: true }))}
                onLoadEnd={() => setImageLoading((prev) => ({ ...prev, [item.id]: false }))}
            />
            <View style={styles.eventInfo}>
                <View style={styles.eventDateContainer}>
                    <Text style={styles.eventDate}>{item.eventDate.toDate().toDateString()}</Text>
                </View>
                <Text style={styles.eventName}>{item.eventName}</Text>
                <Text style={styles.eventLocation}>{item.location.locationName} - {item.eventTime.toDate().toLocaleTimeString()}</Text>
                <View style={styles.priceContainer}>
                    <Text style={styles.eventPrice}>{item.isFree ? 'Free' : `$${item.price}`}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#cade7f" />
                <Text style={{ color: '#fff', marginTop: 10 }}>Loading Events...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Search Bar */}
            <TextInput
                style={styles.searchBar}
                placeholder="Search events..."
                placeholderTextColor="#888"
                value={searchQuery}
                onChangeText={(text) => setSearchQuery(text)}
            />

            {/* Event Type Tabs */}
            <FlatList
                data={eventTypes}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[styles.tab, selectedType === item && styles.activeTab]}
                        onPress={() => setSelectedType(item)}
                    >
                        <Text style={[styles.tabText, selectedType === item && styles.activeTabText]}>{item}</Text>
                    </TouchableOpacity>
                )}
                contentContainerStyle={styles.tabContainer}
            />

            {/* Events List */}
            <FlatList
                data={filteredEvents}
                keyExtractor={(item) => item.id}
                renderItem={renderEvent}
                contentContainerStyle={{ paddingBottom: 20, marginTop: 10 }}
                ListEmptyComponent={
                    <Text style={{ color: '#fff', textAlign: 'center', marginTop: 20 }}>No events found</Text>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1e1e1e',
        paddingTop: 20,
    },
    searchBar: {
        backgroundColor: '#333',
        color: '#fff',
        borderRadius: 8,
        padding: 10,
        marginHorizontal: 15,
        marginBottom: 10,
    },
    tabContainer: {
        paddingLeft: 15,
        paddingVertical: 10,
        height: 55,
    },
    tab: {
        paddingVertical: 8,
        paddingHorizontal: 15,
        height: 35,
        borderRadius: 20,
        marginRight: 10,
        backgroundColor: '#333',
    },
    activeTab: {
        backgroundColor: '#cade7f',
    },
    tabText: {
        color: '#888',
        fontSize: 14,
    },
    activeTabText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    eventCard: {
        backgroundColor: '#706656',
        borderRadius: 10,
        overflow: 'hidden',
        marginBottom: 20,
        marginHorizontal: 15,
        paddingVertical: 20,
    },
    eventImage: {
        width: '100%',
        height: 180,
        resizeMode: 'cover',
    },
    eventInfo: {
        padding: 15,
    },
    eventDateContainer: {
        position: 'absolute',
        top: -15,
        right: 15,
        backgroundColor: '#dc4904',
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    eventDate: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    eventName: {
        color: '#cade7f',
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 10,
    },
    eventLocation: {
        color: '#a0a0a0',
        fontSize: 14,
        marginTop: 5,
    },
    priceContainer: {
        position: 'absolute',
        bottom: -15,
        right: 15,
        backgroundColor: '#f1f1f1',
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    eventPrice: {
        color: '#333',
        fontSize: 14,
        fontWeight: 'bold',
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor:"#1c1c1c"
    },
    imageLoader: {
        position: 'absolute',
        top: 90,
        left: '50%',
        marginLeft: -25,
    },
});