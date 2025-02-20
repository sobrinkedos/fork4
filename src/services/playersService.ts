import { supabase } from '@/lib/supabase';

export const playersService = {
    async list() {
        try {
            console.log('Buscando jogadores...');
            const { data, error } = await supabase
                .from('players')
                .select('*')
                .order('name');

            if (error) {
                console.error('Erro ao buscar jogadores:', error);
                throw error;
            }

            console.log('Jogadores encontrados:', data?.length || 0);
            return data || [];
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
