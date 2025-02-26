import React, { useState, useEffect, useCallback } from 'react';
import { Alert, FlatList, RefreshControl, ActivityIndicator, View } from 'react-native';
import styled from 'styled-components/native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { Player, playerService } from '@/services/playerService';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { Header } from '@/components/Header';
import { useTheme } from '@/contexts/ThemeProvider';

const Container = styled.View`
    flex: 1;
    background-color: ${({ theme }) => theme.colors.backgroundDark};
`;

const Content = styled.View`
    flex: 1;
`;

const LoadingContainer = styled.View`
    flex: 1;
    justify-content: center;
    align-items: center;
`;

const PlayerCard = styled.View`
    background-color: ${({ theme }) => theme.colors.secondary};
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 12px;
    flex-direction: row;
    justify-content: space-between;
`;

const PlayerInfo = styled.View`
    flex: 1;
`;

const PlayerNameContainer = styled.View`
    flex-direction: row;
    align-items: center;
`;

const PlayerName = styled.Text`
    font-size: 16px;
    font-weight: bold;
    color: ${({ theme }) => theme.colors.textPrimary};
`;

const PlayerNickname = styled.Text`
    font-size: 14px;
    color: ${({ theme }) => theme.colors.textSecondary};
    margin-top: 4px;
`;

const PlayerPhone = styled.Text`
    font-size: 14px;
    color: ${({ theme }) => theme.colors.textSecondary};
    margin-top: 4px;
`;

const LinkedUserBadge = styled.View`
    flex-direction: row;
    align-items: center;
    background-color: ${({ theme }) => theme.colors.successLight};
    padding: 4px 8px;
    border-radius: 4px;
    margin-left: 8px;
`;

const LinkedUserText = styled.Text`
    font-size: 12px;
    color: ${({ theme }) => theme.colors.success};
    margin-left: 4px;
`;

const ActionsContainer = styled.View`
    flex-direction: row;
    align-items: center;
`;

const ActionButton = styled.Pressable`
    padding: 8px;
`;

const SectionTitle = styled.Text`
    font-size: 18px;
    font-weight: bold;
    color: ${({ theme }) => theme.colors.textPrimary};
    margin-bottom: 16px;
    margin-top: 24px;
`;

const EmptyText = styled.Text`
    font-size: 14px;
    color: ${({ theme }) => theme.colors.textSecondary};
    text-align: center;
    margin: 16px 0;
`;

const FAB = styled.Pressable`
    position: absolute;
    right: 20px;
    bottom: 20px;
    width: 56px;
    height: 56px;
    border-radius: 28px;
    background-color: ${({ theme }) => theme.colors.accent};
    justify-content: center;
    align-items: center;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

export default function Jogadores() {
    const router = useRouter();
    const [myPlayers, setMyPlayers] = useState<Player[]>([]);
    const [communityPlayers, setCommunityPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const { theme, colors } = useTheme();

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
                <Header />
                <LoadingContainer>
                    <ActivityIndicator size="large" color={colors.accent} />
                </LoadingContainer>
            </Container>
        );
    }

    return (
        <Container>
            <Header title="JOGADORES" />
            <Content>
                <FlatList
                    data={sections}
                    renderItem={renderItem}
                    keyExtractor={(item, index) => item.id || `section-${index}`}
                    contentContainerStyle={{ padding: 20 }}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            colors={[colors.accent]}
                        />
                    }
                />

                <FAB onPress={() => router.push('/jogador/novo')}>
                    <Feather name="plus" size={24} color={colors.backgroundLight} />
                </FAB>
            </Content>
        </Container>
    );
}