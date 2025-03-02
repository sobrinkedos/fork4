import { Stack } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import { AuthProvider } from '../contexts/AuthProvider';
import { ThemeProvider, useTheme } from '../contexts/ThemeProvider';
import { StatusBar, Platform } from "react-native";
import { SafeAreaView } from 'react-native';
import styled, { ThemeContext } from 'styled-components/native';
import { colors } from '../styles/colors';
import { enGB, registerTranslation } from 'react-native-paper-dates';
import { LoggedLayout } from '@/components/LoggedLayout';
import { usePathname } from 'expo-router';
import { useContext } from 'react';

registerTranslation('en-GB', enGB);

function AppLayout() {
    const { session } = useAuth();
    const statusBarHeight = StatusBar.currentHeight || 0;
    const pathname = usePathname();
    const isAuthScreen = pathname === '/login' || pathname === '/register' || pathname === '/signup';
    const { theme, colors } = useTheme();
    const isDarkTheme = theme === 'dark';

    return (
        <SafeContainer statusBarHeight={statusBarHeight}>
            <StatusBar 
                barStyle={isDarkTheme ? "light-content" : "dark-content"}
                backgroundColor={colors.backgroundDark}
                translucent
            />
            {!isAuthScreen ? (
                session ? (
                    <LoggedLayout>
                        <Stack screenOptions={{ headerShown: false }}>
                            <Stack.Screen name="(tabs)" />
                            <Stack.Screen name="(pages)" />
                        </Stack>
                    </LoggedLayout>
                ) : (
                    <Stack screenOptions={{ headerShown: false }}>
                        <Stack.Screen name="(tabs)" />
                        <Stack.Screen name="(pages)" />
                    </Stack>
                )
            ) : (
                <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="login" />
                    <Stack.Screen name="register" />
                    <Stack.Screen name="signup" />
                </Stack>
            )}
        </SafeContainer>
    );
}

export default function RootLayout() {
    return (
        <AuthProvider>
            <ThemeProvider>
                <AppLayout />
            </ThemeProvider>
        </AuthProvider>
    );
}

const SafeContainer = styled(SafeAreaView)<{ statusBarHeight: number }>`
    flex: 1;
    background-color: ${({ theme }) => theme.colors.backgroundDark};
    padding-top: ${Platform.OS === 'android' ? props => props.statusBarHeight : 0}px;
    width: 100%;
`;
