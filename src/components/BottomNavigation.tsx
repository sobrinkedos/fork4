import React from 'react';
import { View, TouchableOpacity, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import styled from 'styled-components/native';
import { Feather } from '@expo/vector-icons';
import { colors } from '@/styles/colors';

const tabs = [
    {
        name: 'dashboard',
        icon: 'grid',
        label: 'Dashboard',
    },
    {
        name: 'comunidades',
        icon: 'users',
        label: 'Comunidades',
    },
    {
        name: 'competicoes',
        icon: 'award',
        label: 'Competições',
    },
    {
        name: 'jogadores',
        icon: 'user',
        label: 'Jogadores',
    },
];

export function BottomNavigation() {
    const router = useRouter();
    const pathname = usePathname();

    const isActive = (path: string) => {
        return pathname.includes(`/${path}`);
    };

    return (
        <Container>
            {tabs.map((tab) => (
                <TabButton
                    key={tab.name}
                    onPress={() => router.push(`/(tabs)/${tab.name}`)}
                    active={isActive(tab.name)}
                >
                    <Feather
                        name={tab.icon as any}
                        size={24}
                        color={isActive(tab.name) ? colors.primary : colors.gray100}
                    />
                    <TabLabel active={isActive(tab.name)}>{tab.label}</TabLabel>
                </TabButton>
            ))}
        </Container>
    );
}

const Container = styled.View`
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
    background-color: ${colors.backgroundDark};
    padding-bottom: ${Platform.OS === 'ios' ? 24 : 16}px;
    padding-top: 16px;
    border-top-width: 0;
`;

const TabButton = styled.TouchableOpacity<{ active: boolean }>`
    align-items: center;
    justify-content: center;
    padding: 4px 12px;
`;

const TabLabel = styled.Text<{ active: boolean }>`
    color: ${({ active }) => active ? colors.primary : colors.gray100};
    font-size: 12px;
    font-weight: 500;
    margin-top: 4px;
`;
