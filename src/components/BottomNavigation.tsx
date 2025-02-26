import React from 'react';
import { View, TouchableOpacity, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import styled from 'styled-components/native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeProvider';

const tabs = [
    {
        name: 'dashboard',
        path: '/(tabs)/dashboard',
        icon: 'grid',
        label: 'Dashboard',
    },
    {
        name: 'comunidades',
        path: '/(tabs)/comunidades',
        icon: 'users',
        label: 'Comunidades',
    },
    {
        name: 'competicoes',
        path: '/(tabs)/competicoes',
        icon: 'award',
        label: 'Competições',
    },
    {
        name: 'jogadores',
        path: '/(tabs)/jogadores',
        icon: 'user',
        label: 'Jogadores',
    },
];

export function BottomNavigation() {
    const router = useRouter();
    const pathname = usePathname();
    const { colors, isDarkTheme } = useTheme();

    const isActive = (path: string) => {
        return pathname === path;
    };

    return (
        <Container>
            {tabs.map((tab) => (
                <TabButton
                    key={tab.name}
                    onPress={() => router.push(tab.path)}
                    isActive={isActive(tab.path)}
                >
                    <TabIcon
                        name={tab.icon}
                        size={24}
                        color={isActive(tab.path) ? colors.primary : colors.textSecondary}
                    />
                    <TabLabel isActive={isActive(tab.path)}>{tab.label}</TabLabel>
                </TabButton>
            ))}
        </Container>
    );
}

const Container = styled.View`
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
    padding: 8px 4px;
    background-color: ${({ theme }) => theme.colors.backgroundMedium};
    border-top-width: 1px;
    border-top-color: ${({ theme }) => theme.colors.border};
    width: 100%;
`;

const TabButton = styled.TouchableOpacity<{ isActive: boolean }>`
    align-items: center;
    justify-content: center;
    padding: 6px 10px;
    border-radius: 8px;
    background-color: ${({ isActive, theme }) =>
        isActive ? theme.colors.tertiary : 'transparent'};
    max-width: 24%;
`;

const TabIcon = styled(Feather)``;

const TabLabel = styled.Text<{ isActive: boolean }>`
    margin-top: 2px;
    font-size: 11px;
    color: ${({ isActive, theme }) =>
        isActive ? theme.colors.primary : theme.colors.textSecondary};
    font-weight: ${({ isActive }) => (isActive ? 'bold' : 'normal')};
    text-align: center;
`;
