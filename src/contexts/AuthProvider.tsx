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
    console.log('AuthProvider: Iniciando...');
    if (typeof window === 'undefined') {
      console.log('AuthProvider: Ambiente não-web detectado');
      setIsLoading(false);
      return;
    }

    // Verificar sessão atual
    console.log('AuthProvider: Verificando sessão atual...');
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('AuthProvider: Sessão verificada:', session ? 'Ativa' : 'Inativa');
      setSession(session);
      setIsLoading(false);
    }).catch(error => {
      console.error('AuthProvider: Erro ao verificar sessão:', error);
      setIsLoading(false);
    });

    // Escutar mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ session, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
