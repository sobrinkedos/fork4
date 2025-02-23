import React, { useEffect, useState, useCallback } from 'react';
import { Alert, Modal, TouchableOpacity, ActivityIndicator, Animated, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import styled from 'styled-components/native';
import { colors } from '@/styles/colors';
import { Feather } from '@expo/vector-icons';
import { communityService } from '@/services/communityService';
import { communityMembersService } from '@/services/communityMembersService';
import { playersService } from '@/services/playersService';
import { competitionService } from '@/services/competitionService';
import { communityOrganizerService } from '@/services/communityOrganizerService';

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

interface CommunityOrganizer {
    id: string;
    community_id: string;
    user_id: string;
    created_by: string;
    created_at: string;
    updated_at: string;
    user_profile?: {
        name: string;
        email: string;
    };
}

export default function CommunityDetails() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [community, setCommunity] = useState<Community | null>(null);
    const [members, setMembers] = useState<Member[]>([]);
    const [allPlayers, setAllPlayers] = useState<Player[]>([]);
    const [competitions, setCompetitions] = useState<Competition[]>([]);
    const [organizers, setOrganizers] = useState<CommunityOrganizer[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [showMembers, setShowMembers] = useState(false);
    const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
    const [selectedOrganizers, setSelectedOrganizers] = useState<string[]>([]);
    const [rotateAnim] = useState(new Animated.Value(0));
    const [addOrganizerModalVisible, setAddOrganizerModalVisible] = useState(false);
    const [newOrganizerEmail, setNewOrganizerEmail] = useState('');
    const [addingOrganizer, setAddingOrganizer] = useState(false);
    const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);

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
            const { myPlayers, communityPlayers } = await playersService.list();
            const competitionsData = await competitionService.listByCommunity(params.id as string);
            const { data: organizersData } = await communityOrganizerService.listOrganizers(params.id as string);

            setCommunity(communityData);
            setMembers(membersData);
            setAllPlayers([...myPlayers, ...communityPlayers]);
            setCompetitions(competitionsData);
            setOrganizers(organizersData || []);
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            Alert.alert('Erro', 'Erro ao carregar dados da comunidade');
        } finally {
            setLoading(false);
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

    const handleSelectOrganizer = (organizerId: string) => {
        setSelectedOrganizers(prev => {
            if (prev.includes(organizerId)) {
                return prev.filter(id => id !== organizerId);
            }
            return [...prev, organizerId];
        });
    };

    const handleRemoveOrganizer = async (userId: string) => {
        if (!community) return;

        try {
            setLoading(true);
            const { error } = await communityOrganizerService.removeOrganizer(community.id, userId);
            
            if (error) {
                Alert.alert('Erro', error.message);
                return;
            }

            Alert.alert('Sucesso', 'Organizador removido com sucesso');
            await loadData();
        } catch (error: any) {
            Alert.alert('Erro', error.message || 'Erro ao remover organizador');
        } finally {
            setLoading(false);
        }
    };

    const handleAddOrganizer = async () => {
        if (!newOrganizerEmail) {
            Alert.alert('Erro', 'Por favor, insira um email válido');
            return;
        }

        try {
            setAddingOrganizer(true);
            const { error } = await communityOrganizerService.addOrganizer(params.id as string, newOrganizerEmail);
            
            if (error) {
                Alert.alert('Erro', error.message);
                return;
            }

            Alert.alert('Sucesso', 'Organizador adicionado com sucesso');
            setNewOrganizerEmail('');
            setAddOrganizerModalVisible(false);
            loadData(); // Recarrega a lista de organizadores
        } catch (error: any) {
            Alert.alert('Erro', error.message || 'Erro ao adicionar organizador');
        } finally {
            setAddingOrganizer(false);
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
        const availablePlayers = allPlayers?.filter(player => 
            !members.some(member => member.player_id === player.id)
        ) || [];
        
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
                                                <MemberName>{item.players?.name || 'Jogador não encontrado'}</MemberName>
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
                    <OrganizersSectionHeader>
                        <SectionTitle>Organizadores</SectionTitle>
                        <AddButton onPress={() => setAddOrganizerModalVisible(true)}>
                            <Feather name="plus" size={24} color={colors.white} />
                        </AddButton>
                    </OrganizersSectionHeader>
                    
                    <OrganizersListContainer>
                        <OrganizersListScrollView>
                            {organizers.map((organizer) => (
                                <OrganizerCard key={organizer.id}>
                                    <OrganizerInfo>
                                        <OrganizerName>{organizer.user_profile?.name || 'Usuário não encontrado'}</OrganizerName>
                                        <OrganizerEmail>{organizer.user_profile?.email || 'Email não encontrado'}</OrganizerEmail>
                                    </OrganizerInfo>
                                    <RemoveOrganizerButton 
                                        onPress={() => handleRemoveOrganizer(organizer.user_id)}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <ActivityIndicator size="small" color={colors.white} />
                                        ) : (
                                            <Feather name="trash-2" size={20} color={colors.white} />
                                        )}
                                    </RemoveOrganizerButton>
                                </OrganizerCard>
                            ))}
                        </OrganizersListScrollView>
                    </OrganizersListContainer>

                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={addOrganizerModalVisible}
                        onRequestClose={() => setAddOrganizerModalVisible(false)}
                    >
                        <ModalOverlay>
                            <ModalCard>
                                <ModalHeader>
                                    <ModalTitle>Adicionar Organizador</ModalTitle>
                                    <CloseButton onPress={() => setAddOrganizerModalVisible(false)}>
                                        <Feather name="x" size={24} color={colors.white} />
                                    </CloseButton>
                                </ModalHeader>

                                <View style={{
                                    backgroundColor: '#1A1A1A',
                                    borderRadius: 8,
                                    marginBottom: 16,
                                }}>
                                    <TextInput
                                        placeholder="Email do organizador"
                                        value={newOrganizerEmail}
                                        onChangeText={setNewOrganizerEmail}
                                        autoCapitalize="none"
                                        keyboardType="email-address"
                                        style={{
                                            color: '#FFFFFF',
                                            fontSize: 16,
                                            padding: 16,
                                        }}
                                        placeholderTextColor="#666666"
                                    />
                                </View>

                                <ModalButton 
                                    onPress={handleAddOrganizer}
                                    disabled={addingOrganizer}
                                >
                                    {addingOrganizer ? (
                                        <ActivityIndicator color={colors.white} />
                                    ) : (
                                        <ModalButtonText>Adicionar</ModalButtonText>
                                    )}
                                </ModalButton>
                            </ModalCard>
                        </ModalOverlay>
                    </Modal>
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
                }}
            >
                <MembersModalContainer>
                    <MembersModalContent>
                        <ModalHeader>
                            <ModalTitle>Adicionar Membros</ModalTitle>
                            <CloseButton onPress={() => setModalVisible(false)}>
                                <Feather name="x" size={24} color={colors.white} />
                            </CloseButton>
                        </ModalHeader>

                        <SelectAllHeader>
                            <SelectAllButton onPress={handleSelectAll}>
                                <Feather 
                                    name={selectedPlayers.length === allPlayers?.filter(player => 
                                        !members.some(member => member.player_id === player.id)
                                    ).length ? "check-square" : "square"} 
                                    size={24} 
                                    color={colors.primary} 
                                />
                                <SelectAllText>Selecionar Todos</SelectAllText>
                            </SelectAllButton>
                        </SelectAllHeader>

                        <PlayersList
                            data={allPlayers?.filter(player => 
                                !members.some(member => member.player_id === player.id)
                            ) || []}
                            keyExtractor={item => item.id}
                            renderItem={({ item }) => (
                                <PlayerCard 
                                    selected={selectedPlayers.includes(item.id)}
                                    onPress={() => handleSelectPlayer(item.id)}
                                >
                                    <PlayerInfo>
                                        <PlayerName>{item.name}</PlayerName>
                                    </PlayerInfo>
                                    <Feather 
                                        name={selectedPlayers.includes(item.id) ? "check-square" : "square"} 
                                        size={24} 
                                        color={colors.primary} 
                                    />
                                </PlayerCard>
                            )}
                            ListEmptyComponent={
                                <EmptyContainer>
                                    <EmptyText>Nenhum jogador disponível</EmptyText>
                                </EmptyContainer>
                            }
                        />

                        <ModalButton 
                            onPress={handleSaveMembers}
                            disabled={selectedPlayers.length === 0}
                        >
                            <ModalButtonText>Adicionar Selecionados</ModalButtonText>
                        </ModalButton>
                    </MembersModalContent>
                </MembersModalContainer>
            </Modal>
        </Container>
    );
}

