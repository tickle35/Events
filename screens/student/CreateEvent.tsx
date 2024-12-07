import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Image, Alert, ActivityIndicator,Platform ,KeyboardAvoidingView} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import DateTimePicker from '@react-native-community/datetimepicker';
import Feather from '@expo/vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, db } from '../../firebase'; // Ensure you have Firebase configured
import { collection, addDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
interface LocationType {
    latitude: number;
    longitude: number;
}

export default function CreateEvent() {
    const [eventName, setEventName] = useState('');
    const [eventDate, setEventDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [eventTime, setEventTime] = useState(new Date());
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [location, setLocation] = useState<LocationType | null>(null);

    const [locationName, setLocationName] = useState('');
    const [description, setDescription] = useState('');
    const [coverImage, setCoverImage] = useState<string | null>(null);
    const [showMap, setShowMap] = useState(false);
    const [isFree, setIsFree] = useState(true);
    const [price, setPrice] = useState('');
    const [eventType, setEventType] = useState('sports'); // Default event type
    const [isLoading, setIsLoading] = useState(false);
    const navigation = useNavigation();
    // Image picker function
    // Image picker function
    const pickImage = async () => {
        // Request media library permissions
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            alert('Permission to access media library was denied. Please enable permissions in settings.');
            return;
        }

        // Launch the image picker
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            const selectedImage = result.assets[0]; // Access the first selected asset
            setCoverImage(selectedImage.uri); // Set the URI of the selected image
        }
    };


    // Open the map to select location
    const pickLocation = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            alert('Permission to access location was denied');
            return;
        }
        setShowMap(true);
    };

    // Get location name using reverse geolocation
    const getLocationName = async (latitude: number, longitude: number) => {
        const geoCode = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (geoCode.length > 0) {
            setLocationName(geoCode[0].city || geoCode[0].region || geoCode[0].country || 'Unknown Location');
        }
    };

    // Confirm location selection from map
    const confirmLocation = (selectedLocation: { latitude: number; longitude: number }) => {
        setLocation(selectedLocation);
        getLocationName(selectedLocation.latitude, selectedLocation.longitude);
        setShowMap(false);
    };

    const handleDateChange = (event: any, selectedDate: Date | undefined) => {
        setShowDatePicker(false);
        if (selectedDate) setEventDate(selectedDate);
    };

    const handleTimeChange = (event: any, selectedTime: Date | undefined) => {
        setShowTimePicker(false);
        if (selectedTime) setEventTime(selectedTime);
    };

    const handleFreeOrPaid = () => {
        Alert.alert(
            "Event Type",
            "Is this event free or paid?",
            [
                {
                    text: "Free",
                    onPress: () => {
                        setIsFree(true);
                        setPrice('0'); // Reset price to 0 if the event is free
                    }
                },
                {
                    text: "Paid",
                    onPress: () => {
                        setIsFree(false);
                        setPrice(''); // Reset price if changing to paid event
                    }
                },
            ]
        );
    };

    const chooseEventType = () => {
        Alert.alert(
            'Choose Event Type',
            'Select the type of event:',
            [
                { text: 'Sports', onPress: () => setEventType('Sports') },
                { text: 'Food', onPress: () => setEventType('Food') },
                { text: 'Entertainment', onPress: () => setEventType('Entertainment') },
                { text: 'Educational', onPress: () => setEventType('Educational') },
                { text: 'Cancel', style: 'cancel' },
            ],
            { cancelable: true }
        );
    };


    const handleCreateEvent = async () => {
        setIsLoading(true);
        // Retrieve the user UID from AsyncStorage
        const user = await AsyncStorage.getItem('user'); // Assuming you store UID under 'userUID'
        if (!user) {
            alert('User UID not found. Please log in again.');
            setIsLoading(false);
            return;
        }
        const parsedUser = JSON.parse(user);
        const userUID = parsedUser.uid;

        // Upload the image to Firebase Storage
        let imageUrl = '';
        if (coverImage) {
            console.log('Selected Image URI:', coverImage);

            try {
                const response = await fetch(coverImage);
                const blob = await response.blob();
                const storageRef = ref(storage, `events/${eventName}-${Date.now()}.jpg`);
                await uploadBytes(storageRef, blob);
                imageUrl = await getDownloadURL(storageRef);
            } catch (error) {
                console.error('Error uploading image:', error);
                alert('Failed to upload image. Please try again.');
                setIsLoading(false);
                return;
            }
        }

        // Save event details to Firestore
        const eventData = {
            eventName,
            eventDate,
            eventTime,
            location,
            locationName,
            description,
            isFree,
            price: isFree ? 0 : parseFloat(price),
            coverImage: imageUrl,
            eventType,
            author: userUID,
        };

        console.log('Event Created:', eventData);

        // Save to Firestore (using the collection and addDoc methods)
        try {
            await addDoc(collection(db, 'events'), eventData);
            alert('Event created successfully!');
            navigation.goBack(); // Navigate back after saving
        } catch (error) {
            console.error('Error creating event:', error);
            alert('Error creating event. Please try again.');
        }
        setIsLoading(false);
    };

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.header}>
                    <Feather name="arrow-left" size={24} color="#fff" onPress={() => navigation.goBack()} />
                    <Text style={styles.headerTitle}>Create Events</Text>
                </View>

                <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                    {coverImage ? (
                        <Image source={{ uri: coverImage }} style={styles.coverImage} />
                    ) : (
                        <Text style={styles.imagePickerText}>Pick Cover Image</Text>
                    )}
                </TouchableOpacity>
                <TextInput
                    style={styles.input}
                    placeholder="Event Name"
                    placeholderTextColor="#a0a0a0"
                    value={eventName}
                    onChangeText={setEventName}
                />
                <TouchableOpacity style={styles.inputGroup} onPress={() => setShowDatePicker(true)}>
                    <Feather name="calendar" size={20} color="#58CC02" />
                    <Text style={styles.inputText}>{eventDate.toDateString()}</Text>
                </TouchableOpacity>
                {showDatePicker && <DateTimePicker value={eventDate} mode="date" display="default" onChange={handleDateChange} />}

                <TouchableOpacity style={styles.inputGroup} onPress={() => setShowTimePicker(true)}>
                    <Feather name="clock" size={20} color="#FFA500" />
                    <Text style={styles.inputText}>
                        {eventTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </TouchableOpacity>
                {showTimePicker && <DateTimePicker value={eventTime} mode="time" display="default" onChange={handleTimeChange} />}

                <TouchableOpacity style={styles.inputGroup} onPress={pickLocation}>
                    <Feather name="map-pin" size={20} color="#56B4D3" />
                    <Text style={styles.inputText}>{locationName || (location ? `Lat: ${location.latitude}, Lng: ${location.longitude}` : 'Pick Location')}</Text>
                </TouchableOpacity>
                <TextInput
                    style={styles.input}
                    placeholder="Description"
                    placeholderTextColor="#a0a0a0"
                    multiline
                    numberOfLines={4}
                    value={description}
                    onChangeText={setDescription}
                />

                <TouchableOpacity style={styles.inputGroup} onPress={handleFreeOrPaid}>
                    <Feather name="compass" size={20} color="#58CC02" />
                    <Text style={styles.inputText}>{isFree ? "Free" : `Price: ${price}`}</Text>
                </TouchableOpacity>

                {!isFree && (

                    <TextInput
                        style={styles.input}
                        placeholder="Enter Price"
                        placeholderTextColor="#a0a0a0"
                        keyboardType="numeric"
                        value={price}
                        onChangeText={setPrice}
                    />

                )}

                <TouchableOpacity style={styles.inputGroup} onPress={chooseEventType}>
                    <Feather name="tag" size={20} color="#6A5ACD" />
                    <Text style={styles.inputText}>{eventType || 'Choose Event Type'}</Text>
                </TouchableOpacity>


                <TouchableOpacity style={styles.createButton} onPress={handleCreateEvent}>
                    {isLoading ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Text style={styles.createButtonText}>Create Event</Text>
                    )}
                </TouchableOpacity>

                {showMap && (
                    <MapView
                        style={styles.fullScreenMap}
                        initialRegion={{
                            latitude: location ? location.latitude : 37.78825,
                            longitude: location ? location.longitude : -122.4324,
                            latitudeDelta: 0.0922,
                            longitudeDelta: 0.0421,
                        }}
                        onPress={(e) => confirmLocation(e.nativeEvent.coordinate)}
                    >
                        {location && <Marker coordinate={location} />}
                    </MapView>
                )}
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 16,
        backgroundColor: '#1c1c1c',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        color: '#fff',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginLeft: 8,
        color: '#fff',
    },
    imagePicker: {
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
    },
    coverImage: {
        width: '100%',
        height: '100%',
        borderRadius: 8,
    },
    imagePickerText: {
        color: '#888',
        fontSize: 16,
    },
    inputGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 8,
        padding: 8,
    },
    input: {
        flex: 1,
        height: 50,
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 8,
        paddingLeft: 8,
        fontSize: 16,
        color: '#fff',
        marginBottom: 16,
        paddingHorizontal: 10,
    },
    inputText: {
        flex: 1,
        fontSize: 16,
        color: '#fff',
    },
    createButton: {
        backgroundColor: '#58CC02',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    createButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    fullScreenMap: {
        ...StyleSheet.absoluteFillObject,
    },
});