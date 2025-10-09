import React from 'react';
import { Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native'; 

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

  return (
    <Background>
      <Container behavior={Platform.OS === 'ios' ? 'padding' : ''} enabled>
        <FormContainer>
          <Logo source={require('../../imgs/Logo-semfundo.png')} />

          <Label>Nome do usuário:</Label>
          <Input placeholder="Seu nome" placeholderTextColor="#A9A9A9" />
          <Label>Email:</Label>
          <Input placeholder="seuemail@exemplo.com" placeholderTextColor="#A9A9A9" />
          <Label>Senha:</Label>
          <Input placeholder="Crie uma senha forte" placeholderTextColor="#A9A9A9" secureTextEntry={true} />
          <Label>Confirme sua senha:</Label>
          <Input placeholder="Confirme a senha" placeholderTextColor="#A9A9A9" secureTextEntry={true} />


          <SubmitButton activeOpacity={0.8}>
            <SubmitText>Entrar</SubmitText>
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