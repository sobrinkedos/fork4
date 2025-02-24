import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import styled from 'styled-components/native';
import { colors } from '@/styles/colors';
import { rankingService, PlayerRanking, PairRanking } from '@/services/rankingService';

const Container = styled.View`
  flex: 1;
  background-color: ${colors.background};
  padding: 16px;
`;

const Title = styled.Text`
  font-size: 24px;
  font-weight: bold;
  color: ${colors.text};
  margin-bottom: 16px;
`;

const SectionTitle = styled.Text`
  font-size: 20px;
  font-weight: bold;
  color: ${colors.text};
  margin-top: 24px;
  margin-bottom: 12px;
`;

const RankingCard = styled.View`
  background-color: ${colors.card};
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
`;

const RankingText = styled.Text`
  color: ${colors.text};
  font-size: 16px;
  margin-bottom: 4px;
`;

const StatsContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-top: 4px;
`;

const StatItem = styled.View`
  align-items: center;
`;

const StatLabel = styled.Text`
  color: ${colors.textSecondary};
  font-size: 12px;
`;

const StatValue = styled.Text`
  color: ${colors.text};
  font-size: 14px;
  font-weight: bold;
`;

export default function CommunityRanking() {
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState<PlayerRanking[]>([]);
  const [pairs, setPairs] = useState<PairRanking[]>([]);

  useEffect(() => {
    loadRankings();
  }, []);

  const loadRankings = async () => {
    try {
      setLoading(true);
      const communityId = params.id as string;
      const [playersData, pairsData] = await Promise.all([
        rankingService.getTopPlayers(communityId),
        rankingService.getTopPairs(communityId)
      ]);
      setPlayers(playersData);
      setPairs(pairsData);
    } catch (error) {
      console.error('Error loading rankings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <ActivityIndicator size="large" color={colors.primary} />
      </Container>
    );
  }

  return (
    <ScrollView>
      <Container>
        <Title>Classificação da Comunidade</Title>

        <SectionTitle>Jogadores</SectionTitle>
        {players.map((player, index) => (
          <RankingCard key={player.id}>
            <RankingText>{`${index + 1}. ${player.name}`}</RankingText>
            <StatsContainer>
              <StatItem>
                <StatValue>{player.wins}</StatValue>
                <StatLabel>Vitórias</StatLabel>
              </StatItem>
              <StatItem>
                <StatValue>{player.totalGames}</StatValue>
                <StatLabel>Jogos</StatLabel>
              </StatItem>
              <StatItem>
                <StatValue>{player.buchudas}</StatValue>
                <StatLabel>Buchudas</StatLabel>
              </StatItem>
              <StatItem>
                <StatValue>{player.buchudasDeRe}</StatValue>
                <StatLabel>Buchudas de Ré</StatLabel>
              </StatItem>
              <StatItem>
                <StatValue>{`${player.winRate.toFixed(1)}%`}</StatValue>
                <StatLabel>Taxa de Vitória</StatLabel>
              </StatItem>
            </StatsContainer>
          </RankingCard>
        ))}

        <SectionTitle>Duplas</SectionTitle>
        {pairs.map((pair, index) => (
          <RankingCard key={pair.id}>
            <RankingText>
              {`${index + 1}. ${pair.player1.name} & ${pair.player2.name}`}
            </RankingText>
            <StatsContainer>
              <StatItem>
                <StatValue>{pair.wins}</StatValue>
                <StatLabel>Vitórias</StatLabel>
              </StatItem>
              <StatItem>
                <StatValue>{pair.totalGames}</StatValue>
                <StatLabel>Jogos</StatLabel>
              </StatItem>
              <StatItem>
                <StatValue>{pair.buchudas}</StatValue>
                <StatLabel>Buchudas</StatLabel>
              </StatItem>
              <StatItem>
                <StatValue>{pair.buchudasDeRe}</StatValue>
                <StatLabel>Buchudas de Ré</StatLabel>
              </StatItem>
              <StatItem>
                <StatValue>{`${pair.winRate.toFixed(1)}%`}</StatValue>
                <StatLabel>Taxa de Vitória</StatLabel>
              </StatItem>
            </StatsContainer>
          </RankingCard>
        ))}
      </Container>
    </ScrollView>
  );
}