import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    ScrollView,
    Text
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import styled from 'styled-components/native';
import { colors } from '@/styles/colors';
import { Feather } from '@expo/vector-icons';
import { gameService, Game } from '@/services/gameService';
import { competitionService } from '@/services/competitionService';
import { useFocusEffect } from '@react-navigation/native';
import { InternalHeader } from '@/components/InternalHeader';

interface Player {
    id: string;
    name: string;
}

export default function GameDetails() {
    const router = useRouter();
    const { id: communityId, competitionId, gameId } = useLocalSearchParams();
    const [loading, setLoading] = useState(true);
    const [game, setGame] = useState<Game | null>(null);
    const [team1Players, setTeam1Players] = useState<Player[]>([]);
    const [team2Players, setTeam2Players] = useState<Player[]>([]);

    const loadGame = async () => {
        try {
            setLoading(true);
            const [gameData, membersData] = await Promise.all([
                gameService.getById(gameId as string),
                competitionService.listMembers(competitionId as string)
            ]);

            setGame(gameData);

            // Mapeando os IDs dos jogadores para seus dados completos
            const playersMap = new Map(
                membersData.map(m => [m.player_id, { id: m.player_id, name: m.players.name }])
            );

            setTeam1Players(gameData.team1.map(id => playersMap.get(id)).filter(Boolean));
            setTeam2Players(gameData.team2.map(id => playersMap.get(id)).filter(Boolean));
        } catch (error) {
            console.error(error);
            Alert.alert('Erro', 'Não foi possível carregar o jogo');
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadGame();
        }, [gameId])
    );

    const handleStartGame = async () => {
        try {
            setLoading(true);
            const updatedGame = await gameService.startGame(gameId as string);
            setGame(updatedGame);
        } catch (error) {
            console.error(error);
            Alert.alert('Erro', 'Não foi possível iniciar o jogo');
        } finally {
            setLoading(false);
        }
    };

    if (loading || !game) {
        return (
            <LoadingContainer>
                <ActivityIndicator size="large" color={colors.primary} />
            </LoadingContainer>
        );
    }

    const isBuchuda = game.is_buchuda;
    const isBuchudaDeRe = game.is_buchuda_de_re;

    return (
        <Container>
            <InternalHeader title="Detalhes do Jogo" />
            <MainContent 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 32 }}
            >
                <GameStatus>
                    <StatusText>
                        {game.status === 'pending' && 'Aguardando Início'}
                        {game.status === 'in_progress' && 'Em Andamento'}
                        {game.status === 'finished' && (
                            <GameStatusFinished>
                                <StatusText>Finalizado</StatusText>
                                {isBuchuda && <BuchudaTag>Buchuda!</BuchudaTag>}
                                {isBuchudaDeRe && <BuchudaTag>Buchuda de Ré!</BuchudaTag>}
                                <WinnerInfo>
                                    <WinnerText>
                                        Vencedores:{' '}
                                        {game.team1_score > game.team2_score ? (
                                            <>
                                                {team1Players.map((player, index) => (
                                                    <Text key={player.id}>
                                                        {player.name}
                                                        {index < team1Players.length - 1 ? ' e ' : ''}
                                                    </Text>
                                                ))}
                                            </>
                                        ) : (
                                            <>
                                                {team2Players.map((player, index) => (
                                                    <Text key={player.id}>
                                                        {player.name}
                                                        {index < team2Players.length - 1 ? ' e ' : ''}
                                                    </Text>
                                                ))}
                                            </>
                                        )}
                                    </WinnerText>
                                    <Feather name="award" size={24} color={colors.primary} />
                                </WinnerInfo>
                            </GameStatusFinished>
                        )}
                    </StatusText>
                </GameStatus>

                <ScoreContainer>
                    <TeamContainer winner={game.status === 'finished' && game.team1_score > game.team2_score}>
                        <TeamTitle>Time 1</TeamTitle>
                        {team1Players.map(player => (
                            <PlayerName key={player.id}>{player.name}</PlayerName>
                        ))}
                        <Score>{game.team1_score}</Score>
                    </TeamContainer>

                    <Versus>X</Versus>

                    <TeamContainer winner={game.status === 'finished' && game.team2_score > game.team1_score}>
                        <TeamTitle>Time 2</TeamTitle>
                        {team2Players.map(player => (
                            <PlayerName key={player.id}>{player.name}</PlayerName>
                        ))}
                        <Score>{game.team2_score}</Score>
                    </TeamContainer>
                </ScoreContainer>

                {game.status === 'pending' && (
                    <ActionButton variant="start" onPress={handleStartGame}>
                        <ActionButtonText>Iniciar Partida</ActionButtonText>
                    </ActionButton>
                )}

                {game.status === 'in_progress' && (
                    <ActionButton 
                        variant="register"
                        onPress={() => router.push(`/comunidade/${communityId}/competicao/${competitionId}/jogo/${gameId}/registrar`)}
                    >
                        <ActionButtonText>Registrar Resultado</ActionButtonText>
                    </ActionButton>
                )}

                {game.rounds.length > 0 && (
                    <>
                        <SectionTitle>Histórico de Partidas</SectionTitle>
                        {game.rounds.map((round, index) => {
                            // Calcula pontos baseado no tipo de vitória
                            let points = 0;
                            switch (round.type) {
                                case 'simple':
                                case 'contagem':
                                    points = 1;
                                    break;
                                case 'carroca':
                                    points = 2;
                                    break;
                                case 'la_e_lo':
                                    points = 3;
                                    break;
                                case 'cruzada':
                                    points = 4;
                                    break;
                            }
                            
                            // Adiciona bônus se houver
                            if (round.has_bonus) {
                                points += 1;
                            }

                            return (
                                <RoundCard key={index}>
                                    <RoundInfo>
                                        <RoundTypeContainer>
                                            <VictoryTypeTag>
                                                {round.type === 'simple' && 'Simples'}
                                                {round.type === 'carroca' && 'Carroça'}
                                                {round.type === 'la_e_lo' && 'Lá-e-lô'}
                                                {round.type === 'cruzada' && 'Cruzada'}
                                                {round.type === 'contagem' && 'Contagem'}
                                                {round.type === 'empate' && 'Empate'}
                                            </VictoryTypeTag>
                                            {round.type !== 'empate' && (
                                                <PointsTag>+{points} pontos</PointsTag>
                                            )}
                                        </RoundTypeContainer>
                                        {round.has_bonus && (
                                            <BonusTag>+1 Bônus</BonusTag>
                                        )}
                                    </RoundInfo>
                                    {round.type !== 'empate' && (
                                        <>
                                            <RoundWinnerText>
                                                Vencedores: {round.winner_team === 1 ? (
                                                    team1Players.map((player, index) => (
                                                        <Text key={player.id}>
                                                            {player.name}
                                                            {index < team1Players.length - 1 ? ' e ' : ''}
                                                        </Text>
                                                    ))
                                                ) : (
                                                    team2Players.map((player, index) => (
                                                        <Text key={player.id}>
                                                            {player.name}
                                                            {index < team2Players.length - 1 ? ' e ' : ''}
                                                        </Text>
                                                    ))
                                                )}
                                            </RoundWinnerText>
                                        </>
                                    )}
                                </RoundCard>
                            );
                        })}
                    </>
                )}
            </MainContent>
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
    background-color: ${colors.backgroundDark};
