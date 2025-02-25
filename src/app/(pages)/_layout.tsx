import { Stack } from 'expo-router';
import { colors } from '@/styles/colors';
import { Feather } from '@expo/vector-icons';

export default function PagesLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: {
                    backgroundColor: colors.backgroundDark,
                }
            }}
        >
            <Stack.Screen 
                name="dashboard" 
                options={{
                    title: 'Dashboard',
                    tabBarIcon: ({ size, color }) => (
                        <Feather name="grid" size={24} color={color} />
                    ),
                }} 
            />
            <Stack.Screen 
                name="comunidades" 
                options={{
                    title: 'Comunidades',
                    tabBarIcon: ({ size, color }) => (
                        <Feather name="users" size={24} color={color} />
                    ),
                }} 
            />
            <Stack.Screen 
                name="competicoes" 
                options={{
                    title: 'Competições',
                    tabBarIcon: ({ size, color }) => (
                        <Feather name="award" size={24} color={color} />
                    ),
                }} 
            />
            <Stack.Screen 
                name="jogadores" 
                options={{
                    title: 'Jogadores',
                    tabBarIcon: ({ size, color }) => (
                        <Feather name="user" size={24} color={color} />
                    ),
                }} 
            />
            <Stack.Screen 
                name="comunidade/[id]" 
                options={{
                    href: null,
                }} 
            />
            <Stack.Screen 
                name="comunidade/[id]/competicao/[competitionId]" 
                options={{
                    href: null,
                }} 
            />
            <Stack.Screen 
                name="comunidade/[id]/competicao/[competitionId]/jogo/[gameId]" 
                options={{
                    href: null,
                }} 
            />
            <Stack.Screen 
                name="comunidade/[id]/competicao/[competitionId]/jogo/[gameId]/registrar" 
                options={{
                    href: null,
                }} 
            />
        </Stack>
    );
}
