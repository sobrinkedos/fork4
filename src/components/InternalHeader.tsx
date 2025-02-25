import React from 'react';
import styled from 'styled-components/native';
import { colors } from '@/styles/colors';
import { Feather } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

type InternalHeaderProps = {
    title: string;
    onBack?: () => void;
    rightContent?: React.ReactNode;
};

export function InternalHeader({ title, onBack, rightContent }: InternalHeaderProps) {
    const router = useRouter();

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            router.back();
        }
    };

    return (
        <Container>
            <HeaderLeft>
                <BackButton onPress={handleBack}>
                    <Feather name="arrow-left" size={24} color={colors.gray100} />
                </BackButton>
                <HeaderTitle>{title}</HeaderTitle>
            </HeaderLeft>
            {rightContent && <HeaderRight>{rightContent}</HeaderRight>}
        </Container>
    );
}

const Container = styled.View`
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    padding-top: 32px;
    background-color: ${colors.primary};
`;

const HeaderLeft = styled.View`
    flex-direction: row;
    align-items: center;
    flex: 1;
`;

const BackButton = styled.TouchableOpacity`
    padding: 8px;
    margin-right: 16px;
`;

const HeaderTitle = styled.Text`
    color: ${colors.gray100};
    font-size: 20px;
    font-weight: bold;
`;

const HeaderRight = styled.View`
    flex-direction: row;
    align-items: center;
`;
