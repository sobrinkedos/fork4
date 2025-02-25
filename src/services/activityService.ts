import { supabase } from '@/lib/supabase';

export interface Activity {
    id: string;
    type: 'game' | 'competition' | 'community' | 'player';
    description: string;
    metadata?: {
        game_id?: string;
        competition_id?: string;
        community_id?: string;
        player_id?: string;
        score?: {
            team1: number;
            team2: number;
        };
        winners?: string[];
        name?: string;
        gamesCount?: number;
        isBuchuda?: boolean;
        isBuchudaDeRe?: boolean;
    };
    created_at?: Date;
    created_by?: string;
}

export const activityService = {
    async createActivity(activity: Omit<Activity, 'id' | 'created_at' | 'created_by'>) {
        try {
            console.log('Iniciando criação de atividade:', { type: activity.type, description: activity.description });
            
            // Verifica autenticação
            const { data: userData, error: authError } = await supabase.auth.getUser();
            if (authError) {
                console.error('Erro na autenticação:', authError);
                throw new Error('Erro na autenticação do usuário');
            }
            if (!userData.user) {
                console.error('Usuário não encontrado');
                throw new Error('Usuário não autenticado');
            }

            // Verifica conexão com o banco
            const { error: healthCheckError } = await supabase
                .from('activities')
                .select('id')
                .limit(1);

            if (healthCheckError) {
                console.error('Erro na conexão com o banco:', healthCheckError);
                throw new Error('Erro na conexão com o banco de dados');
            }

            console.log('Inserindo atividade no banco...');
            const { data, error } = await supabase
                .from('activities')
                .insert([
                    {
                        ...activity,
                        created_at: new Date(),
                        created_by: userData.user.id
                    }
                ])
                .select()
                .single();

            if (error) {
                console.error('Erro ao inserir atividade:', error);
                throw new Error(`Erro ao inserir atividade: ${error.message}`);
            }

            console.log('Atividade criada com sucesso:', data);
            return data;
        } catch (error) {
            console.error('Erro detalhado ao criar atividade:', {
                error,
                message: error instanceof Error ? error.message : 'Erro desconhecido',
                activity
            });
            throw error;
        }
    },

    async getAllActivities(page: number = 1, pageSize: number = 20) {
        try {
            const from = (page - 1) * pageSize;
            const to = from + pageSize - 1;

            const { data, error, count } = await supabase
                .from('activities')
                .select('*', { count: 'exact' })
                .order('created_at', { ascending: false })
                .range(from, to);

            if (error) {
                console.error('Erro ao buscar atividades:', error);
                throw error;
            }

            return {
                activities: data as Activity[],
                totalCount: count || 0,
                currentPage: page,
                pageSize,
                totalPages: count ? Math.ceil(count / pageSize) : 0
            };
        } catch (error) {
            console.error('Erro ao buscar atividades:', error);
            throw error;
        }
    },

    async getRecentActivities() {
        try {
            const { data: userData } = await supabase.auth.getUser();
            if (!userData.user) throw new Error('Usuário não autenticado');

            const { data, error } = await supabase
                .from('activities')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(10);

            if (error) throw error;

            return data.map(activity => ({
                ...activity,
                created_at: new Date(activity.created_at)
            }));
        } catch (error) {
            console.error('Erro ao buscar atividades recentes:', error);
            throw error;
        }
    },

    async registerGameCompletion(
        gameId: string, 
        winners: string[], 
        team1Score: number, 
        team2Score: number,
        isBuchuda: boolean = false,
        isBuchudaDeRe: boolean = false
    ) {
        let description = `Jogo finalizado com placar ${team1Score} x ${team2Score}`;
        if (isBuchuda) description += ' (Buchuda)';
        if (isBuchudaDeRe) description += ' (Buchuda de Ré)';

        return this.createActivity({
            type: 'game',
            description,
            metadata: {
                game_id: gameId,
                winners,
                score: {
                    team1: team1Score,
                    team2: team2Score
                },
                isBuchuda,
                isBuchudaDeRe
            }
        });
    },

    async registerCompetitionCompletion(competitionId: string, winners: string[]) {
        await this.createActivity({
            type: 'competition',
            description: `Competição finalizada! ${winners.join(' e ')} são os campeões!`,
            metadata: {
                competition_id: competitionId,
                winners
            }
        });
    },

    async registerNewCommunity(communityId: string, name: string) {
        await this.createActivity({
            type: 'community',
            description: `Nova comunidade "${name}" criada!`,
            metadata: {
                community_id: communityId
            }
        });
    },

    async registerNewCompetition(competitionId: string, name: string) {
        await this.createActivity({
            type: 'competition',
            description: `Nova competição "${name}" criada!`,
            metadata: {
                competition_id: competitionId
            }
        });
    },

    async registerPlayerMilestone(playerId: string, name: string, gamesCount: number) {
        await this.createActivity({
            type: 'player',
            description: `${name} completou ${gamesCount} jogos!`,
            metadata: {
                player_id: playerId,
                name,
                gamesCount
            }
        });
    }
};