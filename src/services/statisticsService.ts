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
            // Verificar usuário autenticado
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError || !user) {
                console.error('Erro de autenticação:', userError);
                throw new Error('Usuário não autenticado');
            }

            console.log('Usuário autenticado:', user.id);

            // Buscar comunidades onde o usuário é membro
            const { data: memberCommunities, error: memberError } = await supabase
                .from('community_members')
                .select('community_id')
                .eq('player_id', user.id);

            if (memberError) {
                console.error('Erro ao buscar comunidades como membro:', memberError);
                throw new Error('Erro ao buscar comunidades do usuário');
            }

            // Buscar comunidades onde o usuário é organizador
            const { data: organizerCommunities, error: organizerError } = await supabase
                .from('community_organizers')
                .select('community_id')
                .eq('user_id', user.id);

            if (organizerError) {
                console.error('Erro ao buscar comunidades como organizador:', organizerError);
                throw new Error('Erro ao buscar comunidades do usuário');
            }

            console.log('Comunidades como membro:', memberCommunities);
            console.log('Comunidades como organizador:', organizerCommunities);

            // Combinar IDs únicos de comunidades
            const memberIds = memberCommunities?.map(c => c.community_id) || [];
            const organizerIds = organizerCommunities?.map(c => c.community_id) || [];
            const communityIds = [...new Set([...memberIds, ...organizerIds])];

            if (communityIds.length === 0) {
                console.log('Nenhuma comunidade encontrada para o usuário');
                return {
                    totalGames: 0,
                    totalCompetitions: 0,
                    totalPlayers: 0,
                    averageScore: 0,
                    totalCommunities: 0
                };
            }

            // Buscar total de jogos
            const { data: games, error: gamesError } = await supabase
                .from('games')
                .select('*')
                .in('competition_id', (
                    supabase
                        .from('competitions')
                        .select('id')
                        .in('community_id', communityIds)
                ));

            if (gamesError) {
                console.error('Erro ao buscar jogos:', gamesError);
                throw new Error('Erro ao buscar total de jogos');
            }

            console.log('Jogos encontrados:', games?.length || 0);

            // Buscar total de competições
            const { data: competitions, error: competitionsError } = await supabase
                .from('competitions')
                .select('*')
                .in('community_id', communityIds);

            if (competitionsError) {
                console.error('Erro ao buscar competições:', competitionsError);
                throw new Error('Erro ao buscar total de competições');
            }

            console.log('Competições encontradas:', competitions?.length || 0);

            // Buscar total de jogadores
            const { data: players, error: playersError } = await supabase
                .from('community_members')
                .select('player_id')
                .in('community_id', communityIds);

            if (playersError) {
                console.error('Erro ao buscar jogadores:', playersError);
                throw new Error('Erro ao buscar total de jogadores');
            }

            console.log('Jogadores encontrados:', players?.length || 0);

            // Buscar média de pontos
            const { data: scores, error: scoresError } = await supabase
                .from('games')
                .select('team1_score, team2_score')
                .in('competition_id', (
                    supabase
                        .from('competitions')
                        .select('id')
                        .in('community_id', communityIds)
                ));

            if (scoresError) {
                console.error('Erro ao buscar pontuações:', scoresError);
                throw new Error('Erro ao buscar pontuações');
            }

            // Filtrar jogos válidos
            const validScores = scores || [];
            
            const totalScores = validScores.reduce((acc, game) => acc + (game.team1_score || 0) + (game.team2_score || 0), 0);
            const totalGamesForAverage = validScores.length || 1;
            const averageScore = totalScores / (totalGamesForAverage * 2); // Dividir por 2 pois cada jogo tem 2 times

            // Remover duplicatas de jogadores
            const uniquePlayers = new Set(players?.map(p => p.player_id));

            const stats = {
                totalGames: validScores.length,
                totalCompetitions: competitions?.length || 0,
                totalPlayers: uniquePlayers.size,
                averageScore: Math.round(averageScore * 10) / 10,
                totalCommunities: communityIds.length
            };

            console.log('Estatísticas calculadas:', stats);
            return stats;

        } catch (error) {
            console.error('Erro ao buscar estatísticas:', error);
            throw error;
        }
    }
};
