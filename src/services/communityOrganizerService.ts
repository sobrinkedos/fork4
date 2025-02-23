import { supabase } from '@/lib/supabase';
import { UserProfile } from '../types/user';

export interface CommunityOrganizer {
    id: string;
    community_id: string;
    user_id: string;
    created_by: string;
    created_at: string;
    updated_at: string;
    user_profile?: UserProfile;
}

export const communityOrganizerService = {
    async addOrganizer(communityId: string, userEmail: string) {
        try {
            // First, find the user by email
            const { data: userData, error: userError } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('email', userEmail)
                .single();

            if (userError || !userData) {
                throw new Error('Usuário não encontrado');
            }

            // Check if user is already an organizer
            const { data: existingOrganizer } = await supabase
                .from('community_organizers')
                .select('id')
                .eq('community_id', communityId)
                .eq('user_id', userData.user_id)
                .single();

            if (existingOrganizer) {
                throw new Error('Usuário já é organizador desta comunidade');
            }

            // Add user as organizer
            const { data, error } = await supabase
                .from('community_organizers')
                .insert({
                    community_id: communityId,
                    user_id: userData.user_id,
                    created_by: (await supabase.auth.getUser()).data.user?.id
                })
                .select()
                .single();

            if (error) throw error;

            // TODO: Implement email and push notification here

            return { data, error: null };
        } catch (error) {
            console.error('Error adding organizer:', error);
            return { data: null, error };
        }
    },

    async removeOrganizer(communityId: string, userId: string) {
        try {
            const { error } = await supabase
                .from('community_organizers')
                .delete()
                .eq('community_id', communityId)
                .eq('user_id', userId);

            if (error) throw error;
            return { error: null };
        } catch (error) {
            console.error('Error removing organizer:', error);
            return { error };
        }
    },

    async listOrganizers(communityId: string) {
        try {
            const { data, error } = await supabase
                .from('community_organizers')
                .select(`
                    *,
                    user_profile:user_profiles(*)
                `)
                .eq('community_id', communityId);

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('Error listing organizers:', error);
            return { data: null, error };
        }
    },

    async isOrganizer(userId: string, communityId: string) {
        try {
            const { data, error } = await supabase
                .from('community_organizers')
                .select('id')
                .eq('community_id', communityId)
                .eq('user_id', userId)
                .single();

            if (error) return false;
            return !!data;
        } catch (error) {
            console.error('Error checking organizer status:', error);
            return false;
        }
    }
};