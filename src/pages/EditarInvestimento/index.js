// src/pages/EditarInvestimento/index.js
import React, { useEffect, useMemo, useState } from 'react';
import {
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
  LayoutAnimation,
  UIManager,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import Feather from 'react-native-vector-icons/Feather';
import api from '../../services/api';

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
  ReadOnlyBox,
  ReadOnlyText,
  SubmitButton,
  SubmitText,
  BottomNav,
  NavButton,
  NavText,
  NavCenterButton,
  NavCenterLogo,
  SuggestionContainer,
  SuggestionItem,
  SuggestionText,
  CurrentValueText,
} from './styles';

const BRAPI_V2_SEARCH = 'https://brapi.dev/api/v2/search';
const BRAPI_LIST = 'https://brapi.dev/api/quote/list';
const BRAPI_QUOTE = 'https://brapi.dev/api/quote';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const norm = (s) =>
  (s || '')
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const uniqueByTicker = (arr) => {
  const seen = new Set();
  return arr.filter((it) => {
    const k = (it.stock || '').toUpperCase();
    if (!k || seen.has(k)) return false;
    seen.add(k);
    return true;
  });
};

async function fetchBrapiSuggestions(q) {
  const out = [];
  try {
    const { data } = await axios.get(`${BRAPI_V2_SEARCH}?q=${encodeURIComponent(q)}`);
    const rows = Array.isArray(data?.stocks) ? data.stocks : [];
    rows.forEach((s) =>
      out.push({ stock: String(s?.stock || '').toUpperCase(), name: s?.name || '' })
    );
  } catch {}

  if (out.length === 0) {
    try {
      const { data } = await axios.get(`${BRAPI_LIST}?search=${encodeURIComponent(q)}`);
      const rows = Array.isArray(data?.stocks) ? data.stocks : [];
      rows.forEach((s) =>
        out.push({ stock: String(s?.stock || '').toUpperCase(), name: s?.name || '' })
      );
    } catch {}
  }
  return uniqueByTicker(out);
}

