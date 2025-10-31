// src/pages/NovoInvestimento/index.js
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
import { useNavigation } from '@react-navigation/native';
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
} from './styles';

const BRAPI_V2_SEARCH = 'https://brapi.dev/api/v2/search';
const BRAPI_LIST = 'https://brapi.dev/api/quote/list';

// habilita animações no Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// utils
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

// busca unificada (v2/search -> fallback quote/list?search=)
async function fetchBrapiSuggestions(q) {
  const results = [];

  try {
    const { data } = await axios.get(`${BRAPI_V2_SEARCH}?q=${encodeURIComponent(q)}`);
    const rows = Array.isArray(data?.stocks) ? data.stocks : [];
    for (const s of rows) {
      results.push({
        stock: String(s?.stock || '').toUpperCase(),
        name: s?.name || '',
        _origin: 'v2/search',
      });
    }
  } catch {}

  if (results.length === 0) {
    try {
      const { data } = await axios.get(`${BRAPI_LIST}?search=${encodeURIComponent(q)}`);
      const rows = Array.isArray(data?.stocks) ? data.stocks : [];
      for (const s of rows) {
        results.push({
          stock: String(s?.stock || '').toUpperCase(),
          name: s?.name || '',
          _origin: 'quote/list',
        });
      }
    } catch {}
  }

  return uniqueByTicker(results);
}

