import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import { colors } from '@/styles/colors';
import { InternalHeader } from '@/components/InternalHeader';
import { activityService, Activity } from '@/services/activityService';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Container = styled.View`
    flex: 1;
    background-color: ${colors.backgroundDark};
`;

const LoadingContainer = styled.View`
    flex: 1;
    justify-content: center;
    align-items: center;
`;

const ActivityCard = styled.TouchableOpacity`
    background-color: ${colors.backgroundLight};
    border-radius: 8px;
    padding: 16px;
    margin: 8px 16px;
`;

const ActivityHeader = styled.View`
    flex-direction: row;
    align-items: center;
    margin-bottom: 12px;
    gap: 8px;
`;

const ActivityType = styled.View<{ type: Activity['type'] }>`
    background-color: ${props => {
        switch (props.type) {
            case 'game': return colors.success;
            case 'competition': return colors.primary;
            case 'community': return colors.warning;
            case 'player': return colors.info;
            default: return colors.gray300;
        }
    }};
    padding: 4px 8px;
    border-radius: 4px;
`;

const ActivityTypeText = styled.Text`
    color: ${colors.white};
    font-size: 12px;
    font-weight: bold;
    text-transform: uppercase;
`;

const ActivityDescription = styled.Text`
    color: ${colors.textPrimary};
    font-size: 16px;
    line-height: 24px;
    margin-bottom: 8px;
    font-weight: 500;
`;

const ActivityDate = styled.Text`
    color: ${colors.gray300};
    font-size: 14px;
`;

const PaginationContainer = styled.View`
    flex-direction: row;
    justify-content: center;
    align-items: center;
    padding: 16px;
    gap: 16px;
`;

const PaginationButton = styled.TouchableOpacity<{ disabled?: boolean }>`
    opacity: ${props => props.disabled ? 0.5 : 1};
`;

const PaginationText = styled.Text`
    color: ${colors.white};
    font-size: 14px;
`;

const EmptyContainer = styled.View`
    flex: 1;
    justify-content: center;
    align-items: center;
    padding: 32px;
`;

const EmptyText = styled.Text`
    color: ${colors.gray300};
    font-size: 16px;
    text-align: center;
`;

const getTypeLabel = (type: Activity['type']) => {
    switch (type) {
        case 'game': return 'JOGO';
        case 'competition': return 'COMPETIÇÃO';
        case 'community': return 'COMUNIDADE';
        case 'player': return 'JOGADOR';
        default: return type.toUpperCase();
    }
};

export default function ActivityList() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    const loadActivities = async (page: number) => {
        try {
            setLoading(true);
            const result = await activityService.getAllActivities(page);
            setActivities(result.activities);
            setTotalPages(result.totalPages);
            setCurrentPage(result.currentPage);
        } catch (error) {
            console.error('Erro ao carregar atividades:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadActivities(1);
    }, []);

    const handleActivityPress = (activity: Activity) => {
        if (!activity.metadata) return;

        const { game_id, competition_id, community_id } = activity.metadata;
        
        if (game_id) {
            router.push(`/jogo/${game_id}`);
        } else if (competition_id) {
            const communityId = activity.metadata.community_id;
            router.push(`/comunidade/${communityId}/competicao/${competition_id}`);
        } else if (community_id) {
            router.push(`/comunidade/${community_id}`);
        }
    };

    const renderItem = ({ item }: { item: Activity }) => (
        <ActivityCard onPress={() => handleActivityPress(item)}>
            <ActivityHeader>
                <ActivityType type={item.type}>
                    <ActivityTypeText>{getTypeLabel(item.type)}</ActivityTypeText>
                </ActivityType>
            </ActivityHeader>
            <ActivityDescription>{item.description}</ActivityDescription>
            <ActivityDate>
                {item.created_at && format(new Date(item.created_at), "d 'de' MMMM 'às' HH:mm", { locale: ptBR })}
            </ActivityDate>
        </ActivityCard>
    );

    if (loading && activities.length === 0) {
        return (
            <Container>
                <InternalHeader title="Atividades Recentes" />
                <LoadingContainer>
                    <ActivityIndicator size="large" color={colors.primary} />
                </LoadingContainer>
            </Container>
        );
    }

    return (
        <Container>
            <InternalHeader title="Atividades Recentes" />
            <FlatList
                data={activities}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                ListEmptyComponent={
                    <EmptyContainer>
                        <EmptyText>Nenhuma atividade encontrada</EmptyText>
                    </EmptyContainer>
                }
            />
            {totalPages > 1 && (
                <PaginationContainer>
                    <PaginationButton 
                        disabled={currentPage === 1}
                        onPress={() => currentPage > 1 && loadActivities(currentPage - 1)}
                    >
                        <Feather 
                            name="chevron-left" 
                            size={24} 
                            color={currentPage === 1 ? colors.gray300 : colors.white} 
                        />
                    </PaginationButton>
                    <PaginationText>
                        Página {currentPage} de {totalPages}
                    </PaginationText>
                    <PaginationButton 
                        disabled={currentPage === totalPages}
                        onPress={() => currentPage < totalPages && loadActivities(currentPage + 1)}
                    >
                        <Feather 
                            name="chevron-right" 
                            size={24} 
                            color={currentPage === totalPages ? colors.gray300 : colors.white} 
                        />
                    </PaginationButton>
                </PaginationContainer>
            )}
        </Container>
    );
}
