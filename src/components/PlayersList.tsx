import React, { useEffect, useState } from 'react';
import { Alert, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import { colors } from '@/styles/colors';
import { playersService } from '@/services/playersService';

type Player = {
    id: string;
    name: string;
    avatar_url: string | null;
};

type PlayersListProps = {
    excludeIds?: string[];
    onSelectPlayer: (playerId: string) => void;
};

export function PlayersList({ excludeIds = [], onSelectPlayer }: PlayersListProps) {
    const [players, setPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPlayers();
    }, []);

    const loadPlayers = async () => {
        try {
            const data = await playersService.listPlayers();
            const filteredPlayers = excludeIds.length > 0
                ? data.filter(player => !excludeIds.includes(player.id))
                : data;
            setPlayers(filteredPlayers);
        } catch (error) {
            Alert.alert('Erro', 'Erro ao carregar jogadores');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <LoadingText>Carregando jogadores...</LoadingText>
        );
    }

    return (
        <Container>
            {players.length === 0 ? (
                <EmptyText>Nenhum jogador disponível</EmptyText>
            ) : (
                <PlayerList
                    data={players}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <PlayerCard onPress={() => onSelectPlayer(item.id)}>
                            <PlayerName>{item.name}</PlayerName>
                        </PlayerCard>
                    )}
                />
            )}
        </Container>
    );
}

const Container = styled.View`
    flex: 1;
`;

const PlayerList = styled.FlatList`
    flex: 1;
`;

const PlayerCard = styled.TouchableOpacity`
    padding: 16px;
    background-color: ${colors.secondary};
    border-radius: 8px;
    margin-bottom: 8px;
`;

const PlayerName = styled.Text`
    font-size: 16px;
    color: ${colors.gray100};
`;

const LoadingText = styled.Text`
    color: ${colors.gray100};
    font-size: 16px;
    text-align: center;
    margin-top: 20px;
`;

const EmptyText = styled.Text`
    color: ${colors.gray300};
    font-size: 16px;
    text-align: center;
    margin-top: 20px;
`;
