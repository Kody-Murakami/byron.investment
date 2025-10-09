import styled from 'styled-components/native';

export const Background = styled.View`
  flex: 1;
  background-color: #0D202B; /* Cor de fundo escura do design */
`;

export const Container = styled.KeyboardAvoidingView`
  flex: 1;
  align-items: center;
  justify-content: center;
`;

export const FormContainer = styled.View`
  align-items: center;
  justify-content: center;
  background-color: #E6E6E6; /* Fundo do formulário */
  border-radius: 15px;
  padding: 25px;
  width: 90%;
`;

export const Logo = styled.Image`
  width: 150px;
  height: 150px;
  resize-mode: contain;
  margin-bottom: 20px;
`;

export const Label = styled.Text`
  font-size: 16px;
  color: #333;
  align-self: flex-start; /* Alinha o texto à esquerda */
  margin-bottom: 5px;
  margin-left: 5%; /* Alinha com o input */
`;

export const Input = styled.TextInput`
  background-color: #FFF;
  width: 100%;
  font-size: 16px;
  padding: 10px;
  border-radius: 10px;
  border-width: 2px;
  border-color: #56949F; /* Cor da borda do input */
  color: #121212;
  margin-bottom: 15px;
`;

export const SubmitButton = styled.TouchableOpacity`
  width: 100%;
  height: 45px;
  background-color: #56949F; /* Cor do botão */
  align-items: center;
  justify-content: center;
  border-radius: 10px;
`;

export const SubmitText = styled.Text`
  color: #FFF;
  font-size: 18px;
  font-weight: bold;
`;

export const Link = styled.TouchableOpacity`
  margin-top: 15px;
`;

export const LinkText = styled.Text`
  color: #56949F; /* Cor do link */
  font-size: 16px;
`;