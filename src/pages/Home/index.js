import React, { useEffect, useState, useCallback } from 'react';
import { Platform, ScrollView, Alert, RefreshControl } from 'react-native';
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

// (opcional) token da BRAPI
const BRAPI_TOKEN = '';
const withToken = (url) =>
  BRAPI_TOKEN ? `${url}${url.includes('?') ? '&' : '?'}token=${BRAPI_TOKEN}` : url;

const BRAPI_QUOTE_URL = 'https://brapi.dev/api/quote';

export default function Home() {
  const navigation = useNavigation();

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
      const id = item?.id ?? item?._id ?? item?.investmentId ?? item?.investimentoId ?? null;
      if (!id) return Alert.alert('Erro', 'ID do investimento não encontrado.');
      navigation.navigate('EditarInvestimento', { investmentId: id });
    };


  // === EXCLUIR: tenta rota REST e fallback por query ===
  const handleDelete = (item) => {
    const rawId =
      item?.id ??
      item?._id ??
      item?.investmentId ??
      item?.investimentoId ??
      null;

    const id = rawId != null ? String(rawId) : null;

    if (!id) {
      return Alert.alert('Erro', 'ID do investimento não encontrado.');
    }

    Alert.alert('Confirmar', 'Deseja remover este investimento?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          const url = `/investimentos/${encodeURIComponent(id)}`;

          // Otimista: remove da UI e volta se falhar
          const prev = carteira;
          setCarteira((list) =>
            list.filter((x) =>
              String(x?.id ?? x?._id ?? x?.investmentId ?? x?.investimentoId) !== id
            )
          );

          try {
            const resp = await api.delete(url, {
              timeout: 15000,
              validateStatus: () => true,
              headers: { Accept: 'application/json' },
            });

            const ok = resp?.status === 200 || resp?.status === 202 || resp?.status === 204;

            if (ok) {
              const msg = resp?.data?.message || 'Investimento removido com sucesso!';
              Alert.alert('Sucesso', msg);
              await carregarDados();
              return;
            }

            const msg =
              resp?.data?.message ||
              resp?.data?.error ||
              `Falha ao remover (status ${resp?.status ?? '???'})`;
            setCarteira(prev);
            Alert.alert('Erro', msg);
          } catch (err) {
            setCarteira(prev);
            const human =
              err?.message?.includes('timeout')
                ? 'Tempo de espera excedido ao contatar o servidor.'
                : err?.message || 'Erro ao remover investimento.';
            Alert.alert('Erro', human);
          }
        },
      },
    ]);
  };

  // ---- utils numéricos
  const toNum = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  // ---- normalização e validação de tickers ----
  // Remove sufixo de fracionário: PETR4F -> PETR4
  const normalizeTicker = (t) => {
    const s = String(t || '').toUpperCase().trim();
    return /^[A-Z]{4}\dF$/.test(s) ? s.slice(0, -1) : s;
  };

  // Usa a BRAPI para tentar encontrar o símbolo correto e substituir
  const ensureValidTicker = async (t) => {
    const q = normalizeTicker(t);
    try {
      const { data } = await axios.get(
        withToken(`https://brapi.dev/api/quote/list?search=${encodeURIComponent(q)}`)
      );
      const rows = Array.isArray(data?.stocks) ? data.stocks : [];
      const hit = rows.find((x) => x?.stock) || null;
      if (hit) {
        return String(hit.stock).toUpperCase().replace('.SA', '');
      }
    } catch {}
    return q; // se nada achou, mantém (pode resultar em "--" depois)
  };

  // === COTAÇÕES ROBUSTAS: batch + .SA + lookup + histórico ===
  // === COTAÇÕES: força .SA, depois sem .SA, e por fim resolve via search ===
