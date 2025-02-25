import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { Link, useRouter } from 'expo-router';
import styled from 'styled-components/native';
import { colors } from '@/styles/colors';
import { GameWithDetails, gamesService } from '@/services/gamesService';
import { Feather } from '@expo/vector-icons';
import { formatDate } from '@/utils/date';

export default function GamesPage() {
    const router = useRouter();
    const [games, setGames] = useState<GameWithDetails[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadGames();
    }, []);

    const loadGames = async () => {
        try {
            setLoading(true);
            const games = await gamesService.getUserGames();
            setGames(games);
        } catch (error) {
            console.error('Erro ao carregar jogos:', error);
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
            <PageHeader>
                <BackButton onPress={() => router.back()}>
                    <Feather name="arrow-left" size={24} color={colors.gray100} />
                </BackButton>
                <HeaderTitle>Meus Jogos</HeaderTitle>
            </PageHeader>

            <ScrollView>
                <ContentContainer>
                    {games.map((game) => (
                        <GameCard key={game.id}>
                            <CommunityName>{game.competition.community.name}</CommunityName>
                            <CompetitionName>{game.competition.name}</CompetitionName>
                            
                            <TeamsContainer>
                                <TeamContainer>
                                    <TeamScore winner={game.team1_score > game.team2_score}>
                                        {game.team1_score}
                                    </TeamScore>
                                    <TeamPlayers>
                                        {game.team1_players.map(player => player.name).join(' & ')}
                                    </TeamPlayers>
                                </TeamContainer>

                                <VsText>vs</VsText>

                                <TeamContainer>
                                    <TeamScore winner={game.team2_score > game.team1_score}>
                                        {game.team2_score}
                                    </TeamScore>
                                    <TeamPlayers>
                                        {game.team2_players.map(player => player.name).join(' & ')}
                                    </TeamPlayers>
                                </TeamContainer>
                            </TeamsContainer>

                            <GameDetails>
                                {game.is_buchuda && (
                                    <GameBadge>
                                        <Feather name="star" size={12} color={colors.yellow500} />
                                        <BadgeText>Buchuda</BadgeText>
                                    </GameBadge>
                                )}
                                {game.is_buchuda_de_re && (
                                    <GameBadge>
                                        <Feather name="star" size={12} color={colors.yellow500} />
                                        <BadgeText>Buchuda de Ré</BadgeText>
                                    </GameBadge>
                                )}
                                <GameDate>{formatDate(game.created_at)}</GameDate>
                            </GameDetails>
                        </GameCard>
                    ))}
                </ContentContainer>
            </ScrollView>
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

const PageHeader = styled.View`
    flex-direction: row;
    align-items: center;
    padding: 16px 24px;
    padding-top: 60px;
    background-color: ${colors.backgroundDark};
`;

const BackButton = styled.TouchableOpacity`
    padding: 8px;
    margin-right: 16px;
`;

const HeaderTitle = styled.Text`
    color: ${colors.gray100};
    font-size: 24px;
    font-weight: bold;
`;

const ContentContainer = styled.View`
    padding: 16px;
`;

const GameCard = styled.View`
    background-color: ${colors.gray800};
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 12px;
`;

const CommunityName = styled.Text`
    font-size: 14px;
    color: ${colors.gray300};
    margin-bottom: 4px;
`;

const CompetitionName = styled.Text`
    font-size: 16px;
    font-weight: bold;
    color: ${colors.gray100};
    margin-bottom: 12px;
`;

const TeamsContainer = styled.View`
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
`;

const TeamContainer = styled.View`
    flex: 1;
    align-items: center;
`;

const TeamScore = styled.Text<{ winner: boolean }>`
    font-size: 24px;
    font-weight: bold;
    color: ${props => props.winner ? colors.primary : colors.gray300};
    margin-bottom: 4px;
`;

const TeamPlayers = styled.Text`
    font-size: 14px;
    color: ${colors.gray300};
    text-align: center;
`;

const VsText = styled.Text`
    font-size: 14px;
    color: ${colors.gray300};
    margin: 0 12px;
`;

const GameDetails = styled.View`
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    flex-wrap: wrap;
    gap: 8px;
`;

const GameBadge = styled.View`
    flex-direction: row;
    align-items: center;
    background-color: ${colors.gray700};
    padding: 4px 8px;
    border-radius: 4px;
    gap: 4px;
`;

const BadgeText = styled.Text`
    font-size: 12px;
    color: ${colors.gray300};
`;

const GameDate = styled.Text`
    font-size: 12px;
    color: ${colors.gray300};
    margin-left: auto;
`;
