import { StyleSheet, Text, View, SafeAreaView, TextInput, Image, TouchableOpacity,Alert } from 'react-native'
import React, { useState } from 'react'
import Feather from '@expo/vector-icons/Feather';
import Logo from '../../assets/logo-events.png'
import { useAuth } from '../../context/AuthContext';

export default function Login() {
    const [studentId, setStudentId] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const { login } = useAuth(); // Destructure login from AuthContext

    const handleLogin = async () => {
        try {
            await login(studentId, password); // Call login function with studentId and password
        } catch (error) {
            Alert.alert('Login Error', 'Unable to log in. Please check your credentials and try again.');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Image style={{ width: "60%", height: "30%" }} source={Logo} />
            <View style={styles.formContainer}>
                <View style={styles.inputGroup}>
                    <Feather name="user" size={24} color="#cade7f" style={styles.sideIcon} />
                    <TextInput
                        value={studentId}
                        onChangeText={(text) => setStudentId(text)}
                        style={styles.input}
                        placeholder="Enter your student ID"
                        keyboardType="email-address"
                        placeholderTextColor="#a0a0a0"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Feather name="lock" size={24} color="#cade7f" style={styles.sideIcon} />
                    <TextInput
                        value={password}
                        onChangeText={(text) => setPassword(text)}
                        style={styles.input}
                        placeholder="Enter your password"
                        placeholderTextColor="#a0a0a0"
                        secureTextEntry
                    />
                </View>
            </View>

            <View style={styles.loginGroup}>
                <TouchableOpacity style={styles.registerBtn} onPress={handleLogin}>
                    <Text style={{ color: "#fff", fontSize: 16 }}>Log In</Text>
                </TouchableOpacity>
            </View>

        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#1f1f1f",
        flex: 1,
        display: "flex",
        // justifyContent:"center",
        alignItems: "center"
    },
    header: {
        color: "#e0d17c",
        fontFamily: "sans-serif",
        fontSize: 30,
        fontWeight: "700",
        fontStyle: "italic",
        marginTop: "20%"
    },
    formContainer: {
        width: "100%",
        height: "25%",
        marginTop: "2%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-evenly"
    },
    inputGroup: {
        borderColor: "#cade7f",
        borderWidth: 1,
        width: "90%",
        height: "33%",
        borderRadius: 5,
        display: "flex",
        flexDirection: 'row',
        alignItems: "center",
        justifyContent: "space-between"
    },
    sideIcon: {
        marginLeft: "4%"
    },
    registerBtn: {
        width: "100%",
        height: "30%",
        backgroundColor: "#cade7f",
        borderRadius: 5,
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
    },
    input: {
        width: "90%",
        height: "90%",
        borderRadius: 10,
        fontSize: 18,
        marginLeft: "2%",
        color: "#cade7f"
    },
    loginGroup: {
        position: 'absolute',
        width: "90%",
        marginBottom: 0,
        top: "70%",
        height: "30%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-evenly"
    },
})