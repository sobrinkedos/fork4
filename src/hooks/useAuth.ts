import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';
import { authService } from '@/services/authService';
import { Alert } from 'react-native';
import { router } from 'expo-router';

export function useAuth() {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log('Iniciando verificação de sessão...');
        // Verifica a sessão atual
        try {
            supabase.auth.getSession().then(({ data: { session } }) => {
                console.log('Resposta da verificação de sessão recebida');
                if (session?.user) {
                    console.log('Usuário autenticado:', {
                        id: session.user.id,
                        email: session.user.email,
                        lastSignIn: session.user.last_sign_in_at
                    });
                } else {
                    console.log('Nenhuma sessão ativa encontrada');
                }
                setSession(session);
                setLoading(false);
            }).catch(error => {
                console.error('Erro ao obter sessão:', error);
                handleAuthError(error);
                setLoading(false);
            });
        } catch (error) {
            console.error('Erro crítico ao verificar sessão:', error);
            setLoading(false);
        }

        // Escuta mudanças na autenticação
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            console.log('Mudança de estado de autenticação:', _event, session?.user?.id);
            setSession(session);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    // Função para lidar com erros de autenticação
    const handleAuthError = (error: any) => {
        console.error('Erro de autenticação:', {
            message: error?.message,
            status: error?.status,
            name: error?.name,
            stack: error?.stack
        });
        
        // Se for erro de refresh token ou sessão expirada, fazer logout e redirecionar para login
        if (error?.message?.includes('Invalid Refresh Token') || 
            error?.message?.includes('Refresh Token Not Found') ||
            error?.message?.includes('JWT expired')) {
            
            Alert.alert(
                'Sessão expirada',
                'Sua sessão expirou. Por favor, faça login novamente.',
                [
                    { 
                        text: 'OK', 
                        onPress: async () => {
                            await supabase.auth.signOut();
                            setSession(null);
                            router.replace('/login');
                        } 
                    }
                ]
            );
        }
    };

    // Adicionar listener para erros de autenticação
    useEffect(() => {
        const subscription = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'TOKEN_REFRESHED') {
                console.log('Token atualizado com sucesso');
            }
            
            if (event === 'SIGNED_OUT') {
                console.log('Usuário desconectado');
                setSession(null);
            }
        });

        return () => subscription.data.subscription.unsubscribe();
    }, []);

    const user = session?.user ?? null;
    const value = {
        user,
        isAuthenticated: !!user,
        loading,
        signIn: async (email: string, password: string) => {
            try {
                return await authService.signIn(email, password);
            } catch (error) {
                handleAuthError(error);
                throw error;
            }
        },
        signUp: async (email: string, password: string, name?: string) => {
            try {
                return await authService.signUp(email, password, name);
            } catch (error) {
                handleAuthError(error);
                throw error;
            }
        },
        signOut: async () => {
            try {
                return await authService.signOut();
            } catch (error) {
                handleAuthError(error);
                throw error;
            }
        },
        resetPassword: async (email: string) => {
            try {
                return await authService.resetPassword(email);
            } catch (error) {
                handleAuthError(error);
                throw error;
            }
        }
    };

    return value;
}
