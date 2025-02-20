import { View, ScrollView, TouchableOpacity } from "react-native"
import styled from "styled-components/native"
import { colors } from "@/styles/colors"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { SlideTransition } from "@/components/Transitions"
import { FloatingButton } from "@/components/FloatingButton"
import { Header } from "@/components/Header"

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

export default function Competicoes() {
  const competitions = [
    {
      id: 1,
      name: "Torneio de Verão",
      game: "Counter-Strike 2",
      status: "open" as const,
      prizePool: "R$ 5.000",
      startDate: "15/02",
      teams: 8
    },
    {
      id: 2,
      name: "Copa League of Legends",
      game: "League of Legends",
      status: "in_progress" as const,
      prizePool: "R$ 10.000",
      startDate: "10/02",
      teams: 16
    },
    {
      id: 3,
      name: "Valorant Championship",
      game: "Valorant",
      status: "finished" as const,
      prizePool: "R$ 3.000",
      startDate: "01/02",
      teams: 12
    }
  ]

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open':
        return 'Inscrições Abertas'
      case 'in_progress':
        return 'Em Andamento'
      case 'finished':
        return 'Finalizado'
      default:
        return status
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
            <CompetitionCard key={competition.id}>
              <CompetitionHeader>
                <MaterialCommunityIcons 
                  name="trophy" 
                  size={40} 
                  color={colors.accent}
                />
                <CompetitionInfo>
                  <HeaderContent>
                    <TitleRow>
                      <CompetitionName>{competition.name}</CompetitionName>
                      <StatusBadge status={competition.status}>
                        <StatusText>{getStatusText(competition.status)}</StatusText>
                      </StatusBadge>
                    </TitleRow>
                    <CompetitionGame>{competition.game}</CompetitionGame>
                  </HeaderContent>
                </CompetitionInfo>
              </CompetitionHeader>

              <CompetitionDetails>
                <DetailItem>
                  <MaterialCommunityIcons 
                    name="cash" 
                    size={24} 
                    color={colors.accent}
                  />
                  <PrizePool>{competition.prizePool}</PrizePool>
                  <DetailText>Premiação</DetailText>
                </DetailItem>

                <DetailItem>
                  <MaterialCommunityIcons 
                    name="calendar" 
                    size={24} 
                    color={colors.accent}
                  />
                  <PrizePool>{competition.startDate}</PrizePool>
                  <DetailText>Início</DetailText>
                </DetailItem>

                <DetailItem>
                  <MaterialCommunityIcons 
                    name="account-group" 
                    size={24} 
                    color={colors.accent}
                  />
                  <PrizePool>{competition.teams}</PrizePool>
                  <DetailText>Times</DetailText>
                </DetailItem>
              </CompetitionDetails>
            </CompetitionCard>
          ))}
        </Content>
      </ScrollContent>

      <FloatingButton actions={fabActions} />
    </Container>
  )
}