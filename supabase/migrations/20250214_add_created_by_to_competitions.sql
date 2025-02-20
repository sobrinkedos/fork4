-- Adiciona a coluna created_by à tabela competitions
ALTER TABLE competitions
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Atualiza a coluna created_by para registros existentes
DO $$
DECLARE
    v_competition RECORD;
    v_creator_id UUID;
    v_fallback_user_id UUID;
BEGIN
    -- Primeiro, tenta encontrar um usuário válido para usar como fallback
    SELECT id INTO v_fallback_user_id
    FROM auth.users
    LIMIT 1;

    IF v_fallback_user_id IS NULL THEN
        RAISE EXCEPTION 'Não foi possível encontrar nenhum usuário válido no sistema.';
    END IF;

    FOR v_competition IN
        SELECT c.id, c.name, c.community_id
        FROM competitions c
        WHERE c.created_by IS NULL
    LOOP
        -- Tenta encontrar um criador válido
        SELECT creator_id INTO v_creator_id
        FROM (
            -- Primeiro tenta pegar o created_by da comunidade
            SELECT c.created_by as creator_id
            FROM communities c
            WHERE c.id = v_competition.community_id
            AND EXISTS (SELECT 1 FROM auth.users u WHERE u.id = c.created_by)
            UNION
            -- Depois tenta pegar o primeiro membro da competição
            SELECT cm.player_id
            FROM competition_members cm
            WHERE cm.competition_id = v_competition.id
            AND EXISTS (SELECT 1 FROM auth.users u WHERE u.id = cm.player_id)
            UNION
            -- Por último tenta pegar o primeiro membro da comunidade
            SELECT cm.player_id
            FROM community_members cm
            WHERE cm.community_id = v_competition.community_id
            AND EXISTS (SELECT 1 FROM auth.users u WHERE u.id = cm.player_id)
            LIMIT 1
        ) potential_creators;

        -- Se não encontrou nenhum criador válido, usa o usuário fallback
        IF v_creator_id IS NULL THEN
            v_creator_id := v_fallback_user_id;
        END IF;

        UPDATE competitions
        SET created_by = v_creator_id
        WHERE id = v_competition.id;

        RAISE NOTICE 'Atualizada competição ID: %, Nome: %, Novo criador: %',
            v_competition.id, v_competition.name, v_creator_id;
    END LOOP;

    -- Verifica se ainda existem registros sem criador
    IF EXISTS (SELECT 1 FROM competitions WHERE created_by IS NULL) THEN
        RAISE EXCEPTION 'Ainda existem competições sem criador válido. Por favor, entre em contato com o suporte.';
    END IF;
END $$;



-- Torna a coluna created_by NOT NULL para futuros registros
ALTER TABLE competitions
ALTER COLUMN created_by SET NOT NULL;