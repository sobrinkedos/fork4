import React from 'react';
import { View } from 'react-native';
import styled from 'styled-components/native';
import { BottomNavigation } from './BottomNavigation';
import { useTheme } from '../contexts/ThemeProvider';

type LoggedLayoutProps = {
    children: React.ReactNode;
    hideNavigation?: boolean;
};

export function LoggedLayout({ children, hideNavigation = false }: LoggedLayoutProps) {
    const { colors } = useTheme();

    return (
        <Container>
            <Content>{children}</Content>
            {!hideNavigation && <BottomNavigation />}
        </Container>
    );
}

const Container = styled.View`
    flex: 1;
    background-color: ${({ theme }) => theme.colors.backgroundDark};
`;

const Content = styled.View`
    flex: 1;
    background-color: ${({ theme }) => theme.colors.backgroundDark};
`;
