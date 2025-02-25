import { supabase } from '@/lib/supabase';

export const playersService = {
    async list() {
        try {
            console.log('Buscando jogadores...');
            const userId = (await supabase.auth.getUser()).data.user?.id;
            if (!userId) throw new Error('Usuário não autenticado');
            
            // Buscar jogadores criados pelo usuário
            console.log('Buscando jogadores criados pelo usuário...');
            const { data: createdPlayers, error: createdError } = await supabase
                .from('players')
                .select('*')
                .eq('created_by', userId)
                .order('name');

            if (createdError) {
                console.error('Erro ao buscar jogadores criados:', createdError);
                throw createdError;
            }

            // Buscar jogadores vinculados ao usuário
            console.log('Buscando jogadores vinculados ao usuário...');
            const { data: linkedPlayers, error: linkedError } = await supabase
                .from('user_player_relations')
                .select('player:player_id(*)')
                .eq('user_id', userId);

            if (linkedError) {
                console.error('Erro ao buscar jogadores vinculados:', linkedError);
                throw linkedError;
            }

            // Combinar jogadores criados e vinculados
            const userPlayers = [
                ...(createdPlayers || []),
                ...(linkedPlayers?.map(lp => lp.player) || [])
            ];

            // Lista de IDs de jogadores do usuário
            const userPlayerIds = userPlayers.map(p => p.id);

            // Buscar jogadores das comunidades onde sou organizador
            console.log('Buscando jogadores das comunidades...');
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
                .eq('community_members.communities.community_organizers.user_id', userId)
                .order('name');

            if (communityPlayersError) {
                console.error('Erro ao buscar jogadores das comunidades:', communityPlayersError);
                throw communityPlayersError;
            }

            // Remover duplicatas dos jogadores das comunidades e filtrar os que já são do usuário
            const uniqueCommunityPlayers = communityPlayers 
                ? Array.from(new Set(communityPlayers.map(p => p.id)))
                    .map(id => communityPlayers.find(p => p.id === id))
                    .filter(p => p !== undefined && !userPlayerIds.includes(p.id))
                : [];

            // Remover duplicatas e ordenar por nome
            const uniqueUserPlayers = Array.from(new Set(userPlayers.map(p => p.id)))
                .map(id => userPlayers.find(p => p.id === id))
                .filter(p => p !== undefined)
                .sort((a, b) => a.name.localeCompare(b.name));

            return {
                myPlayers: uniqueUserPlayers,
                communityPlayers: uniqueCommunityPlayers
            };
        } catch (error) {
            console.error('Erro ao listar jogadores:', error);
            throw error;
        }
    },

    async getPlayer(id: string) {
        try {
            const { data, error } = await supabase
                .from('players')
                .select('id, name')
                .eq('id', id)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Erro ao buscar jogador:', error);
            throw error;
        }
    },

    async createPlayer(name: string) {
        try {
            const { data, error } = await supabase
                .from('players')
                .insert([{ name }])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Erro ao criar jogador:', error);
            throw error;
        }
    },

    async updatePlayer(id: string, name: string) {
        try {
            const { data, error } = await supabase
                .from('players')
                .update({ name })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Erro ao atualizar jogador:', error);
            throw error;
        }
    },

    async deletePlayer(id: string) {
        try {
            const { error } = await supabase
                .from('players')
                .delete()
                .eq('id', id);

            if (error) throw error;
        } catch (error) {
            console.error('Erro ao deletar jogador:', error);
            throw error;
        }
    }
};
