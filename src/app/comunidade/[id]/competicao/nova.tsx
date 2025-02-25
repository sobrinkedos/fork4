import React, { useState } from 'react';
import { Alert, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import styled from 'styled-components/native';
import { colors } from '@/styles/colors';
import { Feather } from '@expo/vector-icons';
import { competitionService } from '@/services/competitionService';
import { DatePickerInput } from 'react-native-paper-dates';
import { PaperProvider, TextInput } from 'react-native-paper';
import { InternalHeader } from '@/components/InternalHeader';

export default function NovaCompeticao() {
    const router = useRouter();
    const { id: communityId } = useLocalSearchParams();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        start_date: new Date()
    });
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!formData.name.trim()) {
            Alert.alert('Erro', 'O nome da competição é obrigatório');
            return;
        }

        try {
            setLoading(true);
            console.log('Dados do formulário:', {
                ...formData,
                community_id: communityId,
            });

            await competitionService.create({
                name: formData.name.trim(),
                description: formData.description.trim(),
                community_id: communityId as string,
                start_date: formData.start_date.toISOString()
            });
            
            // Atualizar lista de competições
            await competitionService.refreshCompetitions(communityId as string);
            router.back();
        } catch (error: any) {
            console.error('Erro detalhado:', error);
            Alert.alert(
                'Erro',
                error?.message || 'Erro ao criar competição. Tente novamente.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <PaperProvider>
            <Container>
                <InternalHeader title="Nova Competição" />
                <ScrollView>
                    <Content>
                        <FormGroup>
                            <Label>Nome</Label>
                            <TextInput
                                mode="outlined"
                                value={formData.name}
                                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                                placeholder="Nome da competição"
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
                                placeholder="Descrição da competição"
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

                        <FormGroup>
                            <Label>Data da Competição</Label>
                            <DatePickerInput
                                locale="pt"
                                label="Data"
                                value={formData.start_date}
                                onChange={(date) => date && setFormData(prev => ({ ...prev, start_date: date }))}
                                inputMode="start"
                                mode="outlined"
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
                                <SaveButtonText>Criar Competição</SaveButtonText>
                            )}
                        </SaveButton>
                    </Content>
                </ScrollView>
            </Container>
        </PaperProvider>
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
    background-color: ${props => props.disabled ? colors.gray500 : colors.primary};
    padding: 16px;
    border-radius: 8px;
    align-items: center;
    margin-top: 20px;
    opacity: ${props => props.disabled ? 0.7 : 1};
`;

const SaveButtonText = styled.Text`
    color: ${colors.gray100};
    font-size: 16px;
    font-weight: bold;
`;
