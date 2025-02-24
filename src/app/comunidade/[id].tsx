import React, { useEffect, useState, useCallback } from 'react';
import { Alert, Modal, TouchableOpacity, ActivityIndicator, Animated } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import styled from 'styled-components/native';
import { colors } from '@/styles/colors';
import { Feather } from '@expo/vector-icons';
import { communityService } from '@/services/communityService';
import { communityMembersService } from '@/services/communityMembersService';
import { playersService } from '@/services/playersService';
import { competitionService } from '@/services/competitionService';
import { communityOrganizerService } from '@/services/communityOrganizerService';

type CommunityOrganizer = {
    id: string;
    community_id: string;
    user_id: string;
    user_profile?: {
        name: string;
        email: string;
    };
};

type Community = {
    id: string;
    name: string;
    description: string;
    created_at: string;
};

type Member = {
    id: string;
    player_id: string;
    community_id: string;
    players: {
        id: string;
        name: string;
    };
};

type Player = {
    id: string;
    name: string;
};

type Competition = {
    id: string;
    name: string;
    description: string;
    start_date: string;
};

const Container = styled.View`
    flex: 1;
    background-color: ${colors.background};
`;

const PageHeader = styled.View`
    padding: 24px;
    background-color: ${colors.background};
    border-bottom-width: 1px;
    border-bottom-color: ${colors.gray200};
`;

const BackButton = styled.TouchableOpacity`
    padding: 8px;
`;

const HeaderTitle = styled.Text`
    font-size: 24px;
    font-weight: bold;
    color: ${colors.gray100};
    margin-left: 16px;
`;

const MainContent = styled.View`
    padding: 24px;
`;

const SectionHeader = styled.View`
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
`;

const SectionTitle = styled.Text`
    font-size: 18px;
    font-weight: bold;
    color: ${colors.gray100};
`;

const ExpandButton = styled.TouchableOpacity`
    padding: 8px;
`;

const ManageButton = styled.TouchableOpacity`
    padding: 8px;
    background-color: ${colors.primary};
    border-radius: 4px;
    margin-left: auto;
`;

const ManageButtonText = styled.Text`
    color: ${colors.white};
    font-size: 14px;
    margin-left: 8px;
`;

const MembersSection = styled.View`
    margin-bottom: 24px;
`;

const MembersListContainer = styled.View`
    margin-top: 16px;
`;

const MembersListScrollView = styled.ScrollView`
    max-height: 200px;
`;

const MembersList = styled.FlatList`
    width: 100%;
`;

const MemberCard = styled.TouchableOpacity`
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 12px;
    background-color: ${colors.gray800};
    border-radius: 8px;
    margin-bottom: 8px;
`;

const MemberInfo = styled.View`
    flex: 1;
`;

const MemberName = styled.Text`
    color: ${colors.gray100};
    font-size: 16px;
    font-weight: bold;
`;

const SelectAllHeader = styled.View`
    margin-bottom: 16px;
`;

const SelectAllButton = styled.TouchableOpacity`
    flex-direction: row;
    align-items: center;
`;

const SelectAllText = styled.Text`
    color: ${colors.gray100};
    font-size: 14px;
    margin-left: 8px;
`;

const RemoveButton = styled.TouchableOpacity`
    padding: 8px;
    background-color: ${colors.red500};
    border-radius: 4px;
    margin-top: 16px;
`;

const RemoveButtonText = styled.Text`
    color: ${colors.white};
    font-size: 14px;
`;

const OrganizersSection = styled.View`
    margin-top: 24px;
`;

const OrganizersListContainer = styled.View`
    margin-top: 16px;
`;

const OrganizersListScrollView = styled.ScrollView`
    max-height: 200px;
`;

const OrganizersList = styled.FlatList`
    width: 100%;
`;

const OrganizerCard = styled.View`
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 12px;
    background-color: ${colors.gray800};
    border-radius: 8px;
    margin-bottom: 8px;
`;

