import React from 'react';
import { ActivityIndicator, TouchableOpacityProps } from 'react-native';
import styled from 'styled-components/native';
import { colors } from '@/styles/colors';

interface ButtonProps extends TouchableOpacityProps {
    title: string;
    loading?: boolean;
    variant?: 'primary' | 'secondary' | 'outline';
}

export function Button({ title, loading, variant = 'primary', ...rest }: ButtonProps) {
    return (
        <Container variant={variant} disabled={loading || rest.disabled} {...rest}>
            {loading ? (
                <ActivityIndicator color={variant === 'outline' ? colors.primary : colors.white} />
            ) : (
                <Title variant={variant}>{title}</Title>
            )}
        </Container>
    );
}

const Container = styled.TouchableOpacity<{ variant: string }>`
    width: 100%;
    height: 56px;
    border-radius: 8px;
    justify-content: center;
    align-items: center;
    background-color: ${({ variant }) => 
        variant === 'primary' ? colors.primary :
        variant === 'secondary' ? colors.secondary :
        'transparent'
    };
    border: ${({ variant }) => variant === 'outline' ? `1px solid ${colors.primary}` : 'none'};
    opacity: ${({ disabled }) => disabled ? 0.7 : 1};
`;

const Title = styled.Text<{ variant: string }>`
    font-size: 16px;
    font-weight: bold;
    color: ${({ variant }) => 
        variant === 'outline' ? colors.primary : colors.white
    };
`;
