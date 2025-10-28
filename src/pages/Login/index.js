import React, { useState } from 'react';
import { Platform, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native'; 
import api from '../../services/api'; // <-- Importa o "Mensageiro"

import {
  Background,
  Container,
  FormContainer,
  Logo,
  Label,
  Input,
  SubmitButton,
  SubmitText,
  Link,
  LinkText,
} from './styles';


function Login() {
  const navigation = useNavigation(); 

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    // Validação: Campos vazios
    if (email === '' || senha === '') {
      Alert.alert("Erro", "Por favor, preencha E-mail e Senha.");
      return;
    }

    setLoading(true);
    try {
      
      const data = {
        email: email,
        password: senha
      };
      
      // CHAMA A API! (A rota de login no backend é /sessions)
      const response = await api.post('/usuario/login', data);; 

      // Pega o token da resposta
      const { token } = response.data;
      
      // Coloca o token em TODOS os futuros pedidos da API
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      setLoading(false);
      navigation.navigate('Home'); // Navega para a Home
      
      // Limpa os campos após o login (opcional, mas bom)
      setEmail('');
      setSenha('');

    } catch (err) {
      setLoading(false);
      
      // Se a API der erro (ex: 401 Senha errada) ou der erro de rede
      const errorMessage = err.response?.data?.message || "Não foi possível realizar o login.";
      Alert.alert("Erro no login", errorMessage);
    }
  }

  return (
    <Background>
      <Container behavior={Platform.OS === 'ios' ? 'padding' : ''} enabled>
        <FormContainer>
          <Logo source={require('../../imgs/Logo-semfundo.png')} />

          <Label>E-mail:</Label>
          <Input 
            placeholder="seuemail@exemplo.com" 
            placeholderTextColor="#A9A9A9" 
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Label>Senha:</Label>
          <Input 
            placeholder="********" 
            placeholderTextColor="#A9A9A9" 
            secureTextEntry={true} 
            value={senha}
            onChangeText={setSenha}
          />


          <SubmitButton activeOpacity={0.8} onPress={handleLogin} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <SubmitText>Entrar</SubmitText>
            )}
          </SubmitButton>

          <Link onPress={() => navigation.navigate('Cadastro')}>
            <LinkText>Fazer cadastro</LinkText>
          </Link>
        </FormContainer>
      </Container>
    </Background>
  );
}

export default Login;

