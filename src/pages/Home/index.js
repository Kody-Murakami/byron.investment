// src/pages/Home/index.js
import React, { useEffect, useState, useCallback } from 'react';
import { Platform, ScrollView, Alert, RefreshControl } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather'; // << mesmo método do Add
import axios from 'axios/dist/browser/axios.cjs';
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

// Se tiver token da BRAPI, coloque aqui (opcional)
const BRAPI_TOKEN = '';
const withToken = (url) =>
  BRAPI_TOKEN ? `${url}${url.includes('?') ? '&' : '?'}token=${BRAPI_TOKEN}` : url;

const BRAPI_LIST_URL = withToken('https://brapi.dev/api/quote/list');
const BRAPI_QUOTE_URL = 'https://brapi.dev/api/quote'; // aceita múltiplos separados por vírgula

export default function Home() {
  const navigation = useNavigation();

  // garante que a fonte foi carregada (alguns setups de RN bare precisam disso)
  useEffect(() => {
    Feather.loadFont()?.catch?.(() => {});
  }, []);

  const [carteira, setCarteira] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [highlights, setHighlights] = useState([]);
  const [loadingHighlights, setLoadingHighlights] = useState(false);

  const handleLogout = () => {
    api.defaults.headers.common['Authorization'] = null;
    navigation.navigate('Login');
  };

  const handleNavigateNovo = () => navigation.navigate('NovoInvestimento');

  const handleEdit = (item) => {
    const id = item?.id ?? item?._id ?? item?.investmentId ?? item?.investimentoId;
    if (!id) return Alert.alert('Erro', 'ID do investimento não encontrado.');
    navigation.navigate('EditarInvestimento', { investmentId: id });
  };

  const handleDelete = (item) => {
    const id = item?.id ?? item?._id ?? item?.investmentId ?? item?.investimentoId;
    if (!id) return Alert.alert('Erro', 'ID do investimento não encontrado.');
    Alert.alert('Confirmar', 'Deseja remover este investimento?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/investimentos/${id}`);
            await carregarDados();
          } catch (err) {
            const msg = err.response?.data?.message || err.response?.data?.error || 'Não foi possível remover.';
            Alert.alert('Erro', msg);
          }
        },
      },
    ]);
  };

  const carregarDados = async () => {
    try {
      setLoading(true);
      const res = await api.get('/investimentos');

      const lista = Array.isArray(res.data?.investimentos)
        ? res.data.investimentos
        : (Array.isArray(res.data) ? res.data : []);

      const base = (lista || []).map(it => ({
        id: it.id ?? it._id ?? it.investmentId ?? it?.investimentoId,
        name: it.name || it.descricao || '',
        ticker: String(it.ticker || '').toUpperCase(),
        quantity: Number(it.quantity) || 0,
        investedValue: Number(it.investedValue) || 0,
      }));

      // === BRAPI em batch, com .SA e fallback ===
      const tickers = Array.from(new Set(base.map(x => x.ticker).filter(Boolean)));
      let quoteMap = {};

      if (tickers.length) {
        const makeUrl = (syms) =>
          withToken(`${BRAPI_QUOTE_URL}/${syms.map(encodeURIComponent).join(',')}?range=1d&interval=1d`);

        try {
          // 1) batch direto
          let { data } = await axios.get(makeUrl(tickers));
          let results = Array.isArray(data?.results) ? data.results : [];

          // 2) tenta com .SA se vazio
          if (!results.length) {
            const withSa = tickers.map(t => (t.endsWith('.SA') ? t : `${t}.SA`));
            const respSa = await axios.get(makeUrl(withSa));
            results = Array.isArray(respSa?.data?.results) ? respSa.data.results : [];
          }

          // 3) fallback 1-a-1
          if (!results.length) {
            for (const t of tickers) {
              try {
                const r1 = await axios.get(withToken(`${BRAPI_QUOTE_URL}/${encodeURIComponent(t)}?range=1d&interval=1d`));
                if (Array.isArray(r1?.data?.results) && r1.data.results[0]) {
                  results.push(r1.data.results[0]);
                  continue;
                }
                const tSA = t.endsWith('.SA') ? t : `${t}.SA`;
                const r2 = await axios.get(withToken(`${BRAPI_QUOTE_URL}/${encodeURIComponent(tSA)}?range=1d&interval=1d`));
                if (Array.isArray(r2?.data?.results) && r2.data.results[0]) {
                  results.push(r2.data.results[0]);
                }
              } catch {}
            }
          }

          // monta o mapa tolerante
          results.forEach(r => {
            const symRaw = String(r.symbol || r.stock || '').toUpperCase();
            const sym = symRaw.replace('.SA', '');

            const price =
              toNum(r.regularMarketPrice) ??
              toNum(r.close) ??
              toNum(r.regularMarketPreviousClose) ??
              null;

            let pct = toNum(r.regularMarketChangePercent) ?? null;
            if (pct == null && isFiniteNum(price) && isFiniteNum(r.regularMarketPreviousClose)) {
              const prev = Number(r.regularMarketPreviousClose);
              if (prev) pct = ((price / prev) - 1) * 100;
            }
            if (pct == null && isFiniteNum(r.change)) {
              pct = Number(r.change);
            }

            if (sym) {
              quoteMap[sym] = {
                currentPrice: isFiniteNum(price) ? price : null,
                changePercent: isFiniteNum(pct) ? pct : null,
              };
            }
          });

        } catch (e) {
          quoteMap = {};
        }
      }

      const withPrices = base.map(it => {
        const avg = it.quantity > 0 ? it.investedValue / it.quantity : 0;
        const q = quoteMap[it.ticker] || {};
        return {
          ...it,
          avgPrice: avg,
          currentPrice: isFiniteNum(q.currentPrice) ? q.currentPrice : null,
          changePercent: isFiniteNum(q.changePercent) ? q.changePercent : null,
        };
      });

      setCarteira(withPrices);
    } catch (err) {
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

  useFocusEffect(useCallback(() => { carregarDados(); }, []));

  useEffect(() => {
    const fetchHighlights = async () => {
      try {
        setLoadingHighlights(true);
        const { data } = await axios.get(BRAPI_LIST_URL);
        const rows = Array.isArray(data?.stocks) ? data.stocks : [];
        const list = rows
          .map(s => ({
            ticker: s?.stock || s?.symbol || '',
            changePercent:
              isFiniteNum(s?.regularMarketChangePercent)
                ? Number(s.regularMarketChangePercent)
                : (isFiniteNum(s?.change) ? Number(s.change) : null),
          }))
          .filter(x => x.ticker && x.changePercent !== null)
          .sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent))
          .slice(0, 5);
        setHighlights(list);
      } catch {
        setHighlights([]);
      } finally {
        setLoadingHighlights(false);
      }
    };
    fetchHighlights();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    carregarDados();
  };

  return (
    <Background>
      <Header>
        <LogoImage source={require('../../imgs/Logo-semfundo.png')} />
        <LogoutButton onPress={handleLogout}>
          <LogoutText>sair</LogoutText>
          <Feather name="log-out" size={18} color="#56949F" />
        </LogoutButton>
      </Header>

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 150 }}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <ContentContainer behavior={Platform.OS === 'ios' ? 'padding' : undefined} enabled>
          <WelcomeTitle>Welcome back user!</WelcomeTitle>
          <WelcomeSubtitle>Veja como estão suas ações e os destaques do dia!</WelcomeSubtitle>

          {/* CARTEIRA */}
          <Card>
            <CardTitle>Carteira de ações:</CardTitle>
            <Table>
              <TableHeader>
                <ColumnHeader flex={1}>TICKER</ColumnHeader>
                <ColumnHeader flex={1.2}>PREÇO M.</ColumnHeader>
                <ColumnHeader flex={1.2}>PREÇO A.</ColumnHeader>
                <ColumnHeader flex={1.2}>VALORIZAÇÃO</ColumnHeader>
                <ColumnHeader flex={0.9}>ATIVOS</ColumnHeader>
              </TableHeader>

              {loading ? (
                <EmptyTableText>Carregando…</EmptyTableText>
              ) : carteira.length === 0 ? (
                <EmptyTableText>Sem ativos na carteira.</EmptyTableText>
              ) : (
                carteira.map(item => {
                  const avg = Number(item.avgPrice) || 0;
                  const cur = isFiniteNum(item.currentPrice) ? Number(item.currentPrice) : null;
                  const chg = isFiniteNum(item.changePercent) ? Number(item.changePercent) : null;
                  const chgStr = chg != null ? `${chg >= 0 ? '+' : ''}${chg.toFixed(2)}%` : '--';
                  return (
                    <TableRow key={item.id || item.ticker}>
                      <TableCell flex={1}>{item.ticker}</TableCell>
                      <TableCell flex={1.2}>R$ {avg.toFixed(2)}</TableCell>
                      <TableCell flex={1.2}>{cur != null ? `R$ ${cur.toFixed(2)}` : '--'}</TableCell>
                      <TableCellValorizacao flex={1.2} positive={(chg ?? 0) >= 0}>{chgStr}</TableCellValorizacao>
                      <TableCellAtivos flex={0.9}>
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

          {/* DESTAQUE DO DIA */}
          <Card>
            <CardTitle>Destaque do dia:</CardTitle>
            <Table>
              <TableHeader>
                <ColumnHeader flex={1}>TICKER</ColumnHeader>
                <ColumnHeader flex={1}>VALORIZAÇÃO</ColumnHeader>
              </TableHeader>

              {loadingHighlights ? (
                <EmptyTableText>Carregando…</EmptyTableText>
              ) : highlights.length === 0 ? (
                <EmptyTableText>Nenhum destaque hoje.</EmptyTableText>
              ) : (
                highlights.map(h => {
                  const positive = h.changePercent >= 0;
                  const formatted = `${positive ? '+' : ''}${h.changePercent.toFixed(2)}%`;
                  return (
                    <TableRow key={h.ticker}>
                      <TableCell flex={1}>{h.ticker}</TableCell>
                      <TableCellValorizacao flex={1} positive={positive}>{formatted}</TableCellValorizacao>
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

// helpers
function toNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
function isFiniteNum(v) {
  return typeof v === 'number' && Number.isFinite(v);
}