export default function NovoInvestimento() {
  const navigation = useNavigation();

  // garante a fonte dos ícones carregada
  useEffect(() => {
    Feather.loadFont()?.catch?.(() => {});
  }, []);

  // -------- form --------
  const [nome, setNome] = useState('');
  const [ticker, setTicker] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [valorInvestido, setValorInvestido] = useState('');
  const [dataInvestimento, setDataInvestimento] = useState('');
  const [loading, setLoading] = useState(false);

  // preço médio (auto)
  const avgPrice = useMemo(() => {
    const q = parseFloat(String(quantidade).replace(',', '.'));
    const inv = parseFloat(String(valorInvestido).replace(',', '.'));
    if (!isFinite(q) || q <= 0 || !isFinite(inv) || inv < 0) return 0;
    return inv / q;
  }, [quantidade, valorInvestido]);

  // -------- autocomplete --------
  const [nameSuggestions, setNameSuggestions] = useState([]);
  const [tickerSuggestions, setTickerSuggestions] = useState([]);
  const [showNameSuggestions, setShowNameSuggestions] = useState(false);
  const [showTickerSuggestions, setShowTickerSuggestions] = useState(false);
  const [nameFetching, setNameFetching] = useState(false);
  const [tickerFetching, setTickerFetching] = useState(false);

  // posições dos dropdowns
  const [nameDrop, setNameDrop] = useState({ x: 0, y: 0, w: 0 });
  const [tickerDrop, setTickerDrop] = useState({ x: 0, y: 0, w: 0 });

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

  // NOME
  useEffect(() => {
    const qRaw = (nome || '').trim();
    if (!qRaw) {
      setNameSuggestions([]);
      setShowNameSuggestions(false);
      return;
    }
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
          })
          .slice(0, 12);
        setNameSuggestions(list);
      } catch {
        setNameSuggestions([]);
      } finally {
        setNameFetching(false);
      }
    }, 250);

    return () => clearTimeout(t);
  }, [nome]);

  // TICKER
  useEffect(() => {
    const qRaw = (ticker || '').trim().toUpperCase();
    if (!qRaw) {
      setTickerSuggestions([]);
      setShowTickerSuggestions(false);
      return;
    }
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
          })
          .slice(0, 12);
        setTickerSuggestions(list);
      } catch {
        setTickerSuggestions([]);
      } finally {
        setTickerFetching(false);
      }
    }, 250);

    return () => clearTimeout(t);
  }, [ticker]);

  // seleção
  const handleSelectFromName = (item) => {
    if (item.name) setNome(item.name);
    if (item.stock) setTicker(item.stock);
    setShowNameSuggestions(false);
    Keyboard.dismiss();
  };
  const handleSelectFromTicker = (item) => {
    if (item.stock) setTicker(item.stock);
    if (item.name && !nome) setNome(item.name);
    setShowTickerSuggestions(false);
    Keyboard.dismiss();
  };

  // navegação / submit
  const handleLogout = () => {
    api.defaults.headers.common['Authorization'] = null;
    navigation.navigate('Login');
  };
  const handleGoBack = () => navigation.goBack();
  const handleNavigateHome = () => navigation.navigate('Home');
  const handleNavigateDashboard = () => console.log('Navegar para Dashboard');

  const handleAdicionar = async () => {
    if (!nome || !ticker || !quantidade || !valorInvestido || !dataInvestimento) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    const qty = Number(quantidade);
    const invested = parseFloat(String(valorInvestido).replace(',', '.'));
    if (!Number.isFinite(qty) || qty <= 0) {
      Alert.alert('Atenção', 'Quantidade deve ser um número positivo.');
      return;
    }
    if (!Number.isFinite(invested) || invested <= 0) {
      Alert.alert('Atenção', 'Valor investido deve ser um número positivo.');
      return;
    }

    // valida AAAA-MM-DD e monta ISO seguro
    const okDate = /^\d{4}-\d{2}-\d{2}$/.test(dataInvestimento);
    if (!okDate) {
      Alert.alert('Data inválida', 'Use o formato AAAA-MM-DD (ex.: 2025-10-28).');
      return;
    }
    const dateISO = new Date(`${dataInvestimento}T00:00:00Z`).toISOString();

    setShowNameSuggestions(false);
    setShowTickerSuggestions(false);
    setLoading(true);
    try {
      const payload = {
        name: nome.trim(),
        ticker: ticker.trim().toUpperCase(),
        quantity: qty,
        investedValue: invested,
        // se seu backend espera string AAAA-MM-DD, troque por: dateInvested: dataInvestimento
        dateInvested: dateISO,
      };
      await api.post('/investimentos', payload);
      setLoading(false);
      Alert.alert('Sucesso', 'Investimento adicionado à carteira!');
      navigation.navigate('Home');
    } catch (err) {
      setLoading(false);
      const msg = err?.response?.data?.message || err?.response?.data?.error || err.message || 'Não foi possível adicionar.';
      Alert.alert('Erro', msg);
    }
  };

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        setShowNameSuggestions(false);
        setShowTickerSuggestions(false);
        Keyboard.dismiss();
      }}
    >
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
        >
          <ContentContainer behavior={Platform.OS === 'ios' ? 'padding' : undefined} enabled>
            <BackButton onPress={handleGoBack}>
              <Feather name="arrow-left" size={20} color="#E6E6E6" />
              <BackButtonText>voltar</BackButtonText>
            </BackButton>

            <Title>Novo investimento</Title>

            {/* Nome + autocomplete */}
            <View style={{ position: 'relative' }}>
              <Label>Nome do investimento</Label>
              <Input
                placeholder="Ex: Petrobras, Magazine Luiza"
                placeholderTextColor="#A9A9A9"
                value={nome}
                onChangeText={(t) => {
                  setNome(t);
                  setShowNameSuggestions(t.trim().length > 0);
                }}
                onFocus={() => setShowNameSuggestions((nome || '').trim().length > 0)}
                onLayout={(e) => {
                  const { x, y, height, width } = e.nativeEvent.layout;
                  setNameDrop({ x, y: y + height + 4, w: width });
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                }}
                returnKeyType="next"
              />

              {showNameSuggestions && (
                <SuggestionContainer style={{ top: nameDrop.y, left: nameDrop.x, width: nameDrop.w }}>
                  <ScrollView keyboardShouldPersistTaps="handled">
                    {nameListWithTyped.map((item, idx) => (
                      <SuggestionItem key={`${item.name}-${item.stock}-${idx}`} onPress={() => handleSelectFromName(item)}>
                        <SuggestionText>
                          {item.name}{item.stock ? ` — ${item.stock}` : ''}{item._origin === 'typed' ? '  (usar este)' : ''}
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
                onChangeText={(t) => {
                  const v = (t || '').toUpperCase();
                  setTicker(v);
                  setShowTickerSuggestions(v.trim().length > 0);
                }}
                onFocus={() => setShowTickerSuggestions((ticker || '').trim().length > 0)}
                onLayout={(e) => {
                  const { x, y, height, width } = e.nativeEvent.layout;
                  setTickerDrop({ x, y: y + height + 4, w: width });
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                }}
                onSubmitEditing={() => setShowTickerSuggestions(false)}
              />

              {showTickerSuggestions && (
                <SuggestionContainer style={{ top: tickerDrop.y, left: tickerDrop.x, width: tickerDrop.w }}>
                  <ScrollView keyboardShouldPersistTaps="handled">
                    {tickerListWithTyped.map((item, idx) => (
                      <SuggestionItem key={`${item.stock}-${idx}`} onPress={() => handleSelectFromTicker(item)}>
                        <SuggestionText>
                          {item.stock}{item.name ? ` - ${item.name}` : ''}{item._origin === 'typed' ? '  (usar este)' : ''}
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

            {/* Quantidade */}
            <Label>Quantidade</Label>
            <Input
              placeholder="Ex: 100"
              placeholderTextColor="#A9A9A9"
              keyboardType="numeric"
              value={quantidade}
              onChangeText={setQuantidade}
              returnKeyType="next"
            />

            {/* Valor investido */}
            <Label>Valor investido</Label>
            <Input
              placeholder="R$ (Ex: 3850.00)"
              placeholderTextColor="#A9A9A9"
              keyboardType="numeric"
              value={valorInvestido}
              onChangeText={setValorInvestido}
              returnKeyType="next"
            />

            {/* Preço médio (auto) */}
            <Label>Preço médio (auto)</Label>
            <ReadOnlyBox>
              <ReadOnlyText>R$ {isFinite(avgPrice) ? avgPrice.toFixed(2) : '0.00'}</ReadOnlyText>
            </ReadOnlyBox>

            {/* Data */}
            <Label>Data do Investimento</Label>
            <Input
              placeholder="AAAA-MM-DD (Ex: 2025-10-28)"
              placeholderTextColor="#A9A9A9"
              value={dataInvestimento}
              onChangeText={setDataInvestimento}
              returnKeyType="done"
            />

            <SubmitButton onPress={handleAdicionar} disabled={loading} activeOpacity={0.85}>
              {loading ? <ActivityIndicator color="#FFF" /> : <SubmitText>Adicionar</SubmitText>}
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
