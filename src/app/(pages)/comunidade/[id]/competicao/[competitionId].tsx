import React, { useEffect, useState, useCallback } from 'react';
import { Alert, Modal, TouchableOpacity, ActivityIndicator, Text, View, FlatList, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import styled from 'styled-components/native';
import { useTheme } from '@/contexts/ThemeProvider';
import { Feather } from '@expo/vector-icons';
import { competitionService } from '@/services/competitionService';
import { communityMembersService } from '@/services/communityMembersService';
import { gameService, Game } from '@/services/gameService';
import { playerService } from '@/services/playerService';
import { InternalHeader } from '@/components/InternalHeader';

interface Competition {
    id: string;
    name: string;
    description: string;
    status: string;
}

interface CompetitionMember {
    id: string;
    player_id: string;
    players: {
        id: string;
        name: string;
    };
}

interface Member {
    id: string;
    player_id: string;
    players: {
        id: string;
        name: string;
    };
}

interface CompetitionResult {
    players: {
        id: string;
        name: string;
        score: number;
        wins: number;
        losses: number;
        buchudas: number;
        buchudasDeRe: number;
    }[];
    pairs: {
        players: string[];
        score: number;
        wins: number;
        losses: number;
        buchudas: number;
        buchudasDeRe: number;
    }[];
}

export default function CompetitionDetails() {
    const router = useRouter();
    const { id: communityId, competitionId } = useLocalSearchParams();
    const { colors } = useTheme();
    const [competition, setCompetition] = useState<Competition | null>(null);
    const [games, setGames] = useState<(Game & { 
        team1_players?: { id: string; name: string; }[];
        team2_players?: { id: string; name: string; }[];
    })[]>([]);
    const [members, setMembers] = useState<Member[]>([]);
    const [communityMembers, setCommunityMembers] = useState<Member[]>([]);
    const [isAddMemberModalVisible, setIsAddMemberModalVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [canFinish, setCanFinish] = useState(false);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<CompetitionResult | null>(null);
    const [expandedGames, setExpandedGames] = useState(false);
    const [isGamesModalVisible, setIsGamesModalVisible] = useState(false);

    useFocusEffect(
        useCallback(() => {
            const fetchData = async () => {
                try {
                    setIsLoading(true);
                    console.log('Buscando competição com ID:', competitionId);
                    
                    // Verificar se o ID da competição é válido
                    if (!competitionId || typeof competitionId !== 'string') {
                        console.error('ID da competição inválido:', competitionId);
                        setCompetition(null);
                        setIsLoading(false);
                        return;
                    }
                    
                    const [competitionData, gamesData, membersData, communityMembersData] = await Promise.all([
                        competitionService.getById(competitionId as string),
                        gameService.listByCompetition(competitionId as string),
                        playerService.listCompetitionMembers(competitionId as string),
                        communityMembersService.listMembers(communityId as string)
                    ]);

                    console.log('Dados da competição recebidos:', competitionData);
                    
                    setCompetition(competitionData);
                    setGames(gamesData || []);
                    setMembers(membersData || []);
                    setCommunityMembers(communityMembersData || []);
                } catch (error) {
                    console.error('Error fetching data:', error);
                    Alert.alert('Erro', 'Falha ao carregar dados da competição');
                } finally {
                    setIsLoading(false);
                }
            };

            fetchData();
        }, [competitionId, communityId])
    );

    const handleDeleteGame = async (gameId: string) => {
        try {
            await gameService.deleteGame(gameId);
            const updatedGames = await gameService.listByCompetition(competitionId as string);
            setGames(updatedGames || []);
        } catch (error) {
            console.error('Error deleting game:', error);
            Alert.alert('Erro', 'Falha ao deletar o jogo');
        }
    };

    const confirmDeleteGame = (gameId: string) => {
        Alert.alert(
            'Confirmar exclusão',
            'Tem certeza que deseja excluir este jogo?',
            [
                { text: 'Cancelar', style: 'cancel' },
                { 
                    text: 'Excluir', 
                    style: 'destructive',
                    onPress: () => handleDeleteGame(gameId)
                }
            ]
        );
    };

    return (
        <Container colors={colors}>
            <InternalHeader title="Detalhes da Competição" />
            
            {isLoading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <ContentContainer>
                    {competition ? (
                        <ScrollView>
                            <View style={{ marginBottom: 20 }}>
                                <Text style={{ fontSize: 24, color: colors.gray100, marginBottom: 10 }}>
                                    {competition.name}
                                </Text>
                                <Text style={{ fontSize: 16, color: colors.gray300 }}>
                                    {competition.description || 'Sem descrição'}
                                </Text>
                            </View>

                            <View style={{ marginBottom: 20 }}>
                                <Text style={{ fontSize: 20, color: colors.gray100, marginBottom: 10 }}>
                                    Jogos
                                </Text>
                                {games.length > 0 ? (
                                    games.map((game) => (
                                        <GameCard key={game.id}>
                                            <GameTeams>
                                                <TeamScore>
                                                    <Score colors={colors}>{game.team1_score}</Score>
                                                    <TeamName colors={colors}>
                                                        {game.team1.join(' & ')}
                                                    </TeamName>
                                                </TeamScore>

                                                <Versus colors={colors}>vs</Versus>

                                                <TeamScore>
                                                    <Score colors={colors}>{game.team2_score}</Score>
                                                    <TeamName colors={colors}>
                                                        {game.team2.join(' & ')}
                                                    </TeamName>
                                                </TeamScore>
                                            </GameTeams>

                                            <GameStatus colors={colors}>
                                                {game.status === 'pending' ? 'Pendente' :
                                                 game.status === 'in_progress' ? 'Em andamento' : 'Finalizado'}
                                            </GameStatus>

                                            {game.status === 'pending' && (
                                                <DeleteGameButton
                                                    colors={colors}
                                                    onPress={() => confirmDeleteGame(game.id)}
                                                >
                                                    <Feather name="trash-2" size={16} color={colors.error} />
                                                </DeleteGameButton>
                                            )}
                                        </GameCard>
                                    ))
                                ) : (
                                    <EmptyContainer>
                                        <EmptyText colors={colors}>Nenhum jogo registrado</EmptyText>
                                        <EmptyDescription colors={colors}>
                                            Crie um novo jogo para começar
                                        </EmptyDescription>
                                    </EmptyContainer>
                                )}
                            </View>
                        </ScrollView>
                    ) : (
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ fontSize: 18, color: colors.gray100, marginBottom: 10 }}>
                                Competição não encontrada
                            </Text>
                            <Text style={{ fontSize: 14, color: colors.gray300, textAlign: 'center', marginHorizontal: 20 }}>
                                A competição que você está procurando não existe ou foi removida.
                            </Text>
                            <TouchableOpacity 
                                style={{ 
                                    marginTop: 20,
                                    padding: 10,
                                    backgroundColor: colors.primary,
                                    borderRadius: 8
                                }}
                                onPress={() => router.back()}
                            >
                                <Text style={{ color: colors.white }}>
                                    Voltar
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </ContentContainer>
            )}
        </Container>
    );
}

// Styled Components
const Container = styled.View`
    flex: 1;
    background-color: ${props => props.colors.backgroundDark};
`;

const ContentContainer = styled.View`
    flex: 1;
    padding: 16px;
`;

const GamesModalContainer = styled.View`
    flex: 1;
    background-color: ${props => props.colors.backgroundDark};
`;

const MemberModalContainer = styled.View`
    flex: 1;
    background-color: ${props => props.colors.backgroundDark};
`;

const ModalHeader = styled.View`
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 20px;
    background-color: ${props => props.colors.backgroundMedium};
`;

const ModalBody = styled.View`
    flex: 1;
    padding: 16px;
`;

const ModalContent = styled.View`
    flex: 1;
`;

const ModalGameCard = styled(TouchableOpacity)`
    background-color: ${props => props.colors.backgroundMedium};
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 16px;
`;

const GamesList = styled.FlatList`
    flex: 1;
`;

const GameCard = styled.TouchableOpacity`
    background-color: ${props => props.colors.backgroundMedium};
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 16px;
    position: relative;
`;

const GameTeams = styled.View`
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
`;

const TeamScore = styled.View`
    flex: 1;
    align-items: center;
`;

const Score = styled.Text`
    color: ${props => props.colors.gray100};
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 8px;
`;

const TeamName = styled.Text`
    color: ${props => props.colors.gray300};
    font-size: 14px;
    text-align: center;
`;

const Versus = styled.Text`
    color: ${props => props.colors.gray300};
    font-size: 16px;
    margin: 0 16px;
`;

const GameStatus = styled.Text`
    color: ${props => props.colors.gray300};
    font-size: 12px;
    margin-top: 8px;
`;

const DeleteGameButton = styled.TouchableOpacity`
    position: absolute;
    top: 8px;
    right: 8px;
    padding: 6px;
    border-radius: 4px;
    background-color: ${props => props.colors.backgroundMedium};
`;

const EmptyContainer = styled.View`
    padding: 24px;
    align-items: center;
    justify-content: center;
`;

const EmptyText = styled.Text`
    color: ${props => props.colors.gray300};
    font-size: 16px;
    margin-bottom: 8px;
`;

const EmptyDescription = styled.Text`
    color: ${props => props.colors.gray300};
    font-size: 14px;
    text-align: center;
`;
