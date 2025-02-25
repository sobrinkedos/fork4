import { View, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native"
import styled from "styled-components/native"
import { colors } from "@/styles/colors"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { SlideTransition } from "@/components/Transitions"
import { FloatingButton } from "@/components/FloatingButton"
import { Header } from "@/components/Header"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Competition, competitionService } from "@/services/competitionService"
import { useRouter } from 'expo-router'

const Container = styled.View`
  flex: 1;
  background-color: ${colors.backgroundDark};
`

const ScrollContent = styled.ScrollView`
  flex: 1;
`

const Content = styled.View`
  flex: 1;
  padding: 16px;
  padding-bottom: 80px;
`

const CompetitionCard = styled.View`
  background-color: ${colors.backgroundLight};
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
`

const CompetitionName = styled.Text`
  color: ${colors.text};
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 8px;
`

const CompetitionDescription = styled.Text`
  color: ${colors.textSecondary};
  font-size: 14px;
  margin-bottom: 16px;
`

const CompetitionStatus = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`

const StatusText = styled.Text`
  color: ${colors.textSecondary};
  font-size: 14px;
`

const CompetitionStats = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
`

const StatContainer = styled.View`
  flex-direction: row;
  align-items: center;
`

const StatText = styled.Text`
  color: ${colors.textSecondary};
  font-size: 14px;
  margin-left: 4px;
`

const ProgressBarContainer = styled.View`
  height: 4px;
  background-color: ${colors.backgroundDark};
  border-radius: 2px;
  overflow: hidden;
`

const ProgressBarFill = styled.View<{ width: string }>`
  height: 100%;
  width: ${props => props.width};
  background-color: ${colors.primary};
  border-radius: 2px;
`

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
  const router = useRouter()

  useEffect(() => {
    loadCompetitions()
  }, [])

  const loadCompetitions = async () => {
    try {
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
    }
  }

  const renderCompetitionList = (competitions: Competition[], title: string) => {
    if (!competitions.length) {
      return null;
    }

    return (
      <View>
        <CompetitionName style={{ marginTop: 16 }}>{title}</CompetitionName>
        {competitions.map((competition) => (
          <TouchableOpacity
            key={competition.id}
            onPress={() => handleCardPress(competition, router, competition.community_id)}
          >
            <CompetitionCard>
              <CompetitionName>{competition.name}</CompetitionName>
              <CompetitionDescription>{competition.description}</CompetitionDescription>
              
              <CompetitionStatus>
                <StatusText style={{ color: getStatusColor(competition.status) }}>
                  {getStatusText(competition.status)}
                </StatusText>
              </CompetitionStatus>

              <ProgressBarContainer>
                <ProgressBarFill width={competition.status === 'finished' ? '100%' : competition.status === 'in_progress' ? '50%' : '0%'} />
              </ProgressBarContainer>

              <CompetitionStats>
                <StatContainer>
                  <MaterialCommunityIcons name="account-group" size={20} color={colors.textSecondary} />
                  <StatText>{competitionStats[competition.id]?.totalPlayers || 0} jogadores</StatText>
                </StatContainer>
                <StatContainer>
                  <MaterialCommunityIcons name="gamepad-variant" size={20} color={colors.textSecondary} />
                  <StatText>{competitionStats[competition.id]?.totalGames || 0} jogos</StatText>
                </StatContainer>
              </CompetitionStats>
            </CompetitionCard>
          </TouchableOpacity>
        ))}
      </View>
    );
  }

  return (
    <Container>
      <Header title="Competições" />
      <ScrollView style={{ flex: 1, padding: 16 }}>
        {renderCompetitionList(competitions.created, 'Competições Criadas')}
        {renderCompetitionList(competitions.organized, 'Competições que Organizo')}
      </ScrollView>
      <FloatingButton
        actions={[{
          icon: "plus",
          label: "Nova Competição",
          onPress: () => router.push('/comunidade/nova-competicao')
        }]}
      />
    </Container>
  )
}