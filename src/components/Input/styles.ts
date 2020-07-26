import styled, {css} from 'styled-components/native';
import FeatherIcon from 'react-native-vector-icons/Feather';

interface ContainerProps {
  isFocused: boolean;
  isError: boolean;
}

export const Container = styled.View<ContainerProps>`
  width: 100%;
  height: 60px;
  padding: 0 16px;
  background: #232129;
  border-radius: 10px;
  padding-bottom: 8px;
  margin: 8px 0;

  border: 2px solid #232129;

  ${props =>
    props.isError &&
    css`
      border-color: #c53030;
    `};

  ${props =>
    props.isFocused &&
    css`
      border-color: #ff9000;
    `};

  flex-direction: row;
  align-items: center;
`;

export const Icon = styled(FeatherIcon)`
  margin-right: 16px;
`;

export const TextInput = styled.TextInput`
  flex: 1;
  color: white;
  font-family: 'RobotoSlab-Regular';
`;