const Container = styled.View`
    flex: 1;
    background-color: ${colors.backgroundDark};
`;

const LoadingContainer = styled.View`
    flex: 1;
    justify-content: center;
    align-items: center;
`;

const PageHeader = styled.View`
    padding: 20px;
    background-color: ${colors.secondary};
    padding-top: 60px;
    flex-direction: row;
    align-items: center;
`;

const BackButton = styled.TouchableOpacity`
    margin-right: 16px;
`;

const HeaderTitle = styled.Text`
    font-size: 24px;
    font-weight: bold;
    color: ${colors.gray100};
    flex: 1;
`;

const MainContent = styled.View`
    flex: 1;
    padding: 20px;
`;

const SectionHeader = styled.View`
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    margin-top: 16px;
`;

const SectionTitle = styled.Text`
    font-size: 18px;
    font-weight: bold;
    color: ${colors.gray100};
`;

const Description = styled.Text`
    font-size: 16px;
    color: ${colors.gray300};
    margin-bottom: 24px;
`;

const MembersSection = styled.View`
    margin-top: 24px;
`;

const MembersHeader = styled.TouchableOpacity`
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    background-color: ${colors.secondary};
    border-radius: 8px;
`;

const HeaderLeft = styled.View`
    flex-direction: row;
    align-items: center;
`;

