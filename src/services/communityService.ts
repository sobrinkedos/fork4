import { supabase } from '@/lib/supabase';

export interface Community {
    id: string;
    name: string;
    description: string;
    created_by: string;
    created_at: string;
    updated_at: string;
    members_count: number;
    games_count: number;
    is_organizer?: boolean;
}

export interface CreateCommunityDTO {
    name: string;
    description: string;
}

export interface UpdateCommunityDTO {
    name?: string;
    description?: string;
}

class CommunityService {
    private communities: Community[] = [];

    async listCommunities() {
        try {
            const { data, error } = await supabase
                .from('communities')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Erro ao listar comunidades:', error);
                throw error;
            }

            return { data, error: null };
        } catch (error) {
            console.error('Erro ao listar comunidades:', error);
            return { data: null, error };
        }
    }

    async list() {
        try {
            const userId = (await supabase.auth.getUser()).data.user?.id;
            if (!userId) throw new Error('Usuário não autenticado');

            console.log('Buscando comunidades para o usuário:', userId);

            // Busca todas as comunidades onde o usuário é criador
            const { data: createdCommunities = [], error: createdError } = await supabase
                .from('communities')
                .select(`
                    *,
                    members:community_members(count)
                `)
                .eq('created_by', userId);

            if (createdError) {
                console.error('Erro ao listar comunidades criadas:', createdError);
                throw new Error('Erro ao listar comunidades');
            }

            // Primeiro busca os IDs das comunidades onde o usuário é organizador
            const { data: organizedIds = [], error: organizedIdsError } = await supabase
                .from('community_organizers')
                .select('community_id')
                .eq('user_id', userId);

            if (organizedIdsError) {
                console.error('Erro ao buscar IDs de comunidades organizadas:', organizedIdsError);
                throw new Error('Erro ao listar comunidades');
            }

            // Depois busca os detalhes dessas comunidades
            const { data: organizedCommunities = [], error: organizedError } = await supabase
                .from('communities')
                .select(`
                    id,
                    name,
                    description,
                    created_at,
                    created_by,
                    members:community_members(count)
                `)
                .in('id', organizedIds.map(org => org.community_id));

            if (organizedError) {
                console.error('Erro ao listar comunidades organizadas:', organizedError);
                throw new Error('Erro ao listar comunidades');
            }

            // Combina as comunidades e remove duplicatas
            const allCommunities = [
                ...createdCommunities.map(c => ({ ...c, is_organizer: false })),
                ...organizedCommunities.map(c => ({ ...c, is_organizer: true }))
            ];

            console.log('Todas as comunidades:', allCommunities);

            return allCommunities.map(community => ({
                ...community,
                members_count: community.members?.[0]?.count || 0,
                games_count: 0
            }));

        } catch (error) {
            console.error('Erro ao listar comunidades:', error);
            throw error;
        }
    }

    async getById(id: string) {
        try {
            const { data, error } = await supabase
                .from('communities')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Erro ao buscar comunidade:', error);
            throw error;
        }
    }

    async createCommunity(community: CreateCommunityDTO) {
        try {
            const { data: userData, error: userError } = await supabase.auth.getUser();
            if (userError) throw userError;

            const now = new Date().toISOString();
            const { data, error } = await supabase
                .from('communities')
                .insert({
                    ...community,
                    created_by: userData.user.id,
                    created_at: now,
                    updated_at: now
                })
                .select()
                .single();

            if (error) {
                console.error('Erro ao criar comunidade:', error);
                throw error;
            }

            // Atualiza a lista de comunidades em memória
            await this.list();

            return { data, error: null };
        } catch (error) {
            console.error('Erro ao criar comunidade:', error);
            return { data: null, error };
        }
    }

    async create(data: CreateCommunityDTO) {
        try {
            const { data: userData, error: userError } = await supabase.auth.getUser();
            if (userError) throw userError;

            const { data: newCommunity, error } = await supabase
                .from('communities')
                .insert([{
                    ...data,
                    created_by: userData.user.id
                }])
                .select()
                .single();

            if (error) {
                console.error('Erro ao criar comunidade:', error);
                throw new Error('Erro ao criar comunidade');
            }

            // Atualiza a lista de comunidades em memória
            await this.list();

            return newCommunity;
        } catch (error) {
            console.error('Erro ao criar comunidade:', error);
            throw error;
        }
    }

    async updateCommunity(id: string, updates: UpdateCommunityDTO) {
        try {
            const { data, error } = await supabase
                .from('communities')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                console.error('Erro ao atualizar comunidade:', error);
                throw error;
            }

            // Atualiza a lista de comunidades em memória
            await this.list();

            return { data, error: null };
        } catch (error) {
            console.error('Erro ao atualizar comunidade:', error);
            return { data: null, error };
        }
    }

    async deleteCommunity(id: string) {
        try {
            const { error } = await supabase
                .from('communities')
                .delete()
                .eq('id', id);

            if (error) {
                console.error('Erro ao excluir comunidade:', error);
                throw error;
            }

            // Atualiza a lista de comunidades em memória
            await this.list();

            return { error: null };
        } catch (error) {
            console.error('Erro ao excluir comunidade:', error);
            return { error };
        }
    }

    async searchCommunities(query: string) {
        try {
            const { data, error } = await supabase
                .from('communities')
                .select('*')
                .ilike('name', `%${query}%`)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Erro ao pesquisar comunidades:', error);
                throw error;
            }

            return { data, error: null };
        } catch (error) {
            console.error('Erro ao pesquisar comunidades:', error);
            return { data: null, error };
        }
    }
}

export const communityService = new CommunityService();
