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


function Login() {
  const navigation = useNavigation(); 

  return (
    <Background>
      <Container behavior={Platform.OS === 'ios' ? 'padding' : ''} enabled>
        <FormContainer>
          <Logo source={require('../../imgs/Logo-semfundo.png')} />

          <Label>E-mail:</Label>
          <Input placeholder="seuemail@exemplo.com" placeholderTextColor="#A9A9A9" />
          <Label>Senha:</Label>
          <Input placeholder="********" placeholderTextColor="#A9A9A9" secureTextEntry={true} />


          <SubmitButton activeOpacity={0.8}>
            <SubmitText>Entrar</SubmitText>
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