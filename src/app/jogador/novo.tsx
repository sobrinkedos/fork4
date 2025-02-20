import React, { useState } from 'react';
import { Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import styled from 'styled-components/native';
import { colors } from '@/styles/colors';
import { Feather } from '@expo/vector-icons';
import { playerService } from '@/services/playerService';
import { TextInput } from 'react-native-paper';

export default function NovoJogador() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        phone: ''
    });
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!formData.name.trim()) {
            Alert.alert('Erro', 'O nome do jogador é obrigatório');
            return;
        }

        if (!formData.phone.trim()) {
            Alert.alert('Erro', 'O celular do jogador é obrigatório');
            return;
        }

        try {
            setLoading(true);
            await playerService.create({
                name: formData.name.trim(),
                phone: formData.phone.trim()
            });
            router.back();
        } catch (error: any) {
            console.error('Erro ao criar jogador:', error);
            Alert.alert(
                'Erro',
                error?.message || 'Erro ao criar jogador. Tente novamente.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container>
            <PageHeader>
                <BackButton onPress={() => router.back()}>
                    <Feather name="arrow-left" size={24} color={colors.gray100} />
                </BackButton>
                <HeaderTitle>Novo Jogador</HeaderTitle>
            </PageHeader>

            <Content>
                <FormGroup>
                    <Label>Nome</Label>
                    <TextInput
                        mode="outlined"
                        value={formData.name}
                        onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                        placeholder="Nome do jogador"
                        style={{
                            backgroundColor: colors.backgroundDark,
                        }}
                        theme={{
                            colors: {
                                primary: colors.primary,
                                text: colors.gray100,
                                placeholder: colors.gray300,
                                background: colors.backgroundDark,
                                surface: colors.backgroundDark,
                                onSurface: colors.gray100,
                                outline: colors.gray700,
                            }
                        }}
                    />
                </FormGroup>

                <FormGroup>
                    <Label>Celular</Label>
                    <TextInput
                        mode="outlined"
                        value={formData.phone}
                        onChangeText={(text) => {
                            // Remove tudo que não for número
                            const numericOnly = text.replace(/\D/g, '');
                            // Limita a 11 caracteres
                            const limitedText = numericOnly.slice(0, 11);
                            setFormData(prev => ({ ...prev, phone: limitedText }));
                        }}
                        placeholder="(00) 00000-0000"
                        keyboardType="phone-pad"
                        maxLength={11}
                        style={{
                            backgroundColor: colors.backgroundDark,
                        }}
                        theme={{
                            colors: {
                                primary: colors.primary,
                                text: colors.gray100,
                                placeholder: colors.gray300,
                                background: colors.backgroundDark,
                                surface: colors.backgroundDark,
                                onSurface: colors.gray100,
                                outline: colors.gray700,
                            }
                        }}
                    />
                </FormGroup>

                <SaveButton onPress={handleSave} disabled={loading}>
                    {loading ? (
                        <ActivityIndicator color={colors.gray100} />
                    ) : (
                        <SaveButtonText>Criar Jogador</SaveButtonText>
                    )}
                </SaveButton>
            </Content>
        </Container>
    );
}

const Container = styled.View`
    flex: 1;
    background-color: ${colors.backgroundDark};
`;

const PageHeader = styled.View`
    padding: 20px;
    background-color: ${colors.secondary};
    padding-top: 60px;
    flex-direction: row;
    align-items: center;
`;

const BackButton = styled.TouchableOpacity`
    margin-right: 16px;
`;

const HeaderTitle = styled.Text`
    font-size: 24px;
    font-weight: bold;
    color: ${colors.gray100};
`;

const Content = styled.ScrollView.attrs({
    contentContainerStyle: {
        flexGrow: 1,
        padding: 20,
    },
})``;

const FormGroup = styled.View`
    margin-bottom: 20px;
`;

const Label = styled.Text`
    font-size: 16px;
    color: ${colors.gray100};
    margin-bottom: 8px;
`;

const SaveButton = styled.TouchableOpacity<{ disabled?: boolean }>`
    background-color: ${colors.primary};
    padding: 16px;
    border-radius: 8px;
    align-items: center;
    opacity: ${props => props.disabled ? 0.7 : 1};
`;

const SaveButtonText = styled.Text`
    color: ${colors.gray100};
    font-size: 16px;
    font-weight: bold;
`;
