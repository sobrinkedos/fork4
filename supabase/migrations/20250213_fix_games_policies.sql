-- Remove políticas existentes
DROP POLICY IF EXISTS "Usuários podem ver jogos das competições que participam" ON games;
DROP POLICY IF EXISTS "Usuários podem criar jogos em competições que participam" ON games;
DROP POLICY IF EXISTS "Usuários podem atualizar jogos das competições que participam" ON games;

-- Habilita RLS
ALTER TABLE games ENABLE ROW LEVEL SECURITY;

-- Política para SELECT - Qualquer usuário autenticado pode ver
CREATE POLICY "Usuários autenticados podem ver jogos" ON games
FOR SELECT USING (auth.role() = 'authenticated');

-- Política para INSERT - Qualquer usuário autenticado pode criar
CREATE POLICY "Usuários autenticados podem criar jogos" ON games
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Política para UPDATE - Qualquer usuário autenticado pode atualizar
CREATE POLICY "Usuários autenticados podem atualizar jogos" ON games
FOR UPDATE USING (auth.role() = 'authenticated');

-- Política para DELETE - Qualquer usuário autenticado pode deletar
CREATE POLICY "Usuários autenticados podem deletar jogos" ON games
FOR DELETE USING (auth.role() = 'authenticated');
