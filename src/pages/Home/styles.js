import styled from 'styled-components/native';

export const Background = styled.SafeAreaView`
  flex: 1;
  background-color: #0D202B;
`;

/* ===== HEADER ===== */
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

/* ===== CONTEÚDO ===== */
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

/* ===== CARD ===== */
export const Card = styled.View`
  background-color: #E6E6E6;
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

/* ===== TABELA ===== */
export const Table = styled.View`
  width: 100%;
`;

export const TableHeader = styled.View`
  flex-direction: row;
  background-color: #CCCCCC;
  padding: 10px 5px;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
`;

export const ColumnHeader = styled.Text`
  font-size: 11px;
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
  color: ${(props) => (props.positive ? '#008000' : '#D00000')};
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

export const EmptyTableText = styled.Text`
  font-size: 14px;
  color: #777;
  text-align: center;
  padding: 20px 10px;
`;

/* ===== BOTÃO FLUTUANTE ===== */
export const FabButton = styled.TouchableOpacity.attrs({
  style: { shadowOffset: { width: 0, height: 2 } },
})`
  position: absolute;
  bottom: 80px;
  right: 20px;
  background-color: #56949F;
  width: 110px;
  height: 45px;
  border-radius: 25px;
  align-items: center;
  justify-content: center;
  elevation: 5;
  shadow-color: #000;
  shadow-opacity: 0.3;
  shadow-radius: 4px;
`;

export const FabText = styled.Text`
  color: #FFF;
  font-size: 16px;
  font-weight: bold;
`;

/* ===== BOTTOM NAV ===== */
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

/* ===== BOTÃO CENTRAL DA NAV ===== */
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

export const NavCenterLogo = styled.Image.attrs({
  resizeMode: 'contain',
})`
  width: 60px;
  height: 60px;
`;
