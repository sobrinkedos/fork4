import { supabase } from '@/lib/supabase';

export type VictoryType = 
    | 'simple' // 1 ponto
    | 'carroca' // 2 pontos
    | 'la_e_lo' // 3 pontos
    | 'cruzada' // 4 pontos
    | 'contagem' // 1 ponto
    | 'empate'; // 0 ponto + 1 na próxima

export interface GameRound {
    type: VictoryType;
    winner_team: 1 | 2 | null;
    has_bonus: boolean;
}

export interface Game {
    id: string;
    competition_id: string;
    team1_player1_id: string;
    team1_player2_id: string;
    team2_player1_id: string;
    team2_player2_id: string;
    team1_score: number;
    team2_score: number;
    status: 'pending' | 'in_progress' | 'finished';
    created_at: string;
    rounds: GameRound[];
    last_round_was_tie: boolean;
    team1_was_losing_5_0: boolean;
    team2_was_losing_5_0: boolean;
    is_buchuda: boolean;
    is_buchuda_de_re: boolean;
}

export interface CreateGameDTO {
    competition_id: string;
    team1: string[];
    team2: string[];
}

export const gameService = {
    async create(data: CreateGameDTO) {
        try {
            console.log('Criando jogo com dados:', data);
            const session = await supabase.auth.getSession();
            console.log('Sessão atual:', session);

            // Extrair jogadores dos arrays
            const [team1Player1, team1Player2] = data.team1;
            const [team2Player1, team2Player2] = data.team2;

            const { data: newGame, error } = await supabase
                .from('games')
                .insert([{
                    competition_id: data.competition_id,
                    team1_player1_id: team1Player1,
                    team1_player2_id: team1Player2,
                    team2_player1_id: team2Player1,
                    team2_player2_id: team2Player2,
                    team1_score: 0,
                    team2_score: 0,
                    status: 'pending',
                    rounds: [],
                    last_round_was_tie: false,
                    team1_was_losing_5_0: false,
                    team2_was_losing_5_0: false,
                    is_buchuda: false,
                    is_buchuda_de_re: false
                }])
                .select()
                .single();

            if (error) {
                console.error('Erro detalhado:', error);
                throw error;
            }
            return newGame;
        } catch (error) {
            console.error('Erro ao criar jogo:', error);
            throw error;
        }
    },

    async startGame(id: string) {
        try {
            const { data, error } = await supabase
                .from('games')
                .update({
                    status: 'in_progress'
                })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Erro ao iniciar jogo:', error);
            throw error;
        }
    },

    async registerRound(id: string, type: VictoryType, winnerTeam: 1 | 2 | null) {
        try {
            console.log('GameService: Registrando rodada:', { id, type, winnerTeam });
            
            const { data: game, error: getError } = await supabase
                .from('games')
                .select('*')
                .eq('id', id)
                .single();

            if (getError) throw getError;

            console.log('GameService: Estado atual do jogo:', {
                id: game.id,
                team1Score: game.team1_score,
                team2Score: game.team2_score,
                team1WasLosing5_0: game.team1_was_losing_5_0,
                team2WasLosing5_0: game.team2_was_losing_5_0,
                isBuchuda: game.is_buchuda,
                isBuchudaDeRe: game.is_buchuda_de_re
            });

            const hasBonus = game.last_round_was_tie;
            let team1Score = game.team1_score;
            let team2Score = game.team2_score;
            let team1WasLosing5_0 = game.team1_was_losing_5_0;
            let team2WasLosing5_0 = game.team2_was_losing_5_0;
            
            // Calcula pontos baseado no tipo de vitória
            let points = 0;
            switch (type) {
                case 'simple':
                case 'contagem':
                    points = 1;
                    break;
                case 'carroca':
                    points = 2;
                    break;
                case 'la_e_lo':
                    points = 3;
                    break;
                case 'cruzada':
                    points = 4;
                    break;
                case 'empate':
                    points = 0;
                    break;
            }

            // Adiciona bônus se a última rodada foi empate
            if (hasBonus && type !== 'empate') {
                points += 1;
            }

            // Atualiza o placar
            if (winnerTeam === 1) {
                team1Score += points;
            } else if (winnerTeam === 2) {
                team2Score += points;
            }

            // Verifica se algum time está em desvantagem de 5x0
            if (team1Score === 0 && team2Score === 5) {
                team1WasLosing5_0 = true;
                console.log('GameService: Time 1 está perdendo de 5x0');
            }
            if (team2Score === 0 && team1Score === 5) {
                team2WasLosing5_0 = true;
                console.log('GameService: Time 2 está perdendo de 5x0');
            }

            // Verifica se é uma buchuda (vencer sem que o adversário pontue)
            const isBuchuda = (team1Score >= 6 && team2Score === 0) || (team2Score >= 6 && team1Score === 0);
            if (isBuchuda) {
                console.log('GameService: Buchuda detectada!', {
                    team1Score,
                    team2Score,
                    winnerTeam
                });
            }
            
            // Verifica se é uma buchuda de ré (time que estava perdendo de 5x0 venceu)
            const isBuchudaDeRe = 
                (team1Score >= 6 && team1WasLosing5_0) || 
                (team2Score >= 6 && team2WasLosing5_0);
            
            if (isBuchudaDeRe) {
                console.log('GameService: Buchuda de Ré detectada!', {
                    team1Score,
                    team2Score,
                    team1WasLosing5_0,
                    team2WasLosing5_0,
                    winnerTeam
                });
            }

            const newRound: GameRound = {
                type,
                winner_team: winnerTeam,
                has_bonus: hasBonus
            };

            const updateData = {
                team1_score: team1Score,
                team2_score: team2Score,
                rounds: [...game.rounds, newRound],
                last_round_was_tie: type === 'empate',
                status: (team1Score >= 6 || team2Score >= 6) ? 'finished' : 'in_progress',
                is_buchuda: isBuchuda,
                is_buchuda_de_re: isBuchudaDeRe,
                team1_was_losing_5_0: team1WasLosing5_0,
                team2_was_losing_5_0: team2WasLosing5_0
            };

            console.log('GameService: Atualizando jogo:', updateData);

            const { data: updatedGame, error: updateError } = await supabase
                .from('games')
                .update(updateData)
                .eq('id', id)
                .select()
                .single();

            if (updateError) throw updateError;

            console.log('GameService: Jogo atualizado com sucesso:', {
                id: updatedGame.id,
                team1Score: updatedGame.team1_score,
                team2Score: updatedGame.team2_score,
                isBuchuda: updatedGame.is_buchuda,
                isBuchudaDeRe: updatedGame.is_buchuda_de_re,
                status: updatedGame.status
            });

            return updatedGame;
        } catch (error) {
            console.error('Erro ao registrar rodada:', error);
            throw error;
        }
    },

    async listByCompetition(competitionId: string) {
        try {
            const { data, error } = await supabase
                .from('games')
                .select(`
                    *,
                    team1_player1_id,
                    team1_player2_id,
                    team2_player1_id,
                    team2_player2_id
                `)
                .eq('competition_id', competitionId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Erro ao listar jogos:', error);
            throw error;
        }
    },

    async getById(id: string) {
        try {
            const { data, error } = await supabase
                .from('games')
                .select(`
                    *,
                    team1_player1_id,
                    team1_player2_id,
                    team2_player1_id,
                    team2_player2_id
                `)
                .eq('id', id)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Erro ao buscar jogo:', error);
            throw error;
        }
    }
};
