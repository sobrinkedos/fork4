import React, { useEffect, useState } from "react";
import { View, ScrollView, TouchableOpacity, Dimensions } from "react-native";
import styled from "styled-components/native";
import { colors } from "@/styles/colors";
import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { PageTransition } from "@/components/Transitions";
import { Header } from "@/components/Header";
import { useRouter } from "expo-router";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { LineChart } from "@/components/WebLineChart";
import { useAuth } from "@/hooks/useAuth";
import { statisticsService } from "@/services/statisticsService";
import { rankingService } from "@/services/rankingService";

interface Stats {
    totalGames: number;
    totalCompetitions: number;
    totalPlayers: number;
    averageScore: number;
    totalCommunities: number;
}

interface Player {
    id: string;
    name: string;
    wins: number;
    buchudas: number;
    buchudasDeRe: number;
    winRate: number;
}

interface Pair {
    id: string;
    player1: {
        id: string;
        name: string;
    };
    player2: {
        id: string;
        name: string;
    };
    wins: number;
    buchudas: number;
    buchudasDeRe: number;
    winRate: number;
}

interface Activity {
    id: string;
    type: 'game' | 'competition' | 'player';
    description: string;
    time: Date;
}

const Container = styled.View`
    flex: 1;
    background-color: ${colors.backgroundDark};
`;

const ScrollContent = styled.ScrollView`
    flex: 1;
`;

const Content = styled.View`
    flex: 1;
    padding-bottom: 20px;
`;

const WelcomeContainer = styled.View`
    padding: 20px;
    margin-bottom: 10px;
`;

const WelcomeText = styled.Text`
    font-size: 28px;
    font-weight: bold;
    color: ${colors.gray100};
`;

const WelcomeSubtext = styled.Text`
    font-size: 16px;
    color: ${colors.gray300};
    margin-top: 4px;
`;

const StatisticsContainer = styled.View`
    flex-direction: row;
    flex-wrap: wrap;
    padding: 20px;
    justify-content: space-between;
`;

const StatCardWrapper = styled.View`
    width: 48%;
    margin-bottom: 16px;
`;

const StatCard = styled.TouchableOpacity`
    background-color: ${colors.backgroundMedium};
    border-radius: 16px;
    padding: 20px;
    width: 100%;
    align-items: center;
    elevation: 3;
    border: 1px solid ${colors.tertiary}40;
`;

const StatIcon = styled.View`
    width: 40px;
    height: 40px;
    border-radius: 20px;
    background-color: ${colors.primary}20;
    align-items: center;
    justify-content: center;
    margin-bottom: 8px;
`;

const StatValue = styled.Text`
    font-size: 24px;
    font-weight: bold;
    color: ${colors.gray100};
    margin-top: 8px;
`;

const StatLabel = styled.Text`
    font-size: 14px;
    color: ${colors.gray300};
    margin-top: 4px;
`;

const ChartContainer = styled.View`
    background-color: ${colors.backgroundMedium};
    border-radius: 16px;
    padding: 20px;
    margin: 0 20px 20px;
    border: 1px solid ${colors.tertiary}40;
`;

const ChartTitle = styled.Text`
    font-size: 16px;
    font-weight: bold;
    color: ${colors.gray100};
    margin-bottom: 16px;
`;

const SectionContainer = styled.View`
    margin: 0 20px 20px;
`;

const SectionHeader = styled.View`
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
`;

const SectionTitle = styled.Text`
    font-size: 20px;
    font-weight: bold;
    color: ${colors.gray100};
`;

const SeeAllButton = styled.TouchableOpacity`
    flex-direction: row;
    align-items: center;
`;

const SeeAllButtonText = styled.Text`
    color: ${colors.primary};
    font-size: 14px;
    margin-right: 4px;
`;

const PlayerCard = styled.TouchableOpacity`
    flex-direction: row;
    align-items: center;
    background-color: ${colors.backgroundMedium};
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 12px;
    border: 1px solid ${colors.tertiary}40;
`;

const PlayerInfo = styled.View`
    flex: 1;
    margin-left: 12px;
`;

const PlayerName = styled.Text`
    font-size: 16px;
    font-weight: bold;
    color: ${colors.gray100};
`;

const PlayerStats = styled.Text`
    font-size: 14px;
    color: ${colors.gray300};
    margin-top: 4px;
`;

const ActivityCard = styled.TouchableOpacity`
    flex-direction: row;
    align-items: center;
    background-color: ${colors.backgroundMedium};
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 12px;
    border: 1px solid ${colors.tertiary}40;
`;

const ActivityInfo = styled.View`
    flex: 1;
    margin-left: 12px;
`;

const ActivityText = styled.Text`
    font-size: 14px;
    color: ${colors.gray100};
`;

const ActivityTime = styled.Text`
    font-size: 12px;
    color: ${colors.gray300};
    margin-top: 4px;
`;

const RankingCard = styled.View`
    background-color: ${colors.backgroundMedium};
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 12px;
    border: 1px solid ${colors.tertiary}40;
`;

