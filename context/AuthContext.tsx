import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { doc, getDocs, collection } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../firebase';
import { Alert } from 'react-native';

// Define types for user data
interface UserData {
    studentId: string;
    password: string;
    FullName: string;
    role: string;
    id: string;
}

// Define types for stored user information
interface StoredUser {
    FullName: string;
    userRole: string;
    uid: string;
}

// Context type definition
type AuthContextType = {
    userRole: string | null;
    login: (studentId: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
};

// Provider props type
interface AuthProviderProps {
    children: ReactNode;
}

// Create the authentication context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider component with explicit typing
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [userRole, setUserRole] = useState<string | null>('guest');

    useEffect(() => {
        // Check AsyncStorage for saved user data on initial load
        const checkUser = async () => {
            try {
                const userData = await AsyncStorage.getItem('user');
                if (userData) {
                    const parsedData: StoredUser = JSON.parse(userData);
                    setUserRole(parsedData.userRole);
                }
                console.log('User Role:', userData);
            } catch (error) {
                console.error('Error checking user:', error);
            }
        };
        checkUser();
    }, []);

    const login = async (studentId: string, password: string) => {
        try {
            const usersCollection = collection(db, 'users');
            const usersSnapshot = await getDocs(usersCollection);

            let matchedUser: UserData | null = null;

            usersSnapshot.forEach((doc) => {
                const userData = doc.data() as UserData; // Type assertion here
                if (userData.studentId === studentId) {
                    matchedUser = { ...userData, id: doc.id }; // Spread the data and add id
                }
            });

            console.log('Matched User:', matchedUser);

            if (matchedUser) {
                if (matchedUser.password === password) {
                    const user: StoredUser = {
                        FullName: matchedUser.FullName,
                        userRole: matchedUser.role,
                        uid: matchedUser.id,
                    };

                    await AsyncStorage.setItem('user', JSON.stringify(user));
                    setUserRole(matchedUser.role);
                    Alert.alert('Login Successful', `Welcome, ${matchedUser.FullName}`);
                } else {
                    Alert.alert('Login Failed', 'Invalid password');
                }
            } else {
                Alert.alert('Login Failed', 'Invalid Student ID');
            }
        } catch (error) {
            console.error('Login Error:', error);
            Alert.alert('Error', 'An error occurred during login');
        }
    };



    const logout = async () => {
        await AsyncStorage.removeItem('user');
        setUserRole('guest');
        console.log('User Role:', userRole);
    };

    return (
        <AuthContext.Provider value={{ userRole, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook for using auth context
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};