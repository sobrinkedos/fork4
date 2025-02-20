import { View } from "react-native"
import styled from "styled-components/native"
import { colors } from "@/styles/colors"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { useAuth } from '../hooks/useAuth';
import { useRouter } from 'expo-router';
import React from 'react';
import { TouchableOpacity, StatusBar, Platform } from 'react-native';

const Container = styled.View<{ statusBarHeight: number }>`
    width: 100%;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    background-color: ${colors.secondary};
    padding-top: ${props => Platform.OS === 'android' ? Math.floor(props.statusBarHeight / 2) + 16 : 16}px;
    padding-bottom: 20px;
    padding-left: 20px;
    padding-right: 20px;
`;

const LogoContainer = styled.View`
    flex-direction: row;
    align-items: center;
`;

const LogoIconContainer = styled.View`
    width: 40px;
    height: 40px;
    border-radius: 12px;
    background-color: ${colors.accent};
    align-items: center;
    justify-content: center;
    margin-right: 12px;
`;

const LogoText = styled.Text`
    font-size: 24px;
    font-weight: bold;
    color: ${colors.gray100};
    margin-left: 8px;
`;

const ActionContainer = styled.View`
    flex-direction: row;
    align-items: center;
`;

const IconButton = styled.TouchableOpacity`
    width: 40px;
    height: 40px;
    border-radius: 20px;
    background-color: ${colors.primary}20;
    align-items: center;
    justify-content: center;
    margin-left: 12px;
`;

const NotificationBadge = styled.View`
    position: absolute;
    top: -4px;
    right: -4px;
    background-color: ${colors.error};
    width: 16px;
    height: 16px;
    border-radius: 8px;
    align-items: center;
    justify-content: center;
`;

const BadgeText = styled.Text`
    color: ${colors.gray100};
    font-size: 10px;
    font-weight: bold;
`;

const Title = styled.Text`
    font-size: 24px;
    font-weight: bold;
    color: ${colors.gray100};
`;

interface HeaderProps {
    onNotificationPress?: () => void;
    onProfilePress?: () => void;
    title?: string;
}

export function Header({ onNotificationPress, onProfilePress, title }: HeaderProps) {
    const { signOut } = useAuth();
    const router = useRouter();
    const statusBarHeight = StatusBar.currentHeight || 0;

    const handleLogout = async () => {
        await signOut();
        router.push('/login');
    };

    return (
        <Container statusBarHeight={statusBarHeight}>
            {title ? (
                <Title>{title}</Title>
            ) : (
                <LogoContainer>
                    <LogoIconContainer>
                        <MaterialCommunityIcons name="cards" size={24} color={colors.accent} />
                    </LogoIconContainer>
                    <LogoText>Dominô</LogoText>
                </LogoContainer>
            )}
            
            <ActionContainer>
                <IconButton onPress={onNotificationPress}>
                    <MaterialCommunityIcons name="bell-outline" size={24} color={colors.accent} />
                </IconButton>

                <IconButton onPress={onProfilePress}>
                    <MaterialCommunityIcons name="account-circle-outline" size={24} color={colors.accent} />
                </IconButton>

                <IconButton onPress={handleLogout}>
                    <MaterialCommunityIcons name="logout" size={24} color={colors.gray200} />
                </IconButton>
            </ActionContainer>
        </Container>
    )
}
