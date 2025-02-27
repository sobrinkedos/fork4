import { supabase } from '@/lib/supabase';

type CommunityOrganizer = {
    id: string;
    community_id: string;
    user_id: string;
    user_profile?: {
        id: string;
        name: string;
        email: string;
    }
};

export const communityOrganizersService = {
    async listOrganizers(communityId: string): Promise<CommunityOrganizer[]> {
        const { data: organizers, error: organizersError } = await supabase
            .from('community_organizers')
            .select('id, community_id, user_id')
            .eq('community_id', communityId);

        if (organizersError) {
            console.error('Erro ao listar organizadores:', organizersError);
            throw new Error('Não foi possível listar os organizadores');
        }

        if (!organizers || organizers.length === 0) {
            return [];
        }

        const userIds = organizers.map(org => org.user_id);
        const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('id, name, email')
            .in('id', userIds);

        if (profilesError) {
            console.error('Erro ao buscar perfis:', profilesError);
            throw new Error('Não foi possível buscar os dados dos usuários');
        }

        return organizers.map(org => ({
            ...org,
            user_profile: profiles?.find(profile => profile.id === org.user_id)
        }));
    },

    async addOrganizer(communityId: string, email: string, createdBy: string) {
        // Validar formato do email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error(`Email inválido: ${email}. Verifique se o formato está correto.`);
        }

        // Normalizar email (trim e lowercase)
        const normalizedEmail = email.trim().toLowerCase();
        
        try {
            // Buscar usuário pelo email usando o serviço de autenticação
            const { data: users, error: userError } = await supabase
                .from('users')
                .select('id')
                .ilike('email', normalizedEmail)
                .single();

            if (userError) {
                console.error('Erro ao buscar usuário na tabela users:', userError);
                
                // Tenta buscar na tabela profiles como alternativa
                const { data: profiles, error: profileError } = await supabase
                    .from('profiles')
                    .select('id')
                    .ilike('email', normalizedEmail)
                    .single();
                
                if (profileError || !profiles) {
                    console.error('Erro ao buscar usuário na tabela profiles:', profileError);
                    throw new Error(`Nenhum usuário encontrado com o email ${normalizedEmail}`);
                }
                
                // Encontrou o usuário na tabela profiles
                const userId = profiles.id;
                
                // Verifica se o usuário já é organizador
                const { data: existingOrganizer } = await supabase
                    .from('community_organizers')
                    .select('id')
                    .eq('community_id', communityId)
                    .eq('user_id', userId)
                    .single();

                if (existingOrganizer) {
                    throw new Error('Este usuário já é um organizador desta comunidade');
                }

                // Adiciona o organizador
                const { error } = await supabase
                    .from('community_organizers')
                    .insert([
                        {
                            community_id: communityId,
                            user_id: userId,
                            created_by: createdBy
                        }
                    ]);

                if (error) {
                    console.error('Erro ao adicionar organizador:', error);
                    throw new Error('Não foi possível adicionar o organizador');
                }
                
                return;
            }

            if (!users) {
                throw new Error(`Nenhum usuário encontrado com o email ${normalizedEmail}`);
            }

            // Verifica se o usuário já é organizador
            const { data: existingOrganizer } = await supabase
                .from('community_organizers')
                .select('id')
                .eq('community_id', communityId)
                .eq('user_id', users.id)
                .single();

            if (existingOrganizer) {
                throw new Error('Este usuário já é um organizador desta comunidade');
            }

            // Adiciona o organizador
            const { error } = await supabase
                .from('community_organizers')
                .insert([
                    {
                        community_id: communityId,
                        user_id: users.id,
                        created_by: createdBy
                    }
                ]);

            if (error) {
                console.error('Erro ao adicionar organizador:', error);
                throw new Error('Não foi possível adicionar o organizador');
            }
        } catch (error) {
            console.error('Erro completo:', error);
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Erro ao adicionar organizador');
        }
    },

    async removeOrganizer(communityId: string, userId: string) {
        const { error } = await supabase
            .from('community_organizers')
            .delete()
            .eq('community_id', communityId)
            .eq('user_id', userId);

        if (error) {
            console.error('Erro ao remover organizador:', error);
            throw new Error('Não foi possível remover o organizador');
        }
    }
};
