import styled from 'styled-components/native';

export const Background = styled.SafeAreaView`
  flex: 1;
  background-color: #0D202B;
`;

/* Header */
export const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background-color: #F8F8F8;
  border-bottom-width: 2px;
  border-bottom-color: #56949F;
`;

export const LogoImage = styled.Image.attrs({
  resizeMode: 'contain',
})`
  width: 120px;
  height: 40px;
`;

export const LogoutButton = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
`;

export const LogoutText = styled.Text`
  font-size: 16px;
  color: #56949F;
  margin-right: 5px;
  font-weight: 500;
`;

/* Conteúdo */
export const ContentContainer = styled.KeyboardAvoidingView`
  flex: 1;
  padding: 20px;
  padding-bottom: 100px; /* evita sobreposição pelo teclado */
  align-items: flex-start;
`;

export const BackButton = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  margin-bottom: 20px;
`;

export const BackButtonText = styled.Text`
  font-size: 16px;
  color: #E6E6E6;
  margin-left: 5px;
`;

export const Title = styled.Text`
  font-size: 24px;
  font-weight: bold;
  color: #FFF;
  margin-bottom: 25px;
  align-self: flex-start;
`;

export const Label = styled.Text`
  font-size: 16px;
  color: #E6E6E6;
  align-self: flex-start;
  margin-bottom: 8px;
  width: 100%;
`;

export const Input = styled.TextInput`
  background-color: #FFF;
  width: 100%;
  font-size: 16px;
  padding: 12px 15px;
  border-radius: 10px;
  border-width: 2px;
  border-color: #56949F;
  color: #121212;
  margin-bottom: 15px;
`;

export const CurrentValueText = styled.Text`
  font-size: 14px;
  color: #A9A9A9;
  align-self: flex-end;
  margin-top: -8px;
  margin-bottom: 20px;
`;

/* Botão salvar */
export const SubmitButton = styled.TouchableOpacity.attrs({
  activeOpacity: 0.85,
})`
  width: 100%;
  height: 50px;
  background-color: #56949F;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  margin-top: 10px;
  elevation: 3;
  shadow-color: #000;
  shadow-opacity: 0.25;
  shadow-radius: 3px;
`;

export const SubmitText = styled.Text`
  color: #FFF;
  font-size: 18px;
  font-weight: bold;
`;

/* Bottom nav */
export const BottomNav = styled.View`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  flex-direction: row;
  height: 65px;
  background-color: #F8F8F8;
  border-top-width: 1px;
  border-top-color: #DDD;
  justify-content: space-around;
  align-items: center;
`;

export const NavButton = styled.TouchableOpacity`
  flex: 1;
  align-items: center;
  justify-content: center;
  background-color: ${(props) => (props.active ? '#DDEBEC' : 'transparent')};
  border-radius: ${(props) => (props.active ? 10 : 0)}px;
  margin: 5px;
  height: 45px;
`;

export const NavText = styled.Text`
  font-size: 14px;
  color: ${(props) => (props.active ? '#0D202B' : '#A9A9A9')};
  font-weight: ${(props) => (props.active ? 'bold' : 'normal')};
`;

export const NavCenterButton = styled.TouchableOpacity`
  align-items: center;
  justify-content: center;
  width: 70px;
  height: 70px;
  border-radius: 35px;
  background-color: #F8F8F8;
  margin-top: -35px;
  elevation: 4;
  shadow-color: #000;
  shadow-opacity: 0.2;
  shadow-radius: 3px;
  border-width: 1px;
  border-color: #DDD;
`;

export const NavCenterLogo = styled.Image.attrs({
  resizeMode: 'contain',
})`
  width: 60px;
  height: 60px;
`;
