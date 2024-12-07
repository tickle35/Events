import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet,SafeAreaView } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { Home,CreateEvent,Calendar,Explore,MyEvent,EventDetails,Note,NoteDetailScreen,Profile,AddNote } from '../screens/student';
import Feather from '@expo/vector-icons/Feather';
import Logo from '../assets/logo-events.png';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
export type UserStackParamList = {
    Home: undefined;
    EventDetails: { eventId: string };
    create: undefined;
    explore: undefined;
    calendar: undefined;
    myevent: undefined;
    Note: undefined;
    NoteDetail: {title:string,date:string,color:string}
    Profile: undefined;
    AddNote: undefined;
};

const Stack = createStackNavigator<UserStackParamList>();

// Custom Header Component
const Header = () =>{

    const navigation = useNavigation<StackNavigationProp<UserStackParamList>>();
    return(
        <SafeAreaView style={styles.headerContainer}>
            <Image source={Logo} style={styles.logo} />
            <View style={styles.headerIcons}>
                <TouchableOpacity onPress={()=>navigation.navigate('Profile')} style={styles.icon}>
                    <Feather name="user" size={24} color="#cade7f" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.icon}>
                    <Feather name="bell" size={24} color="white" />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )};

const UserStack = () => (

    <Stack.Navigator
        screenOptions={{
            header: () => <Header />, // Apply custom header to all screens
        }}
    >
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="create" component={CreateEvent} />
        <Stack.Screen name="explore" component={Explore} />
        <Stack.Screen name="calendar" component={Calendar} />
        <Stack.Screen name="myevent" component={MyEvent} />
        <Stack.Screen name="EventDetails" component={EventDetails} />
        <Stack.Screen name="Note" component={Note} />
        <Stack.Screen name="NoteDetail" component={NoteDetailScreen} />
        <Stack.Screen name="Profile" component={Profile} />
        <Stack.Screen name="AddNote" component={AddNote} />
    </Stack.Navigator>
);

export default UserStack;

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical:20,
        padding: 20,
        backgroundColor: '#1c1c1c',
    },
    logo: {
        width: 100,
        height: 40,
        resizeMode: 'contain',
    },
    headerIcons: {
        flexDirection: 'row',
    },
    icon: {
        marginRight: 15,
        backgroundColor:"#706656",
        padding:10,
        borderRadius:"50%"
    },
});