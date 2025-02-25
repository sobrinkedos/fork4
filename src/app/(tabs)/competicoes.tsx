import { View, ScrollView, TouchableOpacity, ActivityIndicator, FlatList, Modal } from "react-native"
import styled from "styled-components/native"
import { colors } from "@/styles/colors"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { SlideTransition } from "@/components/Transitions"
import { Header } from "@/components/Header"
import { useCallback, useEffect, useState, useFocusEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Competition, competitionService } from "@/services/competitionService"
import { useRouter } from 'expo-router'

const Container = styled.View`
  flex: 1;
  background-color: ${colors.backgroundDark};
`;

const ScrollContent = styled.ScrollView.attrs({
  contentContainerStyle: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 80,
  },
})`
  flex: 1;
`;

const CompetitionCard = styled.TouchableOpacity`
  background-color: ${colors.secondary};
  border-radius: 8px;
  margin-bottom: 16px;
  padding: 16px;
`;

const CompetitionHeader = styled.View`
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
`;

const CompetitionInfo = styled.View`
  flex: 1;
  margin-right: 12px;
`;

const CompetitionName = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: ${colors.gray100};
  margin-bottom: 32px;
`;

const CompetitionDescription = styled.Text`
  font-size: 14px;
  color: ${colors.gray300};
  margin-bottom: 16px;
`;

const CompetitionStatus = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 12px;
`;

const StatusText = styled.Text`
  font-size: 14px;
  font-weight: 500;
`;

const CompetitionStats = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
`;

const StatContainer = styled.View`
  flex-direction: row;
  align-items: center;
`;

const StatText = styled.Text`
  color: ${colors.gray300};
  font-size: 14px;
  margin-left: 6px;
`;

const SectionTitle = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: ${colors.gray100};
  margin-bottom: 16px;
`;

const ProgressBarContainer = styled.View`
  height: 4px;
  background-color: ${colors.gray700};
  border-radius: 2px;
  overflow: hidden;
  margin: 8px 0;
`;

const ProgressBarFill = styled.View<{ width: string; status: string }>`
  height: 100%;
  width: ${props => props.width};
  background-color: ${props => {
    switch (props.status) {
      case 'finished':
        return colors.success;
      case 'in_progress':
        return colors.primary;
      default:
        return colors.warning;
    }
  }};
`;

const LoadingContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const EmptyText = styled.Text`
  color: ${colors.gray300};
  font-size: 16px;
  text-align: center;
`;

const Content = styled.View`
  flex: 1;
`;

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return colors.warning;
    case 'in_progress':
      return colors.success;
    case 'finished':
      return colors.primary;
    default:
      return colors.textSecondary;
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'pending':
      return 'Pendente';
    case 'in_progress':
      return 'Em Andamento';
    case 'finished':
      return 'Finalizado';
    default:
      return 'Desconhecido';
  }
}

const handleCardPress = (competition: Competition, router: any, communityId: string) => {
  router.push(`/comunidade/${communityId}/competicao/${competition.id}`);
};

export default function Competicoes() {
  const [competitions, setCompetitions] = useState<{
    created: Competition[],
    organized: Competition[]
  }>({ created: [], organized: [] })
  const [competitionStats, setCompetitionStats] = useState<{[key: string]: { totalPlayers: number, totalGames: number }}>({});
  const [loading, setLoading] = useState(true);
  const router = useRouter()

  useEffect(() => {
    loadCompetitions()
  }, [])

  const loadCompetitions = async () => {
    try {
      setLoading(true);
      const comps = await competitionService.listMyCompetitions();

      // Busca estatísticas para cada competição
      const stats: {[key: string]: { totalPlayers: number, totalGames: number }} = {};
      
      const allCompetitions = [...comps.created, ...comps.organized];
      for (const comp of allCompetitions) {
        const { data: members } = await supabase
          .from('competition_members')
          .select('id')
          .eq('competition_id', comp.id);

        const { data: games } = await supabase
          .from('games')
          .select('id')
          .eq('competition_id', comp.id);

        stats[comp.id] = {
          totalPlayers: members?.length || 0,
          totalGames: games?.length || 0
        };
      }

      setCompetitionStats(stats);
      setCompetitions(comps);
    } catch (error) {
      console.error('Erro ao carregar competições:', error);
      if (error instanceof Error) {
        console.error('Detalhes do erro:', error.message);
        console.error('Stack trace:', error.stack);
      } else {
        console.error('Erro desconhecido:', error);
      }
    } finally {
      setLoading(false);
    }
  }

  const renderCompetitionCard = (competition: Competition) => (
    <CompetitionCard
      key={competition.id}
      onPress={() => handleCardPress(competition, router, competition.community_id)}
    >
      <CompetitionHeader>
        <CompetitionInfo>
          <CompetitionName>{competition.name}</CompetitionName>
          {competition.description && (
            <CompetitionDescription>{competition.description}</CompetitionDescription>
          )}
          <CompetitionStatus>
            <StatusText style={{ color: getStatusColor(competition.status) }}>
              {getStatusText(competition.status)}
            </StatusText>
          </CompetitionStatus>
        </CompetitionInfo>
        <MaterialCommunityIcons
          name="chevron-right"
          size={24}
          color={colors.text}
        />
      </CompetitionHeader>

      <ProgressBarContainer>
        <ProgressBarFill 
          width={competition.status === 'finished' ? '100%' : competition.status === 'in_progress' ? '50%' : '0%'} 
          status={competition.status}
        />
      </ProgressBarContainer>

      <CompetitionStats>
        <StatContainer>
          <MaterialCommunityIcons name="account-group" size={16} color={colors.gray300} />
          <StatText>{competitionStats[competition.id]?.totalPlayers || 0} jogadores</StatText>
        </StatContainer>
        <StatContainer>
          <MaterialCommunityIcons name="gamepad-variant" size={16} color={colors.gray300} />
          <StatText>{competitionStats[competition.id]?.totalGames || 0} jogos</StatText>
        </StatContainer>
      </CompetitionStats>
    </CompetitionCard>
  );

  return (
    <Container>
      <Header title="COMPETIÇÕES" />
      <Content>
        {loading ? (
          <LoadingContainer>
            <ActivityIndicator size="large" color={colors.primary} />
          </LoadingContainer>
        ) : (
          <ScrollContent>
            <SectionTitle>Minhas Competições</SectionTitle>
            {competitions.created.length === 0 ? (
              <EmptyText>Você ainda não criou nenhuma competição</EmptyText>
            ) : (
              competitions.created.map(renderCompetitionCard)
            )}

            {competitions.organized.length > 0 && (
              <>
                <SectionTitle style={{ marginTop: 24 }}>Competições que Organizo</SectionTitle>
                {competitions.organized.map(renderCompetitionCard)}
              </>
            )}
          </ScrollContent>
        )}
      </Content>
    </Container>
  );
}