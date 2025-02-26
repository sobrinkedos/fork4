import { useLocalSearchParams, useRouter } from "expo-router";
import { View, Text, ActivityIndicator, StatusBar, Platform } from "react-native";
import { useEffect, useState } from "react";
import { Competition } from "@/types/database.types";
import { getCompetitionById } from "@/services/competitionService";
import { InternalHeader } from "@/components/InternalHeader";
import styled from "styled-components/native";
import { PageTransition } from "@/components/Transitions";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useTheme } from "styled-components/native";

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.backgroundDark};
`;

const Content = styled.View`
  flex: 1;
  padding: 20px;
`;

const CompetitionCard = styled.View`
  background-color: ${({ theme }) => theme.colors.backgroundMedium};
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
`;

const CompetitionName = styled.Text`
  color: ${({ theme }) => theme.colors.gray100};
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 16px;
`;

const InfoItem = styled.View`
  margin-bottom: 12px;
`;

const InfoLabel = styled.Text`
  color: ${({ theme }) => theme.colors.gray300};
  font-size: 14px;
  margin-bottom: 4px;
`;

const InfoValue = styled.Text`
  color: ${({ theme }) => theme.colors.gray100};
  font-size: 16px;
`;

// Componente personalizado para a StatusBar
const StatusBarCustom = () => {
  const theme = useTheme();
  useEffect(() => {
    // Configuração imediata
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(theme.colors.primary);
      StatusBar.setBarStyle('light-content');
      StatusBar.setTranslucent(false);
    }
    
    return () => {
      // Não restauramos ao sair para evitar flickering
    };
  }, [theme]);
  
  return <StatusBar backgroundColor={theme.colors.primary} barStyle="light-content" translucent={false} />;
};

export default function CompetitionDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [competition, setCompetition] = useState<Competition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();

  useEffect(() => {
    const fetchCompetition = async () => {
      try {
        const data = await getCompetitionById(id as string);
        setCompetition(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Falha ao carregar competição');
      } finally {
        setLoading(false);
      }
    };

    fetchCompetition();
  }, [id]);

  return (
    <PageTransition>
      <Container>
        <StatusBarCustom />
        <InternalHeader title="Detalhes da Competição" />
        
        <Content>
          {loading ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
          ) : error ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: theme.colors.error }}>{error}</Text>
            </View>
          ) : !competition ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: theme.colors.gray300 }}>Competição não encontrada</Text>
            </View>
          ) : (
            <CompetitionCard>
              <CompetitionName>{competition.name}</CompetitionName>
              
              <InfoItem>
                <InfoLabel>Descrição</InfoLabel>
                <InfoValue>{competition.description || 'Sem descrição disponível'}</InfoValue>
              </InfoItem>
              
              <InfoItem>
                <InfoLabel>Data de Início</InfoLabel>
                <InfoValue>
                  {format(new Date(competition.start_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </InfoValue>
              </InfoItem>
              
              <InfoItem>
                <InfoLabel>Data de Término</InfoLabel>
                <InfoValue>
                  {format(new Date(competition.end_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </InfoValue>
              </InfoItem>
            </CompetitionCard>
          )}
        </Content>
      </Container>
    </PageTransition>
  );
}