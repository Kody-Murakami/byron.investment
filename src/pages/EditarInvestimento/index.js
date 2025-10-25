import React, { useState } from 'react';
import { Platform, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
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
  CurrentValueText,
  SubmitButton,
  SubmitText,
  BottomNav,
  NavButton,
  NavText,
  NavCenterButton,
  NavCenterLogo,
} from './styles';

function EditarInvestimento() {
  const navigation = useNavigation();
  const route = useRoute();
  const { investmentId, investmentName: initialInvestmentName } = route.params || {};
  const [nomeInvestimento, setNomeInvestimento] = useState(initialInvestmentName || '');
  const [valorInvestido, setValorInvestido] = useState('');
  const [tipoInvestimento, setTipoInvestimento] = useState('');
  const [valorAtual, setValorAtual] = useState('---'); 

 
  const handleLogout = () => {
    navigation.navigate('Login');
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleAlterar = () => {
    console.log('Alterar Investimento:', {
      id: investmentId,
      nomeInvestimento,
      valorInvestido,
      tipoInvestimento,
    });
    
    navigation.navigate('Home');
  };

  const handleNavigateHome = () => {
    navigation.navigate('Home');
  };

  const handleNavigateDashboard = () => {
    console.log('Navegar para Dashboard');
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

    
          <Title>Editar ({initialInvestmentName || '...'})</Title>

          <Label>Alterar nome</Label>
          <Input
            placeholder="Novo nome do investimento"
            placeholderTextColor="#A9A9A9"
            value={nomeInvestimento}
            onChangeText={setNomeInvestimento}
          />

          <Label>Valor investido</Label>
          <Input
            placeholder="R$_______.__"
            placeholderTextColor="#A9A9A9"
            keyboardType="numeric"
            value={valorInvestido}
            onChangeText={setValorInvestido}
          />
          <CurrentValueText>Atual: R${valorAtual}</CurrentValueText>

          <Label>Tipo de investimento</Label>
          <Input
            placeholder="Ex: Ação, Fundo Imobiliário"
            placeholderTextColor="#A9A9A9"
            value={tipoInvestimento}
            onChangeText={setTipoInvestimento}
          />

          <SubmitButton activeOpacity={0.8} onPress={handleAlterar}>
            <SubmitText>Alterar</SubmitText>
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

export default EditarInvestimento;

