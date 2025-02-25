import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Alert, Modal, TouchableOpacity, ActivityIndicator, Animated, FlatList, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import styled from 'styled-components/native';
import { colors } from '@/styles/colors';
import { Feather } from '@expo/vector-icons';
import { communityService } from '@/services/communityService';
import { communityMembersService } from '@/services/communityMembersService';
import { communityOrganizersService } from '@/services/communityOrganizersService';
import { playersService } from '@/services/playersService';
import { competitionService } from '@/services/competitionService';
import { useAuth } from '@/hooks/useAuth';

type CommunityOrganizer = {
    id: string;
    community_id: string;
    user_id: string;
    user_profile?: {
        id: string;
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
    background-color: ${colors.backgroundDark};
`;

const PageHeader = styled.View`
    flex-direction: row;
    align-items: center;
    padding: 24px;
    background-color: ${colors.backgroundDark};
`;

const BackButton = styled.TouchableOpacity`
    padding: 8px;
    margin-right: 8px;
`;

const HeaderTitle = styled.Text`
    color: ${colors.gray100};
    font-size: 20px;
    font-weight: bold;
    flex: 1;
    text-align: center;
`;

const HeaderSubtitle = styled.Text`
    color: ${colors.gray300};
    font-size: 14px;
    text-align: center;
`;

const HeaderLeft = styled.View`
    flex-direction: row;
    align-items: center;
`;

const HeaderRight = styled.View`
    flex-direction: row;
    align-items: center;
`;

const StatsButton = styled.TouchableOpacity`
    flex-direction: row;
    align-items: center;
    padding: 8px 16px;
    border-radius: 8px;
    background-color: ${colors.gray800};
`;

const StatsButtonText = styled.Text`
    color: ${colors.gray100};
    font-size: 14px;
    margin-left: 8px;
`;

const MainContent = styled.View`
    flex: 1;
    background-color: ${colors.background};
`;

const ScrollContainer = styled.ScrollView`
    flex: 1;
    background-color: ${colors.background};
`;

const ContentContainer = styled.View`
    padding: 24px;
    background-color: ${colors.background};
`;

const Section = styled.View`
    margin-bottom: 24px;
    background-color: ${colors.gray800};
    border-radius: 8px;
    padding: 16px;
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

const MemberCard = styled.View`
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 12px;
    background-color: ${colors.gray700};
    border-radius: 8px;
    margin-top: 8px;
`;

const MemberInfo = styled.View`
    flex: 1;
`;

const MemberName = styled.Text`
    font-size: 16px;
    font-weight: bold;
    color: ${colors.gray100};
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

const OrganizerCard = styled.View`
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 12px;
    background-color: ${colors.gray700};
    border-radius: 8px;
    margin-top: 8px;
`;

const OrganizerInfo = styled.View`
    flex: 1;
`;

const OrganizerName = styled.Text`
    font-size: 16px;
    font-weight: bold;
    color: ${colors.gray100};
`;

const OrganizerEmail = styled.Text`
    font-size: 14px;
    color: ${colors.gray300};
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
    background-color: rgba(0, 0, 0, 0.5);
    padding: 24px;
    justify-content: center;
`;

const ModalContent = styled.View`
    background-color: ${colors.gray800};
    padding: 24px;
    border-radius: 8px;
    elevation: 5;
    shadow-color: #000;
    shadow-offset: 0px 2px;
    shadow-opacity: 0.25;
    shadow-radius: 3.84px;
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

const SaveButton = styled.TouchableOpacity<{ disabled?: boolean }>`
    padding: 8px;
    background-color: ${props => props.disabled ? colors.gray600 : colors.primary};
    border-radius: 4px;
    align-items: center;
    opacity: ${props => props.disabled ? 0.7 : 1};
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
    padding: 16px;
    align-items: center;
`;

const EmptyText = styled.Text`
    font-size: 14px;
    color: ${colors.gray300};
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
    const { session } = useAuth();
    const [community, setCommunity] = useState<Community | null>(null);
    const [members, setMembers] = useState<Member[]>([]);
    const [organizers, setOrganizers] = useState<CommunityOrganizer[]>([]);
    const [players, setPlayers] = useState<Player[]>([]);
    const [competitions, setCompetitions] = useState<Competition[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showMembers, setShowMembers] = useState(false);
    const [showOrganizers, setShowOrganizers] = useState(false);
    const [showAddMemberModal, setShowAddMemberModal] = useState(false);
    const [showAddOrganizerModal, setShowAddOrganizerModal] = useState(false);
    const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
    const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [organizerEmail, setOrganizerEmail] = useState('');
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

    const rotateAnimMembers = useRef(new Animated.Value(0)).current;
    const rotateAnimOrganizers = useRef(new Animated.Value(0)).current;

    const rotateMembers = rotateAnimMembers.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '180deg']
    });

    const rotateOrganizers = rotateAnimOrganizers.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '180deg']
    });

    const toggleMembers = useCallback(() => {
        setShowMembers(prev => !prev);
        Animated.timing(rotateAnimMembers, {
            toValue: showMembers ? 0 : 1,
            duration: 300,
            useNativeDriver: true
        }).start();
    }, [showMembers]);

    const toggleOrganizers = useCallback(() => {
        setShowOrganizers(prev => !prev);
        Animated.timing(rotateAnimOrganizers, {
            toValue: showOrganizers ? 0 : 1,
            duration: 300,
            useNativeDriver: true
        }).start();
    }, [showOrganizers]);

    const handleAddOrganizer = async () => {
        if (!community || !organizerEmail || !session?.user?.id) return;

        try {
            setLoading(true);
            await communityOrganizersService.addOrganizer(community.id, organizerEmail, session.user.id);
            const organizersData = await communityOrganizersService.listOrganizers(community.id);
            setOrganizers(organizersData);
            setOrganizerEmail('');
            setShowAddOrganizerModal(false);
        } catch (error) {
            console.error('Erro ao adicionar organizador:', error);
            if (error instanceof Error) {
                Alert.alert('Erro', error.message);
            } else {
                Alert.alert('Erro', 'Não foi possível adicionar o organizador');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveOrganizer = async (userId: string) => {
        if (!community) return;

        try {
            setLoading(true);
            await communityOrganizersService.removeOrganizer(community.id, userId);
            const organizersData = await communityOrganizersService.listOrganizers(community.id);
            setOrganizers(organizersData);
        } catch (error) {
            console.error('Erro ao remover organizador:', error);
            Alert.alert('Erro', 'Não foi possível remover o organizador');
        } finally {
            setLoading(false);
        }
    };

    const loadData = async () => {
        try {
            setLoading(true);
            console.log('Buscando comunidade...');
            const communityData = await communityService.getById(params.id as string);
            if (!communityData) throw new Error('Comunidade não encontrada');
            console.log('Comunidade encontrada:', communityData);
            setCommunity(communityData);

            console.log('Buscando membros...');
            const membersData = await communityMembersService.listMembers(params.id as string);
            console.log('Membros encontrados:', membersData);
            setMembers(membersData);

            console.log('Buscando organizadores...');
            const organizersData = await communityOrganizersService.listOrganizers(params.id as string);
            console.log('Organizadores encontrados:', organizersData);
            setOrganizers(organizersData);

            console.log('Buscando jogadores...');
            const { myPlayers, communityPlayers } = await playersService.list();
            console.log('Jogadores encontrados:', { myPlayers, communityPlayers });

            console.log('Buscando competições...');
            const competitionsData = await competitionService.listByCommunity(params.id as string);
            console.log('Competições encontradas:', competitionsData);
            setCompetitions(competitionsData);
            setPlayers([...myPlayers, ...communityPlayers]);
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            Alert.alert('Erro', 'Não foi possível carregar os dados da comunidade');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            console.log('Carregando dados da comunidade...');
            loadData();
        }, [])
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
        const availablePlayers = players.filter(player => 
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
            setShowAddMemberModal(false);
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

    const renderContent = () => {
        if (loading) {
            return (
                <LoadingContainer>
                    <ActivityIndicator size="large" color={colors.primary} />
                </LoadingContainer>
            );
        }

        return (
            <>
                {community?.description && (
                    <Section>
                        <SectionHeader>
                            <SectionTitle>Detalhes</SectionTitle>
                        </SectionHeader>

                        <Description numberOfLines={isDescriptionExpanded ? undefined : 2}>
                            {community.description}
                        </Description>
                        {community.description.length > 80 && (
                            <ShowMoreContainer onPress={() => setIsDescriptionExpanded(!isDescriptionExpanded)}>
                                <Feather 
                                    name={isDescriptionExpanded ? "chevron-up" : "chevron-down"} 
                                    size={20} 
                                    color={colors.primary} 
                                />
                                <ShowMoreText>
                                    {isDescriptionExpanded ? 'Ver menos' : 'Ver mais'}
                                </ShowMoreText>
                            </ShowMoreContainer>
                        )}
                    </Section>
                )}

                <Section>
                    <SectionHeader>
                        <HeaderLeft>
                            <SectionTitle>Membros ({members.length})</SectionTitle>
                            <ExpandButton onPress={toggleMembers}>
                                <Animated.View style={{ transform: [{ rotate: rotateMembers }] }}>
                                    <Feather name="chevron-down" size={20} color={colors.gray100} />
                                </Animated.View>
                            </ExpandButton>
                        </HeaderLeft>
                        <ManageButton onPress={() => setShowAddMemberModal(true)}>
                            <Feather name="users" size={20} color={colors.white} />
                        </ManageButton>
                    </SectionHeader>

                    {showMembers && (
                        <>
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

                            {members.length > 0 ? (
                                members.map(item => (
                                    <MemberCard key={item.id}>
                                        <MemberInfo>
                                            <MemberName>{item.players.name}</MemberName>
                                        </MemberInfo>
                                        <TouchableOpacity onPress={() => handleSelectMember(item.player_id)}>
                                            <Feather 
                                                name={selectedMembers.includes(item.player_id) ? "check-square" : "square"} 
                                                size={24} 
                                                color={selectedMembers.includes(item.player_id) ? colors.primary : colors.gray300} 
                                            />
                                        </TouchableOpacity>
                                    </MemberCard>
                                ))
                            ) : (
                                <EmptyContainer>
                                    <EmptyText>Nenhum membro encontrado</EmptyText>
                                </EmptyContainer>
                            )}

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
                        </>
                    )}
                </Section>

                <Section>
                    <SectionHeader>
                        <HeaderLeft>
                            <SectionTitle>Organizadores</SectionTitle>
                            <ExpandButton onPress={toggleOrganizers}>
                                <Animated.View style={{ transform: [{ rotate: rotateOrganizers }] }}>
                                    <Feather name="chevron-down" size={20} color={colors.gray100} />
                                </Animated.View>
                            </ExpandButton>
                        </HeaderLeft>
                        <ManageButton onPress={() => setShowAddOrganizerModal(true)}>
                            <Feather name="user-plus" size={20} color={colors.white} />
                        </ManageButton>
                    </SectionHeader>

                    {showOrganizers && (
                        organizers.length > 0 ? (
                            organizers.map(item => (
                                <OrganizerCard key={item.id}>
                                    <OrganizerInfo>
                                        <OrganizerName>{item.user_profile?.name}</OrganizerName>
                                        <OrganizerEmail>{item.user_profile?.email}</OrganizerEmail>
                                    </OrganizerInfo>
                                    <TouchableOpacity
                                        onPress={() => handleRemoveOrganizer(item.user_id)}
                                        disabled={loading}
                                    >
                                        <Feather name="x" size={20} color={colors.error} />
                                    </TouchableOpacity>
                                </OrganizerCard>
                            ))
                        ) : (
                            <EmptyContainer>
                                <EmptyText>Nenhum organizador encontrado</EmptyText>
                            </EmptyContainer>
                        )
                    )}
                </Section>

                <Section>
                    <SectionHeader>
                        <SectionTitle>Competições</SectionTitle>
                    </SectionHeader>
                    {competitions.length > 0 ? (
                        competitions.map(competition => (
                            <CompetitionCard
                                key={competition.id}
                                onPress={() => router.push(`/comunidade/${community?.id}/competicao/${competition.id}`)}>
                                <CompetitionInfo>
                                    <CompetitionName>{competition.name}</CompetitionName>
                                    <CompetitionDescription>{competition.description}</CompetitionDescription>
                                    <CompetitionDetails>
                                        <CompetitionDate>
                                            <Feather name="calendar" size={14} color={colors.gray300} />
                                            <CompetitionDateText>
                                                {new Date(competition.start_date).toLocaleDateString()}
                                            </CompetitionDateText>
                                        </CompetitionDate>
                                    </CompetitionDetails>
                                </CompetitionInfo>
                            </CompetitionCard>
                        ))
                    ) : (
                        <EmptyContainer>
                            <EmptyText>Nenhuma competição encontrada</EmptyText>
                        </EmptyContainer>
                    )}
                </Section>
            </>
        );
    };

    return (
        <Container>
            <PageHeader>
                <BackButton onPress={() => router.back()}>
                    <Feather name="arrow-left" size={24} color={colors.gray100} />
                </BackButton>
                <HeaderTitle>{community?.name}</HeaderTitle>
                <HeaderRight>
                    <StatsButton onPress={() => router.push(`/comunidade/${params.id}/estatisticas`)}>
                        <Feather name="bar-chart-2" size={20} color={colors.gray100} />
                        <StatsButtonText>Estatísticas</StatsButtonText>
                    </StatsButton>
                </HeaderRight>
            </PageHeader>

            <MainContent>
                <ScrollContainer>
                    <ContentContainer>
                        {renderContent()}
                    </ContentContainer>
                </ScrollContainer>
            </MainContent>

            {/* Modais */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={showAddMemberModal}
                onRequestClose={() => {
                    setShowAddMemberModal(false);
                    setSelectedPlayers([]);
                }}
            >
                <ModalContainer>
                    <ModalContent>
                        <ModalHeader>
                            <ModalTitle>Adicionar Membros</ModalTitle>
                            <TouchableOpacity onPress={() => {
                                setShowAddMemberModal(false);
                                setSelectedPlayers([]);
                            }}>
                                <Feather name="x" size={24} color={colors.gray100} />
                            </TouchableOpacity>
                        </ModalHeader>
                        <SelectAllHeader>
                            <SelectAllButton onPress={handleSelectAll}>
                                <Feather 
                                    name={selectedPlayers.length === players.filter(player => 
                                        !members.some(member => member.player_id === player.id)
                                    ).length ? "check-square" : "square"} 
                                    size={24} 
                                    color={colors.primary} 
                                />
                                <SelectAllText>Selecionar Todos</SelectAllText>
                            </SelectAllButton>
                        </SelectAllHeader>
                        <PlayersList
                            data={players.filter(player => 
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
            <Modal
                animationType="slide"
                transparent={true}
                visible={showAddOrganizerModal}
                onRequestClose={() => {
                    setShowAddOrganizerModal(false);
                    setOrganizerEmail('');
                }}
            >
                <ModalContainer>
                    <ModalContent>
                        <ModalHeader>
                            <ModalTitle>Adicionar Organizador</ModalTitle>
                            <TouchableOpacity onPress={() => {
                                setShowAddOrganizerModal(false);
                                setOrganizerEmail('');
                            }}>
                                <Feather name="x" size={24} color={colors.gray100} />
                            </TouchableOpacity>
                        </ModalHeader>
                        <ModalInput
                            value={organizerEmail}
                            onChangeText={(text) => setOrganizerEmail(text)}
                            placeholder="E-mail do organizador"
                        />
                        <SaveButton 
                            onPress={handleAddOrganizer}
                            disabled={organizerEmail === '' || loading}
                        >
                            {loading ? (
                                <ActivityIndicator color={colors.white} />
                            ) : (
                                <SaveButtonText>
                                    Adicionar Organizador
                                </SaveButtonText>
                            )}
                        </SaveButton>
                    </ModalContent>
                </ModalContainer>
            </Modal>
            <FAB onPress={() => router.push({
                pathname: '/comunidade/[id]/competicao/nova',
                params: { id: community.id }
            })}>
                <Feather name="plus" size={24} color={colors.gray100} />
            </FAB>
        </Container>
    );
}
