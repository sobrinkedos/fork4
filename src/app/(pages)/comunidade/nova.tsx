import React, { useState } from 'react';
import { Alert, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import styled from 'styled-components/native';
import { colors } from '@/styles/colors';
import { communityService } from '@/services/communityService';
import { InternalHeader } from '@/components/InternalHeader';
import { Feather } from '@expo/vector-icons';
import { TextInput } from 'react-native-paper';

export default function NovaComunidade() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!formData.name.trim()) {
            Alert.alert('Erro', 'O nome da comunidade é obrigatório');
            return;
        }

        try {
            setLoading(true);
            await communityService.create({
                name: formData.name.trim(),
                description: formData.description.trim()
            });
            router.back();
        } catch (error: any) {
            console.error('Erro ao criar comunidade:', error);
            Alert.alert(
                'Erro',
                error?.message || 'Erro ao criar comunidade. Tente novamente.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container>
            <InternalHeader title="Nova Comunidade" />
            <ScrollView>
                <Content>
                    <FormGroup>
                        <Label>Nome</Label>
                        <TextInput
                            mode="outlined"
                            value={formData.name}
                            onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                            placeholder="Nome da comunidade"
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
                        <Label>Descrição</Label>
                        <TextInput
                            mode="outlined"
                            value={formData.description}
                            onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                            placeholder="Descrição da comunidade"
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                            contentStyle={{
                                paddingTop: 16,
                                minHeight: 120,
                            }}
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
                            <SaveButtonText>Criar Comunidade</SaveButtonText>
                        )}
                    </SaveButton>
                </Content>
            </ScrollView>
        </Container>
    );
}

const Container = styled.View`
    flex: 1;
    background-color: ${colors.backgroundDark};
`;

const Content = styled.View`
    padding: 20px;
`;

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
