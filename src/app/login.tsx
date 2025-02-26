import React, { useState } from 'react';
import { Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import styled from 'styled-components/native';
import { colors } from '../styles/colors';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
    const router = useRouter();
    const { signIn } = useAuth();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        email: '',
        password: '',
    });

    const handleLogin = async () => {
        if (!form.email || !form.password) {
            Alert.alert('Erro', 'Por favor, preencha todos os campos');
            return;
        }

        if (!form.email.includes('@')) {
            Alert.alert('Erro', 'Digite um e-mail válido');
            return;
        }

        setLoading(true);
        try {
            const response = await signIn(form.email, form.password);
            
            if (!response.success) {
                Alert.alert('Erro', response.error || 'E-mail ou senha incorretos');
                return;
            }

            router.replace('/(tabs)/dashboard');
        } catch (error: any) {
            console.error('Erro no login:', error);
            Alert.alert('Erro', 'E-mail ou senha incorretos');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container>
            <Content>
                <Title>Login</Title>
                
                <Input
                    placeholder="E-mail"
                    value={form.email}
                    onChangeText={(text) => setForm(prev => ({ ...prev, email: text }))}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholderTextColor={colors.gray400}
                    editable={!loading}
                />
                
                <Input
                    placeholder="Senha"
                    value={form.password}
                    onChangeText={(text) => setForm(prev => ({ ...prev, password: text }))}
                    secureTextEntry
                    placeholderTextColor={colors.gray400}
                    editable={!loading}
                />

                <LoginButton onPress={handleLogin} disabled={loading}>
                    {loading ? (
                        <ActivityIndicator color={colors.secondary} />
                    ) : (
                        <LoginButtonText>Entrar</LoginButtonText>
                    )}
                </LoginButton>

                <SignUpButton onPress={() => router.push('/register')} disabled={loading}>
                    <SignUpButtonText>Não tem uma conta? Cadastre-se</SignUpButtonText>
                </SignUpButton>
            </Content>
        </Container>
    );
}

const Container = styled.View`
    flex: 1;
    background-color: ${colors.backgroundDark};
`;

const Content = styled.View`
    flex: 1;
    padding: 20px;
    justify-content: center;
`;

const Title = styled.Text`
    font-size: 32px;
    font-weight: bold;
    color: ${colors.gray100};
    margin-bottom: 32px;
    text-align: center;
`;

const Input = styled.TextInput`
    background-color: ${colors.secondary};
    padding: 16px;
    border-radius: 8px;
    margin-bottom: 16px;
    color: ${colors.gray100};
    font-size: 16px;
`;

const LoginButton = styled.TouchableOpacity<{ disabled?: boolean }>`
    width: 100%;
    height: 50px;
    background-color: ${props => props.disabled ? colors.gray : colors.accent};
    border-radius: 8px;
    justify-content: center;
    align-items: center;
    opacity: ${props => props.disabled ? 0.7 : 1};
`;

const LoginButtonText = styled.Text`
    color: ${colors.secondary};
    font-size: 16px;
    font-weight: bold;
    text-align: center;
`;

const SignUpButton = styled.TouchableOpacity<{ disabled?: boolean }>`
    padding: 16px;
    margin-top: 8px;
    opacity: ${props => props.disabled ? 0.7 : 1};
`;

const SignUpButtonText = styled.Text`
    color: ${colors.accent};
    font-size: 14px;
    text-align: center;
`;
