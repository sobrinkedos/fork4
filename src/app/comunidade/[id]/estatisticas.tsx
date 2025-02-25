import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import styled from 'styled-components/native';
import { colors } from '@/styles/colors';
import { Feather } from '@expo/vector-icons';
import { communityStatsService, CommunityStats } from '@/services/communityStatsService';

export default function CommunityStatsPage() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const [stats, setStats] = useState<CommunityStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            setLoading(true);
            const stats = await communityStatsService.getCommunityStats(id as string);
            setStats(stats);
        } catch (error) {
            console.error('Erro ao carregar estatísticas:', error);
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
                <HeaderTitle>Estatísticas</HeaderTitle>
            </PageHeader>

            <ScrollView>
                <ContentContainer>
                    <Section>
                        <SectionTitle>Jogadores</SectionTitle>
                        {stats?.players.map((player) => (
                            <StatCard key={player.id}>
                                <PlayerName>{player.name}</PlayerName>
                                <StatRow>
                                    <StatItem>
                                        <StatLabel>Vitórias</StatLabel>
                                        <StatValue>{player.wins}</StatValue>
                                    </StatItem>
                                    <StatItem>
                                        <StatLabel>Derrotas</StatLabel>
                                        <StatValue>{player.losses}</StatValue>
                                    </StatItem>
                                    <StatItem>
                                        <StatLabel>Pontos</StatLabel>
                                        <StatValue>{player.score}</StatValue>
                                    </StatItem>
                                </StatRow>
                                <StatRow>
                                    <StatItem>
                                        <StatLabel>Buchudas</StatLabel>
                                        <StatValue>+{player.buchudas_given} / -{player.buchudas_taken}</StatValue>
                                    </StatItem>
                                    <StatItem>
                                        <StatLabel>Buchudas de Ré</StatLabel>
                                        <StatValue>+{player.buchudas_de_re_given} / -{player.buchudas_de_re_taken}</StatValue>
                                    </StatItem>
                                </StatRow>
                            </StatCard>
                        ))}
                    </Section>

                    <Section>
                        <SectionTitle>Duplas</SectionTitle>
                        {stats?.pairs.map((pair, index) => (
                            <StatCard key={index}>
                                <PairNames>
                                    {pair.players.map((player) => player.name).join(' & ')}
                                </PairNames>
                                <StatRow>
                                    <StatItem>
                                        <StatLabel>Vitórias</StatLabel>
                                        <StatValue>{pair.wins}</StatValue>
                                    </StatItem>
                                    <StatItem>
                                        <StatLabel>Derrotas</StatLabel>
                                        <StatValue>{pair.losses}</StatValue>
                                    </StatItem>
                                    <StatItem>
                                        <StatLabel>Pontos</StatLabel>
                                        <StatValue>{pair.score}</StatValue>
                                    </StatItem>
                                </StatRow>
                                <StatRow>
                                    <StatItem>
                                        <StatLabel>Buchudas</StatLabel>
                                        <StatValue>+{pair.buchudas_given} / -{pair.buchudas_taken}</StatValue>
                                    </StatItem>
                                    <StatItem>
                                        <StatLabel>Buchudas de Ré</StatLabel>
                                        <StatValue>+{pair.buchudas_de_re_given} / -{pair.buchudas_de_re_taken}</StatValue>
                                    </StatItem>
                                </StatRow>
                            </StatCard>
                        ))}
                    </Section>
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
    padding: 24px;
    background-color: ${colors.backgroundDark};
    padding-top: 60px;
`;

const BackButton = styled.TouchableOpacity`
    margin-right: 16px;
`;

const HeaderTitle = styled.Text`
    font-size: 24px;
    font-weight: bold;
    color: ${colors.gray100};
`;

const ContentContainer = styled.View`
    padding: 16px;
`;

const Section = styled.View`
    margin-bottom: 24px;
`;

const SectionTitle = styled.Text`
    font-size: 20px;
    font-weight: bold;
    color: ${colors.gray100};
    margin-bottom: 16px;
`;

const StatCard = styled.View`
    background-color: ${colors.gray800};
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 12px;
`;

const PlayerName = styled.Text`
    font-size: 18px;
    font-weight: bold;
    color: ${colors.gray100};
    margin-bottom: 12px;
`;

const PairNames = styled.Text`
    font-size: 18px;
    font-weight: bold;
    color: ${colors.gray100};
    margin-bottom: 12px;
`;

const StatRow = styled.View`
    flex-direction: row;
    justify-content: space-between;
    margin-bottom: 8px;
`;

const StatItem = styled.View`
    align-items: center;
    flex: 1;
`;

const StatLabel = styled.Text`
    font-size: 14px;
    color: ${colors.gray300};
    margin-bottom: 4px;
`;

const StatValue = styled.Text`
    font-size: 16px;
    font-weight: bold;
    color: ${colors.gray100};
`;