const RankingPosition = styled.Text`
    font-size: 16px;
    font-weight: bold;
    color: ${colors.gray100};
    margin-bottom: 8px;
`;

const RankingInfo = styled.View`
    flex: 1;
    margin-left: 12px;
`;

const RankingName = styled.Text`
    font-size: 16px;
    font-weight: bold;
    color: ${colors.gray100};
`;

const RankingStats = styled.View`
    flex-direction: row;
    flex-wrap: wrap;
`;

const StatText = styled.Text`
    font-size: 14px;
    color: ${colors.gray300};
    margin-right: 8px;
`;

const calculatePosition = (index: number, items: Array<any>): number => {
    if (index === 0) return 1;
    const currentWinRate = items[index].winRate;
    const previousWinRate = items[index - 1].winRate;
    return currentWinRate === previousWinRate ? calculatePosition(index - 1, items) : index + 1;
};

const Dashboard: React.FC = () => {
    const router = useRouter();
    const { session } = useAuth();
    const [stats, setStats] = useState<Stats>({
        totalGames: 0,
        totalCompetitions: 0,
        totalPlayers: 0,
        averageScore: 0,
        totalCommunities: 0
    });

    const [topPlayers, setTopPlayers] = useState<Player[]>([]);

    useEffect(() => {
        async function loadTopPlayers() {
            try {
                const rankings = await rankingService.getTopPlayers();
                const top4Players = rankings.slice(0, 4).map(player => ({
                    id: player.id,
                    name: player.name,
                    wins: player.wins,
                    buchudas: player.buchudas,
                    buchudasDeRe: player.buchudasDeRe,
                    winRate: player.winRate
                }));
                setTopPlayers(top4Players);
            } catch (error) {
                console.error('Dashboard: Erro ao carregar top jogadores:', error);
            }
        }

        loadTopPlayers();
    }, []);

    const [topPairs, setTopPairs] = useState<Pair[]>([]);

    useEffect(() => {
        async function loadTopPairs() {
            try {
                const rankings = await rankingService.getTopPairs();
                const top4Pairs = rankings.slice(0, 4).map(pair => ({
                    id: pair.id,
                    player1: pair.player1,
                    player2: pair.player2,
                    wins: pair.wins,
                    buchudas: pair.buchudas,
                    buchudasDeRe: pair.buchudasDeRe,
                    winRate: pair.winRate
                }));
                setTopPairs(top4Pairs);
            } catch (error) {
                console.error('Dashboard: Erro ao carregar top duplas:', error);
            }
        }

        loadTopPairs();
    }, []);
    const [recentActivities, setRecentActivities] = useState<Activity[]>([
        {
            id: '1',
            type: 'game',
            description: 'Eliane e Bruna venceram com uma buchuda!',
            time: new Date(2024, 1, 14, 16, 30)
        },
        {
            id: '2',
            type: 'competition',
            description: 'Nova competição "Torneio de Verão" criada',
            time: new Date(2024, 1, 14, 15, 45)
        },
        {
            id: '3',
            type: 'player',
            description: 'Mariana completou 50 jogos!',
            time: new Date(2024, 1, 14, 14, 20)
        }
    ]);

    const [totalCommunities, setTotalCommunities] = useState(0);

    const chartData = {
        labels: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"],
        datasets: [{
            data: [20, 45, 28, 80, 99, 43]
        }]
    };

    const chartConfig = {
        backgroundColor: colors.backgroundMedium,
        backgroundGradientFrom: colors.backgroundMedium,
        backgroundGradientTo: colors.backgroundMedium,
        decimalPlaces: 0,
        color: (opacity = 1) => colors.primary,
        labelColor: (opacity = 1) => colors.gray300,
        style: {
            borderRadius: 16
        },
        propsForDots: {
            r: 6,
            strokeWidth: 2,
            stroke: colors.primary
        }
    };

    useEffect(() => {
        async function loadStatistics() {
            if (session?.user?.id) {
                const userStats = await statisticsService.getUserStatistics(session.user.id);
                setStats(userStats);
            }
        }

        loadStatistics();
    }, [session?.user?.id]);

    useEffect(() => {
        const fetchStatistics = async () => {
            const stats = await statisticsService.getUserStatistics(session?.user?.id);
            setTotalCommunities(stats.totalCommunities);
        };
        fetchStatistics();
    }, [session?.user?.id]);

    return (
        <PageTransition>
            <Container>
                <Header />
                <ScrollContent showsVerticalScrollIndicator={false}>
                    <Content>
                        <WelcomeContainer>
                            <WelcomeText>Olá!</WelcomeText>
                            <WelcomeSubtext>Confira as estatísticas do seu domínio</WelcomeSubtext>
                        </WelcomeContainer>

                        <StatisticsContainer>
                            <StatCardWrapper>
                                <StatCard onPress={() => router.push("/jogos")}>
                                    <StatIcon>
                                        <MaterialCommunityIcons name="cards-playing-outline" size={24} color={colors.primary} />
                                    </StatIcon>
                                    <StatValue>{stats.totalGames}</StatValue>
                                    <StatLabel>Jogos</StatLabel>
                                </StatCard>
                            </StatCardWrapper>

                            <StatCardWrapper>
                                <StatCard onPress={() => router.push("/competicoes")}>
                                    <StatIcon>
                                        <MaterialCommunityIcons name="trophy-outline" size={24} color={colors.primary} />
                                    </StatIcon>
                                    <StatValue>{stats.totalCompetitions}</StatValue>
                                    <StatLabel>Competições</StatLabel>
                                </StatCard>
                            </StatCardWrapper>

                            <StatCardWrapper>
                                <StatCard onPress={() => router.push("/jogadores")}>
                                    <StatIcon>
                                        <MaterialCommunityIcons name="account-group-outline" size={24} color={colors.primary} />
                                    </StatIcon>
                                    <StatValue>{stats.totalPlayers}</StatValue>
                                    <StatLabel>Jogadores</StatLabel>
                                </StatCard>
                            </StatCardWrapper>

                            <StatCardWrapper>
                                <StatCard onPress={() => router.push('/comunidades')}>
                                    <StatIcon>
                                        <MaterialCommunityIcons name="account-multiple" size={24} color={colors.primary} />
                                    </StatIcon>
                                    <StatValue>{stats.totalCommunities}</StatValue>
                                    <StatLabel>Comunidades</StatLabel>
                                </StatCard>
                            </StatCardWrapper>
                        </StatisticsContainer>

                        <ChartContainer>
                            <ChartTitle>Jogos por Mês</ChartTitle>
                            <LineChart
                                data={chartData}
                                width={Dimensions.get("window").width - 80}
                                height={220}
                                chartConfig={chartConfig}
                                bezier
                                style={{
                                    marginVertical: 8,
                                    borderRadius: 16
                                }}
                            />
                        </ChartContainer>

                        <SectionContainer>
                            <SectionHeader>
                                <SectionTitle>Top Jogadores</SectionTitle>
                                <SeeAllButton onPress={() => router.push('/top-jogadores')}>
                                    <SeeAllButtonText>Ver todas</SeeAllButtonText>
                                </SeeAllButton>
                            </SectionHeader>

                            {topPlayers.map((player, index) => {
                                const position = calculatePosition(index, topPlayers);
                                return (
                                    <PlayerCard key={player.id} onPress={() => router.push(`/jogador/${player.id}`)}>
                                        <MaterialCommunityIcons 
                                            name={position === 1 ? "crown" : "star"} 
                                            size={24} 
                                            color={position === 1 ? "#FFD700" : colors.gray300} 
                                        />
                                        <PlayerInfo>
                                            <PlayerName>{player.name}</PlayerName>
                                            <PlayerStats>
                                                {player.wins} vitórias • {player.buchudas} buchudas • {player.winRate.toFixed(2)}% aproveitamento
                                            </PlayerStats>
                                        </PlayerInfo>
                                    </PlayerCard>
                                );
                            })}
                        </SectionContainer>

                        <SectionContainer>
                            <SectionHeader>
                                <SectionTitle>Top Duplas</SectionTitle>
                                <SeeAllButton onPress={() => router.push('/top-duplas')}>
                                    <SeeAllButtonText>Ver todas</SeeAllButtonText>
                                </SeeAllButton>
                            </SectionHeader>

                            {topPairs.map((pair, index) => {
                                const position = calculatePosition(index, topPairs);
                                return (
                                    <PlayerCard key={pair.id}>
                                        <MaterialCommunityIcons 
                                            name={position === 1 ? "crown" : "star"} 
                                            size={24} 
                                            color={position === 1 ? "#FFD700" : colors.gray300} 
                                        />
                                        <PlayerInfo>
                                            <PlayerName>{pair.player1.name} & {pair.player2.name}</PlayerName>
                                            <PlayerStats>
                                                {pair.wins} vitórias • {pair.buchudas} buchudas • {pair.buchudasDeRe} buchudas de ré • {pair.winRate.toFixed(2)}% aproveitamento
                                            </PlayerStats>
                                        </PlayerInfo>
                                    </PlayerCard>
                                );
                            })}
                        </SectionContainer>

                        <SectionContainer>
                            <SectionHeader>
                                <SectionTitle>Atividades Recentes</SectionTitle>
                                <SeeAllButton>
                                    <SeeAllButtonText>Ver todas</SeeAllButtonText>
                                </SeeAllButton>
                            </SectionHeader>

                            {recentActivities.map(activity => (
                                <ActivityCard key={activity.id}>
                                    <MaterialCommunityIcons
                                        name={
                                            activity.type === 'game' 
                                                ? "cards-playing" 
                                                : activity.type === 'competition' 
                                                    ? "trophy" 
                                                    : "account"
                                        }
                                        size={24}
                                        color={colors.primary}
                                    />
                                    <ActivityInfo>
                                        <ActivityText>{activity.description}</ActivityText>
                                        <ActivityTime>
                                            {format(activity.time, "d 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                                        </ActivityTime>
                                    </ActivityInfo>
                                </ActivityCard>
                            ))}
                        </SectionContainer>
                    </Content>
                </ScrollContent>
            </Container>
        </PageTransition>
    );
}

export default Dashboard;
