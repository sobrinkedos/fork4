import { supabase } from '@/lib/supabase';

interface UserStats {
    totalGames: number;
    totalCompetitions: number;
    totalPlayers: number;
    averageScore: number;
    totalCommunities: number;
}

export const statisticsService = {
    async getUserStats(): Promise<UserStats> {
        try {
            console.log('[statisticsService] Iniciando busca de estatísticas...');
            
            // Verificar usuário autenticado
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError || !user) {
                console.error('[statisticsService] Erro de autenticação:', userError);
                throw new Error('Usuário não autenticado');
            }

            console.log('[statisticsService] Usuário autenticado:', user.id);

            // Buscar comunidades onde o usuário é membro
            const { data: memberCommunities, error: memberError } = await supabase
                .from('community_members')
                .select('community_id')
                .eq('player_id', user.id);

            if (memberError) {
                console.error('[statisticsService] Erro ao buscar comunidades como membro:', memberError);
                throw new Error('Erro ao buscar comunidades do usuário');
            }

            console.log('[statisticsService] Comunidades como membro:', memberCommunities);

            // Buscar comunidades onde o usuário é organizador/criador
            // Verificando a estrutura da tabela communities para encontrar a coluna correta
            const { data: organizerCommunities, error: organizerError } = await supabase
                .from('communities')
                .select('id, name, created_by')
                .eq('created_by', user.id);

            if (organizerError) {
                console.error('[statisticsService] Erro ao buscar comunidades como organizador:', organizerError);
                // Não lançar erro aqui, apenas continuar com as comunidades como membro
                console.log('[statisticsService] Continuando apenas com comunidades como membro');
            } else {
                console.log('[statisticsService] Comunidades como organizador:', organizerCommunities);
            }

            // Combinar IDs únicos de comunidades
            const memberIds = memberCommunities?.map(c => c.community_id) || [];
            const organizerIds = organizerCommunities?.map(c => c.id) || [];
            const communityIds = [...new Set([...memberIds, ...organizerIds])];

            console.log('[statisticsService] IDs de comunidades encontradas:', communityIds);

            // Se não houver comunidades, retornar zeros
            if (communityIds.length === 0) {
                console.log('[statisticsService] Nenhuma comunidade encontrada para o usuário');
                return {
                    totalGames: 0,
                    totalCompetitions: 0,
                    totalPlayers: 0,
                    averageScore: 0,
                    totalCommunities: 0
                };
            }

            // Buscar competições das comunidades
            const { data: competitions, error: competitionsError } = await supabase
                .from('competitions')
                .select('id')
                .in('community_id', communityIds);

            if (competitionsError) {
                console.error('[statisticsService] Erro ao buscar competições:', competitionsError);
                throw new Error('Erro ao buscar competições');
            }

            const competitionIds = competitions?.map(c => c.id) || [];
            console.log('[statisticsService] Total de competições encontradas:', competitionIds.length);

            // Buscar jogos das competições
            let totalGames = 0;
            if (competitionIds.length > 0) {
                const { data: games, error: gamesError } = await supabase
                    .from('games')
                    .select('id')
                    .in('competition_id', competitionIds);

                if (gamesError) {
                    console.error('[statisticsService] Erro ao buscar jogos:', gamesError);
                    throw new Error('Erro ao buscar jogos');
                }

                totalGames = games?.length || 0;
                console.log('[statisticsService] Total de jogos encontrados:', totalGames);
            }

            // Buscar jogadores das comunidades
            const { data: players, error: playersError } = await supabase
                .from('community_members')
                .select('player_id')
                .in('community_id', communityIds);

            if (playersError) {
                console.error('[statisticsService] Erro ao buscar jogadores:', playersError);
                throw new Error('Erro ao buscar jogadores');
            }

            // Remover duplicatas de jogadores
            const uniquePlayers = new Set(players?.map(p => p.player_id) || []);
            const totalPlayers = uniquePlayers.size;
            console.log('[statisticsService] Total de jogadores únicos:', totalPlayers);

            // Calcular média de pontos
            let averageScore = 0;
            if (competitionIds.length > 0) {
                const { data: scores, error: scoresError } = await supabase
                    .from('games')
                    .select('team1_score, team2_score')
                    .in('competition_id', competitionIds);

                if (scoresError) {
                    console.error('[statisticsService] Erro ao buscar pontuações:', scoresError);
                } else {
                    const validScores = scores?.filter(s => 
                        s.team1_score !== null && 
                        s.team2_score !== null) || [];
                    
                    if (validScores.length > 0) {
                        const totalScores = validScores.reduce((acc, game) => 
                            acc + (game.team1_score || 0) + (game.team2_score || 0), 0);
                        averageScore = totalScores / (validScores.length * 2); // Dividir por 2 pois cada jogo tem 2 times
                        averageScore = Math.round(averageScore * 10) / 10;
                    }
                }
            }

            // Montar objeto de estatísticas
            const stats = {
                totalGames,
                totalCompetitions: competitionIds.length,
                totalPlayers,
                averageScore,
                totalCommunities: communityIds.length
            };

            console.log('[statisticsService] Estatísticas calculadas:', stats);
            return stats;

        } catch (error) {
            console.error('[statisticsService] Erro ao buscar estatísticas:', error);
            throw error;
        }
    }
};
