import { supabase } from '@/lib/supabase';

export interface Player {
    id: string;
    name: string;
    phone: string;
    created_at: string;
    nickname?: string;
    created_by: string;
    isLinkedUser?: boolean;
    isMine?: boolean;
    user_player_relations?: Array<{
        is_primary_user: boolean;
        user_id: string;
    }>;
}

interface CreatePlayerDTO {
    name: string;
    phone: string;
}

class PlayerService {
    private players: Player[] = [];

    async getByPhone(phone: string) {
        try {
            const { data, error } = await supabase
                .from('players')
                .select('*')
                .eq('phone', phone)
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116 é o código para "não encontrado"
                console.error('Erro ao buscar jogador por telefone:', error);
                throw new Error('Erro ao buscar jogador por telefone');
            }

            return data;
        } catch (error) {
            console.error('Erro ao buscar jogador por telefone:', error);
            throw error;
        }
    }

    async create(data: CreatePlayerDTO) {
        try {
            // Verifica se já existe jogador com este telefone
            const existingPlayer = await this.getByPhone(data.phone);
            if (existingPlayer) {
                throw new Error('Já existe um jogador cadastrado com este telefone');
            }

            const { data: userData, error: userError } = await supabase.auth.getUser();
            if (userError) throw userError;

            const { data: newPlayer, error } = await supabase
                .from('players')
                .insert([{
                    ...data,
                    created_by: userData.user.id
                }])
                .select()
                .single();

            if (error) {
                if (error.code === '23505') { // Código do PostgreSQL para violação de UNIQUE
                    throw new Error('Já existe um jogador cadastrado com este telefone');
                }
                console.error('Erro ao criar jogador:', error);
                throw new Error('Erro ao criar jogador');
            }

            // Atualiza a lista de jogadores em memória
            await this.list();

            return newPlayer;
        } catch (error) {
            console.error('Erro ao criar jogador:', error);
            throw error;
        }
    }

    async list() {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Usuário não autenticado');

            // Buscar jogadores criados pelo usuário
            const { data: createdPlayers, error: createdPlayersError } = await supabase
                .from('players')
                .select('*')
                .eq('created_by', user.id)
                .order('name');

            if (createdPlayersError) {
                console.error('Erro ao buscar jogadores criados:', createdPlayersError);
                throw createdPlayersError;
            }

            // Buscar jogadores vinculados ao usuário
            const { data: linkedPlayers, error: linkedPlayersError } = await supabase
                .from('players')
                .select(`
                    *,
                    user_player_relations!inner (
                        is_primary_user
                    )
                `)
                .eq('user_player_relations.user_id', user.id)
                .order('name');

            if (linkedPlayersError) {
                console.error('Erro ao buscar jogadores vinculados:', linkedPlayersError);
                throw linkedPlayersError;
            }

            // Combinar e remover duplicatas
            const myPlayersMap = new Map();
            
            // Adicionar jogadores criados
            createdPlayers?.forEach(player => {
                myPlayersMap.set(player.id, {
                    ...player,
                    isMine: true,
                    isLinkedUser: false
                });
            });

            // Adicionar jogadores vinculados
            linkedPlayers?.forEach(player => {
                if (!myPlayersMap.has(player.id)) {
                    myPlayersMap.set(player.id, {
                        ...player,
                        isMine: false,
                        isLinkedUser: true
                    });
                } else {
                    // Se já existe (foi criado pelo usuário), apenas marca como vinculado
                    const existingPlayer = myPlayersMap.get(player.id);
                    myPlayersMap.set(player.id, {
                        ...existingPlayer,
                        isLinkedUser: true
                    });
                }
            });

            const myPlayers = Array.from(myPlayersMap.values());
            const myPlayerIds = myPlayers.map(p => p.id);

            // Buscar jogadores das comunidades onde sou organizador
            const { data: communityPlayers, error: communityPlayersError } = await supabase
                .from('players')
                .select(`
                    *,
                    community_members!inner (
                        community_id,
                        communities!inner (
                            id,
                            community_organizers!inner (
                                user_id
                            )
                        )
                    )
                `)
                .eq('community_members.communities.community_organizers.user_id', user.id)
                .filter('id', 'not.in', `(${myPlayerIds.join(',')})`)
                .order('name');

            if (communityPlayersError) {
                console.error('Erro ao buscar jogadores da comunidade:', communityPlayersError);
                throw communityPlayersError;
            }

            return {
                myPlayers: myPlayers,
                communityPlayers: communityPlayers || []
            };
        } catch (error) {
            console.error('Erro ao listar jogadores:', error);
            throw error;
        }
    }

    async getById(id: string) {
        try {
            const { data, error } = await supabase
                .from('players')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                console.error('Erro ao buscar jogador:', error);
                throw new Error('Erro ao buscar jogador');
            }

            return data;
        } catch (error) {
            console.error('Erro ao buscar jogador:', error);
            throw error;
        }
    }

    async update(id: string, data: Partial<CreatePlayerDTO>) {
        try {
            const { data: updatedPlayer, error } = await supabase
                .from('players')
                .update(data)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                console.error('Erro ao atualizar jogador:', error);
                throw new Error('Erro ao atualizar jogador');
            }

            // Atualiza a lista de jogadores em memória
            await this.list();

            return updatedPlayer;
        } catch (error) {
            console.error('Erro ao atualizar jogador:', error);
            throw error;
        }
    }

    async delete(id: string) {
        try {
            const { error } = await supabase
                .from('players')
                .delete()
                .eq('id', id);

            if (error) {
                console.error('Erro ao excluir jogador:', error);
                throw new Error('Erro ao excluir jogador');
            }

            // Atualiza a lista de jogadores em memória
            await this.list();
        } catch (error) {
            console.error('Erro ao excluir jogador:', error);
            throw error;
        }
    }
}

export const playerService = new PlayerService();
