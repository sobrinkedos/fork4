-- Remover políticas existentes da tabela players
DROP POLICY IF EXISTS "Todos podem ver jogadores" ON players;
DROP POLICY IF EXISTS "Usuários podem criar jogadores" ON players;
DROP POLICY IF EXISTS "Usuários podem atualizar seus jogadores" ON players;
DROP POLICY IF EXISTS "Usuários podem deletar seus jogadores" ON players;

-- Criar novas políticas para players
CREATE POLICY "Todos podem ver jogadores"
    ON players
    FOR SELECT
    USING (true);

CREATE POLICY "Usuários podem criar jogadores"
    ON players
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus jogadores"
    ON players
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus jogadores"
    ON players
    FOR DELETE
    USING (auth.uid() = user_id);

-- Garantir que RLS está habilitado
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
