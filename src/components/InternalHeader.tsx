import React, { useEffect } from 'react';
import styled from 'styled-components/native';
import { colors } from '@/styles/colors';
import { Feather } from '@expo/vector-icons';
import { StatusBar, Platform } from 'react-native';
import { useRouter } from 'expo-router';

type InternalHeaderProps = {
    title: string;
    onBack?: () => void;
    rightContent?: React.ReactNode;
};

export function InternalHeader({ title, onBack, rightContent }: InternalHeaderProps) {
    const router = useRouter();
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
                {rightContent && (
                    <HeaderRight>
                        <RightContentContainer>{rightContent}</RightContentContainer>
                    </HeaderRight>
                )}
            </Container>
        </SafeAreaContainer>
    );
}

const SafeAreaContainer = styled.View`
    background-color: ${colors.primary};
    width: 100%;
`;

const Container = styled.View<{ statusBarHeight: number }>`
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    background-color: ${colors.primary};
    padding-top: ${({ statusBarHeight }) => Platform.OS === 'ios' ? 44 : 16}px;
    width: 100%;
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