export default function EditarInvestimento() {
  const navigation = useNavigation();
  const route = useRoute();

  const { investmentId, id, _id, investimentoId } = route.params || {};
  const currentId = investmentId ?? id ?? _id ?? investimentoId ?? null;

  const [nome, setNome] = useState('');
  const [ticker, setTicker] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [valorInvestido, setValorInvestido] = useState('');
  const [dataInvestimento, setDataInvestimento] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [currentPrice, setCurrentPrice] = useState(null);

  const [nameSuggestions, setNameSuggestions] = useState([]);
  const [tickerSuggestions, setTickerSuggestions] = useState([]);
  const [showNameSuggestions, setShowNameSuggestions] = useState(false);
  const [showTickerSuggestions, setShowTickerSuggestions] = useState(false);
  const [nameFetching, setNameFetching] = useState(false);
  const [tickerFetching, setTickerFetching] = useState(false);

  const [nameDrop, setNameDrop] = useState({ x: 0, y: 0, w: 0 });
  const [tickerDrop, setTickerDrop] = useState({ x: 0, y: 0, w: 0 });

  const avgPrice = useMemo(() => {
    const q = parseFloat(String(quantidade).replace(',', '.'));
    const inv = parseFloat(String(valorInvestido).replace(',', '.'));
    if (!isFinite(q) || q <= 0 || !isFinite(inv) || inv < 0) return 0;
    return inv / q;
  }, [quantidade, valorInvestido]);

  const measureBelowName = (e) => {
    const { x, y, height, width } = e.nativeEvent.layout;
    setNameDrop({ x, y: y + height + 4, w: width });
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  };
  const measureBelowTicker = (e) => {
    const { x, y, height, width } = e.nativeEvent.layout;
    setTickerDrop({ x, y: y + height + 4, w: width });
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  };

  // Feather (RN CLI)
  useEffect(() => {
    Feather.loadFont()?.catch?.(() => {});
  }, []);

  // Carrega investimento
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        if (!currentId) {
          if (alive) setLoading(false);
          return;
        }
        const res = await api.get(`/investimentos/${currentId}`);
        const inv = res.data?.investimento ?? res.data ?? {};
        if (!alive) return;

        setNome(inv.name || '');
        setTicker((inv.ticker || '').toUpperCase());
        setQuantidade(inv.quantity != null ? String(inv.quantity) : '');
        setValorInvestido(inv.investedValue != null ? String(inv.investedValue) : '');
        setDataInvestimento(inv.dateInvested ? new Date(inv.dateInvested).toISOString().split('T')[0] : '');
      } catch (e) {
        console.log('load investimento:', e?.response?.data || e?.message);
        Alert.alert('Erro', 'Não foi possível carregar o investimento.');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [currentId]);

  // Preço atual
  useEffect(() => {
    let alive = true;
    (async () => {
      const tk = (ticker || '').trim().toUpperCase();
      if (!tk) { setCurrentPrice(null); return; }
      try {
        const { data } = await axios.get(`${BRAPI_QUOTE}/${encodeURIComponent(tk)}`);
        const p = data?.results?.[0]?.regularMarketPrice ?? data?.results?.[0]?.close ?? null;
        if (alive) setCurrentPrice(p != null ? Number(p) : null);
      } catch { if (alive) setCurrentPrice(null); }
    })();
    return () => { alive = false; };
  }, [ticker]);

  // 🔹 LISTAS PARA O AUTOCOMPLETE (faltava isso)
  const nameListWithTyped = useMemo(() => {
    const typed = (nome || '').trim();
    const base = Array.isArray(nameSuggestions) ? nameSuggestions : [];
    const withoutDup = base.filter((s) => norm(s.name) !== norm(typed));
    if (!typed) return base.slice(0, 8);
    return [{ name: typed, stock: ticker || '', _origin: 'typed' }, ...withoutDup].slice(0, 8);
  }, [nome, nameSuggestions, ticker]);

  const tickerListWithTyped = useMemo(() => {
    const typed = (ticker || '').trim().toUpperCase();
    const base = Array.isArray(tickerSuggestions) ? tickerSuggestions : [];
    const withoutDup = base.filter((s) => (s.stock || '').toUpperCase() !== typed);
    if (!typed) return base.slice(0, 8);
    return [{ stock: typed, name: nome || '', _origin: 'typed' }, ...withoutDup].slice(0, 8);
  }, [ticker, tickerSuggestions, nome]);

  // Busca sugestões por nome
  useEffect(() => {
    const qRaw = (nome || '').trim();
    if (!qRaw) { setNameSuggestions([]); setShowNameSuggestions(false); return; }
    setShowNameSuggestions(true);

    const q = norm(qRaw);
    const t = setTimeout(async () => {
      setNameFetching(true);
      try {
        let list = await fetchBrapiSuggestions(qRaw);
        list = list
          .filter((it) => it.name && norm(it.name).includes(q))
          .sort((a, b) => {
            const an = norm(a.name), bn = norm(b.name);
            const aStarts = an.startsWith(q) ? 0 : 1;
            const bStarts = bn.startsWith(q) ? 0 : 1;
            if (aStarts !== bStarts) return aStarts - bStarts;
            return an.localeCompare(bn);
          });
        setNameSuggestions(list.slice(0, 12));
      } catch { setNameSuggestions([]); }
      finally { setNameFetching(false); }
    }, 250);
    return () => clearTimeout(t);
  }, [nome]);

  // Busca sugestões por ticker
  useEffect(() => {
    const qRaw = (ticker || '').trim().toUpperCase();
    if (!qRaw) { setTickerSuggestions([]); setShowTickerSuggestions(false); return; }
    setShowTickerSuggestions(true);

    const t = setTimeout(async () => {
      setTickerFetching(true);
      try {
        let list = await fetchBrapiSuggestions(qRaw);
        list = list
          .filter((it) => it.stock.includes(qRaw))
          .sort((a, b) => {
            const aStarts = a.stock.startsWith(qRaw) ? 0 : 1;
            const bStarts = b.stock.startsWith(qRaw) ? 0 : 1;
            if (aStarts !== bStarts) return aStarts - bStarts;
            return a.stock.localeCompare(b.stock);
          });
        setTickerSuggestions(list.slice(0, 12));
      } catch { setTickerSuggestions([]); }
      finally { setTickerFetching(false); }
    }, 250);
    return () => clearTimeout(t);
  }, [ticker]);

  const handleSelectFromName = (item) => {
    if (item.name) setNome(item.name);
    if (item.stock) setTicker(item.stock);
    setShowNameSuggestions(false);
  };
  const handleSelectFromTicker = (item) => {
    if (item.stock) setTicker(item.stock);
    if (item.name && !nome) setNome(item.name);
    setShowTickerSuggestions(false);
  };

  const handleLogout = () => {
    api.defaults.headers.common['Authorization'] = null;
    navigation.navigate('Login');
  };
  const handleGoBack = () => navigation.goBack();
  const handleNavigateHome = () => navigation.navigate('Home');
  const handleNavigateDashboard = () => console.log('Navegar para Dashboard');

