import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import styled from 'styled-components/native';
import { colors } from '@/styles/colors';
import { Header } from '@/components/Header';
import { PageTransition } from '@/components/Transitions';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { rankingService, PairRanking } from '@/services/rankingService';

const Container = styled.View`
    flex: 1;
    background-color: ${colors.backgroundDark};
`;

const Content = styled.View`
    flex: 1;
    padding: 20px;
`;

const PairCard = styled.View`
    background-color: ${colors.backgroundMedium};
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 12px;
`;

const Position = styled.Text`
    color: ${colors.primary};
    font-size: 24px;
    font-weight: bold;
    min-width: 40px;
`;

const CardHeader = styled.View`
    flex-direction: column;
    margin-bottom: 12px;
`;

const PlayerInfo = styled.View`
    flex: 1;
    flex-direction: row;
    align-items: center;
`;

const PlayerName = styled.Text`
    color: ${colors.gray100};
    font-size: 16px;
    font-weight: bold;
    margin-left: 8px;
`;

const PlayerIcon = styled.View`
    width: 32px;
    height: 32px;
    border-radius: 16px;
    background-color: ${colors.primary}20;
    align-items: center;
    justify-content: center;
`;

const Separator = styled.View`
    width: 32px;
    align-items: center;
`;

const SeparatorText = styled.Text`
    color: ${colors.gray300};
    font-size: 14px;
`;

const StatsContainer = styled.View`
    flex-direction: row;
    justify-content: space-between;
    padding-top: 12px;
    border-top-width: 1px;
    border-top-color: ${colors.backgroundLight};
`;

const StatItem = styled.View`
    align-items: center;
`;

const StatValue = styled.Text`
    color: ${colors.primary};
    font-size: 16px;
    font-weight: bold;
`;

const StatLabel = styled.Text`
    color: ${colors.gray300};
    font-size: 12px;
`;

const LoadingContainer = styled.View`
    flex: 1;
    justify-content: center;
    align-items: center;
`;

const ErrorContainer = styled.View`
    flex: 1;
    justify-content: center;
    align-items: center;
`;

const ErrorText = styled.Text`
    color: ${colors.error};
    font-size: 16px;
    font-weight: bold;
`;

export default function TopDuplas() {
    const [pairs, setPairs] = useState<PairRanking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadPairs();
    }, []);

    const loadPairs = async () => {
        try {
            setLoading(true);
            const rankings = await rankingService.getTopPairs();
            setPairs(rankings);
            setError(null);
        } catch (error) {
            console.error('Erro ao carregar duplas:', error);
            setError('Não foi possível carregar o ranking de duplas');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Container>
                <Header title="Top Duplas" showBackButton />
                <LoadingContainer>
                    <ActivityIndicator size="large" color={colors.primary} />
                </LoadingContainer>
            </Container>
        );
    }

    if (error) {
        return (
            <Container>
                <Header title="Top Duplas" showBackButton />
                <ErrorContainer>
                    <ErrorText>{error}</ErrorText>
                </ErrorContainer>
            </Container>
        );
    }

    const renderPair = ({ item, index }: { item: PairRanking; index: number }) => (
        <PairCard>
            <CardHeader>
                <Position>{index + 1}º</Position>
                <PlayerInfo>
                    <PlayerIcon>
                        <MaterialCommunityIcons name="account" size={20} color={colors.primary} />
                    </PlayerIcon>
                    <PlayerName>{item.player1.name}</PlayerName>
                </PlayerInfo>
                <PlayerInfo>
                    <PlayerIcon>
                        <MaterialCommunityIcons name="account" size={20} color={colors.primary} />
                    </PlayerIcon>
                    <PlayerName>{item.player2.name}</PlayerName>
                </PlayerInfo>
            </CardHeader>
            <StatsContainer>
                <StatItem>
                    <StatValue>{item.winRate.toFixed(1)}%</StatValue>
                    <StatLabel>Taxa de{"\n"}Vitória</StatLabel>
                </StatItem>
                <StatItem>
                    <StatValue>{item.wins}</StatValue>
                    <StatLabel>Vitórias</StatLabel>
                </StatItem>
                <StatItem>
                    <StatValue>{item.totalGames}</StatValue>
                    <StatLabel>Total de{"\n"}Jogos</StatLabel>
                </StatItem>
                <StatItem>
                    <StatValue>{item.buchudas}</StatValue>
                    <StatLabel>Buchudas</StatLabel>
                </StatItem>
                <StatItem>
                    <StatValue>{item.buchudasDeRe}</StatValue>
                    <StatLabel>Buchudas{"\n"}de Ré</StatLabel>
                </StatItem>
            </StatsContainer>
        </PairCard>
    );

    return (
        <PageTransition>
            <Container>
                <Header title="Top Duplas" showBackButton />
                <Content>
                    <FlatList
                        data={pairs}
                        renderItem={renderPair}
                        keyExtractor={item => item.id}
                        showsVerticalScrollIndicator={false}
                    />
                </Content>
            </Container>
        </PageTransition>
    );
}
