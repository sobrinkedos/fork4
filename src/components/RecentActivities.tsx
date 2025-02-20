import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { gameService, Game } from '@/services/gameService';

export function RecentActivities() {
    const [activities, setActivities] = useState<Game[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadRecentActivities();
    }, []);

    async function loadRecentActivities() {
        try {
            const data = await gameService.getRecentActivities();
            setActivities(data);
        } catch (error) {
            console.error('Erro ao carregar atividades recentes:', error);
        } finally {
            setLoading(false);
        }
    }

    function renderActivity({ item }: { item: Game }) {
        return (
            <View style={styles.activityCard}>
                <View style={styles.header}>
                    <Text style={styles.title}>Partida {item.status === 'finished' ? 'Finalizada' : 'Em Andamento'}</Text>
                    <Text style={styles.date}>
                        {new Date(item.created_at).toLocaleDateString('pt-BR')}
                    </Text>
                </View>
                <View style={styles.scoreContainer}>
                    <View style={styles.teamContainer}>
                        <Text style={styles.teamName}>Time 1</Text>
                        <Text style={styles.score}>{item.team1_score}</Text>
                    </View>
                    <Text style={styles.vs}>VS</Text>
                    <View style={styles.teamContainer}>
                        <Text style={styles.teamName}>Time 2</Text>
                        <Text style={styles.score}>{item.team2_score}</Text>
                    </View>
                </View>
                {item.is_buchuda && (
                    <Text style={styles.specialEvent}>Buchuda!</Text>
                )}
                {item.is_buchuda_de_re && (
                    <Text style={styles.specialEvent}>Buchuda de Ré!</Text>
                )}
            </View>
        );
    }

    if (loading) {
        return (
            <View style={styles.container}>
                <Text>Carregando atividades recentes...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>Atividades Recentes</Text>
            <FlatList
                data={activities}
                renderItem={renderActivity}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.list}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#333',
    },
    list: {
        gap: 16,
    },
    activityCard: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    date: {
        fontSize: 14,
        color: '#666',
    },
    scoreContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 8,
    },
    teamContainer: {
        alignItems: 'center',
        flex: 1,
    },
    teamName: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    score: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    vs: {
        fontSize: 16,
        color: '#666',
        marginHorizontal: 16,
    },
    specialEvent: {
        color: '#e63946',
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 8,
    },
});