`;

const MainContent = styled.ScrollView`
    flex: 1;
    padding: 20px;
`;

const GameStatus = styled.View`
    margin-bottom: 24px;
`;

const GameStatusFinished = styled.View`
    align-items: center;
`;

const StatusText = styled.Text`
    font-size: 18px;
    font-weight: bold;
    color: ${colors.gray100};
    margin-bottom: 8px;
`;

const BuchudaTag = styled.Text`
    font-size: 16px;
    color: ${colors.primary};
    font-weight: bold;
    margin-bottom: 8px;
`;

const WinnerInfo = styled.View`
    flex-direction: row;
    align-items: center;
    background-color: ${colors.secondary};
    padding: 12px 16px;
    border-radius: 8px;
    margin-top: 8px;
`;

const WinnerText = styled.Text`
    font-size: 16px;
    color: ${colors.gray100};
    margin-right: 12px;
`;

const RoundWinnerText = styled.Text`
    color: ${colors.textSecondary};
    font-size: 14px;
`;

const TeamContainer = styled.View<{ winner?: boolean }>`
    flex: 1;
    align-items: center;
    background-color: ${props => props.winner ? colors.secondary : 'transparent'};
    padding: ${props => props.winner ? '16px' : '0px'};
    border-radius: ${props => props.winner ? '8px' : '0px'};
    border: ${props => props.winner ? `2px solid ${colors.primary}` : 'none'};
`;

const ScoreContainer = styled.View`
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 32px;
`;

const TeamTitle = styled.Text`
    font-size: 20px;
    font-weight: bold;
    color: ${colors.gray100};
    margin-bottom: 16px;
`;

const PlayerName = styled.Text`
    font-size: 16px;
    color: ${colors.gray300};
    margin-bottom: 8px;
`;

const Score = styled.Text`
    font-size: 48px;
    font-weight: bold;
    color: ${colors.gray100};
    margin-top: 16px;
`;

const Versus = styled.Text`
    font-size: 24px;
    font-weight: bold;
    color: ${colors.gray300};
    margin-horizontal: 16px;
`;

const ActionButton = styled.TouchableOpacity<{ variant?: 'start' | 'register' }>`
    background-color: ${props => props.variant === 'start' ? colors.success : colors.primary};
    padding: 16px;
    border-radius: 8px;
    align-items: center;
    justify-content: center;
    margin-top: 24px;
`;

const ActionButtonText = styled.Text`
    color: ${colors.white};
    font-size: 16px;
    font-weight: bold;
`;

const SectionTitle = styled.Text`
    font-size: 18px;
    font-weight: bold;
    color: ${colors.gray100};
    margin-top: 32px;
    margin-bottom: 16px;
`;

const RoundCard = styled.View`
    background-color: ${colors.surface};
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 8px;
`;

const RoundInfo = styled.View`
    flex-direction: row;
    align-items: center;
    margin-bottom: 12px;
    justify-content: space-between;
`;

const RoundTypeContainer = styled.View`
    flex-direction: row;
    align-items: center;
    flex: 1;
`;

const VictoryTypeTag = styled.Text`
    color: ${colors.primary};
    font-size: 14px;
    font-weight: bold;
    padding: 4px 8px;
    background-color: ${colors.primaryLight}20;
    border-radius: 4px;
`;

const PointsTag = styled.Text`
    color: ${colors.success};
    font-size: 14px;
    font-weight: bold;
    margin-left: 8px;
`;

const BonusTag = styled.Text`
    color: ${colors.warning};
    font-size: 14px;
    font-weight: bold;
    margin-left: 8px;
    padding: 4px 8px;
    background-color: ${colors.surface};
    border-radius: 4px;
    border: 1px solid ${colors.warning};
`;
