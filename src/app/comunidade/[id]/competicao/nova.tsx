import React, { useState } from 'react';
import { Alert, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import styled from 'styled-components/native';
import { useTheme } from '@/contexts/ThemeProvider';
import { Feather } from '@expo/vector-icons';
import { competitionService } from '@/services/competitionService';
import { DatePickerInput } from 'react-native-paper-dates';
import { PaperProvider, TextInput as Input } from 'react-native-paper';
import { InternalHeader } from '@/components/InternalHeader';

export default function NovaCompeticao() {
    const router = useRouter();
    const { id: communityId } = useLocalSearchParams();
    const { colors, theme: appTheme } = useTheme();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        start_date: new Date()
    });
    const [loading, setLoading] = useState(false);

    const paperTheme = {
        colors: {
            primary: colors.primary,
            surface: colors.backgroundLight,
            text: colors.textPrimary,
            placeholder: colors.textSecondary,
            backdrop: colors.overlay,
            background: colors.backgroundDark,
            onSurface: colors.textPrimary,
            outline: colors.border,
        }
    };

    const handleSave = async () => {
        if (!formData.name.trim()) {
            Alert.alert('Erro', 'O nome da competição é obrigatório');
            return;
        }

        try {
            setLoading(true);
            await competitionService.create({
                name: formData.name.trim(),
                description: formData.description.trim(),
                community_id: communityId as string,
                start_date: formData.start_date.toISOString()
            });
            
            await competitionService.refreshCompetitions(communityId as string);
            router.back();
        } catch (error: any) {
            console.error('Erro ao criar competição:', error);
            Alert.alert(
                'Erro',
                error?.message || 'Erro ao criar competição. Tente novamente.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <PaperProvider theme={paperTheme}>
            <Container>
                <InternalHeader title="Nova Competição" />
                <Content>
                    <FormGroup>
                        <Label>Nome da Competição</Label>
                        <Input
                            mode="outlined"
                            placeholder="Digite o nome da competição"
                            value={formData.name}
                            onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                            style={{
                                backgroundColor: colors.backgroundLight,
                            }}
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label>Descrição</Label>
                        <Input
                            mode="outlined"
                            placeholder="Digite uma descrição (opcional)"
                            value={formData.description}
                            onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                            multiline
                            numberOfLines={4}
                            style={{
                                backgroundColor: colors.backgroundLight,
                            }}
                        />
                    </FormGroup>

                    <DatePickerContainer>
                        <Label>Data de Início</Label>
                        <DatePickerInput
                            locale="pt-BR"
                            label="Data"
                            value={formData.start_date}
                            onChange={(date) => date && setFormData(prev => ({ ...prev, start_date: date }))}
                            inputMode="start"
                            mode="outlined"
                            style={{
                                backgroundColor: colors.backgroundLight,
                            }}
                        />
                    </DatePickerContainer>

                    <ButtonContainer>
                        <SaveButton 
                            onPress={handleSave}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color={colors.white} size="small" />
                            ) : (
                                <>
                                    <Feather name="save" size={20} color={colors.white} />
                                    <ButtonText>Salvar Competição</ButtonText>
                                </>
                            )}
                        </SaveButton>
                    </ButtonContainer>
                </Content>
            </Container>
        </PaperProvider>
    );
}

const Container = styled.View`
    flex: 1;
    background-color: ${props => props.theme.colors.backgroundDark};
`;

const Content = styled.ScrollView`
    flex: 1;
    padding: 16px;
`;

const FormGroup = styled.View`
    margin-bottom: 16px;
`;

const Label = styled.Text`
    font-size: 16px;
    margin-bottom: 8px;
    color: ${props => props.theme.colors.textPrimary};
`;

const DatePickerContainer = styled.View`
    margin-bottom: 20px;
`;

const ButtonContainer = styled.View`
    margin-top: 20px;
`;

const SaveButton = styled.TouchableOpacity<{ disabled?: boolean }>`
    background-color: ${props => props.disabled ? props.theme.colors.gray500 : props.theme.colors.primary};
    padding: 16px;
    border-radius: 8px;
    align-items: center;
    opacity: ${props => props.disabled ? 0.7 : 1};
`;

const ButtonText = styled.Text`
    color: ${props => props.theme.colors.white};
    font-size: 16px;
    font-weight: bold;
    margin-left: 8px;
`;
