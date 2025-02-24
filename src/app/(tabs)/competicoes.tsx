import { View, ScrollView, TouchableOpacity } from "react-native"
import styled from "styled-components/native"
import { colors } from "@/styles/colors"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { SlideTransition } from "@/components/Transitions"
import { FloatingButton } from "@/components/FloatingButton"
import { Header } from "@/components/Header"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Competition } from "@/services/competitionService"
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

const CompetitionCard = styled.TouchableOpacity`
  background-color: ${colors.secondary};
  border-radius: 8px;
  margin-bottom: 16px;
  padding: 16px;
`

const CompetitionHeader = styled.View`
  flex-direction: row;
  align-items: flex-start;
  margin-bottom: 16px;
`

const HeaderContent = styled.View`
  flex: 1;
`

const TitleRow = styled.View`
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
`

const CompetitionInfo = styled.View`
  flex: 1;
  margin-left: 12px;
`

const CompetitionName = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: ${colors.gray100};
`

const CompetitionGame = styled.Text`
  font-size: 14px;
  color: ${colors.gray300};
  margin-top: 4px;
`

const StatusBadge = styled.View<{ status: string }>`
  background-color: ${props => {
    switch (props.status) {
      case 'open':
        return colors.success + '20';
      case 'in_progress':
        return colors.warning + '20';
      case 'finished':
        return colors.error + '20';
      default:
        return colors.gray700;
    }
  }};
  padding: 4px 8px;
  border-radius: 4px;
`

const StatusText = styled.Text`
  color: ${colors.gray100};
  font-size: 12px;
  font-weight: 500;
`

const CompetitionDetails = styled.View`
  flex-direction: row;
  justify-content: space-between;
  padding-top: 12px;
  border-top-width: 1px;
  border-top-color: ${colors.tertiary}20;
`

const DetailItem = styled.View`
  align-items: center;
`

const DetailText = styled.Text`
  color: ${colors.gray300};
  font-size: 12px;
  margin-top: 4px;
`

const PrizePool = styled.Text`
  color: ${colors.gray100};
  font-size: 16px;
  font-weight: bold;
  margin-top: 4px;
`
const handleCardPress = (competition: Competition, router: any, communityId: string) => {
    router.push(`/comunidade/${communityId}/competicao/${competition.id}`);
};
export default function Competicoes() {
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [competitionStats, setCompetitionStats] = useState<{[key: string]: { totalPlayers: number, totalGames: number }}>({});
  const router = useRouter()
  useEffect(() => {
    loadCompetitions()
  }, [])

  const loadCompetitions = async () => {
    try {
      const { data: userCompetitions, error } = await supabase
        .from('competitions')
        .select(`
          id,
          name,
          description,
          start_date,
          status,
          community_id,
          (select count(*) from competition_members cm where cm.competition_id = competitions.id) as members_count,
          (select count(*) from games g where g.competition_id = competitions.id) as games_count
        `)
        .eq('created_by', (await supabase.auth.getUser()).data.user?.id)

      if (error) throw error

      // Verifica e atualiza o status das competições
      const updatedCompetitions = await Promise.all(userCompetitions.map(async (comp) => {
        const { data: games } = await supabase
          .from('games')
          .select('status')
          .eq('competition_id', comp.id);

        if (games && games.length > 0) {
          const hasFinishedGames = games.some(game => game.status === 'finished');
          const hasUnfinishedGames = games.some(game => 
            game.status === 'pending' || game.status === 'in_progress'
          );

          if (hasFinishedGames && !hasUnfinishedGames && comp.status !== 'finished') {
            await supabase
              .from('competitions')
              .update({ status: 'finished' })
              .eq('id', comp.id);
            return { ...comp, status: 'finished' };
          }
        }
        return comp;
      }));

      const stats: {[key: string]: { totalPlayers: number, totalGames: number }} = {};
      updatedCompetitions.forEach((comp) => {
        stats[comp.id] = {
          totalPlayers: comp.members_count || 0,
          totalGames: comp.games_count || 0
        };
      });

      setCompetitionStats(stats);
      setCompetitions(updatedCompetitions);
    } catch (error) {
      console.error('Error loading competitions:', error)
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Aguardando Início'
      case 'in_progress':
        return 'Em Andamento'
      case 'finished':
        return 'Finalizado'
      default:
        return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return colors.warning
      case 'in_progress':
        return colors.success
      case 'finished':
        return colors.primary
      default:
        return colors.gray300
    }
  }

  const fabActions = [
    {
      icon: "trophy-outline",
      label: "Nova Competição",
      onPress: () => console.log("Nova Competição"),
    },
  ];

  return (
    <Container>
      <Header title="Competições" onNotificationPress={() => {}} onProfilePress={() => {}} />
      <ScrollContent>
        <Content>
          {competitions.map(competition => (
            <CompetitionCard 
              key={competition.id} 
              onPress={() => handleCardPress(competition, router, competition.community_id)}
            >
              <CompetitionHeader>
                <MaterialCommunityIcons 
                  name="trophy" 
                  size={40} 
                  color={getStatusColor(competition.status)}
                />
                <CompetitionInfo>
                  <HeaderContent>
                    <TitleRow>
                      <CompetitionName>{competition.name}</CompetitionName>
                      <StatusBadge status={competition.status}>
                        <StatusText>{getStatusText(competition.status)}</StatusText>
                      </StatusBadge>
                    </TitleRow>
                    {competition.description && (
                      <CompetitionGame>
                        {competition.description}
                      </CompetitionGame>
                    )}
                  </HeaderContent>
                </CompetitionInfo>
              </CompetitionHeader>

              <CompetitionDetails>
                <DetailItem>
                  <MaterialCommunityIcons 
                    name="calendar" 
                    size={24} 
                    color={colors.accent}
                  />
                  <DetailText>Início: {new Date(competition.start_date).toLocaleDateString('pt-BR')}</DetailText>
                </DetailItem>

                <DetailItem>
                  <MaterialCommunityIcons 
                    name="account-group" 
                    size={24} 
                    color={colors.accent}
                  />
                  <DetailText>{competitionStats[competition.id]?.totalPlayers || 0} jogadores</DetailText>
                </DetailItem>

                <DetailItem>
                  <MaterialCommunityIcons 
                    name="cards-playing-outline" 
                    size={24} 
                    color={colors.accent}
                  />
                  <DetailText>{competitionStats[competition.id]?.totalGames || 0} jogos</DetailText>
                </DetailItem>

                {competition.status === 'in_progress' && (
                  <ProgressBar>
                    <ProgressIndicator 
                      width={`${Math.min((competitionStats[competition.id]?.totalGames || 0) * 10, 100)}%`}
                      status={competition.status}
                    />
                  </ProgressBar>
                )}
              </CompetitionDetails>
            </CompetitionCard>
          ))}
        </Content>
      </ScrollContent>
      <FloatingButton actions={fabActions} />
    </Container>
  )
}