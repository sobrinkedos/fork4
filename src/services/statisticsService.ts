import { supabase } from "@/lib/supabase";

interface UserStatistics {
    totalGames: number;
    totalCompetitions: number;
    totalPlayers: number;
    averageScore: number;
    totalCommunities: number;
}

export const statisticsService = {
    async getUserStatistics(userId: string): Promise<UserStatistics> {
        try {
            if (!userId) {
                return {
                    totalGames: 0,
                    totalCompetitions: 0,
                    totalPlayers: 0,
                    averageScore: 0,
                    totalCommunities: 0
                };
            }

            console.log('Buscando estatísticas para o usuário:', userId);

            // Primeiro buscar as comunidades criadas pelo usuário
            const { data: ownedCommunities, error: ownedError } = await supabase
                .from('communities')
                .select('id')
                .eq('created_by', userId);

            if (ownedError) {
                console.error('Erro ao buscar comunidades criadas:', ownedError);
                throw ownedError;
            }

            // Buscar comunidades onde o usuário é membro
            const { data: memberCommunities, error: memberError } = await supabase
                .from('community_members')
                .select('community_id')
                .eq('player_id', userId);

            if (memberError) {
                console.error('Erro ao buscar comunidades como membro:', memberError);
                throw memberError;
            }

            // Combinar IDs únicos das comunidades
            const communityIds = new Set([
                ...(ownedCommunities || []).map(c => c.id),
                ...(memberCommunities || []).map(c => c.community_id)
            ]);

            console.log('Total de comunidades do usuário:', communityIds.size);

            // Buscar competições das comunidades do usuário
            let allCompetitions = [];
            if (communityIds.size > 0) {
                const { data: competitions, error: competitionsError } = await supabase
                    .from('competitions')
                    .select('id')
                    .in('community_id', Array.from(communityIds));

                if (competitionsError) {
                    console.error('Erro ao buscar competições:', competitionsError);
                    throw competitionsError;
                }

                allCompetitions = competitions || [];
                console.log('Competições encontradas:', allCompetitions);
            }

            // Buscar jogos das competições
            let totalGames = 0;
            let totalScore = 0;
            let gamesWithScore = 0;

            if (allCompetitions.length > 0) {
                const competitionIds = allCompetitions.map(c => c.id);
                
                // Buscar jogos das competições
                const { data: games, error: gamesError } = await supabase
                    .from('games')
                    .select('*')
                    .in('competition_id', competitionIds);

                if (gamesError) {
                    console.error('Erro ao buscar jogos:', gamesError);
                    throw gamesError;
                }

                console.log('Jogos encontrados:', games);

                // Filtrar apenas os jogos que o usuário participou
                const userGames = games?.filter(game => 
                    (Array.isArray(game.team1) && game.team1.includes(userId)) || 
                    (Array.isArray(game.team2) && game.team2.includes(userId))
                ) || [];

                totalGames = games?.length || 0; // Total de jogos nas competições
                console.log('Total de jogos nas competições:', totalGames);

                // Calcular média de pontos dos jogos que o usuário participou
                userGames.forEach(game => {
                    if (game.status === 'finished') {
                        let playerScore = null;
                        
                        if (game.team1 && game.team1.includes(userId)) {
                            playerScore = game.team1_score;
                        } else if (game.team2 && game.team2.includes(userId)) {
                            playerScore = game.team2_score;
                        }

                        if (playerScore !== null && playerScore !== undefined) {
                            totalScore += playerScore;
                            gamesWithScore++;
                        }
                    }
                });
            }

            const totalCompetitions = allCompetitions.length;
            console.log('Total de competições:', totalCompetitions);

            // Buscar total de jogadores nas competições
            let totalPlayers = 0;
            if (allCompetitions.length > 0) {
                const competitionIds = allCompetitions.map(c => c.id);
                const { data: members, error: membersError } = await supabase
                    .from('competition_members')
                    .select('player_id')
                    .in('competition_id', competitionIds);

                if (membersError) {
                    console.error('Erro ao buscar membros:', membersError);
                    throw membersError;
                }

                // Remover duplicatas (jogadores que estão em múltiplas competições)
                const uniquePlayers = new Set(members?.map(m => m.player_id));
                totalPlayers = uniquePlayers.size;
                console.log('Total de jogadores únicos:', totalPlayers);
            }

            const averageScore = gamesWithScore > 0 ? totalScore / gamesWithScore : 0;

            const stats = {
                totalGames,
                totalCompetitions,
                totalPlayers,
                averageScore,
                totalCommunities: communityIds.size
            };

            console.log('Estatísticas finais:', stats);
            return stats;

        } catch (error) {
            console.error('Erro ao buscar estatísticas:', error);
            throw error;
        }
    }
};
