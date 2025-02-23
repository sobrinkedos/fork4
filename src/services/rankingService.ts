import { supabase } from '@/lib/supabase';

export interface PlayerRanking {
    id: string;
    name: string;
    wins: number;
    totalGames: number;
    buchudas: number;
    buchudasDeRe: number;
    winRate: number;
}

export interface PairRanking {
    id: string;
    player1: {
        id: string;
        name: string;
    };
    player2: {
        id: string;
        name: string;
    };
    wins: number;
    totalGames: number;
    buchudas: number;
    buchudasDeRe: number;
    winRate: number;
}

export const rankingService = {
    async getTopPlayers(): Promise<PlayerRanking[]> {
        console.log('RankingService: Iniciando busca de jogadores...');
        const userId = (await supabase.auth.getUser()).data.user?.id;

        if (!userId) {
            console.error('RankingService: Usuário não autenticado');
            return [];
        }

        // Buscar IDs das comunidades onde o usuário é membro
        const { data: memberCommunities } = await supabase
            .from('community_members')
            .select('community_id')
            .eq('player_id', userId);

        // Buscar IDs das comunidades onde o usuário é organizador
        const { data: organizerCommunities } = await supabase
            .from('community_organizers')
            .select('community_id')
            .eq('user_id', userId);

        // Combinar os IDs das comunidades
        const communityIds = [
            ...(memberCommunities?.map(c => c.community_id) || []),
            ...(organizerCommunities?.map(c => c.community_id) || [])
        ];

        if (communityIds.length === 0) {
            console.log('RankingService: Usuário não pertence a nenhuma comunidade');
            return [];
        }

        // Buscar jogadores das comunidades
        const { data: communityMembers } = await supabase
            .from('community_members')
            .select(`
                player_id,
                players (id, name)
            `)
            .in('community_id', communityIds);

        if (!communityMembers || communityMembers.length === 0) {
            console.log('RankingService: Nenhum jogador encontrado nas comunidades');
            return [];
        }

        // Extrair IDs únicos dos jogadores
        const playerIds = [...new Set(communityMembers
            .filter(member => member.players)
            .map(member => member.players.id))];

        // Buscar estatísticas dos jogadores
        const { data: games } = await supabase
            .from('games')
            .select('*')
            .in('winner_id', playerIds);

        // Calcular estatísticas para cada jogador
        const playerStats = playerIds.map(playerId => {
            const playerGames = games?.filter(game =>
                game.team1_player1_id === playerId ||
                game.team1_player2_id === playerId ||
                game.team2_player1_id === playerId ||
                game.team2_player2_id === playerId
            ) || [];

            const wins = games?.filter(game => game.winner_id === playerId).length || 0;
            const buchudas = games?.filter(game =>
                game.winner_id === playerId && game.is_buchuda
            ).length || 0;
            const buchudasDeRe = games?.filter(game =>
                game.winner_id === playerId && game.is_buchuda_de_re
            ).length || 0;

            const player = communityMembers.find(member =>
                member.players?.id === playerId
            )?.players;

            return {
                id: playerId,
                name: player?.name || 'Jogador Desconhecido',
                wins,
                totalGames: playerGames.length,
                buchudas,
                buchudasDeRe,
                winRate: playerGames.length > 0
                    ? (wins / playerGames.length) * 100
                    : 0
            };
        });

        // Ordenar por taxa de vitórias
        return playerStats.sort((a, b) => b.winRate - a.winRate);
    },

    async getTopPairs(): Promise<PairRanking[]> {
        try {
            console.log('RankingService: Iniciando busca de duplas...');
            
            // 1. Buscar todos os jogadores
            const { data: players, error: playersError } = await supabase
                .from('players')
                .select('*');

            console.log('RankingService: Resposta do Supabase (players):', { data: players, error: playersError });

            if (playersError) {
                console.error('RankingService: Erro ao buscar jogadores:', playersError.message);
                throw playersError;
            }

            if (!players || players.length === 0) {
                console.log('RankingService: Nenhum jogador encontrado');
                return [];
            }

            console.log('RankingService: Jogadores encontrados:', players.length);

            // 2. Buscar todos os jogos
            const { data: games, error: gamesError } = await supabase
                .from('games')
                .select('*')
                .neq('status', 'pending');

            console.log('RankingService: Resposta do Supabase (games):', { data: games, error: gamesError });

            if (gamesError) {
                console.error('RankingService: Erro ao buscar jogos:', gamesError.message);
                throw gamesError;
            }

            if (!games || games.length === 0) {
                console.log('RankingService: Nenhum jogo encontrado');
                return [];
            }

            console.log('RankingService: Jogos encontrados:', games.length);

            // Processar estatísticas por dupla
            const pairStats = new Map<string, {
                id: string;
                player1: { id: string; name: string; };
                player2: { id: string; name: string; };
                wins: number;
                totalGames: number;
                buchudas: number;
                buchudasDeRe: number;
            }>();

            // Processar jogos
            games.forEach(game => {
                // Extrair IDs dos jogadores dos arrays team1 e team2
                const team1Players = game.team1 || [];
                const team2Players = game.team2 || [];

                // Processar time 1
                if (team1Players.length === 2) {
                    const [player1Id, player2Id] = team1Players;
                    const player1 = players.find(p => p.id === player1Id);
                    const player2 = players.find(p => p.id === player2Id);

                    if (player1 && player2) {
                        const pairId = [player1Id, player2Id].sort().join('-');
                        const stats = pairStats.get(pairId) || {
                            id: pairId,
                            player1: { id: player1.id, name: player1.name },
                            player2: { id: player2.id, name: player2.name },
                            wins: 0,
                            totalGames: 0,
                            buchudas: 0,
                            buchudasDeRe: 0
                        };

                        stats.totalGames++;
                        if (game.team1_score > game.team2_score) {
                            stats.wins++;
                            if (game.is_buchuda && game.team2_score === 0) {
                                stats.buchudas++;
                            }
                            if (game.is_buchuda_de_re) {
                                stats.buchudasDeRe++;
                            }
                        }

                        pairStats.set(pairId, stats);
                    }
                }

                // Processar time 2
                if (team2Players.length === 2) {
                    const [player1Id, player2Id] = team2Players;
                    const player1 = players.find(p => p.id === player1Id);
                    const player2 = players.find(p => p.id === player2Id);

                    if (player1 && player2) {
                        const pairId = [player1Id, player2Id].sort().join('-');
                        const stats = pairStats.get(pairId) || {
                            id: pairId,
                            player1: { id: player1.id, name: player1.name },
                            player2: { id: player2.id, name: player2.name },
                            wins: 0,
                            totalGames: 0,
                            buchudas: 0,
                            buchudasDeRe: 0
                        };

                        stats.totalGames++;
                        if (game.team2_score > game.team1_score) {
                            stats.wins++;
                            if (game.is_buchuda && game.team1_score === 0) {
                                stats.buchudas++;
                            }
                            if (game.is_buchuda_de_re) {
                                stats.buchudasDeRe++;
                            }
                        }

                        pairStats.set(pairId, stats);
                    }
                }
            });

            // Calcular ranking final
            const rankings = Array.from(pairStats.values())
                .filter(stats => stats.totalGames > 0)
                .map(stats => ({
                    ...stats,
                    winRate: (stats.wins / stats.totalGames) * 100
                }))
                .sort((a, b) => b.winRate - a.winRate);

            console.log('RankingService: Rankings de duplas calculados:', rankings.length);
            if (rankings.length > 0) {
                console.log('RankingService: Exemplo de ranking de dupla:', rankings[0]);
            }

            return rankings;
        } catch (error) {
            console.error('RankingService: Erro ao buscar ranking de duplas:', error);
            throw error;
        }
    }
};
