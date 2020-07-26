import styled from 'styled-components/native';
import { RectButton } from 'react-native-gesture-handler';

export const Container = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 0 24px;
`;
export const Title = styled.Text`
  font-family: 'RobotoSlab-Medium';
  color: #f4ede8;
  font-size: 32px;
  margin-top: 48px;
  text-align: center;
`;
export const Description = styled.Text`
  font-family: 'RobotoSlab-Regular';
  color: #999591;
  margin-top: 16px;
  font-size: 18px;
  text-align: center;
`;
export const OKButton = styled(RectButton)`
  height: 50px;
  background: #ff9000;
  border-radius: 10px;
  align-items: center;
  justify-content: center;
  margin-top: 24px;
  padding: 12px 24px;
`;
export const OKButtonText = styled.Text`
  font-family: 'RobotoSlab-Medium';
  color: #232129;
  font-size: 18px;
`;
