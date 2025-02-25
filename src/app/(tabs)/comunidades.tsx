import React, { useState, useEffect, useCallback } from 'react';
import { Alert, Modal as RNModal, ActivityIndicator, TouchableOpacity, View, FlatList, ScrollView } from 'react-native';
import styled from 'styled-components/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '@/styles/colors';
import { Community, communityService } from '@/services/communityService';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { Header } from '@/components/Header';

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
    justify-content: space-between;
`;

const CommunityInfo = styled.View`
    flex: 1;
    margin-right: 12px;
`;

const OrganizerBadge = styled.View`
    background-color: ${colors.accent};
    padding: 4px 8px;
    border-radius: 4px;
    margin-left: 8px;
`;

const OrganizerText = styled.Text`
    color: ${colors.white};
    font-size: 12px;
    font-weight: bold;
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

const SectionTitle = styled.Text`
    font-size: 18px;
    font-weight: bold;
    color: ${colors.gray100};
    margin-bottom: 16px;
`;

const CommunityFooter = styled.View`
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
`;

const FooterText = styled.Text`
    font-size: 14px;
    color: ${colors.gray300};
`;

const ModalContainer = styled.View`
    flex: 1;
    background-color: rgba(0, 0, 0, 0.5);
    justify-content: center;
    align-items: center;
    padding: 20px;
`;

const ModalHeader = styled.View`
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
`;

const CloseButton = styled.TouchableOpacity`
    padding: 8px;
`;

const AddButton = styled.TouchableOpacity`
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

const AddButtonText = styled.Text`
    font-size: 16px;
    font-weight: bold;
    color: ${colors.gray100};
    text-align: center;
`;

const SaveButton = styled.TouchableOpacity`
    background-color: ${colors.accent};
    padding: 16px;
    border-radius: 8px;
    align-items: center;
    justify-content: center;
`;

const SaveButtonText = styled.Text`
    font-size: 16px;
    font-weight: bold;
    color: ${colors.gray100};
    text-align: center;
`;

const Content = styled.View`
    flex: 1;
    padding: 16px;
`;

export default function Comunidades() {
    const router = useRouter();
    const [createdCommunities, setCreatedCommunities] = useState<Community[]>([]);
    const [organizedCommunities, setOrganizedCommunities] = useState<Community[]>([]);
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
            const { created, organized } = await communityService.list();
            setCreatedCommunities(created || []);
            setOrganizedCommunities(organized || []);
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
            setLoading(true);
            await communityService.create({
                name: formData.name.trim(),
                description: formData.description.trim()
            });
            setShowModal(false);
            setFormData({ name: '', description: '' });
            await loadCommunities();
        } catch (error) {
            console.error('Erro ao criar comunidade:', error);
            Alert.alert('Erro', 'Não foi possível criar a comunidade');
        } finally {
            setLoading(false);
        }
    };

    const renderCommunityCard = (community: Community) => (
        <CommunityCard
            key={community.id}
            onPress={() => router.push(`/comunidade/${community.id}`)}
        >
            <CommunityHeader>
                <CommunityInfo>
                    <CommunityName>{community.name}</CommunityName>
                    {community.description && (
                        <CommunityDescription>{community.description}</CommunityDescription>
                    )}
                </CommunityInfo>
                <MaterialCommunityIcons
                    name="chevron-right"
                    size={24}
                    color={colors.text}
                />
            </CommunityHeader>
            <CommunityFooter>
                <FooterText>{community.members_count || 0} membros</FooterText>
            </CommunityFooter>
        </CommunityCard>
    );

    return (
        <Container>
            <Header title="COMUNIDADES" />
            <Content>
                {loading ? (
                    <LoadingContainer>
                        <ActivityIndicator size="large" color={colors.primary} />
                    </LoadingContainer>
                ) : (
                    <ScrollContent>
                        <SectionTitle>Minhas Comunidades</SectionTitle>
                        {createdCommunities.length === 0 ? (
                            <EmptyText>Você ainda não criou nenhuma comunidade</EmptyText>
                        ) : (
                            createdCommunities.map(renderCommunityCard)
                        )}

                        {organizedCommunities.length > 0 && (
                            <>
                                <SectionTitle style={{ marginTop: 24 }}>Comunidades que Organizo</SectionTitle>
                                {organizedCommunities.map(renderCommunityCard)}
                            </>
                        )}

                        <AddButton onPress={() => setShowModal(true)}>
                            <MaterialCommunityIcons
                                name="plus"
                                size={24}
                                color={colors.text}
                            />
                        </AddButton>
                    </ScrollContent>
                )}
            </Content>

            <RNModal
                visible={showModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowModal(false)}
            >
                <ModalContainer>
                    <ModalContent>
                        <ModalHeader>
                            <ModalTitle>Nova Comunidade</ModalTitle>
                            <CloseButton onPress={() => setShowModal(false)}>
                                <MaterialCommunityIcons
                                    name="close"
                                    size={24}
                                    color={colors.text}
                                />
                            </CloseButton>
                        </ModalHeader>

                        <Input
                            placeholder="Nome da Comunidade"
                            placeholderTextColor={colors.gray300}
                            value={formData.name}
                            onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                        />

                        <Input
                            placeholder="Descrição (opcional)"
                            placeholderTextColor={colors.gray300}
                            value={formData.description}
                            onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                            multiline
                            numberOfLines={4}
                            style={{ height: 100, textAlignVertical: 'top' }}
                        />

                        <SaveButton onPress={handleSave} disabled={loading}>
                            {loading ? (
                                <ActivityIndicator color={colors.text} />
                            ) : (
                                <SaveButtonText>Salvar</SaveButtonText>
                            )}
                        </SaveButton>
                    </ModalContent>
                </ModalContainer>
            </RNModal>
        </Container>
    );
}