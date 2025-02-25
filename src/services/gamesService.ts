import { supabase } from '@/lib/supabase';

export type GameWithDetails = {
    id: string;
    team1_score: number;
    team2_score: number;
    status: string;
    is_buchuda: boolean;
    is_buchuda_de_re: boolean;
    created_at: string;
    competition: {
        id: string;
        name: string;
        community: {
            id: string;
            name: string;
        };
    };
    team1_players: {
        id: string;
        name: string;
    }[];
    team2_players: {
        id: string;
        name: string;
    }[];
};

export const gamesService = {
    async getUserGames(): Promise<GameWithDetails[]> {
        const { data: userCommunities, error: communitiesError } = await supabase
            .from('community_members')
            .select('community_id')
            .or('is_creator.eq.true,is_organizer.eq.true,is_member.eq.true');

        if (communitiesError) {
            throw new Error('Erro ao buscar comunidades do usuário');
        }

        const communityIds = userCommunities.map(cm => cm.community_id);

        const { data: games, error: gamesError } = await supabase
            .from('games')
            .select(`
                *,
                competition:competitions (
                    id,
                    name,
                    community:communities (
                        id,
                        name
                    )
                ),
                team1_players:team1 (
                    id,
                    name
                ),
                team2_players:team2 (
                    id,
                    name
                )
            `)
            .in('competition.community_id', communityIds)
            .order('created_at', { ascending: false });

        if (gamesError) {
            throw new Error('Erro ao buscar jogos');
        }

        return games || [];
    }
};
