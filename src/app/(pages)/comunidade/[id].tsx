import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Alert, Modal, TouchableOpacity, ActivityIndicator, Animated, FlatList, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import styled from 'styled-components/native';
import { useTheme } from '@/contexts/ThemeProvider';
import { Feather } from '@expo/vector-icons';
import { communityService } from '@/services/communityService';
import { communityMembersService } from '@/services/communityMembersService';
import { communityOrganizersService } from '@/services/communityOrganizersService';
import { playersService } from '@/services/playersService';
import { competitionService } from '@/services/competitionService';
import { useAuth } from '@/hooks/useAuth';
import { InternalHeader } from '@/components/InternalHeader';

type CommunityOrganizer = {
    id: string;
    community_id: string;
    user_id: string;
    user_profile?: {
        id: string;
        name: string;
        email: string;
    };
    is_creator?: boolean;
};

type Community = {
    id: string;
    name: string;
    description: string;
    created_at: string;
    created_by: string;
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
    background-color: ${props => props.colors.backgroundDark};
    padding: 0;
`;

const MainContent = styled.View`
    flex: 1;
    padding: 8px;
`;

const ScrollContainer = styled.ScrollView`
    flex: 1;
    background-color: ${props => props.colors.background};
`;

const ContentContainer = styled.View`
    padding: 24px;
    background-color: ${props => props.colors.background};
`;

const Section = styled.View<{ colors: any }>`
    background-color: ${props => props.colors.gray800};
    border-radius: 8px;
    padding: 12px;
    margin: 8px 0;
`;

const SectionHeader = styled.TouchableOpacity`
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
`;

const HeaderLeft = styled.View`
    flex-direction: row;
    align-items: center;
    gap: 8px;
`;

const SectionTitle = styled.Text<{ colors: any }>`
    color: ${props => props.colors.text};
    font-size: 16px;
    font-weight: bold;
`;

const ExpandButton = styled.TouchableOpacity`
    padding: 8px;
`;

const ManageButton = styled.TouchableOpacity<{ colors: any }>`
    flex-direction: row;
    align-items: center;
    justify-content: center;
    background-color: ${({ colors }) => colors.primary};
    padding: 12px;
    border-radius: 8px;
    margin-top: 8px;
`;

const ManageButtonText = styled.Text<{ colors: any }>`
    color: ${({ colors }) => colors.white};
    font-size: 14px;
    font-weight: bold;
    margin-left: 8px;
`;

const MemberCard = styled.View`
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 12px;
    background-color: ${props => props.colors.gray700};
    border-radius: 8px;
    margin-top: 8px;
`;

const MemberInfo = styled.View`
    flex: 1;
`;

const MemberName = styled.Text`
    font-size: 16px;
    font-weight: bold;
    color: ${props => props.colors.gray100};
`;

const SelectAllHeader = styled.View`
    margin-bottom: 16px;
`;

const SelectAllButton = styled.TouchableOpacity`
    flex-direction: row;
    align-items: center;
`;

const SelectAllText = styled.Text`
    color: ${props => props.colors.gray100};
    font-size: 14px;
    margin-left: 8px;
`;

const RemoveButton = styled.TouchableOpacity`
    padding: 8px;
    background-color: ${props => props.colors.red500};
    border-radius: 4px;
    margin-top: 16px;
`;

const RemoveButtonText = styled.Text`
    color: ${props => props.colors.white};
    font-size: 14px;
`;

const OrganizerCard = styled.View`
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 12px;
    background-color: ${props => props.colors.gray700};
    border-radius: 8px;
    margin-top: 8px;
`;

const OrganizerInfo = styled.View`
    flex: 1;
`;

const OrganizerName = styled.Text`
    font-size: 16px;
    font-weight: bold;
    color: ${props => props.colors.gray100};
`;

const OrganizerEmail = styled.Text`
    font-size: 14px;
    color: ${props => props.colors.gray300};
    margin-top: 4px;
`;

const RemoveOrganizerButton = styled.TouchableOpacity`
    padding: 8px;
    background-color: ${props => props.colors.red500};
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
    background-color: ${props => props.colors.gray800};
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
    color: ${props => props.colors.gray100};
`;

const ModalSubtitle = styled.Text`
    font-size: 14px;
    color: ${props => props.colors.gray300};
    margin-bottom: 16px;
`;

const ModalInput = styled.TextInput`
    width: 100%;
    height: 48px;
    background-color: ${props => props.colors.gray800};
    border-radius: 8px;
    padding: 0 16px;
    color: ${props => props.colors.gray100};
    margin-bottom: 16px;
`;

const ModalButtonsContainer = styled.View`
    flex-direction: row;
    justify-content: space-between;
    margin-top: 16px;
`;

const ModalCancelButton = styled.TouchableOpacity`
    padding: 8px;
    background-color: ${props => props.colors.gray600};
    border-radius: 4px;
    align-items: center;
    opacity: 0.7;
`;

const ModalButtonText = styled.Text<{ variant?: 'secondary' }>`
    color: ${props => props.variant === 'secondary' ? props.colors.gray100 : props.colors.white};
    font-size: 14px;
`;

const SaveButton = styled.TouchableOpacity<{ disabled?: boolean }>`
    padding: 8px;
    background-color: ${props => props.disabled ? props.colors.gray600 : props.colors.primary};
    border-radius: 4px;
    align-items: center;
    opacity: ${props => props.disabled ? 0.7 : 1};
`;

const SaveButtonText = styled.Text`
    color: ${props => props.colors.white};
    font-size: 14px;
`;

const FAB = styled.TouchableOpacity`
    position: absolute;
    bottom: 24px;
    right: 24px;
    padding: 16px;
    background-color: ${props => props.colors.primary};
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
    color: ${props => props.colors.gray300};
`;

const PlayerCard = styled.View<{ colors: any }>`
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 12px;
    background-color: ${({ colors }) => colors.gray700};
    border-radius: 8px;
    margin-bottom: 8px;
`;

const PlayerInfo = styled.View`
    flex: 1;
`;

const PlayerName = styled.Text<{ colors: any }>`
    color: ${({ colors }) => colors.text};
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
    background-color: ${props => props.colors.gray800};
    border-radius: 8px;
    margin-bottom: 8px;
`;

const CompetitionInfo = styled.View`
    flex: 1;
`;

const CompetitionName = styled.Text`
    color: ${props => props.colors.gray100};
    font-size: 16px;
    font-weight: bold;
`;

const CompetitionDescription = styled.Text`
    color: ${props => props.colors.gray300};
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
    color: ${props => props.colors.gray300};
    font-size: 14px;
    margin-left: 4px;
`;

const CompetitionStatus = styled.View`
    flex-direction: row;
    align-items: center;
`;

const StatusBadge = styled.View`
    padding: 4px 8px;
    background-color: ${props => props.status === 'pending' ? props.colors.warning : props.status === 'in_progress' ? props.colors.primary : props.colors.success};
    border-radius: 4px;
    margin-left: 8px;
`;

const StatusText = styled.Text`
    color: ${props => props.colors.white};
    font-size: 12px;
`;

const Description = styled.Text<{ colors: any }>`
    color: ${props => props.colors.gray300};
    font-size: 14px;
    line-height: 20px;
`;

const ShowMoreContainer = styled.TouchableOpacity`
    flex-direction: row;
    align-items: center;
    margin-top: 8px;
`;

const ShowMoreText = styled.Text`
    color: ${props => props.colors.primary};
    font-size: 14px;
    margin-left: 4px;
`;

const StatsButton = styled.TouchableOpacity<{ pressed?: boolean; colors: any }>`
    flex-direction: row;
    align-items: center;
    justify-content: center;
    background-color: ${({ colors }) => colors.primary};
    padding: 12px 16px;
    border-radius: 8px;
    margin: 8px 16px;
`;

const StatsButtonText = styled.Text<{ colors: any }>`
    color: ${({ colors }) => colors.white};
    font-size: 16px;
    font-weight: bold;
    margin-left: 8px;
`;

export default function CommunityDetails() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { session } = useAuth();
    const { theme, colors } = useTheme();
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
    const [newOrganizerEmail, setNewOrganizerEmail] = useState('');
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const [isPressed, setIsPressed] = useState(false);
    const [isOrganizer, setIsOrganizer] = useState(false);

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
        if (!newOrganizerEmail || !session?.user?.id) {
            Alert.alert('Erro', 'Por favor, insira um email válido');
            return;
        }

        setLoading(true);
        try {
            await communityOrganizersService.addOrganizer(
                params.id as string, 
                newOrganizerEmail,
                session.user.id
            );
            const updatedOrganizers = await communityOrganizersService.listOrganizers(params.id as string);
            setOrganizers(updatedOrganizers);
            setNewOrganizerEmail('');
            setShowAddOrganizerModal(false);
            Alert.alert('Sucesso', 'Organizador adicionado com sucesso!');
        } catch (error) {
            console.error('Erro ao adicionar organizador:', error);
            if (error instanceof Error && error.message.includes('não encontrado')) {
                Alert.alert(
                    'Usuário não encontrado',
                    'Este usuário ainda não está cadastrado no sistema. Deseja enviar um convite por email?',
                    [
                        {
                            text: 'Não',
                            style: 'cancel',
                        },
                        {
                            text: 'Sim',
                            onPress: () => {
                                // Aqui você poderia implementar um envio de convite
                                Alert.alert('Informação', 'Funcionalidade de convite será implementada em breve.');
                            },
                        },
                    ]
                );
            } else {
                Alert.alert('Erro', error instanceof Error ? error.message : 'Não foi possível adicionar o organizador');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveOrganizer = async (userId: string) => {
        try {
            await communityOrganizersService.removeOrganizer(params.id as string, userId);
            const updatedOrganizers = await communityOrganizersService.listOrganizers(params.id as string);
            setOrganizers(updatedOrganizers);
            Alert.alert('Sucesso', 'Organizador removido com sucesso!');
        } catch (error) {
            console.error('Erro ao remover organizador:', error);
            Alert.alert('Erro', 'Não foi possível remover o organizador');
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

    useEffect(() => {
        const loadOrganizers = async () => {
            try {
                const data = await communityOrganizersService.listOrganizers(params.id as string);
                setOrganizers(data);
            } catch (error) {
                console.error('Erro ao carregar organizadores:', error);
            }
        };

        loadOrganizers();
    }, [params.id]);

    useEffect(() => {
        if (session?.user?.id && organizers.length > 0) {
            const userIsOrganizer = organizers.some(org => org.user_id === session.user?.id);
            setIsOrganizer(userIsOrganizer);
        }
    }, [organizers, session?.user?.id]);

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

    const renderMembers = () => (
        <>
            {selectedMembers.length > 0 && (
                <SelectAllHeader>
                    <SelectAllButton onPress={handleSelectAllMembers}>
                        <Feather 
                            name={selectedMembers.length === members.length ? "check-square" : "square"} 
                            size={24} 
                            color={colors.primary} 
                        />
                        <SelectAllText colors={colors}>Selecionar Todos</SelectAllText>
                    </SelectAllButton>
                </SelectAllHeader>
            )}
            {members.map(member => (
                <MemberCard key={member.player_id} colors={colors}>
                    <MemberInfo>
                        <MemberName colors={colors}>{member.players.name}</MemberName>
                    </MemberInfo>
                    <TouchableOpacity onPress={() => handleSelectMember(member.player_id)}>
                        <Feather 
                            name={selectedMembers.includes(member.player_id) ? "check-square" : "square"} 
                            size={24} 
                            color={selectedMembers.includes(member.player_id) ? colors.primary : colors.gray300} 
                        />
                    </TouchableOpacity>
                </MemberCard>
            ))}
            {selectedMembers.length > 0 && (
                <RemoveButton 
                    onPress={handleRemoveMembers}
                    disabled={loading}
                    colors={colors}
                >
                    {loading ? (
                        <ActivityIndicator color={colors.white} />
                    ) : (
                        <RemoveButtonText colors={colors}>
                            Remover {selectedMembers.length} {selectedMembers.length === 1 ? 'membro' : 'membros'}
                        </RemoveButtonText>
                    )}
                </RemoveButton>
            )}
        </>
    );

    const renderOrganizers = () => (
        <>
            {organizers.map((organizer) => (
                <PlayerCard key={organizer.id} colors={colors}>
                    <PlayerInfo>
                        <PlayerName colors={colors}>
                            {organizer.user_profile?.name || organizer.user_profile?.email}
                            {organizer.is_creator ? " (Criador)" : ""}
                        </PlayerName>
                    </PlayerInfo>
                    {!organizer.is_creator && (
                        <TouchableOpacity onPress={() => handleRemoveOrganizer(organizer.user_id)}>
                            <Feather name="x" size={24} color={colors.error} />
                        </TouchableOpacity>
                    )}
                </PlayerCard>
            ))}
        </>
    );

    const renderContent = () => {
        if (loading) {
            return (
                <LoadingContainer>
                    <ActivityIndicator size="large" color={colors.primary} />
                </LoadingContainer>
            );
        }

        if (!community) {
            return (
                <EmptyContainer>
                    <EmptyText colors={colors}>Comunidade não encontrada</EmptyText>
                </EmptyContainer>
            );
        }

        const isCreator = community.created_by === session?.user?.id;

        return (
            <>
                <Section colors={colors}>
                    <TouchableOpacity 
                        onPress={() => router.push(`/comunidade/${params.id}/estatisticas`)}
                    >
                        <HeaderLeft>
                            <Feather name="bar-chart-2" size={24} color={colors.text} />
                            <SectionTitle colors={colors}>Estatísticas</SectionTitle>
                        </HeaderLeft>
                    </TouchableOpacity>
                </Section>

                {community.description && (
                    <Section colors={colors}>
                        <Description colors={colors}>{community.description}</Description>
                        {community.description.length > 100 && (
                            <ShowMoreContainer onPress={() => setIsDescriptionExpanded(!isDescriptionExpanded)}>
                                <Animated.View style={{ transform: [{ rotate: '0deg' }] }}>
                                    <Feather 
                                        name={isDescriptionExpanded ? "chevron-up" : "chevron-down"} 
                                        size={24} 
                                        color={colors.text} 
                                    />
                                </Animated.View>
                                <ShowMoreText colors={colors}>
                                    {isDescriptionExpanded ? 'Ver menos' : 'Ver mais'}
                                </ShowMoreText>
                            </ShowMoreContainer>
                        )}
                    </Section>
                )}

                <Section colors={colors}>
                    <SectionHeader onPress={toggleMembers}>
                        <HeaderLeft>
                            <SectionTitle colors={colors}>Membros ({members.length})</SectionTitle>
                            {(isCreator || isOrganizer) && (
                                <TouchableOpacity onPress={() => setShowAddMemberModal(true)}>
                                    <Feather name="user-plus" size={20} color={colors.primary} />
                                </TouchableOpacity>
                            )}
                        </HeaderLeft>
                        <Animated.View style={{ transform: [{ rotate: rotateMembers }] }}>
                            <Feather name="chevron-down" size={24} color={colors.text} />
                        </Animated.View>
                    </SectionHeader>
                    {showMembers && renderMembers()}
                </Section>

                <Section colors={colors}>
                    <SectionHeader onPress={toggleOrganizers}>
                        <HeaderLeft>
                            <SectionTitle colors={colors}>Organizadores ({organizers.length})</SectionTitle>
                            {isCreator && (
                                <TouchableOpacity onPress={() => setShowAddOrganizerModal(true)}>
                                    <Feather name="user-plus" size={20} color={colors.primary} />
                                </TouchableOpacity>
                            )}
                        </HeaderLeft>
                        <Animated.View style={{ transform: [{ rotate: rotateOrganizers }] }}>
                            <Feather name="chevron-down" size={24} color={colors.text} />
                        </Animated.View>
                    </SectionHeader>
                    {showOrganizers && renderOrganizers()}
                </Section>

                {competitions.length > 0 && (
                    <Section colors={colors}>
                        <SectionHeader>
                            <HeaderLeft>
                                <SectionTitle colors={colors}>Competições ({competitions.length})</SectionTitle>
                            </HeaderLeft>
                        </SectionHeader>

                        {competitions.map(competition => (
                            <CompetitionCard 
                                key={competition.id} 
                                onPress={() => router.push(`/comunidade/${params.id}/competicao/${competition.id}`)}
                                colors={colors}
                            >
                                <CompetitionInfo>
                                    <CompetitionName colors={colors}>{competition.name}</CompetitionName>
                                    <CompetitionDescription colors={colors}>{competition.description}</CompetitionDescription>
                                    <CompetitionDetails>
                                        <CompetitionDate>
                                            <Feather name="calendar" size={14} color={colors.gray300} />
                                            <CompetitionDateText colors={colors}>
                                                {new Date(competition.start_date).toLocaleDateString()}
                                            </CompetitionDateText>
                                        </CompetitionDate>
                                    </CompetitionDetails>
                                </CompetitionInfo>
                            </CompetitionCard>
                        ))}
                    </Section>
                )}
            </>
        );
    };

    return (
        <Container colors={colors}>
            <InternalHeader 
                title={community?.name || 'Carregando...'}
                onBack={() => router.back()}
            />
            <MainContent>
                <ScrollView>
                    {renderContent()}
                </ScrollView>
            </MainContent>

            <Modal
                visible={showAddOrganizerModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowAddOrganizerModal(false)}
            >
                <ModalContainer>
                    <ModalContent colors={colors}>
                        <ModalTitle colors={colors}>Adicionar Organizador</ModalTitle>
                        <ModalSubtitle colors={colors}>
                            Digite o email de um usuário já cadastrado no sistema.
                        </ModalSubtitle>
                        <ModalInput
                            value={newOrganizerEmail}
                            onChangeText={setNewOrganizerEmail}
                            placeholder="Email do organizador"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            colors={colors}
                        />
                        <ModalButtonsContainer>
                            <ModalCancelButton 
                                onPress={() => {
                                    setShowAddOrganizerModal(false);
                                    setNewOrganizerEmail('');
                                }}
                                colors={colors}
                            >
                                <ModalButtonText colors={colors} variant="secondary">
                                    Cancelar
                                </ModalButtonText>
                            </ModalCancelButton>
                            <SaveButton 
                                onPress={handleAddOrganizer}
                                disabled={newOrganizerEmail === '' || loading}
                                colors={colors}
                            >
                                {loading ? (
                                    <ActivityIndicator color={colors.white} />
                                ) : (
                                    <SaveButtonText colors={colors}>
                                        Adicionar
                                    </SaveButtonText>
                                )}
                            </SaveButton>
                        </ModalButtonsContainer>
                    </ModalContent>
                </ModalContainer>
            </Modal>

            <FAB onPress={() => router.push({
                pathname: '/comunidade/[id]/competicao/nova',
                params: { id: community.id }
            })} colors={colors}>
                <Feather name="plus" size={24} color={colors.gray100} />
            </FAB>
        </Container>
    );
}
