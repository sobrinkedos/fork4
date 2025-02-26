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
                name="comunidade/[id]" 
                options={{
                    headerShown: false
                }} 
            />
            <Stack.Screen 
                name="competicao/[id]" 
                options={{
                    headerShown: false
                }} 
            />
            <Stack.Screen 
                name="jogo/[id]" 
                options={{
                    headerShown: false
                }} 
            />
            <Stack.Screen 
                name="jogador/[id]" 
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
