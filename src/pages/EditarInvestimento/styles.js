import styled from 'styled-components/native';

export const Background = styled.SafeAreaView`
  flex: 1;
  background-color: #0D202B;
`;

export const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background-color: #F8F8F8;
  border-bottom-width: 2px;
  border-bottom-color: #56949F;
`;

export const LogoImage = styled.Image.attrs({ resizeMode: 'contain' })`
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

export const ContentContainer = styled.KeyboardAvoidingView`
  padding: 20px;
  padding-bottom: 100px;
`;

export const BackButton = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  margin-bottom: 20px;
  align-self: flex-start;
`;

export const BackButtonText = styled.Text`
  font-size: 16px;
  color: #E6E6E6;
  margin-left: 8px;
`;

export const Title = styled.Text`
  font-size: 24px;
  font-weight: bold;
  color: #FFF;
  margin-bottom: 25px;
  text-align: center;
`;

export const Label = styled.Text`
  font-size: 16px;
  color: #E6E6E6;
  margin-bottom: 8px;
  margin-left: 5px;
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

export const ReadOnlyBox = styled.View`
  background-color: #F3F3F3;
  width: 100%;
  padding: 12px 15px;
  border-radius: 10px;
  border-width: 2px;
  border-color: #CFCFCF;
  margin-bottom: 15px;
`;

export const ReadOnlyText = styled.Text`
  font-size: 16px;
  color: #444;
`;

export const CurrentValueText = styled.Text`
  color: #CFE7CF;
  margin-top: 6px;
  margin-bottom: 8px;
`;

export const SubmitButton = styled.TouchableOpacity.attrs({ activeOpacity: 0.85 })`
  width: 100%;
  height: 50px;
  background-color: #56949F;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  margin-top: 20px;
  elevation: 3;
  shadow-color: #000;
  shadow-opacity: 0.25;
  shadow-radius: 3px;
  flex-direction: row;
`;

export const SubmitText = styled.Text`
  color: #FFF;
  font-size: 18px;
  font-weight: bold;
`;

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
  background-color: ${(p) => (p.active ? '#DDEBEC' : 'transparent')};
  border-radius: ${(p) => (p.active ? 10 : 0)}px;
  margin: 5px;
  height: 45px;
`;

export const NavText = styled.Text`
  font-size: 14px;
  color: ${(p) => (p.active ? '#0D202B' : '#A9A9A9')};
  font-weight: ${(p) => (p.active ? 'bold' : 'normal')};
`;

export const NavCenterButton = styled.TouchableOpacity.attrs({
  style: { shadowOffset: { width: 0, height: -1 } },
})`
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

export const NavCenterLogo = styled.Image.attrs({ resizeMode: 'contain' })`
  width: 60px;
  height: 60px;
`;

export const SuggestionContainer = styled.View`
  position: absolute;
  z-index: 9999;
  elevation: 9;
  background-color: #FFF;
  border-radius: 8px;
  border-width: 1px;
  border-color: #CCC;
  max-height: 220px;
  shadow-color: #000;
  shadow-opacity: 0.15;
  shadow-radius: 6px;
`;

export const SuggestionItem = styled.TouchableOpacity`
  padding: 12px 15px;
  border-bottom-width: 1px;
  border-bottom-color: #EEE;
`;

export const SuggestionText = styled.Text`
  font-size: 14px;
  color: #333;
`;
