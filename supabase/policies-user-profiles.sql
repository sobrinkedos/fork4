-- Remover políticas existentes da tabela user_profiles
DROP POLICY IF EXISTS "Usuários podem criar seu próprio perfil" ON user_profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON user_profiles;
DROP POLICY IF EXISTS "Todos podem ver perfis" ON user_profiles;

-- Criar novas políticas para user_profiles
CREATE POLICY "Usuários podem criar seu próprio perfil"
    ON user_profiles 
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil"
    ON user_profiles 
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Todos podem ver perfis"
    ON user_profiles 
    FOR SELECT
    USING (true);

-- Garantir que RLS está habilitado
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
