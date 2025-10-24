import styled from 'styled-components/native';

export const Background = styled.SafeAreaView`
  flex: 1;
  background-color: #0D202B; /* Cor de fundo escura */
`;

export const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background-color: #F8F8F8; /* Fundo branco/cinza claro do header */
  border-bottom-width: 2px;
  border-bottom-color: #56949F; /* Linha azul do print */
`;

export const LogoImage = styled.Image`
  width: 120px;
  height: 40px;
  resize-mode: contain;
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

export const ContentContainer = styled.View`
  padding: 20px;
`;

export const WelcomeTitle = styled.Text`
  font-size: 24px;
  font-weight: bold;
  color: #FFF;
  margin-bottom: 5px;
`;

export const WelcomeSubtitle = styled.Text`
  font-size: 16px;
  color: #E6E6E6;
  margin-bottom: 20px;
`;

export const Card = styled.View`
  background-color: #E6E6E6; /* Fundo cinza claro dos cards */
  border-radius: 15px;
  padding: 15px;
  margin-bottom: 20px;
  width: 100%;
`;

export const CardTitle = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 15px;
`;

export const Table = styled.View`
  width: 100%;
`;

export const TableHeader = styled.View`
  flex-direction: row;
  background-color: #CCCCCC; /* Fundo cinza do cabeçalho da tabela */
  padding: 10px 5px;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
`;

export const ColumnHeader = styled.Text`
  font-size: 11px; /* Tamanho pequeno como no print */
  font-weight: bold;
  color: #555;
  flex: ${(props) => props.flex || 1};
  text-align: left;
`;

export const TableRow = styled.View`
  flex-direction: row;
  padding: 12px 5px;
  border-bottom-width: 1px;
  border-bottom-color: #CCC;
  align-items: center;
`;

export const TableCell = styled.Text`
  font-size: 14px;
  color: #333;
  flex: ${(props) => props.flex || 1};
  text-align: left;
`;

export const TableCellValorizacao = styled(TableCell)`
  font-weight: bold;
  color: ${(props) => (props.positive ? '#008000' : '#D00000')}; /* Verde ou Vermelho */
`;

export const TableCellAtivos = styled.View`
  flex-direction: row;
  justify-content: space-around;
  flex: ${(props) => props.flex || 1};
  align-items: center;
`;

export const IconButton = styled.TouchableOpacity`
  padding: 5px;
`;

export const FabButton = styled.TouchableOpacity`
  position: absolute;
  bottom: 80px; /* Posição acima da nav inferior */
  right: 20px;
  background-color: #56949F; /* Cor azul */
  width: 110px; /* Largura para caber "+ Novo" */
  height: 45px;
  border-radius: 25px;
  align-items: center;
  justify-content: center;
  elevation: 5;
  shadow-color: #000;
  shadow-opacity: 0.3;
  shadow-radius: 4px;

  /* ***** INÍCIO DA CORREÇÃO ***** */
  shadow-offset-width: 0;
  shadow-offset-height: 2;
  /* ***** FIM DA CORREÇÃO ***** */
`;

export const FabText = styled.Text`
  color: #FFF;
  font-size: 16px;
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
  /* Estilo do botão ativo */
  background-color: ${(props) => (props.active ? '#DDEBEC' : 'transparent')};
  border-radius: ${(props) => (props.active ? '10px' : '0px')};
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
  margin-top: -35px; /* Puxa o botão para cima */
  elevation: 4;
  shadow-color: #000;
  shadow-opacity: 0.2;
  shadow-radius: 3px;
  border-width: 1px;
  border-color: #DDD;
  shadow-offset-width: 0;
  shadow-offset-height: -1;
`;

export const NavCenterLogo = styled.Image`
  width: 60px;
  height: 60px;
  resize-mode: contain;
`;

