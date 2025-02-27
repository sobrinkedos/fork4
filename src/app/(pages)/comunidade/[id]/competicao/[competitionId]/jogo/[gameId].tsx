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
import { Feather } from '@expo/vector-icons';
import { gameService, Game } from '@/services/gameService';
import { competitionService } from '@/services/competitionService';
import { useFocusEffect } from '@react-navigation/native';
import { InternalHeader } from '@/components/InternalHeader';
import { useTheme } from '@/contexts/ThemeProvider';

interface Player {
    id: string;
    name: string;
}

export default function GameDetails() {
    const router = useRouter();
    const { id: communityId, competitionId, gameId } = useLocalSearchParams();
    const { colors } = useTheme();
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
            <LoadingContainer colors={colors}>
                <ActivityIndicator size="large" color={colors.primary} />
            </LoadingContainer>
        );
    }

    const isBuchuda = game.is_buchuda;
    const isBuchudaDeRe = game.is_buchuda_de_re;

    return (
        <Container colors={colors}>
            <InternalHeader title="Detalhes do Jogo" />
            <MainContent 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 32 }}
            >
                <GameStatus>
                    <StatusText colors={colors}>
                        {game.status === 'pending' && 'Aguardando Início'}
                        {game.status === 'in_progress' && 'Em Andamento'}
                        {game.status === 'finished' && (
                            <GameStatusFinished>
                                <StatusText colors={colors}>Finalizado</StatusText>
                                {isBuchuda && <BuchudaTag colors={colors}>Buchuda!</BuchudaTag>}
                                {isBuchudaDeRe && <BuchudaTag colors={colors}>Buchuda de Ré!</BuchudaTag>}
                                <WinnerInfo colors={colors}>
                                    <WinnerText colors={colors}>
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
                                    <Feather name="award" size={24} color="#4F8EF7" />
                                </WinnerInfo>
                            </GameStatusFinished>
                        )}
                    </StatusText>
                </GameStatus>

                <ScoreContainer>
                    <TeamContainer winner={game.status === 'finished' && game.team1_score > game.team2_score} colors={colors}>
                        <TeamTitle colors={colors}>Time 1</TeamTitle>
                        {team1Players.map(player => (
                            <PlayerName key={player.id} colors={colors}>{player.name}</PlayerName>
                        ))}
                        <Score colors={colors}>{game.team1_score}</Score>
                    </TeamContainer>

                    <Versus colors={colors}>X</Versus>

                    <TeamContainer winner={game.status === 'finished' && game.team2_score > game.team1_score} colors={colors}>
                        <TeamTitle colors={colors}>Time 2</TeamTitle>
                        {team2Players.map(player => (
                            <PlayerName key={player.id} colors={colors}>{player.name}</PlayerName>
                        ))}
                        <Score colors={colors}>{game.team2_score}</Score>
                    </TeamContainer>
                </ScoreContainer>

                {game.status === 'pending' && (
                    <ActionButton variant="start" colors={colors} onPress={handleStartGame}>
                        <ActionButtonText colors={colors}>Iniciar Partida</ActionButtonText>
                    </ActionButton>
                )}

                {game.status === 'in_progress' && (
                    <ActionButton 
                        variant="register"
                        colors={colors}
                        onPress={() => router.push(`/comunidade/${communityId}/competicao/${competitionId}/jogo/${gameId}/registrar`)}
                    >
                        <ActionButtonText colors={colors}>Registrar Resultado</ActionButtonText>
                    </ActionButton>
                )}

                {game.rounds.length > 0 && (
                    <>
                        <SectionTitle colors={colors}>Histórico de Partidas</SectionTitle>
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
                                <RoundCard key={index} colors={colors}>
                                    <RoundInfo>
                                        <RoundTypeContainer>
                                            <VictoryTypeTag colors={colors}>
                                                {round.type === 'simple' && 'Simples'}
                                                {round.type === 'carroca' && 'Carroça'}
                                                {round.type === 'la_e_lo' && 'Lá-e-lô'}
                                                {round.type === 'cruzada' && 'Cruzada'}
                                                {round.type === 'contagem' && 'Contagem'}
                                                {round.type === 'empate' && 'Empate'}
                                            </VictoryTypeTag>
                                            {round.type !== 'empate' && (
                                                <PointsTag colors={colors}>+{points} pontos</PointsTag>
                                            )}
                                        </RoundTypeContainer>
                                        {round.has_bonus && (
                                            <BonusTag colors={colors}>+1 Bônus</BonusTag>
                                        )}
                                    </RoundInfo>
                                    {round.type !== 'empate' && (
                                        <>
                                            <RoundWinnerText colors={colors}>
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

const Container = styled.View<{ colors: any }>`
    flex: 1;
    background-color: ${props => props.colors.background};
`;

const LoadingContainer = styled.View<{ colors: any }>`
    flex: 1;
    justify-content: center;
    align-items: center;
    background-color: ${props => props.colors.background};
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

const StatusText = styled.Text<{ colors: any }>`
    font-size: 18px;
    font-weight: bold;
    color: ${props => props.colors.text};
    margin-bottom: 8px;
`;

const BuchudaTag = styled.Text<{ colors: any }>`
    font-size: 16px;
    color: ${props => props.colors.success};
    font-weight: bold;
    margin-bottom: 8px;
`;

const WinnerInfo = styled.View<{ colors: any }>`
    flex-direction: row;
    align-items: center;
    background-color: ${props => props.colors.secondary};
    padding: 12px 16px;
    border-radius: 8px;
    margin-top: 8px;
`;

const WinnerText = styled.Text<{ colors: any }>`
    font-size: 16px;
    color: ${props => props.colors.text};
    margin-right: 12px;
`;

const RoundWinnerText = styled.Text<{ colors: any }>`
    color: ${props => props.colors.textSecondary};
    font-size: 14px;
`;

const TeamContainer = styled.View<{ winner?: boolean, colors: any }>`
    flex: 1;
    align-items: center;
    background-color: ${props => props.winner ? props.colors.secondary : 'transparent'};
    padding: ${props => props.winner ? '16px' : '0px'};
    border-radius: ${props => props.winner ? '8px' : '0px'};
    border: ${props => props.winner ? `2px solid ${props.colors.primary}` : 'none'};
`;

const ScoreContainer = styled.View`
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 32px;
`;

const TeamTitle = styled.Text<{ colors: any }>`
    font-size: 20px;
    font-weight: bold;
    color: ${props => props.colors.text};
    margin-bottom: 16px;
`;

const PlayerName = styled.Text<{ colors: any }>`
    font-size: 16px;
    color: ${props => props.colors.textSecondary};
    margin-bottom: 8px;
`;

const Score = styled.Text<{ colors: any }>`
    font-size: 48px;
    font-weight: bold;
    color: ${props => props.colors.text};
    margin-top: 16px;
`;

const Versus = styled.Text<{ colors: any }>`
    font-size: 24px;
    font-weight: bold;
    color: ${props => props.colors.textSecondary};
    margin-horizontal: 16px;
`;

const ActionButton = styled.TouchableOpacity<{ variant?: 'start' | 'register', colors: any }>`
    background-color: ${props => props.variant === 'start' ? props.colors.success : props.colors.primary};
    padding: 16px;
    border-radius: 8px;
    align-items: center;
    justify-content: center;
    margin-top: 24px;
`;

const ActionButtonText = styled.Text<{ colors: any }>`
    color: ${props => props.colors.white};
    font-size: 16px;
    font-weight: bold;
`;

const SectionTitle = styled.Text<{ colors: any }>`
    font-size: 18px;
    font-weight: bold;
    color: ${props => props.colors.text};
    margin-top: 32px;
    margin-bottom: 16px;
`;

const RoundCard = styled.View<{ colors: any }>`
    background-color: ${props => props.colors.surface};
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

const VictoryTypeTag = styled.Text<{ colors: any }>`
    color: ${props => props.colors.primary};
    font-size: 14px;
    font-weight: bold;
    padding: 4px 8px;
    background-color: ${props => `${props.colors.primaryLight}20`};
    border-radius: 4px;
`;

const PointsTag = styled.Text<{ colors: any }>`
    color: ${props => props.colors.success};
    font-size: 14px;
    font-weight: bold;
    margin-left: 8px;
`;

const BonusTag = styled.Text<{ colors: any }>`
    color: ${props => props.colors.warning};
    font-size: 14px;
    font-weight: bold;
    margin-left: 8px;
    padding: 4px 8px;
    background-color: ${props => props.colors.surface};
    border-radius: 4px;
    border: 1px solid ${props => props.colors.warning};
`;
