import { Stack } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import { AuthProvider } from '../contexts/AuthProvider';
import { ThemeProvider } from '../contexts/ThemeProvider';
import { StatusBar, Platform } from "react-native";
import { SafeAreaView } from 'react-native';
import styled from 'styled-components/native';
import { colors } from '../styles/colors';
import { enGB, registerTranslation } from 'react-native-paper-dates';
import { LoggedLayout } from '@/components/LoggedLayout';
import { usePathname } from 'expo-router';

registerTranslation('en-GB', enGB);

export default function RootLayout() {
    const { session } = useAuth();
    const statusBarHeight = StatusBar.currentHeight || 0;
    const pathname = usePathname();
    const isAuthScreen = pathname === '/login' || pathname === '/register' || pathname === '/signup';

    return (
        <AuthProvider>
            <ThemeProvider>
                <SafeContainer statusBarHeight={statusBarHeight}>
                    <StatusBar 
                        barStyle="light-content"
                        backgroundColor={colors.backgroundDark}
                        translucent
                    />
                    {!isAuthScreen ? (
                        <LoggedLayout>
                            <Stack screenOptions={{ headerShown: false }}>
                                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                                <Stack.Screen name="(pages)" options={{ headerShown: false }} />
                                <Stack.Screen name="comunidade/[id]" options={{ headerShown: false }} />
                                <Stack.Screen name="competicao/[id]" options={{ headerShown: false }} />
                                <Stack.Screen name="jogo/[id]" options={{ headerShown: false }} />
                                <Stack.Screen name="jogador/[id]" options={{ headerShown: false }} />
                                <Stack.Screen name="top-jogadores" options={{ headerShown: false }} />
                                <Stack.Screen name="profile" options={{ headerShown: false }} />
                            </Stack>
                        </LoggedLayout>
                    ) : (
                        <Stack screenOptions={{ headerShown: false }}>
                            <Stack.Screen name="login" options={{ headerShown: false }} />
                            <Stack.Screen name="register" options={{ headerShown: false }} />
                            <Stack.Screen name="signup" options={{ headerShown: false }} />
                        </Stack>
                    )}
                </SafeContainer>
            </ThemeProvider>
        </AuthProvider>
    );
}

const SafeContainer = styled(SafeAreaView)<{ statusBarHeight: number }>`
    flex: 1;
    background-color: ${colors.backgroundDark};
    padding-top: ${Platform.OS === 'android' ? props => props.statusBarHeight : 0}px;
`;
