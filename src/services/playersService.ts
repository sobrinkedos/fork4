import { supabase } from '@/lib/supabase';

export const playersService = {
    async list() {
        try {
            console.log('Buscando jogadores...');
            
            // Buscar jogadores criados pelo usuário
            const { data: myPlayers, error: myPlayersError } = await supabase
                .from('players')
                .select('*')
                .eq('created_by', (await supabase.auth.getUser()).data.user?.id)
                .order('name');

            if (myPlayersError) {
                console.error('Erro ao buscar meus jogadores:', myPlayersError);
                throw myPlayersError;
            }

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
                .neq('created_by', (await supabase.auth.getUser()).data.user?.id)
                .eq('community_members.communities.community_organizers.user_id', (await supabase.auth.getUser()).data.user?.id)
                .order('name');

            if (communityPlayersError) {
                console.error('Erro ao buscar jogadores das comunidades:', communityPlayersError);
                throw communityPlayersError;
            }

            // Remover duplicatas dos jogadores das comunidades
            const uniqueCommunityPlayers = communityPlayers ? Array.from(new Set(communityPlayers.map(p => p.id)))
                .map(id => communityPlayers.find(p => p.id === id))
                .filter(p => p !== undefined) : [];

            return {
                myPlayers: myPlayers || [],
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
