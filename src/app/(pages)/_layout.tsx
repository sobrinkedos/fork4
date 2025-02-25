import { Stack } from 'expo-router';
import { colors } from '@/styles/colors';

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
                name="profile" 
                options={{
                    headerShown: false,
                    presentation: 'modal'
                }} 
            />
        </Stack>
    );
}
