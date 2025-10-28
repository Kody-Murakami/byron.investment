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

function Cadastro() {
  const navigation = useNavigation(); 
  
  // Estados para guardar o que o usuário digita
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [loading, setLoading] = useState(false); // Para o ícone de "a carregar"

  // Função que é chamada ao clicar no botão
  async function handleCadastro() {
    // Validação 1: Campos vazios
    if (nome === '' || email === '' || senha === '' || confirmarSenha === '') {
      Alert.alert("Erro", "Por favor, preencha todos os campos.");
      return; 
    }
    
    // Validação 2: Senhas diferentes
    if (senha !== confirmarSenha) {
      Alert.alert("Erro", "As senhas não são iguais!");
      return;
    }

    // Se passou nas validações, tenta enviar para a API
    setLoading(true);
    try {
      
      const data = {
        name: nome,
        email: email,
        password: senha
      };
      
      // CHAMA A API! (Lembre-se que no backend a rota é /usuarios)
      await api.post('/usuario', data); 

      setLoading(false);
      Alert.alert("Sucesso", "Cadastro realizado! Faça o login.");
      navigation.goBack(); // Volta para a tela de Login

    } catch (err) {
      setLoading(false);
      
      // Se a API der erro (ex: email já existe) ou der erro de rede
      const errorMessage = err.response?.data?.message || "Não foi possível realizar o cadastro.";
      Alert.alert("Erro no cadastro", errorMessage);
    }
  }

  return (
    <Background>
      <Container behavior={Platform.OS === 'ios' ? 'padding' : ''} enabled>
        <FormContainer>
          <Logo source={require('../../imgs/Logo-semfundo.png')} />

          <Label>Nome do usuário:</Label>
          <Input 
            placeholder="Seu nome" 
            placeholderTextColor="#A9A9A9" 
            value={nome}         // <-- Liga o input ao state
            onChangeText={setNome} // <-- Atualiza o state ao digitar
          />
          <Label>Email:</Label>
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
            placeholder="Crie uma senha forte" 
            placeholderTextColor="#A9A9A9" 
            secureTextEntry={true} 
            value={senha}
            onChangeText={setSenha}
          />
          <Label>Confirme sua senha:</Label>
          <Input 
            placeholder="Confirme a senha" 
            placeholderTextColor="#A9A9A9" 
            secureTextEntry={true} 
            value={confirmarSenha}
            onChangeText={setConfirmarSenha}
          />

          {/* O botão agora chama a função handleCadastro */}
          <SubmitButton activeOpacity={0.8} onPress={handleCadastro} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#FFF" /> // Mostra "rodinha"
            ) : (
              <SubmitText>Cadastrar</SubmitText> // O texto mudou de "Entrar" para "Cadastrar"
            )}
          </SubmitButton>

          <Link onPress={() => navigation.goBack()}>
            <LinkText>Já possuo uma conta</LinkText>
          </Link>
        </FormContainer>
      </Container>
    </Background>
  );
}

export default Cadastro;

