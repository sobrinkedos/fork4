import React from 'react';
import { TextInputProps as RNTextInputProps } from 'react-native';
import styled from 'styled-components/native';
import { colors } from '@/styles/colors';

interface TextInputProps extends RNTextInputProps {
    label?: string;
}

export function TextInput({ label, ...rest }: TextInputProps) {
    return (
        <Container>
            {label && <Label>{label}</Label>}
            <Input
                placeholderTextColor={colors.gray400}
                {...rest}
            />
        </Container>
    );
}

const Container = styled.View`
    gap: 4px;
`;

const Label = styled.Text`
    font-size: 14px;
    color: ${colors.gray200};
`;

const Input = styled.TextInput`
    background-color: ${colors.secondary};
    border-radius: 8px;
    padding: 12px;
    font-size: 16px;
    color: ${colors.gray100};
    border: 1px solid ${colors.tertiary}40;
`;
