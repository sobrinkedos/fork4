import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextData {
  session: Session | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('AuthProvider: Iniciando verificação de sessão e configuração...');
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        if (typeof window === 'undefined') {
          console.log('AuthProvider: Ambiente não-web detectado');
          if (isMounted) setIsLoading(false);
          return;
        }

        // Verificar sessão atual
        console.log('AuthProvider: Verificando sessão atual...');
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('AuthProvider: Erro ao verificar sessão:', error);
          if (isMounted) setIsLoading(false);
          return;
        }

        if (session) {
          console.log('AuthProvider: Sessão encontrada para usuário:', session.user.id);
        } else {
          console.log('AuthProvider: Nenhuma sessão ativa encontrada');
        }

        if (isMounted) {
          setSession(session);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('AuthProvider: Erro crítico durante inicialização:', error);
        if (isMounted) setIsLoading(false);
      }
    };

    initializeAuth();

    // Escutar mudanças na autenticação
    console.log('AuthProvider: Configurando listener de autenticação...');
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('AuthProvider: Mudança de estado detectada:', _event);
      if (isMounted) {
        setSession(session);
      }
    });

    return () => {
      console.log('AuthProvider: Limpando recursos...');
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);
  return (
    <AuthContext.Provider value={{ session, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
