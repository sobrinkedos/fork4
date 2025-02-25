import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Stack, useRouter } from 'expo-router';
import styled from 'styled-components/native';
import { colors } from '@/styles/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PageTransition } from '@/components/Transitions';
import { Header } from '@/components/Header';

const Container = styled.View`
  flex: 1;
  background-color: ${colors.backgroundDark};
`;

const ScrollContent = styled.ScrollView`
  flex: 1;
`;

const Content = styled.View`
  padding: 20px;
  gap: 16px;
`;

const InputContainer = styled.View`
  gap: 8px;
`;

const Label = styled.Text`
  font-size: 16px;
  color: ${colors.gray100};
  font-weight: 500;
`;

const StyledInput = styled.TextInput`
  background-color: ${colors.secondary};
  padding: 16px;
  border-radius: 8px;
  color: ${colors.gray100};
  font-size: 16px;
`;

const SaveButton = styled.TouchableOpacity`
  background-color: ${colors.primary};
  padding: 16px;
  border-radius: 8px;
  align-items: center;
  justify-content: center;
  margin-top: 16px;
`;

const ButtonText = styled.Text`
  color: ${colors.gray100};
  font-size: 16px;
  font-weight: 600;
`;

export default function ProfileScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    full_name: '',
    username: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  async function loadProfile() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;

      if (data) {
        setProfile({
          full_name: data.full_name || '',
          username: data.username || '',
          email: user?.email || '',
          phone: data.phone || '',
        });
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro ao carregar perfil');
    } finally {
      setLoading(false);
    }
  }

  async function updateProfile() {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          username: profile.username,
          phone: profile.phone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user?.id);

      if (error) throw error;
      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
    } catch (error) {
      Alert.alert('Erro', 'Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageTransition>
      <Container>
        <Header
          title="Meu Perfil"
          onNotificationPress={() => {}}
          onProfilePress={() => router.back()}
        />
        <ScrollContent showsVerticalScrollIndicator={false}>
          <Content>
            <InputContainer>
              <Label>Nome Completo</Label>
              <StyledInput
                value={profile.full_name}
                onChangeText={(text) => setProfile({ ...profile, full_name: text })}
                placeholder="Seu nome completo"
                placeholderTextColor={colors.gray300}
              />
            </InputContainer>

            <InputContainer>
              <Label>Nome de Usuário</Label>
              <StyledInput
                value={profile.username}
                onChangeText={(text) => setProfile({ ...profile, username: text })}
                placeholder="@seu.usuario"
                placeholderTextColor={colors.gray300}
              />
            </InputContainer>

            <InputContainer>
              <Label>Email</Label>
              <StyledInput
                value={profile.email}
                editable={false}
                placeholder="seu@email.com"
                placeholderTextColor={colors.gray300}
              />
            </InputContainer>

            <InputContainer>
              <Label>Telefone</Label>
              <StyledInput
                value={profile.phone}
                onChangeText={(text) => setProfile({ ...profile, phone: text })}
                placeholder="(00) 00000-0000"
                placeholderTextColor={colors.gray300}
                keyboardType="phone-pad"
              />
            </InputContainer>

            <SaveButton onPress={updateProfile} disabled={loading}>
              <ButtonText>
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </ButtonText>
            </SaveButton>
          </Content>
        </ScrollContent>
      </Container>
    </PageTransition>
  );
}