const OrganizerInfo = styled.View`
    flex: 1;
`;

const OrganizerName = styled.Text`
    color: ${colors.gray100};
    font-size: 16px;
    font-weight: bold;
`;

const OrganizerEmail = styled.Text`
    color: ${colors.gray300};
    font-size: 14px;
    margin-top: 4px;
`;

const RemoveOrganizerButton = styled.TouchableOpacity`
    padding: 8px;
    background-color: ${colors.red500};
    border-radius: 4px;
    margin-left: auto;
`;

const ModalContainer = styled.View`
    flex: 1;
    background-color: ${colors.background};
    padding: 24px;
`;

const ModalContent = styled.View`
    background-color: ${colors.background};
    padding: 24px;
    border-radius: 8px;
`;

const ModalHeader = styled.View`
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
`;

const ModalTitle = styled.Text`
    font-size: 18px;
    font-weight: bold;
    color: ${colors.gray100};
`;

const ModalInput = styled.TextInput`
    width: 100%;
    height: 48px;
    background-color: ${colors.gray800};
    border-radius: 8px;
    padding: 0 16px;
    color: ${colors.gray100};
    margin-bottom: 16px;
`;

const SaveButton = styled.TouchableOpacity`
    padding: 8px;
    background-color: ${colors.primary};
    border-radius: 4px;
`;

const SaveButtonText = styled.Text`
    color: ${colors.white};
    font-size: 14px;
`;

const FAB = styled.TouchableOpacity`
    position: absolute;
    bottom: 24px;
    right: 24px;
    padding: 16px;
    background-color: ${colors.primary};
    border-radius: 50px;
`;

const LoadingContainer = styled.View`
    flex: 1;
    justify-content: center;
    align-items: center;
`;

const EmptyContainer = styled.View`
    flex: 1;
    justify-content: center;
    align-items: center;
`;

const EmptyText = styled.Text`
    color: ${colors.gray300};
    font-size: 14px;
`;

const PlayerCard = styled.TouchableOpacity`
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 12px;
    background-color: ${colors.gray800};
    border-radius: 8px;
    margin-bottom: 8px;
`;

const PlayerInfo = styled.View`
    flex: 1;
`;

const PlayerName = styled.Text`
    color: ${colors.gray100};
    font-size: 16px;
    font-weight: bold;
`;

const PlayersList = styled.FlatList`
    width: 100%;
`;

const CompetitionCard = styled.TouchableOpacity`
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 12px;
    background-color: ${colors.gray800};
    border-radius: 8px;
    margin-bottom: 8px;
`;

const CompetitionInfo = styled.View`
    flex: 1;
`;

const CompetitionName = styled.Text`
    color: ${colors.gray100};
    font-size: 16px;
    font-weight: bold;
`;

const CompetitionDescription = styled.Text`
    color: ${colors.gray300};
    font-size: 14px;
    margin-top: 4px;
`;

const CompetitionDetails = styled.View`
    flex-direction: row;
    align-items: center;
    margin-top: 8px;
`;

const CompetitionDate = styled.View`
    flex-direction: row;
    align-items: center;
    margin-right: 16px;
`;

const CompetitionDateText = styled.Text`
    color: ${colors.gray300};
    font-size: 14px;
    margin-left: 4px;
`;

const CompetitionStatus = styled.View`
    flex-direction: row;
    align-items: center;
`;

const StatusBadge = styled.View`
    padding: 4px 8px;
    background-color: ${props => props.status === 'pending' ? colors.warning : props.status === 'in_progress' ? colors.primary : colors.success};
    border-radius: 4px;
    margin-left: 8px;
`;

const StatusText = styled.Text`
    color: ${colors.white};
    font-size: 12px;
`;

const Description = styled.Text`
    color: ${colors.gray300};
    font-size: 14px;
    margin-top: 8px;
`;

