import React, { useEffect, useState, useCallback } from 'react';
import {
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import axios from 'axios';
import api from '../../services/api';

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
  EmptyTableText,
  FabButton,
  FabText,
  BottomNav,
  NavButton,
  NavText,
  NavCenterButton,
  NavCenterLogo,
} from './styles';

// Endpoints BRAPI
const BRAPI_LIST_URL = 'https://brapi.dev/api/quote/list'; // top movers do mercado
// Se tiver token: `${BRAPI_LIST_URL}?token=SEU_TOKEN`

function Home() {
  const navigation = useNavigation();

  const [carteira, setCarteira] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Destaques do dia (mercado inteiro)
  const [highlights, setHighlights] = useState([]);
  const [loadingHighlights, setLoadingHighlights] = useState(false);

  const handleLogout = () => {
    api.defaults.headers.common['Authorization'] = null;
    navigation.navigate('Login');
  };

  const handleNavigateNovo = () => {
    navigation.navigate('NovoInvestimento');
  };

  const handleEdit = (item) => {
    const id = item?.id ?? item?._id ?? item?.investmentId ?? item?.investimentoId;
    if (!id) {
      console.log('Item sem id:', item);
      Alert.alert('Erro', 'ID do investimento não encontrado.');
      return;
    }
    navigation.navigate('EditarInvestimento', { investmentId: id });
  };

  const handleDelete = async (item) => {
    const id = item?.id ?? item?._id ?? item?.investmentId ?? item?.investimentoId;
    if (!id) {
      Alert.alert('Erro', 'ID do investimento não encontrado.');
      return;
    }

    Alert.alert('Confirmar', 'Deseja remover este investimento?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/investimentos/${id}`);
            await carregarDados(); // recarrega a lista
          } catch (err) {
            console.log(err.response?.data || err.message);
            const msg = err.response?.data?.message || 'Não foi possível remover.';
            Alert.alert('Erro', msg);
          }
        },
      },
    ]);
  };

  const carregarDados = async () => {
    try {
      setLoading(true);
      const response = await api.get('/investimentos');

      // aceita { investimentos: [...] } ou array direto
      const lista = Array.isArray(response.data?.investimentos)
        ? response.data.investimentos
        : (Array.isArray(response.data) ? response.data : []);

      setCarteira(Array.isArray(lista) ? lista : []);
    } catch (err) {
      console.log(err.response?.data || err.message);
      if (err.response?.status === 401) {
        Alert.alert('Sessão expirada', 'Faça login novamente.');
        handleLogout();
      } else {
        Alert.alert('Erro', 'Não foi possível carregar sua carteira.');
      }
      setCarteira([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Recarrega quando a tela ganha foco (ex.: após criar/editar)
  useFocusEffect(
    useCallback(() => {
      carregarDados();
    }, [])
  );

  // ===== Destaques do dia do mercado inteiro (BRAPI /quote/list) =====
  useEffect(() => {
    const fetchMarketHighlights = async () => {
      try {
        setLoadingHighlights(true);

        // Se tiver token, use: const { data } = await axios.get(`${BRAPI_LIST_URL}?token=SEU_TOKEN`);
        const { data } = await axios.get(BRAPI_LIST_URL);

        // A BRAPI retorna diferentes listas; aqui normalizamos para {ticker, changePercent}
        // Formato comum: data.stocks = [{ stock: 'PETR4', change: 3.21, ... }, ...]
        const rows = Array.isArray(data?.stocks) ? data.stocks : [];

        const list = rows
          .map(s => ({
            ticker: s?.stock || s?.symbol || '',
            changePercent:
              typeof s?.change === 'number'
                ? s.change
                : (typeof s?.regularMarketChangePercent === 'number'
                    ? s.regularMarketChangePercent
                    : null),
          }))
          .filter(x => x.ticker && x.changePercent !== null);

        // Ordena por variação absoluta desc e pega top 5
        list.sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent));
        setHighlights(list.slice(0, 5));
      } catch (e) {
        console.log('Falha ao buscar destaques do mercado:', e?.message);
        setHighlights([]);
      } finally {
        setLoadingHighlights(false);
      }
    };

    fetchMarketHighlights();
  }, []); // carrega uma vez ao montar

  const onRefresh = () => {
    setRefreshing(true);
    carregarDados();
    // Opcional: recarregar destaques do mercado no pull-to-refresh
    (async () => {
      try {
        setLoadingHighlights(true);
        const { data } = await axios.get(BRAPI_LIST_URL);
        const rows = Array.isArray(data?.stocks) ? data.stocks : [];
        const list = rows
          .map(s => ({
            ticker: s?.stock || s?.symbol || '',
            changePercent:
              typeof s?.change === 'number'
                ? s.change
                : (typeof s?.regularMarketChangePercent === 'number'
                    ? s.regularMarketChangePercent
                    : null),
          }))
          .filter(x => x.ticker && x.changePercent !== null)
          .sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent))
          .slice(0, 5);
        setHighlights(list);
      } catch (e) {
        console.log('Falha ao atualizar destaques do mercado:', e?.message);
        setHighlights([]);
      } finally {
        setLoadingHighlights(false);
      }
    })();
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
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <ContentContainer behavior={Platform.OS === 'ios' ? 'padding' : undefined} enabled>
          <WelcomeTitle>Bem-vindo!</WelcomeTitle>
          <WelcomeSubtitle>Resumo da sua carteira</WelcomeSubtitle>

          {/* ===== Destaques do dia (mercado inteiro) ===== */}
          <Card>
            <CardTitle>Destaques do dia</CardTitle>
            <Table>
              <TableHeader>
                <ColumnHeader flex={1}>Ticker</ColumnHeader>
                <ColumnHeader flex={1}>Valorização</ColumnHeader>
              </TableHeader>

              {loadingHighlights ? (
                <EmptyTableText>Carregando…</EmptyTableText>
              ) : highlights.length === 0 ? (
                <EmptyTableText>Nenhum destaque hoje.</EmptyTableText>
              ) : (
                highlights.map(h => {
                  const positive = h.changePercent >= 0;
                  const formatted =
                    (positive ? '+' : '') + h.changePercent.toFixed(2) + '%';
                  return (
                    <TableRow key={h.ticker}>
                      <TableCell flex={1}>{h.ticker}</TableCell>
                      <TableCellValorizacao flex={1} positive={positive}>
                        {formatted}
                      </TableCellValorizacao>
                    </TableRow>
                  );
                })
              )}
            </Table>
          </Card>

          {/* ===== Carteira de ações ===== */}
          <Card>
            <CardTitle>Carteira de ações</CardTitle>
            <Table>
              <TableHeader>
                <ColumnHeader flex={1}>Ticker</ColumnHeader>
                <ColumnHeader flex={1.5}>Nome</ColumnHeader>
                <ColumnHeader flex={0.8}>Qtd.</ColumnHeader>
                <ColumnHeader flex={1.5}>Preço Médio</ColumnHeader>
                <ColumnHeader flex={1.5}>Ações</ColumnHeader>
              </TableHeader>

              {loading ? (
                <EmptyTableText>Carregando…</EmptyTableText>
              ) : carteira.length === 0 ? (
                <EmptyTableText>Nenhuma ação na carteira.</EmptyTableText>
              ) : (
                carteira.map((item) => {
                  const qty = Number(item.quantity) || 0;
                  const inv = Number(item.investedValue) || 0;
                  const avg = qty > 0 ? (inv / qty) : 0;

                  return (
                    <TableRow key={item.id || item._id || item.ticker}>
                      <TableCell flex={1}>{(item.ticker || '').toUpperCase()}</TableCell>
                      <TableCell flex={1.5}>{item.name || item.descricao || '-'}</TableCell>
                      <TableCell flex={0.8}>{qty}</TableCell>
                      <TableCell flex={1.5}>
                        R$ {avg.toFixed(2)}
                      </TableCell>

                      <TableCellAtivos flex={1.5}>
                        <IconButton onPress={() => handleEdit(item)}>
                          <Feather name="edit" size={18} color="#56949F" />
                        </IconButton>
                        <IconButton onPress={() => handleDelete(item)}>
                          <Feather name="trash-2" size={18} color="#D00000" />
                        </IconButton>
                      </TableCellAtivos>
                    </TableRow>
                  );
                })
              )}
            </Table>
          </Card>
        </ContentContainer>
      </ScrollView>

      <FabButton onPress={handleNavigateNovo}>
        <FabText>+ Novo</FabText>
      </FabButton>

      <BottomNav>
        <NavButton active onPress={() => navigation.navigate('Home')}>
          <NavText active>Início</NavText>
        </NavButton>
        <NavCenterButton>
          <NavCenterLogo source={require('../../imgs/Logo-semfundo.png')} />
        </NavCenterButton>
        <NavButton onPress={() => navigation.navigate('Dashboard')}>
          <NavText>Dashboard</NavText>
        </NavButton>
      </BottomNav>
    </Background>
  );
}

export default Home;
