import styled from 'styled-components/native';

export const Background = styled.View`
  flex: 1;
  background-color: #0f2c33;
`;

export const Header = styled.View`
  padding: 16px 20px;
  background-color: #ffffff;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

export const LogoImage = styled.Image`
  width: 110px;
  height: 28px;
  resize-mode: contain;
`;

export const LogoutButton = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

export const LogoutText = styled.Text`
  color: #56949f;
  font-size: 14px;
  margin-right: 6px;
`;

export const ContentContainer = styled.KeyboardAvoidingView`
  flex: 1;
  padding: 18px;
`;

export const WelcomeTitle = styled.Text`
  color: #ffffff;
  font-size: 20px;
  font-weight: 700;
  margin-top: 8px;
`;

export const WelcomeSubtitle = styled.Text`
  color: #e5f0f2;
  font-size: 12px;
  margin-bottom: 12px;
`;

export const Card = styled.View`
  background-color: #e6e6e6;
  border-radius: 12px;
  padding: 12px;
  margin-top: 14px;
  shadow-color: #000;
  shadow-opacity: 0.08;
  shadow-radius: 8px;
  elevation: 2;
`;

export const CardTitle = styled.Text`
  color: #333333;
  font-weight: 700;
  font-size: 16px;
  margin-bottom: 8px;
`;

export const Table = styled.View`
  background-color: #d9d9d9;
  border-radius: 8px;
  overflow: hidden;
`;

export const TableHeader = styled.View`
  background-color: #8f8f8f;
  flex-direction: row;
  padding: 8px 10px;
`;

export const ColumnHeader = styled.Text`
  flex: ${p => p.flex || 1};
  color: #f2f2f2;
  font-weight: 700;
  font-size: 12px;
`;

export const TableRow = styled.View`
  flex-direction: row;
  align-items: center;
  padding: 10px;
  border-top-width: 1px;
  border-top-color: #cfcfcf;
  background-color: #e6e6e6;
`;

export const TableCell = styled.Text`
  flex: ${p => p.flex || 1};
  color: #2f2f2f;
  font-size: 14px;
`;

export const TableCellValorizacao = styled(TableCell)`
  color: ${p => (p.positive ? '#0a9b43' : '#d00000')};
  font-weight: 700;
`;

export const TableCellAtivos = styled.View`
  flex: ${p => p.flex || 1};
  flex-direction: row;
  justify-content: flex-end;
  gap: 10px;
`;

export const IconButton = styled.TouchableOpacity`
  padding: 6px;
  border-radius: 8px;
  background-color: #e6eef0;
`;

export const EmptyTableText = styled.Text`
  padding: 16px;
  text-align: center;
  color: #5a5a5a;
`;

export const FabButton = styled.TouchableOpacity`
  position: absolute;
  right: 18px;
  bottom: 90px;
  background-color: #78c2cc;
  padding: 12px 18px;
  border-radius: 24px;
  shadow-color: #000;
  shadow-opacity: 0.2;
  shadow-radius: 6px;
  elevation: 4;
`;

export const FabText = styled.Text`
  color: #ffffff;
  font-weight: 700;
  font-size: 16px;
`;

export const BottomNav = styled.View`
  position: absolute;
  left: 14px;
  right: 14px;
  bottom: 16px;
  background-color: #ffffff;
  border-radius: 16px;
  padding: 10px 14px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

export const NavButton = styled.TouchableOpacity`
  flex: 1;
  align-items: center;
`;

export const NavText = styled.Text`
  color: ${p => (p.active ? '#0f2c33' : '#8c9aa0')};
  font-weight: ${p => (p.active ? '700' : '500')};
`;

export const NavCenterButton = styled.View`
  background-color: #ffffff;
  width: 64px;
  height: 64px;
  border-radius: 32px;
  align-items: center;
  justify-content: center;
  margin: 0 10px;
`;

export const NavCenterLogo = styled.Image`
  width: 48px;
  height: 24px;
  resize-mode: contain;
`;
