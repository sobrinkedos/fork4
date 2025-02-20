import React, { useState, useEffect, useCallback } from 'react';
import { Alert, Modal as RNModal, ActivityIndicator, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '@/styles/colors';
import { Header } from '@/components/Header';
import { Community, communityService } from '@/services/communityService';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

const Container = styled.View`
    flex: 1;
    background-color: ${colors.backgroundDark};
`;

const ScrollContent = styled.ScrollView.attrs({
    contentContainerStyle: {
        flexGrow: 1,
        padding: 16,
        paddingBottom: 80,
    },
})`
    flex: 1;
`;

const CommunityCard = styled.TouchableOpacity`
    background-color: ${colors.secondary};
    border-radius: 8px;
    margin-bottom: 16px;
    padding: 16px;
`;

const CommunityHeader = styled.View`
    flex-direction: row;
    align-items: flex-start;
`;

const CommunityInfo = styled.View`
    flex: 1;
    margin-left: 12px;
`;

const CommunityName = styled.Text`
    font-size: 18px;
    font-weight: bold;
    color: ${colors.gray100};
`;

const CommunityDescription = styled.Text`
    font-size: 14px;
    color: ${colors.gray300};
    margin-top: 4px;
    margin-bottom: 12px;
`;

const CommunityStats = styled.View`
    flex-direction: row;
    align-items: center;
`;

const StatItem = styled.View`
    flex-direction: row;
    align-items: center;
    margin-right: 16px;
`;

const StatText = styled.Text`
    font-size: 14px;
    color: ${colors.gray300};
    margin-left: 4px;
`;

const Modal = styled.View`
    flex: 1;
    background-color: rgba(0, 0, 0, 0.5);
    justify-content: center;
    align-items: center;
    padding: 20px;
`;

const ModalContent = styled.View`
    background-color: ${colors.backgroundLight};
    padding: 20px;
    border-radius: 8px;
    width: 100%;
`;

const ModalTitle = styled.Text`
    font-size: 20px;
    font-weight: bold;
    color: ${colors.gray100};
    margin-bottom: 16px;
    text-align: center;
`;

const Input = styled.TextInput`
    background-color: ${colors.backgroundDark};
    padding: 16px;
    border-radius: 8px;
    margin-bottom: 16px;
    color: ${colors.gray100};
    font-size: 16px;
`;

const ButtonsContainer = styled.View`
    flex-direction: row;
    justify-content: space-between;
    margin-top: 8px;
`;

const Button = styled.TouchableOpacity<{ variant?: 'primary' | 'secondary' | 'danger' }>`
    background-color: ${props => {
        switch (props.variant) {
            case 'primary':
                return colors.accent;
            case 'danger':
                return colors.error;
            default:
                return colors.gray700;
        }
    }};
    padding: 16px;
    border-radius: 8px;
    flex: 1;
    margin-horizontal: 4px;
`;

const ButtonText = styled.Text`
    color: ${colors.gray100};
    font-size: 16px;
    font-weight: bold;
    text-align: center;
`;

const LoadingContainer = styled.View`
    flex: 1;
    justify-content: center;
    align-items: center;
`;

const EmptyContainer = styled.View`
    flex: 1;
    justify-content: center;
    align-items: center;
`;

const EmptyText = styled.Text`
    color: ${colors.gray300};
    font-size: 16px;
    text-align: center;
    margin-top: 16px;
`;

const CreateButton = styled.TouchableOpacity`
    position: absolute;
    right: 16px;
    bottom: 16px;
    width: 56px;
    height: 56px;
    border-radius: 28px;
    background-color: ${colors.accent};
    align-items: center;
    justify-content: center;
    elevation: 5;
`;

export default function Comunidades() {
    const router = useRouter();
    const [communities, setCommunities] = useState<Community[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });

    useEffect(() => {
        loadCommunities();
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadCommunities();
        }, [])
    );

    const loadCommunities = async () => {
        try {
            setLoading(true);
            const data = await communityService.list();
            setCommunities(data || []);
        } catch (error) {
            console.error('Erro ao carregar comunidades:', error);
            Alert.alert('Erro', 'Não foi possível carregar as comunidades');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.name.trim()) {
            Alert.alert('Erro', 'O nome da comunidade é obrigatório');
            return;
        }

        try {
            if (selectedCommunity) {
                const { error } = await communityService.update(selectedCommunity.id, {
                    name: formData.name.trim(),
                    description: formData.description.trim()
                });
                if (error) throw error;
                Alert.alert('Sucesso', 'Comunidade atualizada com sucesso');
            } else {
                const { error } = await communityService.create({
                    name: formData.name.trim(),
                    description: formData.description.trim()
                });
                if (error) throw error;
                Alert.alert('Sucesso', 'Comunidade criada com sucesso');
            }

            setFormData({ name: '', description: '' });
            setSelectedCommunity(null);
            setShowModal(false);
            loadCommunities();
        } catch (error) {
            console.error('Erro ao salvar comunidade:', error);
            Alert.alert('Erro', 'Não foi possível salvar a comunidade');
        }
    };

    const handleEdit = (community: Community) => {
        setSelectedCommunity(community);
        setFormData({
            name: community.name,
            description: community.description
        });
        setShowModal(true);
    };

    const handleDelete = (community: Community) => {
        Alert.alert(
            'Confirmar exclusão',
            `Deseja realmente excluir a comunidade ${community.name}?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const { error } = await communityService.delete(community.id);
                            if (error) throw error;
                            Alert.alert('Sucesso', 'Comunidade excluída com sucesso');
                            loadCommunities();
                        } catch (error) {
                            console.error('Erro ao excluir comunidade:', error);
                            Alert.alert('Erro', 'Não foi possível excluir a comunidade');
                        }
                    }
                }
            ]
        );
    };

    const handleAddNew = () => {
        setSelectedCommunity(null);
        setFormData({ name: '', description: '' });
        setShowModal(true);
    };

    const handleCardPress = (communityId: string) => {
        router.push(`/comunidade/${communityId}`);
    };

    const renderCommunity = (community: Community) => (
        <CommunityCard
            key={community.id}
            onPress={() => router.push(`/comunidade/${community.id}`)}
        >
            <CommunityHeader>
                <MaterialCommunityIcons
                    name="account-group"
                    size={32}
                    color={colors.primary}
                />
                <CommunityInfo>
                    <CommunityName>{community.name}</CommunityName>
                    <CommunityDescription>{community.description}</CommunityDescription>
                    <CommunityStats>
                        <StatItem>
                            <MaterialCommunityIcons
                                name="account-multiple"
                                size={16}
                                color={colors.gray300}
                            />
                            <StatText>{community.members_count} membros</StatText>
                        </StatItem>
                        <StatItem>
                            <MaterialCommunityIcons
                                name="cards-playing-outline"
                                size={16}
                                color={colors.gray300}
                            />
                            <StatText>{community.games_count} jogos</StatText>
                        </StatItem>
                    </CommunityStats>
                </CommunityInfo>
            </CommunityHeader>
        </CommunityCard>
    );

    if (loading) {
        return (
            <Container>
                <Header title="Comunidades" onNotificationPress={() => {}} onProfilePress={() => {}} />
                <LoadingContainer>
                    <ActivityIndicator size="large" color={colors.accent} />
                </LoadingContainer>
            </Container>
        );
    }

    return (
        <Container>
            <Header title="Comunidades" onNotificationPress={() => {}} onProfilePress={() => {}} />
            <ScrollContent>
                {communities.length === 0 ? (
                    <EmptyContainer>
                        <MaterialCommunityIcons 
                            name="account-group-outline" 
                            size={48} 
                            color={colors.gray400}
                        />
                        <EmptyText>
                            Nenhuma comunidade encontrada{'\n'}
                            Toque no + para criar
                        </EmptyText>
                    </EmptyContainer>
                ) : (
                    communities.map(renderCommunity)
                )}
            </ScrollContent>

            <CreateButton 
                onPress={() => router.push('/comunidade/nova')}
            >
                <MaterialCommunityIcons 
                    name="plus" 
                    size={24} 
                    color={colors.gray100}
                />
            </CreateButton>

            <RNModal
                visible={showModal}
                transparent
                animationType="fade"
                onRequestClose={() => {
                    setShowModal(false);
                    setSelectedCommunity(null);
                    setFormData({ name: '', description: '' });
                }}
            >
                <Modal>
                    <ModalContent>
                        <ModalTitle>
                            {selectedCommunity ? 'Editar Comunidade' : 'Nova Comunidade'}
                        </ModalTitle>
                        
                        <Input
                            placeholder="Nome da comunidade *"
                            value={formData.name}
                            onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                            placeholderTextColor={colors.gray400}
                        />
                        
                        <Input
                            placeholder="Descrição"
                            value={formData.description}
                            onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                            placeholderTextColor={colors.gray400}
                            multiline
                            numberOfLines={3}
                            textAlignVertical="top"
                        />

                        <ButtonsContainer>
                            <Button 
                                variant="secondary"
                                onPress={() => {
                                    setShowModal(false);
                                    setSelectedCommunity(null);
                                    setFormData({ name: '', description: '' });
                                }}
                            >
                                <ButtonText>Cancelar</ButtonText>
                            </Button>
                            
                            <Button variant="primary" onPress={handleSave}>
                                <ButtonText>Salvar</ButtonText>
                            </Button>
                        </ButtonsContainer>
                    </ModalContent>
                </Modal>
            </RNModal>
        </Container>
    );
}