const fetchQuotes = async (tickers) => {
  if (!Array.isArray(tickers) || tickers.length === 0) return {};

  const uniq = Array.from(new Set(
    tickers.map(t => String(t || '').toUpperCase().trim()).filter(Boolean)
  ));

  const getPriceFromResult = (r) => {
    const n = (v) => (Number.isFinite(Number(v)) ? Number(v) : null);
    const direct =
      n(r?.regularMarketPrice) ??
      n(r?.close) ??
      n(r?.price) ??
      n(r?.regularMarketPreviousClose);
    if (direct != null) return direct;

    const hist = Array.isArray(r?.historicalDataPrice) ? r.historicalDataPrice : [];
    for (let i = hist.length - 1; i >= 0; i--) {
      const p = n(hist[i]?.close);
      if (p != null) return p;
    }
    return null;
  };

  const getOne = async (sym) => {
    // tenta com .SA primeiro, depois sem .SA
    const tries = [sym.includes('.') ? sym : `${sym}.SA`, sym];
    for (const trySym of tries) {
      try {
        const url = withToken(`${BRAPI_QUOTE_URL}/${encodeURIComponent(trySym)}?range=1mo&interval=1d`);
        const { data } = await axios.get(url);
        const r = Array.isArray(data?.results) ? data.results[0] : null;
        const p = r ? getPriceFromResult(r) : null;
        if (p != null) return { price: p, symbolUsed: trySym };
      } catch {}
    }

    try {
      const sUrl = withToken(`https://brapi.dev/api/quote/list?search=${encodeURIComponent(sym)}`);
      const { data: sdata } = await axios.get(sUrl);
      const rows = Array.isArray(sdata?.stocks) ? sdata.stocks : [];
      const hit = rows.find(x => x?.stock) || null;
      if (hit) {
        const found = String(hit.stock).toUpperCase();
        const url2 = withToken(`${BRAPI_QUOTE_URL}/${encodeURIComponent(found)}?range=1mo&interval=1d`);
        const { data: d2 } = await axios.get(url2);
        const r2 = Array.isArray(d2?.results) ? d2.results[0] : null;
        const p2 = r2 ? getPriceFromResult(r2) : null;
        if (p2 != null) return { price: p2, symbolUsed: found };
      }
    } catch {}

    return { price: null, symbolUsed: null }; 
  };

  const out = {};
  for (const t of uniq) {
    const { price, symbolUsed } = await getOne(t);
    if (price != null) {
      // normaliza a chave sem .SA
      const key = String(symbolUsed || t).toUpperCase().replace('.SA', '');
      out[key] = price;
    }
    // evita rate limit
    await new Promise((res) => setTimeout(res, 100));
  }
  return out;
};

  const carregarDados = async () => {
  try {
    setLoading(true);

    // ✅ agora usa o endpoint que já vem com currentPrice calculado no backend
    const res = await api.get('/investimentos/todos');

    const lista = Array.isArray(res.data?.investimentos) ? res.data.investimentos : [];

    const withPrices = lista.map((it) => {
      const qty = Number(it.quantity) || 0;
      const invested = Number(it.investedValue) || 0;
      const avg = qty > 0 ? invested / qty : 0;
      const cur = it.currentPrice != null ? Number(it.currentPrice) : null;
      const pctVsAvg = cur != null && avg > 0 ? ((cur - avg) / avg) * 100 : null;


      return {
        id: it.id,
        name: it.name,
        ticker: it.ticker,
        quantity: qty,
        investedValue: invested,
        avgPrice: avg,
        currentPrice: cur,
        pctVsAvg,
      };
    });

    setCarteira(withPrices);

    // (opcional) manter os destaques como você já tinha:
    try {
      setLoadingHighlights(true);
      const { data } = await axios.get('https://brapi.dev/api/quote/list');
      const rows = Array.isArray(data?.stocks) ? data.stocks : [];
      const hi = rows
        .map((s) => ({
          ticker: s?.stock || s?.symbol || '',
          changePercent:
            Number.isFinite(Number(s?.regularMarketChangePercent))
              ? Number(s?.regularMarketChangePercent)
              : Number.isFinite(Number(s?.change))
              ? Number(s?.change)
              : null,
        }))
        .filter((x) => x.ticker && x.changePercent != null)
        .sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent))
        .slice(0, 5);
      setHighlights(hi);
    } catch {
      setHighlights([]);
    } finally {
      setLoadingHighlights(false);
    }
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
                carteira.map((item) => {
                  const avg = Number(item.avgPrice) || 0;
                  const cur = item.currentPrice != null ? Number(item.currentPrice) : null;
                  const pct = item.pctVsAvg;
                  const pctStr = pct == null ? '--' : `${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%`;

                  return (
                    <TableRow key={item.id || item.ticker}>
                      <TableCell flex={1}>{item.ticker}</TableCell>
                      <TableCell flex={1.2}>R$ {avg.toFixed(2)}</TableCell>
                      <TableCell flex={1.2}>{cur != null ? `R$ ${cur.toFixed(2)}` : '--'}</TableCell>
                      <TableCellValorizacao flex={1.2} positive={(pct ?? 0) >= 0}>
                        {pctStr}
                      </TableCellValorizacao>
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
                highlights.map((h) => {
                  const positive = h.changePercent >= 0;
                  const formatted = `${positive ? '+' : ''}${h.changePercent.toFixed(2)}%`;
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
