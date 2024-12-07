import { StyleSheet, Text, View, SafeAreaView, FlatList ,TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
// import { Calendar } from 'react-native-calendars';
// import dayjs from 'dayjs';
import { db } from '../../firebase'; // Adjust the import as per your configuration
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

export default function CalendarPage() {
    // const [currentDate, setCurrentDate] = useState(dayjs().format('YYYY-MM-DD'));
    // const [filteredEvents, setFilteredEvents] = useState([]);
    // const [markedDates, setMarkedDates] = useState({});
    // const [events, setEvents] = useState([]);
    //
     const navigation = useNavigation()
    //
    // // Fetch events created by the user and RSVP'd events
    // const fetchEvents = async () => {
    //     try {
    //         const user = await AsyncStorage.getItem('user');
    //         const parsedUser = JSON.parse(user);
    //         const uid = parsedUser.uid;
    //
    //         // Fetch My Events (created by user)
    //         const myEventsQuery = query(collection(db, 'events'), where('author', '==', uid));
    //         const myEventsSnapshot = await getDocs(myEventsQuery);
    //         const myEventsData = myEventsSnapshot.docs.map((doc) => ({
    //             id: doc.id,
    //             ...doc.data(),
    //             eventDate: doc.data().eventDate?.toDate().toISOString().split('T')[0], // Format date as 'YYYY-MM-DD'
    //         }));
    //
    //         // Fetch RSVP’d Events (attended by user)
    //         const rsvpQuery = query(collection(db, 'attendees'), where('userId', '==', uid));
    //         const rsvpSnapshot = await getDocs(rsvpQuery);
    //         const eventIds = rsvpSnapshot.docs.map((doc) => doc.data().eventId);
    //
    //         const rsvpdEventsData = [];
    //         for (const eventId of eventIds) {
    //             const eventDocRef = doc(db, 'events', eventId);
    //             const eventDoc = await getDoc(eventDocRef);
    //             if (eventDoc.exists()) {
    //                 rsvpdEventsData.push({
    //                     id: eventDoc.id,
    //                     ...eventDoc.data(),
    //                     eventDate: eventDoc.data().eventDate?.toDate().toISOString().split('T')[0],
    //                 });
    //             }
    //         }
    //
    //         // Combine both lists of events
    //         const combinedEvents = [...myEventsData, ...rsvpdEventsData];
    //         console.log(combinedEvents,'the events')
    //         setEvents(combinedEvents);
    //
    //         // Mark the dates on the calendar
    //         const markedDatesObj = combinedEvents.reduce((acc, event) => {
    //             const date = event.eventDate;
    //             acc[date] = {
    //                 selected: true,
    //                 selectedColor: '#e1d27c',
    //                 selectedTextColor: '#1f1f1f',
    //             };
    //             return acc;
    //         }, {});
    //         setMarkedDates(markedDatesObj);
    //     } catch (error) {
    //         console.error('Error fetching events:', error);
    //     }
    // };
    //
    // useEffect(() => {
    //     fetchEvents();
    // }, []);
    //
    // // Filter events based on selected date
    // const handleDayPress = (day) => {
    //     setCurrentDate(day.dateString);
    //     const eventsForSelectedDate = events.filter(event => event.eventDate === day.dateString);
    //     setFilteredEvents(eventsForSelectedDate);
    // };

    // const renderEvent = ({ item }) => (
    //     <TouchableOpacity style={styles.eventCard} onPress={() => navigation.navigate('EventDetails', { eventId: item.id })}>
    //         <Text style={styles.eventName}>{item.eventName}</Text>
    //         {/* <Text style={styles.eventTime}>{item.time}</Text> */}
    //         <Text style={styles.eventLocation}>{item.locationName}</Text>
    //     </TouchableOpacity>
    // );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.calendarView}>
                {/*<Calendar*/}
                {/*    current={currentDate}*/}
                {/*    onDayPress={handleDayPress}*/}
                {/*    markedDates={markedDates}*/}
                {/*    theme={{*/}
                {/*        backgroundColor: '#633be9',*/}
                {/*        calendarBackground: '#633be9',*/}
                {/*        textSectionTitleColor: '#cade7f',*/}
                {/*        dayTextColor: '#cade7f',*/}
                {/*        monthTextColor: '#cade7f',*/}
                {/*        selectedDayBackgroundColor: '#cade7f',*/}
                {/*        selectedDayTextColor: '#1f1f1f',*/}
                {/*        arrowColor: '#cade7f',*/}
                {/*        todayTextColor: '#cade7f',*/}
                {/*    }}*/}
                {/*    style={{*/}
                {/*        borderRadius: 10,*/}
                {/*        width: '100%',*/}
                {/*    }}*/}
                {/*/>*/}
            </View>
            <View style={styles.eventList}>
                {/*{filteredEvents.length > 0 ? (*/}
                {/*    <FlatList*/}
                {/*        data={filteredEvents}*/}
                {/*        keyExtractor={(item) => item.id}*/}
                {/*        renderItem={renderEvent}*/}
                {/*        style={styles.flatList}*/}
                {/*    />*/}
                {/*) : (*/}
                {/*    <Text style={styles.noEventsText}>No events for this day</Text>*/}
                {/*)}*/}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1c1c1c',
        alignItems: 'center',
        paddingTop: 10,
    },
    calendarView: {
        width: '95%',
        height: '40%',
        marginTop: '2%',
    },
    eventList: {
        backgroundColor: '#2c2c2c',
        height: '55%',
        width: '95%',
        borderRadius: 10,
        marginTop: 10,
        padding: 10,
    },
    flatList: {
        width: '100%',
    },
    eventCard: {
        backgroundColor: '#333333',
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
        borderLeftWidth: 2,
        borderLeftColor: '#633be9',
    },
    eventName: {
        color: '#cade7f',
        fontSize: 16,
        fontWeight: 'bold',
    },
    eventTime: {
        color: '#ffffff',
        fontSize: 14,
        marginTop: 5,
    },
    eventLocation: {
        color: '#a0a0a0',
        fontSize: 14,
        marginTop: 5,
    },
    noEventsText: {
        color: '#a0a0a0',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 20,
    },
});