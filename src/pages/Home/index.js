import React, { useState, useCallback } from 'react';
import { ScrollView, RefreshControl, Alert, ActivityIndicator } from 'react-native';
// useFocusEffect é chamado toda vez que a tela entra em foco
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import api from '../../services/api'; // Importamos a nossa API

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
  TableCellValorizacao, // Vamos manter este estilo, mas o nome é figurativo
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

function Home() {
  const navigation = useNavigation();
  
  // States para os dados reais e para o loading
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [carteira, setCarteira] = useState([]); // <-- O estado inicial é um array
  // O seu backend não tem uma rota para "destaques", então vamos deixar vazio
  const [destaque, setDestaque] = useState([]); 

  // Esta função busca os dados no backend
  async function carregarDados() {
    // Não precisamos setar o loading principal se for só um "refresh"
    if (!refreshing) {
      setLoading(true);
    }

    try {
      // O token já foi adicionado no Login, então a API já está autorizada
      const response = await api.get('/investimentos');
      
      // ================== A CORREÇÃO ESTÁ AQUI ==================
      // Verificamos se 'response.data' é um array. 
      // Se não for (ex: se for 'undefined'), usamos um array vazio [].
      setCarteira(Array.isArray(response.data) ? response.data : []);
      // ==========================================================

    } catch (err) {
      const errorMessage = err.response?.data?.message || "Não foi possível carregar seus investimentos.";
      Alert.alert("Erro", errorMessage);
      setCarteira([]); // Se der erro, também garantimos que é um array vazio
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  // O useFocusEffect vai chamar o carregarDados() toda vez que a tela Home for exibida
  useFocusEffect(
    useCallback(() => {
      carregarDados();
    }, [])
  );

  // Função para o "Puxar para atualizar"
  const onRefresh = () => {
    setRefreshing(true);
    carregarDados();
  };

  const handleLogout = () => {
    // Limpa o token da API e volta para o Login
    api.defaults.headers.common['Authorization'] = null;
    navigation.navigate('Login');
  };

  const handleEdit = (item) => {
    // Enviamos o item *inteiro* para a tela de Edição
    navigation.navigate('EditarInvestimento', {
      investimento: item,
    });
  };

  const handleDelete = (id) => {
    Alert.alert(
      "Excluir Investimento",
      "Tem certeza que deseja excluir este item?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              // Chama a rota de delete do backend
              await api.delete(`/investimentos/${id}`);
              Alert.alert("Sucesso", "Investimento excluído.");
              // Atualiza a lista, removendo o item excluído
              setCarteira(carteira.filter(item => item.id !== id));
            } catch (err) {
              const errorMessage = err.response?.data?.message || "Não foi possível excluir o investimento.";
              Alert.alert("Erro", errorMessage);
            }
          },
        },
      ]
    );
  };

  const handleNovo = () => {
    navigation.navigate('NovoInvestimento');
  };

  const handleNavigateDashboard = () => {
    console.log('Navegar para Dashboard');
    // navigation.navigate('Dashboard');
  };
  
  // Se estiver a carregar pela primeira vez, mostra um spinner
  if (loading) {
    return (
      <Background style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color="#56949F" />
      </Background>
    );
  }

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
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            colors={["#56949F"]} 
          />
        }
      >
        <ContentContainer>
          <WelcomeTitle>Bem-vindo!</WelcomeTitle>
          <WelcomeSubtitle>Resumo da sua carteira</WelcomeSubtitle>

          {/* Card: Destaques (Sem API, por enquanto) */}
          <Card>
            <CardTitle>Destaques do dia</CardTitle>
            <Table>
              <TableHeader>
                <ColumnHeader flex={2}>Ticker</ColumnHeader>
                <ColumnHeader flex={1}>Valorização</ColumnHeader>
              </TableHeader>
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

          {/* Card: Carteira de ações (Dados Reais da API) */}
          <Card>
            <CardTitle>Carteira de ações</CardTitle>
            <Table>
              <TableHeader>
                {/* Ajustamos as colunas para os dados do seu backend */}
                <ColumnHeader flex={1.5}>Ticker</ColumnHeader>
                <ColumnHeader flex={2}>Nome</ColumnHeader>
                <ColumnHeader flex={1}>Qtd.</ColumnHeader>
                <ColumnHeader flex={1.5}>Preço Médio</ColumnHeader>
                <ColumnHeader flex={1.5}>Ações</ColumnHeader>
              </TableHeader>
              
              {/*
                Agora, se 'carteira' for '[]', o .map() não vai rodar 
                e o <EmptyTableText> será mostrado, sem crashar o app.
              */}
              {carteira.length === 0 ? (
                <EmptyTableText>Nenhuma ação na carteira.</EmptyTableText>
              ) : (
                carteira.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell flex={1.5}>{item.ticker}</TableCell>
                    <TableCell flex={2} style={{textAlign: 'left'}}>{item.nome}</TableCell>
                    <TableCell flex={1}>{item.quantidade}</TableCell>
                    <TableCell flex={1.5}>R${item.preco_medio.toFixed(2)}</TableCell>
                    
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

