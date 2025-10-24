import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { ScrollView } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

import {
  Background,
  Header,
  LogoImage,
  LogoutButton,
  LogoutText,
  ContentContainer,
  WelcomeTitle,
  WelcomeSubtitle,
  Card,
  CardTitle,
  Table,
  TableHeader,
  ColumnHeader,
  TableRow,
  TableCell,
  TableCellValorizacao,
  TableCellAtivos,
  IconButton,
  FabButton,
  FabText,
  BottomNav,
  NavButton,
  NavText,
  NavCenterButton,
  NavCenterLogo,
 
} from './styles';


function Home() {
  const navigation = useNavigation();

  const handleLogout = () => {
    navigation.navigate('Login');
  };

  const handleEdit = (id) => {
    console.log('Editar:', id);
  };

  const handleDelete = (id) => {
    console.log('Deletar:', id);
  };

  const handleNovo = () => {
    navigation.navigate('NovoInvestimento');
  };

  const handleNavigateDashboard = () => {
    console.log('Navegar para Dashboard');
  };
  


  return (
    <Background>
      <Header>
        {/* Use o caminho correto para seu logo */}
        <LogoImage source={require('../../imgs/Logo-semfundo.png')} />
        <LogoutButton onPress={handleLogout}>
          <LogoutText>Sair</LogoutText>
          <Feather name="log-out" size={18} color="#56949F" />
        </LogoutButton>
      </Header>

      <ScrollView contentContainerStyle={{ paddingBottom: 150 }}>
        <ContentContainer>
          <WelcomeTitle>Welcome back user!</WelcomeTitle>
          <WelcomeSubtitle>Veja como estão suas ações e os destaques do dia!</WelcomeSubtitle>

          <Card>
            <CardTitle>Carteira de ações:</CardTitle>
            <Table>
              <TableHeader>
                <ColumnHeader flex={1.5}>TICKER</ColumnHeader>
                <ColumnHeader flex={2}>PREÇO M.</ColumnHeader>
                <ColumnHeader flex={2}>PREÇO A.</ColumnHeader>
                <ColumnHeader flex={2}>VALORIZAÇÃO</ColumnHeader>
                <ColumnHeader flex={1.5}>ATIVOS</ColumnHeader>
              </TableHeader>
            </Table>
          </Card>
          <Card>
            <CardTitle>Destaque do dia:</CardTitle>
            <Table>
              <TableHeader>
                <ColumnHeader flex={1.5}>TICKER</ColumnHeader>
                <ColumnHeader flex={2}>PREÇO M.</ColumnHeader>
                <ColumnHeader flex={2}>PREÇO A.</ColumnHeader>
                <ColumnHeader flex={2.5}>VALORIZAÇÃO</ColumnHeader>
              </TableHeader>
              
            </Table>
          </Card>

        </ContentContainer>
      </ScrollView>

      {/* Botão Flutuante */}
      <FabButton activeOpacity={0.8} onPress={handleNovo}>
        <FabText>+ Novo</FabText>
      </FabButton>

      {/* Navegação Inferior */}
      <BottomNav>
        <NavButton active={true}>
          <NavText active={true}>Início</NavText>
        </NavButton>
        <NavCenterButton>
          {/* Use o caminho correto para seu logo central */}
          <NavCenterLogo source={require('../../imgs/Logo-semfundo.png')} />
        </NavCenterButton>
        <NavButton onPress={handleNavigateDashboard}>
          <NavText>Dashboard</NavText>
        </NavButton>
      </BottomNav>
    </Background>
  );
}

export default Home;

