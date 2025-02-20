import React, { useState, useEffect, useCallback } from 'react';
import { Alert, FlatList, RefreshControl } from 'react-native';
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
    const [players, setPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadPlayers = async () => {
        try {
            setLoading(true);
            const data = await playerService.list();
            setPlayers(data || []);
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

    const renderItem = ({ item }: { item: Player }) => (
        <PlayerCard>
            <PlayerInfo>
                <PlayerName>{item.name}</PlayerName>
                {item.nickname && (
                    <PlayerNickname>@{item.nickname}</PlayerNickname>
                )}
                {item.phone && (
                    <PlayerPhone>{item.phone}</PlayerPhone>
                )}
            </PlayerInfo>
            <ActionsContainer>
                <ActionButton onPress={() => handleDelete(item)}>
                    <MaterialCommunityIcons
                        name="delete"
                        size={24}
                        color={colors.error}
                    />
                </ActionButton>
            </ActionsContainer>
        </PlayerCard>
    );

    return (
        <Container>
            <Header title="Jogadores" onNotificationPress={() => {}} onProfilePress={() => {}} />

            <FlatList
                data={players}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{
                    padding: 20,
                }}
                ListEmptyComponent={
                    !loading ? (
                        <EmptyContainer>
                            <EmptyText>Nenhum jogador encontrado</EmptyText>
                        </EmptyContainer>
                    ) : null
                }
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={[colors.primary]}
                        tintColor={colors.primary}
                    />
                }
            />

            <CreateButton 
                onPress={() => router.push('/jogador/novo')}
            >
                <Feather name="plus" size={24} color={colors.gray100} />
            </CreateButton>
        </Container>
    );
}

const Container = styled.View`
    flex: 1;
    background-color: ${colors.backgroundDark};
`;

const PlayerCard = styled.View`
    background-color: ${colors.secondary};
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 16px;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
`;

const PlayerInfo = styled.View`
    flex: 1;
`;

const PlayerName = styled.Text`
    color: ${colors.gray100};
    font-size: 16px;
    font-weight: bold;
`;

const PlayerNickname = styled.Text`
    color: ${colors.gray300};
    font-size: 14px;
    margin-top: 4px;
`;

const PlayerPhone = styled.Text`
    color: ${colors.gray300};
    font-size: 14px;
    margin-top: 4px;
`;

const ActionsContainer = styled.View`
    flex-direction: row;
    align-items: center;
`;

const ActionButton = styled.TouchableOpacity`
    margin-left: 16px;
`;

const EmptyContainer = styled.View`
    flex: 1;
    justify-content: center;
    align-items: center;
    padding: 20px;
`;

const EmptyText = styled.Text`
    color: ${colors.gray300};
    font-size: 16px;
    text-align: center;
    line-height: 24px;
`;

const CreateButton = styled.TouchableOpacity`
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