const AnimatedIcon = styled(Animated.View)`
    margin-left: 8px;
`;

const MembersListContainer = styled.View`
    margin-top: 8px;
    background-color: ${colors.secondary};
    border-radius: 8px;
    padding: 12px;
`;

const MembersListScrollView = styled.ScrollView`
    max-height: 300px;
`;

const MembersList = styled.FlatList`
    flex-grow: 0;
`;

const MemberCard = styled.TouchableOpacity<{ selected: boolean }>`
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 12px;
    background-color: ${props => props.selected ? colors.error + '20' : colors.backgroundDark};
    border-radius: 8px;
    margin-bottom: 8px;
`;

const MemberInfo = styled.View`
    flex: 1;
`;

const MemberName = styled.Text`
    font-size: 16px;
    color: ${colors.gray100};
    font-weight: 500;
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

const OrganizersSectionHeader = styled.View`
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
`;

const AddButton = styled.TouchableOpacity`
    background-color: ${colors.primary};
    width: 40px;
    height: 40px;
    border-radius: 20px;
    justify-content: center;
    align-items: center;
`;

const ModalOverlay = styled.View`
    flex: 1;
    justify-content: center;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.8);
    padding: 20px;
`;

const ModalCard = styled.View`
    background-color: ${colors.gray800};
    padding: 20px;
    border-radius: 12px;
    width: 100%;
    shadow-color: #000;
    shadow-offset: 0px 2px;
    shadow-opacity: 0.25;
    shadow-radius: 3.84px;
    elevation: 5;
`;

const ModalHeader = styled.View`
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
`;

const ModalTitle = styled.Text`
    font-size: 20px;
    color: ${colors.white};
    font-weight: bold;
`;

const CloseButton = styled.TouchableOpacity`
    padding: 5px;
`;

const ModalButton = styled.TouchableOpacity`
    background-color: ${colors.primary};
    padding: 12px;
    border-radius: 8px;
    align-items: center;
    justify-content: center;
    opacity: ${props => props.disabled ? 0.7 : 1};
`;

const ModalButtonText = styled.Text`
    color: ${colors.white};
    font-size: 16px;
    font-weight: bold;
`;

const FAB = styled.TouchableOpacity`
    position: absolute;
    right: 16px;
    bottom: 16px;
    width: 56px;
    height: 56px;
    border-radius: 28px;
    background-color: ${colors.primary};
    align-items: center;
    justify-content: center;
    elevation: 5;
    shadow-color: ${colors.primary};
    shadow-offset: 0px 2px;
    shadow-opacity: 0.25;
    shadow-radius: 3.84px;
