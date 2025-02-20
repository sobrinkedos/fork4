import React, { useState, useEffect } from 'react';
import {
    View,
    TouchableOpacity,
    Alert,
    ScrollView,
    ActivityIndicator
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import styled from 'styled-components/native';
import { colors } from '@/styles/colors';
import { Feather } from '@expo/vector-icons';
import { gameService, VictoryType } from '@/services/gameService';
import { competitionService } from '@/services/competitionService';

interface VictoryOption {
    type: VictoryType;
    label: string;
    points: number;
    description: string;
}

interface Player {
    id: string;
    name: string;
}

const victoryOptions: VictoryOption[] = [
    {
        type: 'simple',
        label: 'Vitória Simples',
        points: 1,
        description: 'Vitória normal (1 ponto)'
    },
    {
        type: 'carroca',
        label: 'Vitória de Carroça',
        points: 2,
        description: 'Vitória com carroça (2 pontos)'
    },
    {
        type: 'la_e_lo',
        label: 'Vitória de Lá-e-lô',
        points: 3,
        description: 'Vitória de lá-e-lô (3 pontos)'
    },
    {
        type: 'cruzada',
        label: 'Vitória de Cruzada',
        points: 4,
        description: 'Vitória de cruzada (4 pontos)'
    },
    {
        type: 'contagem',
        label: 'Vitória por Contagem',
        points: 1,
        description: 'Vitória por contagem de pontos (1 ponto)'
    },
    {
        type: 'empate',
        label: 'Empate',
        points: 0,
        description: 'Empate (0 pontos + 1 ponto bônus na próxima)'
    }
];

export default function RegisterResult() {
    const router = useRouter();
    const { id: communityId, competitionId, gameId } = useLocalSearchParams();
    const [selectedType, setSelectedType] = useState<VictoryType | null>(null);
    const [winnerTeam, setWinnerTeam] = useState<'team1' | 'team2' | null>(null);
    const [loading, setLoading] = useState(false);
    const [team1Players, setTeam1Players] = useState<Player[]>([]);
    const [team2Players, setTeam2Players] = useState<Player[]>([]);

    useEffect(() => {
        loadPlayers();
    }, []);

    const loadPlayers = async () => {
        try {
            const game = await gameService.getById(gameId as string);
            if (!game) return;

            const team1 = await Promise.all([
                game.team1_player1_id && competitionService.getPlayerById(game.team1_player1_id),
                game.team1_player2_id && competitionService.getPlayerById(game.team1_player2_id)
            ].filter(Boolean));

            const team2 = await Promise.all([
                game.team2_player1_id && competitionService.getPlayerById(game.team2_player1_id),
                game.team2_player2_id && competitionService.getPlayerById(game.team2_player2_id)
            ].filter(Boolean));

            setTeam1Players(team1.filter(Boolean));
            setTeam2Players(team2.filter(Boolean));
        } catch (error) {
            console.error('Erro ao carregar jogadores:', error);
            Alert.alert('Erro', 'Não foi possível carregar os jogadores');
        }
    };

    const handleRegisterResult = async () => {
        if (!selectedType) {
            Alert.alert('Erro', 'Selecione o tipo de vitória');
            return;
        }

        if (selectedType !== 'empate' && !winnerTeam) {
            Alert.alert('Erro', 'Selecione o time vencedor');
            return;
        }

        try {
            setLoading(true);
            const winnerTeamNumber = winnerTeam === 'team1' ? 1 : winnerTeam === 'team2' ? 2 : null;
            const result = await gameService.registerRound(gameId as string, selectedType, winnerTeamNumber);
            
            if (result.status === 'finished') {
                let message = 'Jogo finalizado!';
                if (result.team1_score === 6 && result.team2_score === 0) {
                    message = 'BUCHUDA! 🎉\nTime 1 venceu sem que o adversário marcasse pontos!';
                } else if (result.team2_score === 6 && result.team1_score === 0) {
                    message = 'BUCHUDA! 🎉\nTime 2 venceu sem que o adversário marcasse pontos!';
                } else if (result.team1_was_losing_5_0) {
                    message = 'BUCHUDA DE RÉ! 🎉🔄\nIncrível virada do Time 1 após estar perdendo de 5x0!';
                } else if (result.team2_was_losing_5_0) {
                    message = 'BUCHUDA DE RÉ! 🎉🔄\nIncrível virada do Time 2 após estar perdendo de 5x0!';
                }
                Alert.alert('Parabéns!', message, [
                    { 
                        text: 'OK', 
                        onPress: () => {
                            router.back();
                        }
                    }
                ]);
            } else {
                router.back();
            }
        } catch (error) {
            console.error('Erro ao registrar resultado:', error);
            Alert.alert('Erro', 'Não foi possível registrar o resultado');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <LoadingContainer>
                <ActivityIndicator size="large" color={colors.primary} />
            </LoadingContainer>
        );
    }

    return (
        <Container>
            <Header>
                <BackButton onPress={() => router.back()}>
                    <Feather name="arrow-left" size={24} color={colors.gray100} />
                </BackButton>
                <HeaderTitle>Registrar Resultado</HeaderTitle>
            </Header>

            <MainContent 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 32 }}
            >
                <SectionTitle>Tipo de Vitória</SectionTitle>

                {victoryOptions.map(option => (
                    <VictoryOption
                        key={option.type}
                        onPress={() => {
                            setSelectedType(option.type);
                            if (option.type === 'empate') {
                                setWinnerTeam(null);
                            }
                        }}
                        selected={selectedType === option.type}
                    >
                        <VictoryOptionContent>
                            <VictoryTitle>{option.label}</VictoryTitle>
                            <VictoryDescription>{option.description}</VictoryDescription>
                        </VictoryOptionContent>
                        {selectedType === option.type && (
                            <Feather name="check" size={24} color={colors.primary} />
                        )}
                    </VictoryOption>
                ))}

                {selectedType && selectedType !== 'empate' && (
                    <>
                        <SectionTitle>Time Vencedor</SectionTitle>
                        <TeamOptions>
                            <TeamOption
                                selected={winnerTeam === 'team1'}
                                onPress={() => setWinnerTeam('team1')}
                            >
                                <TeamOptionContent>
                                    {team1Players.map((player, index) => (
                                        <TeamOptionText key={player.id}>
                                            {player.name}
                                            {index < team1Players.length - 1 ? ' e ' : ''}
                                        </TeamOptionText>
                                    ))}
                                </TeamOptionContent>
                            </TeamOption>

                            <TeamOption
                                selected={winnerTeam === 'team2'}
                                onPress={() => setWinnerTeam('team2')}
                            >
                                <TeamOptionContent>
                                    {team2Players.map((player, index) => (
                                        <TeamOptionText key={player.id}>
                                            {player.name}
                                            {index < team2Players.length - 1 ? ' e ' : ''}
                                        </TeamOptionText>
                                    ))}
                                </TeamOptionContent>
                            </TeamOption>
                        </TeamOptions>
                    </>
                )}

                <RegisterButton onPress={handleRegisterResult}>
                    <RegisterButtonText>Registrar Resultado</RegisterButtonText>
                </RegisterButton>
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
    align-items: center;
    justify-content: center;
    background-color: ${colors.backgroundDark};
`;

const Header = styled.View`
    padding: 16px;
    padding-top: 60px;
    background-color: ${colors.backgroundMedium};
    border-bottom-width: 1px;
    border-bottom-color: ${colors.border};
    flex-direction: row;
    align-items: center;
`;

const BackButton = styled.TouchableOpacity`
    margin-right: 16px;
`;

const HeaderTitle = styled.Text`
    color: ${colors.textPrimary};
    font-size: 24px;
    font-weight: bold;
`;

const MainContent = styled.ScrollView`
    flex: 1;
    padding: 16px;
`;

const SectionTitle = styled.Text`
    color: ${colors.textPrimary};
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 16px;
    margin-top: 24px;
`;

const VictoryOption = styled.TouchableOpacity<{ selected: boolean }>`
    background-color: ${colors.backgroundMedium};
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 8px;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    border: 1px solid ${props => props.selected ? colors.primary : colors.border};
`;

const VictoryOptionContent = styled.View`
    flex: 1;
    margin-right: 16px;
`;

const VictoryTitle = styled.Text`
    color: ${colors.textPrimary};
    font-size: 16px;
    font-weight: bold;
`;

const VictoryDescription = styled.Text`
    color: ${colors.textSecondary};
    font-size: 14px;
    margin-top: 4px;
`;

const TeamOptions = styled.View`
    flex-direction: row;
    margin-horizontal: -4px;
`;

const TeamOption = styled.TouchableOpacity<{ selected: boolean }>`
    flex: 1;
    background-color: ${colors.backgroundMedium};
    border-radius: 8px;
    padding: 16px;
    margin-horizontal: 4px;
    align-items: center;
    border: 1px solid ${props => props.selected ? colors.primary : colors.border};
`;

const TeamOptionContent = styled.View`
    align-items: center;
    justify-content: center;
`;

const TeamOptionText = styled.Text`
    color: ${colors.textPrimary};
    font-size: 16px;
    text-align: center;
`;

const RegisterButton = styled.TouchableOpacity`
    background-color: ${colors.primary};
    padding: 16px;
    border-radius: 8px;
    align-items: center;
    margin-top: 24px;
    margin-bottom: 24px;
`;

const RegisterButtonText = styled.Text`
    color: ${colors.textPrimary};
    font-size: 16px;
    font-weight: bold;
`;
