import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import styled from 'styled-components/native';
import { colors } from '@/styles/colors';
import { CompetitionResult, competitionService } from '@/services/competitionService';

export default function CompetitionScores() {
    const router = useRouter();
    const { id: communityId, competitionId } = useLocalSearchParams();
    const [loading, setLoading] = useState(true);
    const [results, setResults] = useState<CompetitionResult | null>(null);

    const loadResults = useCallback(async () => {
        try {
            setLoading(true);
            const results = await competitionService.getCompetitionResults(competitionId as string);
            setResults(results);
        } catch (error) {
            console.error('Erro ao carregar resultados:', error);
            Alert.alert('Erro', 'Não foi possível carregar os resultados');
        } finally {
            setLoading(false);
        }
    }, [competitionId]);

    useEffect(() => {
        loadResults();
    }, [loadResults]);

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
                <HeaderTitle>Classificação</HeaderTitle>
            </Header>

            <MainContent>
                <ContentContainer>
                    <Section>
                        <SectionTitle>Classificação Individual</SectionTitle>
                        {results?.players.map((player, index) => (
                            <PlayerCard key={player.id}>
                                <Position>{index + 1}º</Position>
                                <PlayerInfo>
                                    <PlayerName>{player.name}</PlayerName>
                                    <PlayerStats>
                                        <StatItem>
                                            <StatLabel>Pontos:</StatLabel>
                                            <StatValue>{player.score}</StatValue>
                                        </StatItem>
                                        <StatItem>
                                            <StatLabel>V/D:</StatLabel>
                                            <StatValue>{player.wins}/{player.losses}</StatValue>
                                        </StatItem>
                                        <StatItem>
                                            <StatLabel>Buchudas dadas:</StatLabel>
                                            <StatValue>{player.buchudas}</StatValue>
                                        </StatItem>
                                        <StatItem>
                                            <StatLabel>Buchudas de Ré dadas:</StatLabel>
                                            <StatValue>{player.buchudasDeRe}</StatValue>
                                        </StatItem>
                                    </PlayerStats>
                                </PlayerInfo>
                            </PlayerCard>
                        ))}
                    </Section>

                    <Section>
                        <SectionTitle>Classificação por Duplas</SectionTitle>
                        {results?.pairs.map((pair, index) => (
                            <PairCard key={pair.players.join('_')}>
                                <Position>{index + 1}º</Position>
                                <PairInfo>
                                    <PairPlayers>
                                        {pair.players.map(playerId => {
                                            const player = results.players.find(p => p.id === playerId);
                                            return player?.name;
                                        }).join(' e ')}
                                    </PairPlayers>
                                    <PairStats>
                                        <StatItem>
                                            <StatLabel>Pontos:</StatLabel>
                                            <StatValue>{pair.score}</StatValue>
                                        </StatItem>
                                        <StatItem>
                                            <StatLabel>V/D:</StatLabel>
                                            <StatValue>{pair.wins}/{pair.losses}</StatValue>
                                        </StatItem>
                                        <StatItem>
                                            <StatLabel>Buchudas dadas:</StatLabel>
                                            <StatValue>{pair.buchudas}</StatValue>
                                        </StatItem>
                                        <StatItem>
                                            <StatLabel>Buchudas de Ré dadas:</StatLabel>
                                            <StatValue>{pair.buchudasDeRe}</StatValue>
                                        </StatItem>
                                    </PairStats>
                                </PairInfo>
                            </PairCard>
                        ))}
                    </Section>
                </ContentContainer>
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

const Header = styled.View`
    flex-direction: row;
    align-items: center;
    padding: 20px;
    background-color: ${colors.backgroundMedium};
`;

const BackButton = styled.TouchableOpacity`
    margin-right: 16px;
`;

const HeaderTitle = styled.Text`
    color: ${colors.gray100};
    font-size: 20px;
    font-weight: bold;
`;

const MainContent = styled.ScrollView`
    flex: 1;
    padding: 24px;
`;

const ContentContainer = styled.View`
    flex: 1;
`;

const Section = styled.View`
    margin-bottom: 24px;
`;

const SectionTitle = styled.Text`
    color: ${colors.gray100};
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 16px;
`;

const PlayerCard = styled.View`
    background-color: ${colors.backgroundMedium};
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 8px;
    flex-direction: row;
    align-items: center;
`;

const Position = styled.Text`
    font-size: 24px;
    font-weight: bold;
    color: ${colors.primary};
    margin-right: 16px;
`;

const PlayerInfo = styled.View`
    flex: 1;
`;

const PlayerName = styled.Text`
    color: ${colors.gray100};
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 4px;
`;

const PlayerStats = styled.View`
    flex-direction: row;
    flex-wrap: wrap;
`;

const StatItem = styled.View`
    flex-direction: row;
    align-items: center;
    margin-right: 16px;
    margin-top: 4px;
`;

const StatLabel = styled.Text`
    color: ${colors.gray300};
    font-size: 14px;
    margin-right: 4px;
`;

const StatValue = styled.Text`
    color: ${colors.gray100};
    font-size: 14px;
    font-weight: bold;
`;

const PairCard = styled(PlayerCard)``;

const PairInfo = styled(PlayerInfo)``;

const PairPlayers = styled(PlayerName)``;

const PairStats = styled(PlayerStats)``;
