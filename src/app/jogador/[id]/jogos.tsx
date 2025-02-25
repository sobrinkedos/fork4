import React, { useEffect, useState } from 'react';
import { View, Alert, Text, TouchableOpacity } from 'react-native';
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

const Container = styled.View`
    flex: 1;
    background-color: ${colors.background};
`;

const PageHeader = styled.View`
    flex-direction: row;
    align-items: center;
    padding: 16px 24px;
    padding-top: 60px;
    background-color: ${colors.primary};
`;

const BackButton = styled.TouchableOpacity`
    padding: 8px;
    margin-right: 16px;
`;

const HeaderTitle = styled.Text`
    color: ${colors.white};
    font-size: 20px;
    font-weight: bold;
    flex: 1;
`;

const HeaderSubtitle = styled.Text`
    color: ${colors.white};
    font-size: 14px;
    margin-top: 4px;
`;

const HeaderLeft = styled.View`
    flex-direction: row;
    align-items: center;
    flex: 1;
`;

const HeaderRight = styled.View`
    flex-direction: row;
    align-items: center;
`;

const StatsButton = styled.TouchableOpacity`
    flex-direction: row;
    align-items: center;
    padding: 8px 16px;
    border-radius: 8px;
    background-color: ${colors.white}20;
`;

const Content = styled.View`
    flex: 1;
`;

const GamesList = styled.FlatList`
    flex: 1;
    padding: 16px;
`;

const GameCard = styled.View`
    background-color: ${colors.surface};
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 16px;
`;

const GameDate = styled.Text`
    font-size: 14px;
    color: ${colors.textSecondary};
    margin-bottom: 8px;
`;

const GameScore = styled.View`
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
`;

const TeamScore = styled.View`
    flex: 1;
    align-items: center;
`;

const TeamName = styled.Text`
    font-size: 16px;
    color: ${colors.text};
    margin-bottom: 4px;
`;

const Score = styled.Text`
    font-size: 24px;
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
    font-size: 18px;
    color: ${colors.textSecondary};
    text-align: center;
    margin-top: 20px;
`;

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
            <PageHeader>
                <HeaderLeft>
                    <BackButton onPress={() => router.back()}>
                        <Feather name="arrow-left" size={24} color={colors.white} />
                    </BackButton>
                    <View>
                        <HeaderTitle>{player.name}</HeaderTitle>
                        <HeaderSubtitle>{games.length} jogos</HeaderSubtitle>
                    </View>
                </HeaderLeft>
                <HeaderRight>
                    <StatsButton onPress={() => router.push(`/jogador/${id}`)}>
                        <Feather name="bar-chart-2" size={20} color={colors.white} />
                        <Text style={{ color: colors.white, marginLeft: 8 }}>Estatísticas</Text>
                    </StatsButton>
                </HeaderRight>
            </PageHeader>

            {games.length === 0 ? (
                <Content>
                    <EmptyText>Nenhum jogo encontrado</EmptyText>
                </Content>
            ) : (
                <Content>
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
                                        <TeamName>Time 1</TeamName>
                                        <Score>{item.team1_score}</Score>
                                    </TeamScore>
                                    <Separator>x</Separator>
                                    <TeamScore>
                                        <TeamName>Time 2</TeamName>
                                        <Score>{item.team2_score}</Score>
                                    </TeamScore>
                                </GameScore>
                                {item.is_buchuda && (
                                    <Text style={{ color: colors.white, backgroundColor: colors.primary, padding: 4, borderRadius: 4, marginTop: 8, alignSelf: 'flex-start' }}>
                                        Buchuda
                                    </Text>
                                )}
                                {item.is_buchuda_de_re && (
                                    <Text style={{ color: colors.white, backgroundColor: colors.primary, padding: 4, borderRadius: 4, marginTop: 8, alignSelf: 'flex-start' }}>
                                        Buchuda de Ré
                                    </Text>
                                )}
                            </GameCard>
                        )}
                    />
                </Content>
            )}
        </Container>
    );
}