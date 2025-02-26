import React, { useEffect } from 'react';
import styled from 'styled-components/native';
import { colors } from '@/styles/colors';
import { Feather } from '@expo/vector-icons';
import { TouchableOpacity, StatusBar, Platform, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';

type InternalHeaderProps = {
    title: string;
    onBack?: () => void;
    rightContent?: React.ReactNode;
};

export function InternalHeader({ title, onBack, rightContent }: InternalHeaderProps) {
    const router = useRouter();
    const { signOut } = useAuth();
    const statusBarHeight = StatusBar.currentHeight || 0;

    useEffect(() => {
        // Configuração explícita para Android
        if (Platform.OS === 'android') {
            StatusBar.setBackgroundColor(colors.primary);
            StatusBar.setBarStyle('light-content');
            StatusBar.setTranslucent(false);
        } else {
            StatusBar.setBarStyle('light-content');
        }
    }, []);

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            router.back();
        }
    };

    const handleLogout = async () => {
        try {
            const response = await signOut();
            if (response.success) {
                // Redirecionar para a página de login após logout bem-sucedido
                router.replace('/login');
            } else {
                console.error('Erro ao fazer logout:', response.error);
            }
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
        }
    };

    return (
        <SafeAreaContainer>
            <StatusBar backgroundColor={colors.primary} barStyle="light-content" />
            <Container statusBarHeight={statusBarHeight}>
                <HeaderLeft>
                    <BackButton onPress={handleBack}>
                        <Feather name="arrow-left" size={24} color={colors.white} />
                    </BackButton>
                    <HeaderTitle>{title}</HeaderTitle>
                </HeaderLeft>
                <HeaderRight>
                    {rightContent && <RightContentContainer>{rightContent}</RightContentContainer>}
                    <IconButton onPress={handleLogout}>
                        <Feather name="log-out" size={24} color={colors.white} />
                    </IconButton>
                </HeaderRight>
            </Container>
        </SafeAreaContainer>
    );
}

const SafeAreaContainer = styled.View`
    background-color: ${colors.primary};
`;

const Container = styled.View<{ statusBarHeight: number }>`
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    background-color: ${colors.primary};
    padding-top: ${({ statusBarHeight }) => Platform.OS === 'ios' ? 44 : 16}px;
`;

const HeaderLeft = styled.View`
    flex-direction: row;
    align-items: center;
    flex: 1;
`;

const BackButton = styled.TouchableOpacity`
    padding: 4px;
    margin-right: 16px;
`;

const HeaderTitle = styled.Text`
    color: ${colors.white};
    font-size: 20px;
    font-weight: bold;
`;

const HeaderRight = styled.View`
    flex-direction: row;
    align-items: center;
`;

const RightContentContainer = styled.View`
    margin-right: 16px;
`;

const IconButton = styled.TouchableOpacity`
    padding: 4px;
`;
