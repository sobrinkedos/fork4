import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { colors } from '@/styles/colors';
import { Platform } from 'react-native';
import * as SystemUI from 'expo-system-ui';
import { useEffect } from 'react';

export default function TabRoutesLayout() {
    useEffect(() => {
        async function configureNavBar() {
            try {
                if (Platform.OS === 'android') {
                    await SystemUI.NavigationBar.setBackgroundColorAsync(colors.backgroundDark);
                    await SystemUI.NavigationBar.setButtonStyleAsync('light');
                }
            } catch (error) {
                console.warn('Erro ao configurar NavigationBar:', error);
            }
        }
        
        configureNavBar();
    }, []);

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: colors.backgroundDark,
                    borderTopWidth: 0,
                    elevation: 0,
                    paddingBottom: 16,
                    height: 70,
                },
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.gray100,
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '500',
                    marginTop: 4,
                },
                tabBarIconStyle: {
                    marginTop: 4,
                },
            }}
        >
            <Tabs.Screen
                name="dashboard"
                options={{
                    title: 'Dashboard',
                    tabBarIcon: ({ size, color }) => (
                        <Feather name="grid" size={24} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="comunidades"
                options={{
                    title: 'Comunidades',
                    tabBarIcon: ({ size, color }) => (
                        <Feather name="users" size={24} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="competicoes"
                options={{
                    title: 'Competições',
                    tabBarIcon: ({ size, color }) => (
                        <Feather name="award" size={24} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="jogadores"
                options={{
                    title: 'Jogadores',
                    tabBarIcon: ({ size, color }) => (
                        <Feather name="user" size={24} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}