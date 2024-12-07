import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { Login } from '../screens/auth';


export type AuthStackParamList = {
    Login: undefined;
    Signup: undefined;
};

const Stack = createStackNavigator<AuthStackParamList>();

const AuthStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={Login} />

    </Stack.Navigator>
);

export default AuthStack;