import { Stack } from 'expo-router';
import { useTheme } from '@/contexts/ThemeProvider';

export default function PagesLayout() {
    const { colors } = useTheme();
    
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
                name="profile" 
                options={{
                    headerShown: false,
                    presentation: 'modal'
                }} 
            />
            <Stack.Screen 
                name="jogos/index" 
                options={{
                    headerShown: false
                }} 
            />
            <Stack.Screen 
                name="comunidade/[id]" 
                options={{
                    headerShown: false
                }} 
            />
            <Stack.Screen 
                name="comunidade/[id]/competicao/[competitionId]/jogo" 
                options={{
                    headerShown: false
                }} 
            />
            <Stack.Screen 
                name="jogador/jogador/[id]" 
                options={{
                    headerShown: false
                }} 
            />
            <Stack.Screen 
                name="top-jogadores" 
                options={{
                    headerShown: false
                }} 
            />
        </Stack>
    );
}
