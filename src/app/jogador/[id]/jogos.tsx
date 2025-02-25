import React, { useEffect, useState } from 'react';
import { View, Alert, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import styled from 'styled-components/native';
import { colors } from '@/styles/colors';
import { gameService } from '@/services/gameService';
import { playerService } from '@/services/playerService';
import { Feather } from '@expo/vector-icons';

type Game = {
    id: string;
    team1: string[];
    team2: string[];
    team1_score: number;
    team2_score: number;
    status: string;
    is_buchuda: boolean;
    is_buchuda_de_re: boolean;
    created_at: string;
};

type Player = {
    id: string;
    name: string;
};

export default function PlayerGames() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const [games, setGames] = useState<Game[]>([]);
    const [player, setPlayer] = useState<Player | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPlayerAndGames();
    }, [id]);

    const loadPlayerAndGames = async () => {
        try {
            const playerData = await playerService.getPlayerById(id as string);
            setPlayer(playerData);

            const gamesData = await gameService.getPlayerGames(id as string);
            setGames(gamesData);
        } catch (error) {
            console.error(error);
            Alert.alert('Erro', 'Não foi possível carregar os jogos do jogador');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <LoadingText>Carregando...</LoadingText>;
    }

    if (!player) {
        return <ErrorText>Jogador não encontrado</ErrorText>;
    }

    return (
        <Container>
            <Header>
                <BackButton onPress={() => router.back()}>
                    <Feather name="arrow-left" size={24} color={colors.text} />
                </BackButton>
                <HeaderContent>
                    <PlayerName>{player.name}</PlayerName>
                    <GamesCount>{games.length} jogos</GamesCount>
                </HeaderContent>
            </Header>

            {games.length === 0 ? (
                <EmptyText>Nenhum jogo encontrado</EmptyText>
            ) : (
                <GamesList
                    data={games}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <GameCard>
                            <GameDate>
                                {new Date(item.created_at).toLocaleDateString('pt-BR')}
                            </GameDate>
                            <GameScore>
                                <TeamScore>
                                    Time 1: {item.team1_score}
                                </TeamScore>
                                <Separator>x</Separator>
                                <TeamScore>
                                    Time 2: {item.team2_score}
                                </TeamScore>
                            </GameScore>
                            {(item.is_buchuda || item.is_buchuda_de_re) && (
                                <View style={{ marginTop: 8 }}>
                                    {item.is_buchuda && (
                                        <View style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            backgroundColor: colors.primary,
                                            padding: 8,
                                            borderRadius: 8,
                                            marginTop: 4,
                                        }}>
                                            <Text style={{
                                                fontSize: 16,
                                                marginRight: 4,
                                                color: colors.white,
                                            }}>👻</Text>
                                            <Text style={{
                                                color: colors.white,
                                                fontSize: 14,
                                                fontWeight: 'bold',
                                            }}>Buchuda!</Text>
                                        </View>
                                    )}
                                    {item.is_buchuda_de_re && (
                                        <View style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            backgroundColor: colors.primary,
                                            padding: 8,
                                            borderRadius: 8,
                                            marginTop: 4,
                                        }}>
                                            <Text style={{
                                                fontSize: 16,
                                                marginRight: 4,
                                                color: colors.white,
                                            }}>🔄</Text>
                                            <Text style={{
                                                color: colors.white,
                                                fontSize: 14,
                                                fontWeight: 'bold',
                                            }}>Buchuda de Ré!</Text>
                                        </View>
                                    )}
                                </View>
                            )}
                        </GameCard>
                    )}
                />
            )}
        </Container>
    );
}

const Container = styled.View`
    flex: 1;
    background-color: ${colors.background};
`;

const Header = styled.View`
    flex-direction: row;
    align-items: center;
    padding: 16px;
    padding-top: 60px;
    background-color: ${colors.surface};
`;

const BackButton = styled.TouchableOpacity`
    padding: 8px;
    margin-right: 16px;
`;

const HeaderContent = styled.View`
    flex: 1;
`;

const PlayerName = styled.Text`
    font-size: 24px;
    font-weight: bold;
    color: ${colors.text};
    margin-bottom: 4px;
`;

const GamesCount = styled.Text`
    font-size: 16px;
    color: ${colors.textSecondary};
`;

const GamesList = styled.FlatList`
    flex: 1;
    padding: 16px;
`;

const GameCard = styled.View`
    background-color: ${colors.surface};
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 12px;
`;

const GameDate = styled.Text`
    font-size: 14px;
    color: ${colors.textSecondary};
    margin-bottom: 8px;
`;

const GameScore = styled.View`
    flex-direction: row;
    align-items: center;
    justify-content: center;
    margin-bottom: 8px;
`;

const TeamScore = styled.Text`
    font-size: 18px;
    font-weight: bold;
    color: ${colors.text};
`;

const Separator = styled.Text`
    font-size: 18px;
    color: ${colors.text};
    margin: 0 12px;
`;

const LoadingText = styled.Text`
    font-size: 18px;
    color: ${colors.text};
    text-align: center;
    margin-top: 20px;
`;

const ErrorText = styled.Text`
    font-size: 18px;
    color: ${colors.error};
    text-align: center;
    margin-top: 20px;
`;

const EmptyText = styled.Text`
    font-size: 16px;
    color: ${colors.textSecondary};
    text-align: center;
    margin-top: 20px;
`;