import { Stack } from 'expo-router';
import { Platform } from 'react-native';
import { useEffect } from 'react';
import * as NavigationBar from 'expo-navigation-bar';
import { colors } from '@/styles/colors';

export default function TabRoutesLayout() {
    useEffect(() => {
        async function configureNavigationBar() {
            if (Platform.OS === 'android') {
                await NavigationBar.setBackgroundColorAsync(colors.backgroundDark);
                await NavigationBar.setButtonStyleAsync('light');
                await NavigationBar.setBorderColorAsync(colors.backgroundDark);
            }
        }

        configureNavigationBar();
    }, []);

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="dashboard" />
            <Stack.Screen name="comunidades" />
            <Stack.Screen name="competicoes" />
            <Stack.Screen name="jogadores" />
        </Stack>
    );
}