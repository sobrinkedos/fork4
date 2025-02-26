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
                name="jogos" 
                options={{
                    headerShown: false
                }} 
            />
            <Stack.Screen 
                name="comunidade/[id]/index" 
                options={{
                    headerShown: false
                }} 
            />
            <Stack.Screen 
                name="comunidade/[id]/competicao/[competitionId]/jogo/index" 
                options={{
                    headerShown: false
                }} 
            />
            <Stack.Screen 
                name="jogador/[id]/index" 
                options={{
                    headerShown: false
                }} 
            />
            <Stack.Screen 
                name="top-jogadores/index" 
                options={{
                    headerShown: false
                }} 
            />
        </Stack>
    );
}
