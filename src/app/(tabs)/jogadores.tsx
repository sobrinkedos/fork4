import React, { useState, useEffect, useCallback } from 'react';
import { Alert, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import styled from 'styled-components/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../styles/colors';
import { Player, playerService } from '@/services/playerService';
import { Header } from '@/components/Header';
import { useFocusEffect } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function Jogadores() {
    const router = useRouter();
    const [myPlayers, setMyPlayers] = useState<Player[]>([]);
    const [communityPlayers, setCommunityPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadPlayers = async () => {
        try {
            setLoading(true);
            const { myPlayers: my, communityPlayers: community } = await playerService.list();
            setMyPlayers(my || []);
            setCommunityPlayers(community || []);
        } catch (error) {
            console.error('Erro ao carregar jogadores:', error);
            Alert.alert('Erro', 'Não foi possível carregar os jogadores');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPlayers();
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadPlayers();
        }, [])
    );

    const handleRefresh = () => {
        setRefreshing(true);
        loadPlayers().finally(() => setRefreshing(false));
    };

    const handleDelete = (player: Player) => {
        Alert.alert(
            'Confirmar exclusão',
            `Deseja realmente excluir o jogador ${player.name}?`,
            [
                {
                    text: 'Cancelar',
                    style: 'cancel'
                },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await playerService.delete(player.id);
                            Alert.alert('Sucesso', 'Jogador excluído com sucesso');
                            loadPlayers();
                        } catch (error) {
                            console.error('Erro ao excluir jogador:', error);
                            Alert.alert('Erro', 'Não foi possível excluir o jogador');
                        }
                    }
                }
            ]
        );
    };

    const renderPlayerItem = ({ item, isMyPlayer }: { item: Player; isMyPlayer: boolean }) => (
        <PlayerCard>
            <PlayerInfo>
                <PlayerNameContainer>
                    <PlayerName>{item.name}</PlayerName>
                    {item.isLinkedUser && (
                        <LinkedUserBadge>
                            <MaterialCommunityIcons
                                name="account-check"
                                size={16}
                                color={colors.success}
                            />
                            <LinkedUserText>Vinculado</LinkedUserText>
                        </LinkedUserBadge>
                    )}
                </PlayerNameContainer>
                {item.nickname && (
                    <PlayerNickname>@{item.nickname}</PlayerNickname>
                )}
                {item.phone && (
                    <PlayerPhone>{item.phone}</PlayerPhone>
                )}
            </PlayerInfo>
            {isMyPlayer && (
                <ActionsContainer>
                    <ActionButton onPress={() => handleDelete(item)}>
                        <MaterialCommunityIcons
                            name="delete"
                            size={24}
                            color={colors.error}
                        />
                    </ActionButton>
                </ActionsContainer>
            )}
        </PlayerCard>
    );

    const renderSectionHeader = (title: string) => (
        <SectionTitle>{title}</SectionTitle>
    );

    const renderItem = ({ item }: { item: any }) => {
        if (item.sectionTitle) {
            return renderSectionHeader(item.sectionTitle);
        }

        if (item.emptyMessage) {
            return <EmptyText>{item.emptyMessage}</EmptyText>;
        }

        return renderPlayerItem({
            item,
            isMyPlayer: item.section === 'myPlayers'
        });
    };

    // Preparar dados para a FlatList
    const sections = [];
    
    // Seção "Meus Jogadores"
    sections.push({ sectionTitle: 'Meus Jogadores' });
    if (myPlayers.length === 0) {
        sections.push({ emptyMessage: 'Você ainda não criou nenhum jogador' });
    } else {
        myPlayers.forEach(player => sections.push({ ...player, section: 'myPlayers' }));
    }

    // Seção "Jogadores das Comunidades"
    sections.push({ sectionTitle: 'Jogadores das Comunidades' });
    if (communityPlayers.length === 0) {
        sections.push({ emptyMessage: 'Nenhum jogador disponível nas suas comunidades' });
    } else {
        communityPlayers.forEach(player => sections.push({ ...player, section: 'communityPlayers' }));
    }

    if (loading) {
        return (
            <Container>
                <Header title="Jogadores" onNotificationPress={() => {}} onProfilePress={() => {}} />
                <LoadingContainer>
                    <ActivityIndicator size="large" color={colors.primary} />
                </LoadingContainer>
            </Container>
        );
    }

    return (
        <Container>
            <Header title="Jogadores" onNotificationPress={() => {}} onProfilePress={() => {}} />

            <FlatList
                data={sections}
                renderItem={renderItem}
                keyExtractor={(item, index) => item.id || `section-${index}`}
                contentContainerStyle={{ padding: 16 }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={[colors.primary]}
                    />
                }
            />

            <FAB onPress={() => router.push('/jogador/novo')}>
                <Feather name="plus" size={24} color={colors.gray100} />
            </FAB>
        </Container>
    );
}

const Container = styled.View`
    flex: 1;
    background-color: ${colors.backgroundDark};
`;

const LoadingContainer = styled.View`
    flex: 1;
    justify-content: center;
    align-items: center;
`;

const SectionTitle = styled.Text`
    font-size: 18px;
    font-weight: bold;
    color: ${colors.gray100};
    margin: 24px 0 12px;
`;

const PlayerCard = styled.View`
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    background-color: ${colors.secondary};
    border-radius: 8px;
    margin-bottom: 8px;
`;

const PlayerInfo = styled.View`
    flex: 1;
`;

const PlayerNameContainer = styled.View`
    flex-direction: row;
    align-items: center;
    gap: 8px;
`;

const PlayerName = styled.Text`
    font-size: 16px;
    color: ${colors.gray100};
    font-weight: bold;
`;

const LinkedUserBadge = styled.View`
    flex-direction: row;
    align-items: center;
    background-color: ${colors.success}20;
    padding: 4px 8px;
    border-radius: 12px;
    gap: 4px;
`;

const LinkedUserText = styled.Text`
    color: ${colors.success};
    font-size: 12px;
    font-weight: bold;
`;

const PlayerNickname = styled.Text`
    font-size: 14px;
    color: ${colors.gray300};
    margin-top: 4px;
`;

const PlayerPhone = styled.Text`
    font-size: 14px;
    color: ${colors.gray300};
    margin-top: 4px;
`;

const ActionsContainer = styled.View`
    flex-direction: row;
    align-items: center;
`;

const ActionButton = styled.TouchableOpacity`
    padding: 8px;
`;

const FAB = styled.TouchableOpacity`
    position: absolute;
    right: 16px;
    bottom: 16px;
    width: 56px;
    height: 56px;
    border-radius: 28px;
    background-color: ${colors.primary};
    justify-content: center;
    align-items: center;
    elevation: 4;
`;

const EmptyText = styled.Text`
    color: ${colors.gray300};
    font-size: 14px;
    text-align: center;
    margin: 12px 0;
`;