// dentro do EditarInvestimento/index.js

const handleSalvar = async () => {
  if (!currentId) { Alert.alert('Erro', 'ID do investimento não informado.'); return; }
  if (!nome || !ticker || !quantidade || !valorInvestido || !dataInvestimento) {
    Alert.alert('Erro', 'Por favor, preencha todos os campos.'); return;
  }

  const qty = Number(quantidade);
  const invested = parseFloat(String(valorInvestido).replace(',', '.'));
  if (!Number.isFinite(qty) || qty <= 0) {
    Alert.alert('Atenção', 'Quantidade deve ser um número positivo.');
    return;
  }
  if (!Number.isFinite(invested) || invested < 0) {
    Alert.alert('Atenção', 'Valor investido deve ser um número válido.');
    return;
  }

  const okDate = /^\d{4}-\d{2}-\d{2}$/.test(dataInvestimento);
  if (!okDate) {
    Alert.alert('Data inválida', 'Use o formato AAAA-MM-DD (ex.: 2025-10-28).');
    return;
  }
  const dateISO = new Date(`${dataInvestimento}T00:00:00Z`).toISOString();

  setSaving(true);
  try {
    const payload = {
      name: nome.trim(),
      ticker: ticker.trim().toUpperCase(),
      quantity: qty,
      investedValue: invested,
      dateInvested: dateISO,
    };

    // Se você adicionou a rota PATCH, pode manter este fallback; se só tiver PUT, deixe só o PUT.
    try { await api.put(`/investimentos/${currentId}`, payload); }
    catch { await api.patch?.(`/investimentos/${currentId}`, payload); }

    Alert.alert('Sucesso', 'Investimento atualizado!');
    navigation.goBack(); // Home tem useFocusEffect -> recarrega
  } catch (err) {
    const msg = err?.response?.data?.message || err.message || 'Não foi possível atualizar.';
    Alert.alert('Erro', msg);
  } finally {
    setSaving(false);
  }
};


  return (
    <TouchableWithoutFeedback onPress={() => { setShowNameSuggestions(false); setShowTickerSuggestions(false); Keyboard.dismiss(); }}>
      <Background>
        <Header>
          <LogoImage source={require('../../imgs/Logo-semfundo.png')} />
          <LogoutButton onPress={handleLogout}>
            <LogoutText>Sair</LogoutText>
            <Feather name="log-out" size={18} color="#56949F" />
          </LogoutButton>
        </Header>

        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 150 }} keyboardShouldPersistTaps="handled">
          <ContentContainer behavior={Platform.OS === 'ios' ? 'padding' : undefined} enabled>

            <BackButton onPress={handleGoBack}>
              <Feather name="arrow-left" size={20} color="#E6E6E6" />
              <BackButtonText>voltar</BackButtonText>
            </BackButton>

            <Title>{loading ? 'Carregando…' : 'Editar investimento'}</Title>

            {/* Nome + autocomplete */}
            <View style={{ position: 'relative' }}>
              <Label>Nome do investimento</Label>
              <Input
                placeholder="Ex: Petrobras, Magazine Luiza"
                placeholderTextColor="#A9A9A9"
                value={nome}
                onChangeText={(t) => { setNome(t); setShowNameSuggestions(t.trim().length > 0); }}
                onFocus={() => setShowNameSuggestions((nome || '').trim().length > 0)}
                onLayout={measureBelowName}
                editable={!loading}
              />
              {showNameSuggestions && (
                <SuggestionContainer style={{ top: nameDrop.y, left: nameDrop.x, width: nameDrop.w }}>
                  <ScrollView keyboardShouldPersistTaps="handled">
                    {nameListWithTyped.map((item, idx) => (
                      <SuggestionItem key={`${item.name}-${item.stock}-${idx}`} onPress={() => handleSelectFromName(item)}>
                        <SuggestionText>
                          {item.name}{item.stock ? ` — ${item.stock}` : ''}
                        </SuggestionText>
                      </SuggestionItem>
                    ))}
                    {nameFetching && (
                      <SuggestionItem activeOpacity={1}>
                        <SuggestionText>Buscando sugestões…</SuggestionText>
                      </SuggestionItem>
                    )}
                  </ScrollView>
                </SuggestionContainer>
              )}
            </View>

            {/* Ticker + autocomplete */}
            <View style={{ position: 'relative' }}>
              <Label>Ticker</Label>
              <Input
                placeholder="Ex: PETR4, MGLU3"
                placeholderTextColor="#A9A9A9"
                autoCapitalize="characters"
                autoCorrect={false}
                value={ticker}
                onChangeText={(t) => { const v = (t || '').toUpperCase(); setTicker(v); setShowTickerSuggestions(v.trim().length > 0); }}
                onFocus={() => setShowTickerSuggestions((ticker || '').trim().length > 0)}
                onLayout={measureBelowTicker}
                onSubmitEditing={() => setShowTickerSuggestions(false)}
                editable={!loading}
              />
              {showTickerSuggestions && (
                <SuggestionContainer style={{ top: tickerDrop.y, left: tickerDrop.x, width: tickerDrop.w }}>
                  <ScrollView keyboardShouldPersistTaps="handled">
                    {tickerListWithTyped.map((item, idx) => (
                      <SuggestionItem key={`${item.stock}-${idx}`} onPress={() => handleSelectFromTicker(item)}>
                        <SuggestionText>
                          {item.stock}{item.name ? ` - ${item.name}` : ''}
                        </SuggestionText>
                      </SuggestionItem>
                    ))}
                    {tickerFetching && (
                      <SuggestionItem activeOpacity={1}>
                        <SuggestionText>Buscando sugestões…</SuggestionText>
                      </SuggestionItem>
                    )}
                  </ScrollView>
                </SuggestionContainer>
              )}
            </View>

            <Label>Quantidade</Label>
            <Input
              placeholder="Ex: 100"
              placeholderTextColor="#A9A9A9"
              keyboardType="numeric"
              value={quantidade}
              onChangeText={setQuantidade}
              editable={!loading}
            />

            <Label>Valor investido</Label>
            <Input
              placeholder="R$ (Ex: 3850.00)"
              placeholderTextColor="#A9A9A9"
              keyboardType="numeric"
              value={valorInvestido}
              onChangeText={setValorInvestido}
              editable={!loading}
            />

            <Label>Preço médio (auto)</Label>
            <ReadOnlyBox>
              <ReadOnlyText>R$ {isFinite(avgPrice) ? avgPrice.toFixed(2) : '0.00'}</ReadOnlyText>
            </ReadOnlyBox>

            <Label>Data do Investimento</Label>
            <Input
              placeholder="AAAA-MM-DD (Ex: 2025-10-28)"
              placeholderTextColor="#A9A9A9"
              value={dataInvestimento}
              onChangeText={setDataInvestimento}
              editable={!loading}
            />

            {currentPrice != null && (
              <CurrentValueText>Preço atual (BRAPI): R$ {Number(currentPrice).toFixed(2)}</CurrentValueText>
            )}

            <SubmitButton onPress={handleSalvar} disabled={saving || loading}>
              {saving ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Feather name="save" size={18} color="#FFF" />
                  <SubmitText style={{ marginLeft: 8 }}>Salvar</SubmitText>
                </>
              )}
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
    </TouchableWithoutFeedback>
  );
}
