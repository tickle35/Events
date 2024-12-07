import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AuthStack from './AuthStack';
import UserStack from './UserStack';
import { useAuth } from '../context/AuthContext';
const RootStack = createStackNavigator();

const RootNavigator = () => {
    const { userRole } = useAuth();

    if (userRole === null) {
        // You can return a loading indicator here while AsyncStorage is being checked
        return null;
    }

    return (
        <NavigationContainer>
            <RootStack.Navigator screenOptions={{ headerShown: false }}>
                {userRole === 'guest' ? (
                    <RootStack.Screen name="Auth" component={AuthStack} />
                ) : (
                    <RootStack.Screen name="User" component={UserStack} />
                )}
            </RootStack.Navigator>
        </NavigationContainer>
    );
};

export default RootNavigator;