const ShowMoreContainer = styled.TouchableOpacity`
    flex-direction: row;
    align-items: center;
    margin-top: 8px;
`;

const ShowMoreText = styled.Text`
    color: ${colors.primary};
    font-size: 14px;
    margin-left: 4px;
`;

export default function CommunityDetails() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [community, setCommunity] = useState<Community | null>(null);
    const [members, setMembers] = useState<Member[]>([]);
    const [allPlayers, setAllPlayers] = useState<Player[]>([]);
    const [competitions, setCompetitions] = useState<Competition[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [showMembers, setShowMembers] = useState(false);
    const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
    const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
    const [rotateAnim] = useState(new Animated.Value(0));
    const [organizers, setOrganizers] = useState<CommunityOrganizer[]>([]);
    const [showOrganizers, setShowOrganizers] = useState(false);
    const [organizerModalVisible, setOrganizerModalVisible] = useState(false);
    const [organizerEmail, setOrganizerEmail] = useState('');
    const [rotateOrganizersAnim] = useState(new Animated.Value(0));

    const toggleOrganizers = useCallback(() => {
        setShowOrganizers(prev => !prev);
        Animated.timing(rotateOrganizersAnim, {
            toValue: showOrganizers ? 0 : 1,
            duration: 200,
            useNativeDriver: true
        }).start();
    }, [showOrganizers, rotateOrganizersAnim]);

    const rotateOrganizers = rotateOrganizersAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '180deg'],
    });

    const handleAddOrganizer = async () => {
        if (!community || !organizerEmail) return;

        try {
            setLoading(true);
            const { error } = await communityOrganizerService.addOrganizer(community.id, organizerEmail);
            if (error) throw error;

            const { data: updatedOrganizers } = await communityOrganizerService.listOrganizers(community.id);
            if (updatedOrganizers) {
                setOrganizers(updatedOrganizers);
            }

            setOrganizerModalVisible(false);
            setOrganizerEmail('');
        } catch (error) {
            console.error(error);
            Alert.alert('Erro', 'Não foi possível adicionar o organizador');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveOrganizer = async (userId: string) => {
        if (!community) return;

        try {
            setLoading(true);
            const { error } = await communityOrganizerService.removeOrganizer(community.id, userId);
            if (error) throw error;

            const { data: updatedOrganizers } = await communityOrganizerService.listOrganizers(community.id);
            if (updatedOrganizers) {
                setOrganizers(updatedOrganizers);
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Erro', 'Não foi possível remover o organizador');
        } finally {
            setLoading(false);
        }
    };

    const toggleMembers = useCallback(() => {
        setShowMembers(prev => !prev);
        Animated.timing(rotateAnim, {
            toValue: showMembers ? 0 : 1,
            duration: 200,
            useNativeDriver: true
        }).start();
    }, [showMembers, rotateAnim]);

    const rotate = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '180deg'],
    });

    const loadData = async () => {
        try {
            setLoading(true);
            const communityData = await communityService.getById(params.id as string);
            const membersData = await communityMembersService.listMembers(params.id as string);
            const playersData = await playersService.list();
            const competitionsData = await competitionService.listByCommunity(params.id as string);

            setCommunity(communityData);
            setMembers(membersData);
            setAllPlayers(playersData);
            setCompetitions(competitionsData);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [params.id]);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [params.id])
    );

    const handleToggleMember = async (playerId: string, isCurrentMember: boolean) => {
        if (!community) return;
        
        try {
            setLoading(true);
            if (isCurrentMember) {
                await communityMembersService.removeMember(community.id, playerId);
            } else {
                await communityMembersService.addMember(community.id, playerId);
            }
            await loadData();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectPlayer = (playerId: string) => {
        setSelectedPlayers(prev => {
            if (prev.includes(playerId)) {
                return prev.filter(id => id !== playerId);
            }
            return [...prev, playerId];
        });
    };

    const handleSelectAll = () => {
        const availablePlayers = allPlayers.filter(player => 
            !members.some(member => member.player_id === player.id)
        );
        
        if (selectedPlayers.length === availablePlayers.length) {
            setSelectedPlayers([]);
        } else {
            setSelectedPlayers(availablePlayers.map(player => player.id));
        }
    };

    const handleSaveMembers = async () => {
        if (!community || selectedPlayers.length === 0) return;

        try {
            setLoading(true);
            await communityMembersService.addMembers(community.id, selectedPlayers);
            setModalVisible(false);
            setSelectedPlayers([]);
            await loadData();
        } catch (error) {
            console.error(error);
            Alert.alert('Erro', 'Não foi possível adicionar os membros');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectMember = (memberId: string) => {
        setSelectedMembers(prev => {
            if (prev.includes(memberId)) {
                return prev.filter(id => id !== memberId);
            }
            return [...prev, memberId];
        });
    };

    const handleSelectAllMembers = () => {
        if (selectedMembers.length === members.length) {
            setSelectedMembers([]);
        } else {
            setSelectedMembers(members.map(member => member.player_id));
        }
    };

    const handleRemoveMembers = async () => {
        if (!community || selectedMembers.length === 0) return;

        try {
            setLoading(true);
            for (const memberId of selectedMembers) {
                await communityMembersService.removeMember(community.id, memberId);
            }
            setSelectedMembers([]);
            await loadData();
        } catch (error) {
            console.error(error);
            Alert.alert('Erro', 'Não foi possível remover os membros');
        } finally {
            setLoading(false);
        }
    };

    if (loading || !community) {
        return (
            <Container>
                <LoadingContainer>
                    <ActivityIndicator size="large" color={colors.primary} />
                </LoadingContainer>
            </Container>
        );
    }

    return (
        <Container>
            <PageHeader>
                <BackButton onPress={() => router.back()}>
                    <Feather name="arrow-left" size={24} color={colors.gray100} />
                </BackButton>
                <HeaderTitle>{community.name}</HeaderTitle>
            </PageHeader>

            <MainContent>
                {community.description && (
                    <>
                        <SectionHeader>
                            <SectionTitle>Detalhes</SectionTitle>
                        </SectionHeader>

                        <Description numberOfLines={2}>
                            {community.description}
                        </Description>
                        {community.description.length > 80 && (
                            <ShowMoreContainer>
                                <Feather name="chevron-down" size={20} color={colors.primary} />
                                <ShowMoreText>Ver mais</ShowMoreText>
                            </ShowMoreContainer>
                        )}
                    </>
                )}

                <MembersSection>
                    <SectionHeader>
                        <HeaderLeft>
                            <SectionTitle>Membros ({members.length})</SectionTitle>
                            <ExpandButton onPress={toggleMembers}>
                                <Animated.View style={{ transform: [{ rotate }] }}>
                                    <Feather name="chevron-down" size={24} color={colors.gray300} />
                                </Animated.View>
                            </ExpandButton>
                        </HeaderLeft>
                        <ManageButton onPress={() => setModalVisible(true)}>
                            <ManageButtonText>Gerenciar</ManageButtonText>
                            <Feather name="users" size={20} color={colors.gray100} />
                        </ManageButton>
                    </SectionHeader>

                    {showMembers && (
                        <MembersListContainer>
                            <SelectAllHeader>
                                <SelectAllButton onPress={handleSelectAllMembers}>
                                    <Feather 
                                        name={selectedMembers.length === members.length ? "check-square" : "square"} 
                                        size={24} 
                                        color={colors.primary} 
                                    />
                                    <SelectAllText>Selecionar Todos</SelectAllText>
                                </SelectAllButton>
                            </SelectAllHeader>

                            <MembersListScrollView>
                                <MembersList
                                    data={members}
                                    keyExtractor={(item) => item.id}
                                    renderItem={({ item }) => (
                                        <MemberCard 
                                            onPress={() => handleSelectMember(item.player_id)}
                                            selected={selectedMembers.includes(item.player_id)}
                                        >
                                            <MemberInfo>
                                                <MemberName>{item.players.name}</MemberName>
                                            </MemberInfo>
                                            <Feather 
                                                name={selectedMembers.includes(item.player_id) ? "check-square" : "square"} 
                                                size={24} 
                                                color={selectedMembers.includes(item.player_id) ? colors.primary : colors.gray300} 
                                            />
                                        </MemberCard>
                                    )}
                                    ListEmptyComponent={
                                        <EmptyContainer>
                                            <EmptyText>Nenhum membro encontrado</EmptyText>
                                        </EmptyContainer>
                                    }
                                    scrollEnabled={false}
                                />
                                {selectedMembers.length > 0 && (
                                    <RemoveButton 
                                        onPress={handleRemoveMembers}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <ActivityIndicator color={colors.white} />
                                        ) : (
                                            <RemoveButtonText>
                                                Remover {selectedMembers.length} {selectedMembers.length === 1 ? 'membro' : 'membros'}
                                            </RemoveButtonText>
                                        )}
                                    </RemoveButton>
                                )}
                            </MembersListScrollView>
                        </MembersListContainer>
                    )}
                </MembersSection>

                <OrganizersSection>
                    <SectionHeader>
                        <HeaderLeft>
                            <SectionTitle>Organizadores</SectionTitle>
                            <ExpandButton onPress={toggleOrganizers}>
                                <Animated.View style={{ transform: [{ rotate: rotateOrganizers }] }}>
                                    <Feather name="chevron-down" size={24} color={colors.gray300} />
                                </Animated.View>
                            </ExpandButton>
                        </HeaderLeft>
                        <ManageButton onPress={() => setOrganizerModalVisible(true)}>
                            <ManageButtonText>Adicionar</ManageButtonText>
                            <Feather name="user-plus" size={20} color={colors.gray100} />
                        </ManageButton>
                    </SectionHeader>
                    {showOrganizers && (
                        <OrganizersListContainer>
                            <OrganizersListScrollView>
                                <OrganizersList
                                    data={organizers}
                                    keyExtractor={(item) => item.id}
                                    renderItem={({ item }) => (
                                        <OrganizerCard>
                                            <OrganizerInfo>
                                                <OrganizerName>{item.user_profile?.name}</OrganizerName>
                                                <OrganizerEmail>{item.user_profile?.email}</OrganizerEmail>
                                            </OrganizerInfo>
                                            <RemoveOrganizerButton
                                                onPress={() => handleRemoveOrganizer(item.user_id)}
                                                disabled={loading}
                                            >
                                                <Feather name="x" size={20} color={colors.error} />
                                            </RemoveOrganizerButton>
                                        </OrganizerCard>
                                    )}
                                    ListEmptyComponent={
                                        <EmptyContainer>
                                            <EmptyText>Nenhum organizador encontrado</EmptyText>
                                        </EmptyContainer>
                                    }
                                    scrollEnabled={false}
                                />
                            </OrganizersListScrollView>
                        </OrganizersListContainer>
                    )}
                </OrganizersSection>
                <SectionHeader>
                    <SectionTitle>Competições</SectionTitle>
                </SectionHeader>
                <CompetitionsList
                    data={competitions}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <CompetitionCard 
                            onPress={() => router.push({
                                pathname: '/comunidade/[id]/competicao/[competitionId]',
                                params: { 
                                    id: community.id,
                                    competitionId: item.id 
                                }
                            })}
                        >
                            <CompetitionInfo>
                                <CompetitionName>{item.name}</CompetitionName>
                                {item.description && (
                                    <CompetitionDescription>
                                        {item.description}
                                    </CompetitionDescription>
                                )}
                                <CompetitionDetails>
                                    <CompetitionDate>
                                        <Feather name="calendar" size={14} color={colors.gray300} />
                                        <CompetitionDateText>
                                            {new Date(item.start_date).toLocaleDateString('pt-BR')}
                                        </CompetitionDateText>
                                    </CompetitionDate>
                                    <CompetitionStatus>
                                        {item.status === 'pending' && (
                                            <StatusBadge status="pending">
                                                <StatusText>Aguardando início</StatusText>
                                            </StatusBadge>
                                        )}
                                        {item.status === 'in_progress' && (
                                            <StatusBadge status="in_progress">
                                                <StatusText>Em andamento</StatusText>
                                            </StatusBadge>
                                        )}
                                        {item.status === 'finished' && (
                                            <StatusBadge status="finished">
                                                <StatusText>Finalizada</StatusText>
                                            </StatusBadge>
                                        )}
                                    </CompetitionStatus>
                                </CompetitionDetails>
                            </CompetitionInfo>
                            <Feather name="chevron-right" size={24} color={colors.gray300} />
                        </CompetitionCard>
                    )}
                    ListEmptyComponent={
                        <EmptyContainer>
                            <EmptyText>Nenhuma competição encontrada</EmptyText>
                        </EmptyContainer>
                    }
                />
            </MainContent>
            <FAB onPress={() => router.push({
                pathname: '/comunidade/[id]/competicao/nova',
                params: { id: community.id }
            })}>
                <Feather name="plus" size={24} color={colors.gray100} />
            </FAB>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(false);
                    setSelectedPlayers([]);
                }}
            >
                <ModalContainer>
                    <ModalContent>
                        <ModalHeader>
                            <ModalTitle>Adicionar Membros</ModalTitle>
                            <TouchableOpacity onPress={() => {
                                setModalVisible(false);
                                setSelectedPlayers([]);
                            }}>
                                <Feather name="x" size={24} color={colors.gray100} />
                            </TouchableOpacity>
                        </ModalHeader>
                        <SelectAllHeader>
                            <SelectAllButton onPress={handleSelectAll}>
                                <Feather 
                                    name={selectedPlayers.length === allPlayers.filter(player => 
                                        !members.some(member => member.player_id === player.id)
                                    ).length ? "check-square" : "square"} 
                                    size={24} 
                                    color={colors.primary} 
                                />
                                <SelectAllText>Selecionar Todos</SelectAllText>
                            </SelectAllButton>
                        </SelectAllHeader>
                        <PlayersList
                            data={allPlayers.filter(player => 
                                !members.some(member => member.player_id === player.id)
                            )}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <PlayerCard 
                                    onPress={() => handleSelectPlayer(item.id)}
                                    selected={selectedPlayers.includes(item.id)}
                                >
                                    <PlayerInfo>
                                        <PlayerName>{item.name}</PlayerName>
                                    </PlayerInfo>
                                    <Feather 
                                        name={selectedPlayers.includes(item.id) ? "check-square" : "square"} 
                                        size={24} 
                                        color={selectedPlayers.includes(item.id) ? colors.primary : colors.gray300} 
                                    />
                                </PlayerCard>
                            )}
                            ListEmptyComponent={
                                <EmptyContainer>
                                    <EmptyText>Nenhum jogador disponível</EmptyText>
                                </EmptyContainer>
                            }
                        />
                        <SaveButton 
                            onPress={handleSaveMembers}
                            disabled={selectedPlayers.length === 0 || loading}
                        >
                            {loading ? (
                                <ActivityIndicator color={colors.white} />
                            ) : (
                                <SaveButtonText>
                                    Adicionar {selectedPlayers.length} {selectedPlayers.length === 1 ? 'membro' : 'membros'}
                                </SaveButtonText>
                            )}
                        </SaveButton>
                    </ModalContent>
                </ModalContainer>
            </Modal>
        </Container>
    );
}
