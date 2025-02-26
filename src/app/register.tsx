import React, { useState } from 'react';
import { Alert, ActivityIndicator, StatusBar, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import styled from 'styled-components/native';
import { useAuth } from '../hooks/useAuth';
import { userService } from '../services/userService';
import { useTheme } from '../contexts/ThemeProvider';

export default function Register() {
    const router = useRouter();
    const { signUp, signIn } = useAuth();
    const [loading, setLoading] = useState(false);
    const { colors } = useTheme();
    const [form, setForm] = useState({
        email: '',
        password: '',
        fullName: '',
        phoneNumber: '',
        nickname: ''
    });

    const handleRegister = async () => {
        if (!form.email || !form.password || !form.fullName || !form.phoneNumber) {
            Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios');
            return;
        }

        setLoading(true);
        try {
            // 1. Criar conta de autenticação
            const { data, error: signUpError } = await signUp(form.email, form.password);
            
            if (signUpError) {
                console.error('Erro no signUp:', signUpError);
                throw new Error(signUpError.message);
            }

            if (!data.user) {
                console.error('Usuário não criado após signUp');
                throw new Error('Erro ao criar usuário. Por favor, tente novamente.');
            }

            // 2. Verificar se já existe usuário com este telefone
            const { data: existingUser } = await userService.findByPhoneNumber(form.phoneNumber);

            // 3. Criar ou atualizar perfil
            const { error: profileError } = await userService.createProfile(
                data.user.id,
                form.fullName,
                form.phoneNumber,
                form.nickname
            );

            if (profileError) {
                console.error('Erro ao criar perfil:', profileError);
                throw profileError;
            }

            // 4. Fazer login automático
            const { error: signInError } = await signIn(form.email, form.password);
            
            if (signInError) {
                console.error('Erro ao fazer login automático:', signInError);
                throw signInError;
            }

            if (existingUser) {
                Alert.alert(
                    'Bem-vindo de volta!',
                    'Identificamos que você já é um jogador. Sua conta foi atualizada com privilégios de administrador.',
                    [
                        {
                            text: 'OK',
                            onPress: () => router.push('/(tabs)/dashboard')
                        }
                    ]
                );
            } else {
                Alert.alert(
                    'Sucesso',
                    'Conta criada com sucesso!',
                    [
                        {
                            text: 'OK',
                            onPress: () => router.push('/(tabs)/dashboard')
                        }
                    ]
                );
            }
        } catch (error: any) {
            console.error('Erro completo no registro:', error);
            Alert.alert(
                'Erro',
                error.message || 'Não foi possível criar sua conta. Tente novamente.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container>
            <StatusBar style="light" backgroundColor={colors.primary} />
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <Content>
                    <Title>Cadastro</Title>
                    
                    <InputContainer>
                        <InputLabel>Nome completo *</InputLabel>
                        <Input
                            placeholder="Digite seu nome completo"
                            placeholderTextColor={colors.textDisabled}
                            value={form.fullName}
                            onChangeText={(text) => setForm(prev => ({ ...prev, fullName: text }))}
                            editable={!loading}
                        />
                    </InputContainer>
                    
                    <InputContainer>
                        <InputLabel>E-mail *</InputLabel>
                        <Input
                            placeholder="Digite seu e-mail"
                            placeholderTextColor={colors.textDisabled}
                            value={form.email}
                            onChangeText={(text) => setForm(prev => ({ ...prev, email: text }))}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            editable={!loading}
                        />
                    </InputContainer>
                    
                    <InputContainer>
                        <InputLabel>Senha *</InputLabel>
                        <Input
                            placeholder="Digite sua senha"
                            placeholderTextColor={colors.textDisabled}
                            value={form.password}
                            onChangeText={(text) => setForm(prev => ({ ...prev, password: text }))}
                            secureTextEntry
                            editable={!loading}
                        />
                    </InputContainer>
                    
                    <InputContainer>
                        <InputLabel>Telefone *</InputLabel>
                        <Input
                            placeholder="Digite seu telefone"
                            placeholderTextColor={colors.textDisabled}
                            value={form.phoneNumber}
                            onChangeText={(text) => setForm(prev => ({ ...prev, phoneNumber: text }))}
                            keyboardType="phone-pad"
                            editable={!loading}
                        />
                    </InputContainer>
                    
                    <InputContainer>
                        <InputLabel>Apelido (opcional)</InputLabel>
                        <Input
                            placeholder="Digite seu apelido"
                            placeholderTextColor={colors.textDisabled}
                            value={form.nickname}
                            onChangeText={(text) => setForm(prev => ({ ...prev, nickname: text }))}
                            editable={!loading}
                        />
                    </InputContainer>
                    
                    <RegisterButton onPress={handleRegister} disabled={loading}>
                        {loading ? (
                            <ActivityIndicator color={colors.secondary} />
                        ) : (
                            <RegisterButtonText>Cadastrar</RegisterButtonText>
                        )}
                    </RegisterButton>
                    
                    <LoginButton onPress={() => router.push('/login')} disabled={loading}>
                        <LoginButtonText>Já tem uma conta? Faça login</LoginButtonText>
                    </LoginButton>
                </Content>
            </ScrollView>
        </Container>
    );
}

const Container = styled.View`
    flex: 1;
    background-color: ${({ theme }) => theme.colors.backgroundDark};
`;

const Content = styled.View`
    flex: 1;
    padding: 24px;
    justify-content: center;
`;

const Title = styled.Text`
    font-size: 32px;
    font-weight: bold;
    color: ${({ theme }) => theme.colors.primary};
    margin-bottom: 32px;
    text-align: center;
`;

const InputContainer = styled.View`
    margin-bottom: 16px;
`;

const InputLabel = styled.Text`
    font-size: 16px;
    font-weight: 500;
    color: ${({ theme }) => theme.colors.textPrimary};
    margin-bottom: 8px;
`;

const Input = styled.TextInput`
    background-color: ${({ theme }) => theme.colors.tertiary};
    border-radius: 8px;
    padding: 16px;
    font-size: 16px;
    color: ${({ theme }) => theme.colors.textPrimary};
`;

const RegisterButton = styled.TouchableOpacity`
    background-color: ${({ theme }) => theme.colors.primary};
    border-radius: 8px;
    padding: 16px;
    align-items: center;
    margin-top: 24px;
    opacity: ${({ disabled }) => (disabled ? 0.7 : 1)};
`;

const RegisterButtonText = styled.Text`
    font-size: 16px;
    font-weight: bold;
    color: ${({ theme }) => theme.colors.gray900};
`;

const LoginButton = styled.TouchableOpacity`
    padding: 16px;
    align-items: center;
    margin-top: 16px;
`;

const LoginButtonText = styled.Text`
    font-size: 16px;
    color: ${({ theme }) => theme.colors.primary};
`;
