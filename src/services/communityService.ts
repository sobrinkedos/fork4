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
            // Busca as comunidades com contagem de membros
            const { data: communities, error: communitiesError } = await supabase
                .from('communities')
                .select(`
                    *,
                    members:community_members(count)
                `)
                .order('name');

            if (communitiesError) {
                console.error('Erro ao listar comunidades:', communitiesError);
                throw new Error('Erro ao listar comunidades');
            }

            // Para cada comunidade, busca suas competições
            const communitiesPromises = communities.map(async (community) => {
                const { data: competitions, error: competitionsError } = await supabase
                    .from('competitions')
                    .select('id')
                    .eq('community_id', community.id);

                if (competitionsError) {
                    console.error('Erro ao buscar competições:', competitionsError);
                    return { ...community, games_count: 0 };
                }

                // Para cada competição, busca seus jogos
                const gamesPromises = competitions?.map(async (competition) => {
                    const { data: games, error: gamesError } = await supabase
                        .from('games')
                        .select('id')
                        .eq('competition_id', competition.id);

                    if (gamesError) {
                        console.error('Erro ao buscar jogos:', gamesError);
                        return 0;
                    }

                    return games?.length || 0;
                }) || [];

                const gamesCounts = await Promise.all(gamesPromises);
                const totalGames = gamesCounts.reduce((acc, count) => acc + count, 0);

                return {
                    ...community,
                    members_count: community.members[0]?.count || 0,
                    games_count: totalGames
                };
            });

            const communitiesWithCounts = await Promise.all(communitiesPromises);
            this.communities = communitiesWithCounts;
            return communitiesWithCounts;
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
