import React, { useState } from 'react'; // 1. Importar o useState
import { ScrollView, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
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
  EmptyTableText, 
} from './styles';

const carteiraMock = [
  {
    id: '1',
    ticker: 'PETR4',
    nome: 'Petrobras',
    cotacao: 38.50,
    valorizacao: 2.5,
    patrimonio: 5000.00,
  },
  {
    id: '2',
    ticker: 'MGLU3',
    nome: 'Magazine Luiza',
    cotacao: 12.10,
    valorizacao: -1.2,
    patrimonio: 1500.00,
  }
];

const destaqueMock = [
  { id: '1', ticker: 'VIIA3', valorizacao: 10.2 },
  { id: '2', ticker: 'IRBR3', valorizacao: -5.1 },
];

function Home() {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);

  const [carteira, setCarteira] = useState(carteiraMock);
  const [destaque, setDestaque] = useState(destaqueMock);

  const onRefresh = () => {
    setRefreshing(true);

    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleLogout = () => {
    navigation.navigate('Login');
  };

  const handleEdit = (item) => {
    console.log('Editar item:', item.id);
    navigation.navigate('EditarInvestimento', {
      investmentId: item.id,
      investmentName: item.ticker, 
    });
  };

  const handleDelete = (id) => {
    console.log('Deletar:', id);
    // Aqui você implementaria a lógica de deleção
  };

  const handleNovo = () => {
    navigation.navigate('NovoInvestimento');
  };

  const handleNavigateDashboard = () => {
    console.log('Navegar para Dashboard');
    // navigation.navigate('Dashboard');
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

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 150 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#56949F"]} />
        }
      >
        <ContentContainer>
          <WelcomeTitle>Bem-vindo!</WelcomeTitle>
          <WelcomeSubtitle>Resumo da sua carteira</WelcomeSubtitle>

          {/* Card: Destaques */}
          <Card>
            <CardTitle>Destaques do dia</CardTitle>
            <Table>
              <TableHeader>
                <ColumnHeader flex={2}>Ticker</ColumnHeader>
                <ColumnHeader flex={1}>Valorização</ColumnHeader>
              </TableHeader>

              {/* 4. Descomentado e usando os dados mock de 'destaque' */}
              {destaque.length === 0 ? (
                <EmptyTableText>Nenhum destaque hoje.</EmptyTableText>
              ) : (
                destaque.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell flex={2}>{item.ticker}</TableCell>
                    <TableCellValorizacao flex={1} positive={item.valorizacao >= 0}>
                      {item.valorizacao.toFixed(1)}%
                    </TableCellValorizacao>
                  </TableRow>
                ))
              )}
            </Table>
          </Card>

          {/* Card: Carteira de ações */}
          <Card>
            <CardTitle>Carteira de ações</CardTitle>
            <Table>
              <TableHeader>
                <ColumnHeader flex={1.5}>Ticker</ColumnHeader>
                <ColumnHeader flex={1}>Cotação</ColumnHeader>
                <ColumnHeader flex={1}>Valoriz.</ColumnHeader>
                <ColumnHeader flex={1.5}>Patrimônio</ColumnHeader>
                <ColumnHeader flex={1.5}>Ativos</ColumnHeader>
              </TableHeader>

              {/* 4. Descomentado e usando os dados mock de 'carteira' */}
              {carteira.length === 0 ? (
                <EmptyTableText>Nenhuma ação na carteira.</EmptyTableText>
              ) : (
                carteira.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell flex={1.5}>{item.ticker}</TableCell>
                    <TableCell flex={1}>R${item.cotacao.toFixed(2)}</TableCell>
                    <TableCellValorizacao flex={1} positive={item.valorizacao >= 0}>
                      {item.valorizacao.toFixed(1)}%
                    </TableCellValorizacao>
                    <TableCell flex={1.5}>R${item.patrimonio.toFixed(2)}</TableCell>
                    
                    {/* Botões de Editar e Deletar */}
                    <TableCellAtivos flex={1.5}>
                      <IconButton onPress={() => handleEdit(item)}>
                        <Feather name="edit" size={18} color="#333" />
                      </IconButton>
                      <IconButton onPress={() => handleDelete(item.id)}>
                        <Feather name="trash-2" size={18} color="#FF0000" />
                      </IconButton>
                    </TableCellAtivos>
                    
                  </TableRow>
                ))
              )}

            </Table>
          </Card>
        </ContentContainer>
      </ScrollView>

      {/* Botão Flutuante + Novo */}
      <FabButton activeOpacity={0.8} onPress={handleNovo}>
        <FabText>+ Novo</FabText>
      </FabButton>

      {/* Navegação Inferior */}
      <BottomNav>
        <NavButton active={true}>
          <NavText active={true}>Início</NavText>
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

export default Home;

