import React from 'react';
import { View } from 'react-native';
import styled from 'styled-components/native';
import { BottomNavigation } from './BottomNavigation';
import { colors } from '@/styles/colors';

type LoggedLayoutProps = {
    children: React.ReactNode;
    hideNavigation?: boolean;
};

export function LoggedLayout({ children, hideNavigation = false }: LoggedLayoutProps) {
    return (
        <Container>
            <Content>{children}</Content>
            {!hideNavigation && <BottomNavigation />}
        </Container>
    );
}

const Container = styled.View`
    flex: 1;
    background-color: ${colors.background};
`;

const Content = styled.View`
    flex: 1;
`;
