import React, { useState } from 'react';
import { Platform, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';

import {
  Background,
  Header,
  LogoImage,
  LogoutButton,
  LogoutText,
  ContentContainer,
  BackButton,
  BackButtonText,
  Title,
  Label,
  Input,
  SubmitButton,
  SubmitText,
  BottomNav,
  NavButton,
  NavText,
  NavCenterButton,
  NavCenterLogo,
} from './styles';

function NovoInvestimento() {
  const navigation = useNavigation();

  // Estados para os campos do formulário
  const [nomeInvestimento, setNomeInvestimento] = useState('');
  const [tipoInvestimento, setTipoInvestimento] = useState('');
  const [valorInvestido, setValorInvestido] = useState('');
  const [ticker, setTicker] = useState('');

  const handleLogout = () => {
    navigation.navigate('Login');
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleAdicionar = () => {
    // Aqui você integraria com seu backend para adicionar o novo investimento
    console.log('Adicionar Investimento:', {
      nomeInvestimento,
      tipoInvestimento,
      valorInvestido,
      ticker,
    });
    // Após adicionar, você pode navegar de volta para a Home ou Dashboard
    navigation.navigate('Home');
  };

  const handleNavigateHome = () => {
    navigation.navigate('Home');
  };

  const handleNavigateDashboard = () => {
    console.log('Navegar para Dashboard');
    // navigation.navigate('Dashboard'); // Descomente quando a tela Dashboard existir
  };

  return (
    <Background>
      <Header>
        <LogoImage source={require('../../imgs/Logo-semfundo.png')} />
        <LogoutButton onPress={handleLogout}>
          <LogoutText>Sair</LogoutText>
          <Feather name="log-out" size={18} color="#56949F" />
        </LogoutButton>
      </Header>

      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 150 }}>
        <ContentContainer behavior={Platform.OS === 'ios' ? 'padding' : ''} enabled>
          <BackButton onPress={handleGoBack}>
            <Feather name="arrow-left" size={20} color="#E6E6E6" />
            <BackButtonText>voltar</BackButtonText>
          </BackButton>

          <Title>Novo investimento</Title>

          <Label>Nome do investimento</Label>
          <Input
            placeholder="Ex: Ações da Empresa X"
            placeholderTextColor="#A9A9A9"
            value={nomeInvestimento}
            onChangeText={setNomeInvestimento}
          />

          <Label>Tipo de investimento</Label>
          <Input
            placeholder="Ex: Ação, Fundo Imobiliário"
            placeholderTextColor="#A9A9A9"
            value={tipoInvestimento}
            onChangeText={setTipoInvestimento}
          />

          <Label>Valor investido</Label>
          <Input
            placeholder="R$_______.__"
            placeholderTextColor="#A9A9A9"
            keyboardType="numeric"
            value={valorInvestido}
            onChangeText={setValorInvestido}
          />

          <Label>Ticker</Label>
          <Input
            placeholder="Ex: PETR4, ITUB3"
            placeholderTextColor="#A9A9A9"
            autoCapitalize="characters"
            value={ticker}
            onChangeText={setTicker}
          />

          <SubmitButton activeOpacity={0.8} onPress={handleAdicionar}>
            <SubmitText>Adicionar</SubmitText>
          </SubmitButton>
        </ContentContainer>
      </ScrollView>

      <BottomNav>
        <NavButton onPress={handleNavigateHome}>
          <NavText>Início</NavText>
        </NavButton>
        <NavCenterButton>
          <NavCenterLogo source={require('../../imgs/Logo-semfundo.png')} />
        </NavCenterButton>
        <NavButton onPress={handleNavigateDashboard}>
          <NavText>Dashboard</NavText>
        </NavButton>
      </BottomNav>
    </Background>
  );
}

export default NovoInvestimento;