`;

const ManageButton = styled.TouchableOpacity`
    flex-direction: row;
    align-items: center;
    background-color: ${colors.primary};
    padding: 8px 16px;
    border-radius: 8px;
`;

const ManageButtonText = styled.Text`
    color: ${colors.gray100};
    font-size: 14px;
    font-weight: 500;
    margin-right: 8px;
`;

const CompetitionsList = styled.FlatList`
    flex-grow: 0;
    margin-top: 8px;
`;

const CompetitionCard = styled.TouchableOpacity`
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    background-color: ${colors.secondary};
    border-radius: 8px;
    margin-bottom: 8px;
`;

const CompetitionInfo = styled.View`
    flex: 1;
    margin-right: 16px;
`;

const CompetitionName = styled.Text`
    font-size: 16px;
    font-weight: bold;
    color: ${colors.gray100};
`;

const CompetitionDescription = styled.Text`
    font-size: 14px;
    color: ${colors.gray300};
    margin-top: 4px;
`;

const CompetitionDetails = styled.View`
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin-top: 8px;
`;

const CompetitionDate = styled.View`
    flex-direction: row;
    align-items: center;
`;

const CompetitionDateText = styled.Text`
    color: ${colors.gray300};
    font-size: 14px;
    margin-left: 4px;
`;
const CompetitionStatus = styled.View`
    margin-left: 16px;
`;

const StatusBadge = styled.View<{ status: string }>`
    padding: 4px 8px;
    border-radius: 4px;
    background-color: ${({ status }) => {
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
    }};
`;

const StatusText = styled.Text`
    color: ${colors.gray100};
    font-size: 12px;
    font-weight: bold;
`;

const SelectButton = styled.TouchableOpacity<{ selected: boolean }>`
    padding: 4px;
`;

const SaveButton = styled.TouchableOpacity<{ disabled?: boolean }>`
    background-color: ${colors.primary};
    padding: 16px;
    border-radius: 8px;
    align-items: center;
    justify-content: center;
    opacity: ${props => props.disabled ? 0.7 : 1};
`;

const SaveButtonText = styled.Text`
    color: ${colors.white};
    font-size: 16px;
    font-weight: bold;
`;

const SelectAllHeader = styled.View`
    padding: 16px;
    border-bottom-width: 1px;
    border-bottom-color: ${colors.gray800};
`;

const SelectAllButton = styled.TouchableOpacity`
    flex-direction: row;
    align-items: center;
`;

const SelectAllText = styled.Text`
    color: ${colors.gray100};
    font-size: 16px;
    margin-left: 8px;
`;

const ExpandButton = styled.TouchableOpacity`
    padding: 4px;
    margin-left: 8px;
`;

const RemoveButton = styled.TouchableOpacity<{ disabled?: boolean }>`
    background-color: ${colors.error};
    padding: 16px;
    border-radius: 8px;
    align-items: center;
    justify-content: center;
    opacity: ${props => props.disabled ? 0.7 : 1};
    margin-top: 16px;
    margin-bottom: 16px;
`;

const RemoveButtonText = styled.Text`
    color: ${colors.white};
    font-size: 16px;
    font-weight: bold;
`;

const EmptyContainer = styled.View`
    flex: 1;
    justify-content: center;
    align-items: center;
    padding: 20px;
`;

const EmptyText = styled.Text`
    color: ${colors.gray300};
    font-size: 16px;
    text-align: center;
`;

const PlayersList = styled.FlatList`
    flex: 1;
`;

const PlayerCard = styled.TouchableOpacity<{ selected: boolean }>`
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    background-color: ${props => props.selected ? colors.primary + '20' : colors.secondary};
    border-radius: 8px;
    margin-bottom: 8px;
`;

const PlayerInfo = styled.View`
    flex: 1;
`;

const PlayerName = styled.Text`
    font-size: 16px;
    color: ${colors.gray100};
    font-weight: 500;
`;

const MembersModalContainer = styled(ModalOverlay)`
    justify-content: flex-end;
`;

const MembersModalContent = styled(ModalCard)`
    border-top-left-radius: 20px;
    border-top-right-radius: 20px;
    height: 80%;
    width: 100%;
`;
