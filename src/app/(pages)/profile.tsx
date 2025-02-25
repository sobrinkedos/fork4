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
    nickname: '',
    email: '',
    phone_number: '',
  });

  useEffect(() => {
    if (user?.id) {
      console.log('useEffect - user?.id:', user?.id);
      loadProfile();
    }
  }, [user?.id]);

  async function loadProfile() {
    try {
      setLoading(true);
      console.log('Carregando perfil para usuário:', user?.id);
      
      if (!user?.id) {
        console.log('Usuário não encontrado');
        return;
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select('full_name, nickname, phone_number')
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('Perfil não encontrado, criando novo perfil...');
          const { error: insertError } = await supabase
            .from('user_profiles')
            .insert([
              { 
                user_id: user.id,
                full_name: null,
                nickname: null,
                phone_number: null
              }
            ]);
          
          if (insertError) {
            console.error('Erro ao criar perfil:', insertError);
            throw insertError;
          }

          setProfile({
            full_name: '',
            nickname: '',
            email: user.email || '',
            phone_number: '',
          });
          return;
        }
        
        console.error('Erro ao carregar perfil:', error);
        throw error;
      }

      console.log('Dados do perfil:', data);
      if (data) {
        setProfile({
          full_name: data.full_name || '',
          nickname: data.nickname || '',
          email: user.email || '',
          phone_number: data.phone_number || '',
        });
      }
    } catch (error) {
      console.error('Erro completo:', error);
      Alert.alert('Erro', 'Erro ao carregar perfil');
    } finally {
      setLoading(false);
    }
  }

  async function updateProfile() {
    try {
      setLoading(true);

      // Atualiza o perfil com os novos dados
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          full_name: profile.full_name,
          nickname: profile.nickname,
          phone_number: profile.phone_number
        })
        .eq('user_id', user?.id);

      if (updateError) {
        console.error('Erro ao atualizar perfil:', updateError);
        throw updateError;
      }

      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
      router.back();
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
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
              <Label>Apelido</Label>
              <StyledInput
                value={profile.nickname}
                onChangeText={(text) => setProfile({ ...profile, nickname: text })}
                placeholder="Seu apelido"
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
                value={profile.phone_number}
                onChangeText={(text) => setProfile({ ...profile, phone_number: text })}
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
