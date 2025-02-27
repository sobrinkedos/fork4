import { supabase } from '@/lib/supabase';

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

export const communityOrganizersService = {
    async listOrganizers(communityId: string): Promise<CommunityOrganizer[]> {
        try {
            // Primeiro, buscar a comunidade para obter o criador
            const { data: community, error: communityError } = await supabase
                .from('communities')
                .select('created_by')
                .eq('id', communityId)
                .single();

            if (communityError) {
                console.error('Erro ao buscar comunidade:', communityError);
                throw new Error('Não foi possível buscar os dados da comunidade');
            }

            // Buscar organizadores
            const { data: organizers, error: organizersError } = await supabase
                .from('community_organizers')
                .select('id, community_id, user_id')
                .eq('community_id', communityId);

            if (organizersError) {
                console.error('Erro ao listar organizadores:', organizersError);
                throw new Error('Não foi possível listar os organizadores');
            }

            // Coletar todos os IDs de usuários (criador + organizadores)
            const userIds = [
                community.created_by,
                ...(organizers?.map(org => org.user_id) || [])
            ];

            // Buscar perfis de todos os usuários
            const { data: profiles, error: profilesError } = await supabase
                .from('profiles')
                .select('id, name, email')
                .in('id', userIds);

            if (profilesError) {
                console.error('Erro ao buscar perfis:', profilesError);
                throw new Error('Não foi possível buscar os dados dos usuários');
            }

            // Criar lista final de organizadores
            const allOrganizers: CommunityOrganizer[] = [];

            // Adicionar criador como primeiro organizador
            const creatorProfile = profiles?.find(p => p.id === community.created_by);
            if (creatorProfile) {
                allOrganizers.push({
                    id: `creator-${communityId}`,
                    community_id: communityId,
                    user_id: community.created_by,
                    user_profile: creatorProfile,
                    is_creator: true
                });
            }

            // Adicionar outros organizadores
            organizers?.forEach(org => {
                const profile = profiles?.find(p => p.id === org.user_id);
                if (profile && org.user_id !== community.created_by) {
                    allOrganizers.push({
                        ...org,
                        user_profile: profile,
                        is_creator: false
                    });
                }
            });

            return allOrganizers;
        } catch (error) {
            console.error('Erro ao listar organizadores:', error);
            throw error;
        }
    },

    async addOrganizer(communityId: string, email: string, createdBy: string): Promise<void> {
        try {
            console.log('Adicionando organizador:', { communityId, email, createdBy });
            
            if (!email || !email.includes('@')) {
                throw new Error('Email inválido. Por favor, forneça um endereço de email válido.');
            }

            // Normalizar o email
            const normalizedEmail = email.toLowerCase().trim();
            
            // Primeiro, buscar a comunidade para validar
            const { data: community, error: communityError } = await supabase
                .from('communities')
                .select('created_by')
                .eq('id', communityId)
                .single();

            if (communityError) {
                console.error('Erro ao buscar comunidade:', communityError);
                throw new Error('Comunidade não encontrada');
            }

            console.log('Comunidade encontrada:', community);

            // Buscar usuário pelo email na tabela profiles (tentativa com ILIKE para ser mais flexível)
            let { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('id, email, name')
                .ilike('email', `%${normalizedEmail}%`)
                .maybeSingle();

            if (profileError) {
                console.error('Erro ao buscar perfil:', profileError);
                throw new Error('Erro ao buscar usuário');
            }

            // Se não encontrou com ILIKE, tenta com EQ (exato)
            if (!profile) {
                const { data: exactProfile } = await supabase
                    .from('profiles')
                    .select('id, email, name')
                    .eq('email', normalizedEmail)
                    .maybeSingle();
                
                if (exactProfile) {
                    profile = exactProfile;
                } else {
                    // Lista alguns emails para ajudar o usuário a debugar
                    const { data: sampleProfiles } = await supabase
                        .from('profiles')
                        .select('email')
                        .limit(5);
                    
                    const sampleEmails = sampleProfiles?.map(p => p.email).join(', ');
                    
                    throw new Error(`Usuário com email "${email}" não encontrado. O usuário precisa estar cadastrado no sistema antes de ser adicionado como organizador. Exemplos de emails cadastrados: ${sampleEmails}`);
                }
            }

            // Verificar se o usuário é o criador
            if (profile.id === community.created_by) {
                throw new Error(`"${profile.name || profile.email}" já é o criador desta comunidade.`);
            }

            // Verificar se já é organizador
            const { data: existingOrganizer, error: existingError } = await supabase
                .from('community_organizers')
                .select('id')
                .eq('community_id', communityId)
                .eq('user_id', profile.id)
                .maybeSingle();

            if (existingError) {
                console.error('Erro ao verificar organizador existente:', existingError);
                throw new Error('Erro ao verificar organizador');
            }

            if (existingOrganizer) {
                throw new Error(`"${profile.name || profile.email}" já é um organizador desta comunidade.`);
            }

            // Adicionar como organizador
            const { error: insertError } = await supabase
                .from('community_organizers')
                .insert({
                    community_id: communityId,
                    user_id: profile.id,
                    created_by: createdBy
                });

            if (insertError) {
                console.error('Erro ao inserir organizador:', insertError);
                throw new Error('Não foi possível adicionar o organizador');
            }
        } catch (error) {
            console.error('Erro ao adicionar organizador:', error);
            throw error;
        }
    },

    async removeOrganizer(communityId: string, userId: string) {
        // Verifica se o usuário é o criador
        const { data: community } = await supabase
            .from('communities')
            .select('created_by')
            .eq('id', communityId)
            .single();

        if (community && community.created_by === userId) {
            throw new Error('Não é possível remover o criador da comunidade');
        }

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
