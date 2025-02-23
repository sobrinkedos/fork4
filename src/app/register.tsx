import React, { useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import styled from 'styled-components/native';
import { colors } from '../styles/colors';
import { useAuth } from '../hooks/useAuth';
import { userService } from '../services/userService';

export default function Register() {
    const router = useRouter();
    const { signUp, signIn } = useAuth();
    const [loading, setLoading] = useState(false);
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
            <Content>
                <Title>Criar Conta</Title>
                
                <Input
                    placeholder="Nome completo *"
                    value={form.fullName}
                    onChangeText={(text) => setForm(prev => ({ ...prev, fullName: text }))}
                    placeholderTextColor={colors.gray400}
                />
                
                <Input
                    placeholder="E-mail *"
                    value={form.email}
                    onChangeText={(text) => setForm(prev => ({ ...prev, email: text }))}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholderTextColor={colors.gray400}
                />
                
                <Input
                    placeholder="Senha *"
                    value={form.password}
                    onChangeText={(text) => setForm(prev => ({ ...prev, password: text }))}
                    secureTextEntry
                    placeholderTextColor={colors.gray400}
                />
                
                <Input
                    placeholder="Telefone *"
                    value={form.phoneNumber}
                    onChangeText={(text) => setForm(prev => ({ ...prev, phoneNumber: text }))}
                    keyboardType="phone-pad"
                    placeholderTextColor={colors.gray400}
                />
                
                <Input
                    placeholder="Apelido (opcional)"
                    value={form.nickname}
                    onChangeText={(text) => setForm(prev => ({ ...prev, nickname: text }))}
                    placeholderTextColor={colors.gray400}
                />
                
                <RegisterButton onPress={handleRegister} disabled={loading}>
                    <ButtonText>{loading ? 'Criando conta...' : 'Criar Conta'}</ButtonText>
                </RegisterButton>

                <LoginLink onPress={() => router.push('/login')}>
                    <LinkText>Já tem uma conta? Faça login</LinkText>
                </LoginLink>
            </Content>
        </Container>
    );
}

const Container = styled.View`
    flex: 1;
    background-color: ${colors.backgroundDark};
`;

const Content = styled.ScrollView`
    flex: 1;
    padding: 20px;
`;

const Title = styled.Text`
    font-size: 24px;
    font-weight: bold;
    color: ${colors.gray100};
    margin-bottom: 24px;
    text-align: center;
    margin-top: 40px;
`;

const Input = styled.TextInput`
    background-color: ${colors.backgroundLight};
    padding: 16px;
    border-radius: 8px;
    margin-bottom: 16px;
    color: ${colors.gray100};
    font-size: 16px;
`;

const RegisterButton = styled.TouchableOpacity`
    background-color: ${colors.accent};
    padding: 16px;
    border-radius: 8px;
    margin-top: 8px;
    opacity: ${props => props.disabled ? 0.7 : 1};
`;

const ButtonText = styled.Text`
    color: ${colors.gray100};
    font-size: 16px;
    font-weight: bold;
    text-align: center;
`;

const LoginLink = styled.TouchableOpacity`
    margin-top: 16px;
`;

const LinkText = styled.Text`
    color: ${colors.gray200};
    font-size: 14px;
    text-align: center;
`;
