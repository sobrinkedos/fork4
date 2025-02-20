import { supabase } from '../lib/supabase';
import { UserProfile, UserRole } from '../types/user';

export const userService = {
    async createProfile(
        userId: string,
        fullName: string,
        phoneNumber: string,
        nickname?: string
    ): Promise<{ data: UserProfile | null; error: Error | null }> {
        try {
            // Verificar se já existe um usuário com este telefone
            const { data: existingUser } = await this.findByPhoneNumber(phoneNumber);

            // Se já existe, atualiza os roles
            if (existingUser) {
                const updatedRoles = Array.from(new Set([...existingUser.roles, 'admin', 'organizer']));
                return await this.updateProfile(existingUser.id, {
                    roles: updatedRoles
                });
            }

            // Se não existe, cria novo perfil
            const { data, error } = await supabase
                .from('user_profiles')
                .insert({
                    user_id: userId,
                    full_name: fullName,
                    phone_number: phoneNumber,
                    nickname,
                    roles: ['admin', 'organizer'] as UserRole[]
                })
                .select()
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('Error creating user profile:', error);
            return { data: null, error: error as Error };
        }
    },

    async getProfile(userId: string): Promise<{ data: UserProfile | null; error: Error | null }> {
        try {
            const { data, error } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('Error fetching user profile:', error);
            return { data: null, error: error as Error };
        }
    },

    async updateProfile(
        userId: string,
        updates: Partial<UserProfile>
    ): Promise<{ data: UserProfile | null; error: Error | null }> {
        try {
            const { data, error } = await supabase
                .from('user_profiles')
                .update(updates)
                .eq('user_id', userId)
                .select()
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('Error updating user profile:', error);
            return { data: null, error: error as Error };
        }
    },

    async findByPhoneNumber(phoneNumber: string): Promise<{ data: UserProfile | null; error: Error | null }> {
        try {
            const { data, error } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('phone_number', phoneNumber)
                .single();

            if (error && error.code !== 'PGRST116') throw error; // PGRST116 é o código para "não encontrado"
            return { data: data || null, error: null };
        } catch (error) {
            console.error('Error finding user by phone:', error);
            return { data: null, error: error as Error };
        }
    }
};
