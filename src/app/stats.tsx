import React from 'react';
import { View, ScrollView } from 'react-native';
import styled from 'styled-components/native';
import { colors } from '@/styles/colors';
import TopJogadores from '@/app/top-jogadores';
import TopDuplas from '@/app/top-duplas';

const Container = styled.View`
    flex: 1;
    background-color: ${colors.backgroundDark};
`;

const ScrollContent = styled.ScrollView`
    flex: 1;
`;

const Section = styled.View`
    margin-bottom: 30px;
`;

export default function StatsPage() {
    return (
        <Container>
            <ScrollContent>
                <Section>
                    <TopJogadores />
                </Section>
                <Section>
                    <TopDuplas />
                </Section>
            </ScrollContent>
        </Container>
    );
}
