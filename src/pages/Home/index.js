// src/pages/Home/index.js
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
    const id =
      item?.id ?? item?._id ?? item?.investmentId ?? item?.investimentoId ?? item?.Id ?? null;
    if (!id) return Alert.alert('Erro', 'ID do investimento não encontrado.');
    navigation.navigate('EditarInvestimento', { investmentId: id });
  };

  // === EXCLUIR: tenta rota REST e fallback por query ===
  const handleDelete = (item) => {
  // pega o id exatamente como vier, mas força string
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

        // --- Otimistic UI: tira da tela antes (e volta se falhar)
        const prev = carteira;
        setCarteira((list) => list.filter((x) => String(
          x?.id ?? x?._id ?? x?.investmentId ?? x?.investimentoId
        ) !== id));

        try {
          // Aceita qualquer status como “resposta” para não cair em exception
          const resp = await api.delete(url, {
            timeout: 15000,
            validateStatus: () => true,
            headers: { Accept: 'application/json' },
          });

          // Muitos backends devolvem 204 (sem body) no delete
          const ok = resp?.status === 200 || resp?.status === 202 || resp?.status === 204;

          if (ok) {
            // Mensagem amigável mesmo que não tenha body
            const msg = resp?.data?.message || 'Investimento removido com sucesso!';
            Alert.alert('Sucesso', msg);
            // Recarrega do back para garantir consistência
            await carregarDados();
            return;
          }

          // Se chegou aqui, servidor respondeu mas não “ok”
          const msg =
            resp?.data?.message ||
            resp?.data?.error ||
            `Falha ao remover (status ${resp?.status ?? '???'})`;
          // rollback da UI otimista
          setCarteira(prev);
          Alert.alert('Erro', msg);
        } catch (err) {
          // Erro de rede/timeout/etc. -> rollback e alerta
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

  // ---- utils
  const toNum = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };
  const isFiniteNum = (v) => typeof v === 'number' && Number.isFinite(v);

  // === COTAÇÕES ROBUSTAS: batch + .SA + lookup + histórico ===
const fetchQuotes = async (tickers) => {
  if (!Array.isArray(tickers) || tickers.length === 0) return {};

  const norm = (t) => String(t || '').toUpperCase().trim();
  const base = Array.from(new Set(tickers.map(norm).filter(Boolean)));
  const withSa = base.map(t => (t.includes('.') ? t : `${t}.SA`));
  const all = Array.from(new Set([...base, ...withSa]));

  const toNum = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };
  const chunk = (arr, n = 45) => {
    const out = [];
    for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
    return out;
  };

  // helper: extrai preço de um objeto da BRAPI
  const extractPrice = (r) => {
    const direct =
      toNum(r?.regularMarketPrice) ??
      toNum(r?.close) ??
      toNum(r?.price) ??
      toNum(r?.regularMarketPreviousClose);

    if (direct != null) return direct;

    // fallback: último close válido do histórico
    const hist = Array.isArray(r?.historicalDataPrice) ? r.historicalDataPrice : [];
    for (let i = hist.length - 1; i >= 0; i--) {
      const p = toNum(hist[i]?.close);
      if (p != null) return p;
    }
    return null;
  };

  const map = {};

  // 1) batch inicial (rápido)
  for (const group of chunk(all)) {
    const url = withToken(
      `${BRAPI_QUOTE_URL}/${group.map(encodeURIComponent).join(',')}?range=1d&interval=1d`
    );
    try {
      const { data } = await axios.get(url);
      const results = Array.isArray(data?.results) ? data.results : [];
      for (const r of results) {
        const symRaw = String(r.symbol || r.stock || '').toUpperCase();
        const sym = symRaw.replace('.SA', '');
        const price = extractPrice(r);
        if (sym && price != null && map[sym] == null) map[sym] = price;
      }
    } catch {}
  }

  // 2) quem faltou: range maior + lookup por search
  const missing = base.filter(t => map[t] == null);

  for (const t of missing) {
    const tries = [t, t.includes('.') ? t : `${t}.SA`];

    let got = false;
    // 2a) tenta direto com range maior (traz histórico)
    for (const sym of tries) {
      try {
        const urlOne = withToken(
          `${BRAPI_QUOTE_URL}/${encodeURIComponent(sym)}?range=1mo&interval=1d`
        );
        const { data } = await axios.get(urlOne);
        const r = Array.isArray(data?.results) ? data.results[0] : null;
        const price = r ? extractPrice(r) : null;
        if (price != null) {
          map[t] = price;
          got = true;
          break;
        }
      } catch {}
    }
    if (got) { await new Promise(res => setTimeout(res, 120)); continue; }

    // 2b) descobre símbolo exato via search
    try {
      const sUrl = withToken(`https://brapi.dev/api/quote/list?search=${encodeURIComponent(t)}`);
      const { data: sdata } = await axios.get(sUrl);
      const rows = Array.isArray(sdata?.stocks) ? sdata.stocks : [];
      const hit = rows.find(x => x?.stock) || null;
      if (hit) {
        const stock = String(hit.stock).toUpperCase();
        const urlExact = withToken(
          `${BRAPI_QUOTE_URL}/${encodeURIComponent(stock)}?range=1mo&interval=1d`
        );
        const { data: qdata } = await axios.get(urlExact);
        const r = Array.isArray(qdata?.results) ? qdata.results[0] : null;
        const price = r ? extractPrice(r) : null;
        if (price != null) {
          const key = stock.replace('.SA', '');
          map[key] = price;
          if (map[t] == null) map[t] = price;
        }
      }
    } catch {}

    await new Promise(res => setTimeout(res, 120)); // evita rate limit
  }

  return map;
};

  const carregarDados = async () => {
    try {
      setLoading(true);

      // 1) back-end
      const res = await api.get('/investimentos');
      const lista = Array.isArray(res.data?.investimentos)
        ? res.data.investimentos
        : Array.isArray(res.data)
        ? res.data
        : [];

      const base = (lista || []).map((it) => ({
        id: it.id ?? it._id ?? it.investmentId ?? it?.investimentoId,
        name: it.name || it.descricao || '',
        ticker: String(it.ticker || '').toUpperCase(),
        quantity: Number(it.quantity) || 0,
        investedValue: Number(it.investedValue) || 0,
      }));

      // 2) cotações
      const tickers = Array.from(new Set(base.map((x) => x.ticker).filter(Boolean)));
      const mapPrices = await fetchQuotes(tickers);

      // 3) calcula preço médio e valorização vs. médio
      const withPrices = base.map((it) => {
        const avg = it.quantity > 0 ? it.investedValue / it.quantity : 0;
        const cur = mapPrices[it.ticker] ?? null;
        const pctVsAvg = cur != null && avg > 0 ? ((cur - avg) / avg) * 100 : null;

        return {
          ...it,
          avgPrice: avg,
          currentPrice: cur,
          pctVsAvg,
        };
      });

      setCarteira(withPrices);

      // Destaques do dia (opcional)
      try {
        setLoadingHighlights(true);
        const { data } = await axios.get(withToken('https://brapi.dev/api/quote/list'));
        const rows = Array.isArray(data?.stocks) ? data.stocks : [];
        const hi = rows
          .map((s) => ({
            ticker: s?.stock || s?.symbol || '',
            changePercent: toNum(s?.regularMarketChangePercent) ?? toNum(s?.change),
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

          {/* DESTAQUE DO DIA (opcional) */}
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
