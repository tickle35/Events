import { StyleSheet, Text, View, SafeAreaView, TextInput, TouchableOpacity,Alert } from 'react-native';
import React, { useState, useCallback } from 'react';
import Feather from '@expo/vector-icons/Feather';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Calendar } from 'react-native-calendars';
import dayjs from 'dayjs';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { collection, query, where, getDocs, getDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase'; // Adjust import based on your project
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Define navigation types
type RootStackParamList = {
    create: undefined;
    explore: undefined;
    myevent: undefined;
    Note: undefined;
    calendar: undefined;
};

type NavigationProps = NativeStackNavigationProp<RootStackParamList>;


export default function Home() {
    const [currentDate, setCurrentDate] = useState(dayjs().format('YYYY-MM-DD'));
    const handleMonthChange = (date: string) => {
        setCurrentDate(date);
    };
    const navigation = useNavigation<NavigationProps>();
    const [Loading, setLoading] = useState(false)
    const [Error, setError] = useState('')
    const [markedDates, setMarkedDates] = useState('')
    useFocusEffect(
        useCallback(() => {
            fetchEvents()
        }, [])
    )

    const fetchEvents = async () => {
        setLoading(true);
        setError('');
        try {
            const user = await AsyncStorage.getItem('user');
            const parsedUser = user ? JSON.parse(user) : null;
            const uid = parsedUser?.uid;

            if (!uid) {
               console.log("No user Found");
               Alert.alert("No User Found")
            }

            // Fetch My Events (created by user)
            const myEventsQuery = query(collection(db, 'events'), where('author', '==', uid));
            const myEventsSnapshot = await getDocs(myEventsQuery);
            const myEventsData = myEventsSnapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    eventDate: data.eventDate?.toDate().toISOString().split('T')[0], // Format date as 'YYYY-MM-DD'
                };
            });
            console.log('My Events Data:', myEventsData);

            // Fetch RSVP’d Events (attended by user)
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
                        eventDate: data.eventDate?.toDate().toISOString().split('T')[0],
                    });
                }
            }
            console.log('RSVP’d Events Data:', rsvpdEventsData);

            // Combine the dates from both lists
            const allEventDates = [
                ...myEventsData.map((event) => event.eventDate),
                ...rsvpdEventsData.map((event) => event.eventDate),
            ];

            // Create marked dates object
            const markedDates = allEventDates.reduce((acc, date) => {
                acc[date] = { marked: true, dotColor: '#e1d27c', activeOpacity: 0.7 };
                return acc;
            }, {});
            console.log('Marked Dates:', markedDates);

            setMarkedDates(markedDates);
        } catch (err) {
            setError('Failed to fetch events. Please try again.');
            console.error('Error fetching events:', err);
        } finally {
            setLoading(false);
        }
    };


    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.searchComponent}>
                <TextInput placeholder='Search event here' placeholderTextColor="#c1c1c1" style={styles.searchbar} />
                <TouchableOpacity style={styles.icon}>
                    <Feather name="search" size={24} color="#cade7f" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('create')} style={styles.icon}>
                    <Feather name="plus" size={24} color="white" />
                </TouchableOpacity>
            </View>
            <View style={styles.options}>
                <View style={styles.top}>
                    <View style={styles.inner}>
                        <TouchableOpacity onPress={() => navigation.navigate('explore')} style={styles.lT}>
                            <Text style={{ fontSize: 25, textAlign: "center" }}>Explore</Text>
                            {/* <FontAwesome name="wpexplorer" size={40} color="black" /> */}
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => navigation.navigate('myevent')} style={styles.lB}>
                            <Text style={{ fontSize: 18, fontWeight: "400" }}>My Events</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.inner}>
                        <TouchableOpacity onPress={() => navigation.navigate('Note')} style={styles.RT}>
                            <Text style={{ fontWeight: "bold" }}>Notes</Text>
                            <Text style={{ fontWeight: "300", fontSize: 23 }}>Write down personal notes</Text>
                        </TouchableOpacity>

                        <View style={styles.RB}>
                            <TouchableOpacity onPress={() => navigation.navigate('create')} style={styles.Button1}>
                                <Feather name="plus" size={44} color="white" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.Button2}>
                                <MaterialIcons name="report" size={44} color="white" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('calendar')} style={styles.down}>
                    <Calendar
                        current={currentDate}
                        onDayPress={(day: { dateString: string }) => console.log('Selected Date: ', day.dateString)}
                        onMonthChange={(month: { dateString: string }) => handleMonthChange(month.dateString)}
                        markedDates={markedDates}
                        theme={{
                            backgroundColor: '#633be9',
                            calendarBackground: '#633be9',
                            textSectionTitleColor: '#cade7f',
                            dayTextColor: '#cade7f',
                            monthTextColor: '#cade7f',
                            selectedDayBackgroundColor: '#cade7f',
                            selectedDayTextColor: '#1f1f1f',
                            arrowColor: '#cade7f',
                            todayTextColor: '#cade7f',
                        }}
                        style={{
                            borderRadius: 10,
                            width: '100%',
                        }}
                    />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#1c1c1c",
        flex: 1,
        alignItems: "center"
    },
    searchComponent: {
        height: "10%",
        width: "95%",
        marginTop: "2%",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-evenly"
    },
    searchbar: {
        backgroundColor: "#706656",
        color: "white",
        width: "70%",
        height: "70%",
        borderRadius: "50%",
        paddingHorizontal: 20
    },
    icon: {
        backgroundColor: "#706656",
        padding: 10,
        borderRadius: "50%"
    },
    options: {
        height: "85%",
        width: "95%",
        marginTop: "2%",
        display: "flex",
        flexDirection: "column"
    },
    top: {
        height: "56%",
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between"
    },
    down: {
        backgroundColor: "#673ceb",
        height: "40%",
        borderRadius: 20,
        display: "flex",
    },
    inner: {
        height: "100%",
        width: "49%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-evenly"

    },
    lT: {
        backgroundColor: "#e1d27c",
        height: "30%",
        borderRadius: 20,
        display: "flex",
        justifyContent: "center"
    },
    lB: {
        backgroundColor: "#e1d27c",
        height: "65%",
        borderRadius: 20,
        display: "flex",
        flexDirection: "column",
        padding: 20,
        justifyContent: "space-between"
    },
    RT: {
        backgroundColor: "#cade7f",
        height: "65%",
        borderRadius: 20,
        padding: 20,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between"
    },
    RB: {
        height: "30%",
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between"
    },
    Button1: {
        backgroundColor: "#dc4904",
        width: "49%",
        height: "100%",
        borderRadius: 10,
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
    },
    Button2: {
        backgroundColor: "#5bc296",
        width: "49%",
        height: "100%",
        borderRadius: 10,
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '90%',
        paddingVertical: 10,
    },
    headerTitle: {
        color: '#cade7f',
        fontSize: 20,
        fontWeight: 'bold',
    },
})