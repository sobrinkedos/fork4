import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';
import { authService } from '@/services/authService';

export function useAuth() {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Verifica a sessão atual
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
        });

        // Escuta mudanças na autenticação
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    return {
        session,
        loading,
        user: session?.user ?? null,
        signIn: async (email: string, password: string) => {
            return await authService.signIn(email, password);
        },
        signUp: async (email: string, password: string) => {
            return await authService.signUp(email, password);
        },
        signOut: async () => {
            return await authService.signOut();
        },
        resetPassword: async (email: string) => {
            return await authService.resetPassword(email);
        }
    };
}
