import React, { useCallback, useMemo } from 'react';
import { View, Button } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useRoute, useNavigation } from '@react-navigation/native';
import { format } from 'date-fns';
import enGB from 'date-fns/locale/en-GB';
import { useAuth } from '../../hooks/auth';
import {
  Container,
  Title,
  Description,
  OKButton,
  OKButtonText,
} from './styles';

interface RouteParams {
  date: number;
}

const AppointmentCreated: React.FC = () => {
  const { signOut } = useAuth();

  const { params } = useRoute();

  const navigation = useNavigation();
  const { date } = params as RouteParams;

  const handleOkPressed = useCallback(() => {
    navigation.reset({
      routes: [{ name: 'Dashboard' }],
      index: 0,
    });
  }, [navigation]);

  const formattedDate = useMemo(() => {
    return format(date, "EEEE, dd 'of' MMMM 'of' yyyy 'at' HH:mm 'h'", {
      locale: enGB,
    });
  }, [date]);

  return (
    <Container>
      <Icon name="check" size={80} color="#04d361" />
      <Title>Appointment created successfully</Title>
      <Description>{formattedDate}</Description>
      <OKButton onPress={handleOkPressed}>
        <OKButtonText>OK</OKButtonText>
      </OKButton>
    </Container>
  );
};

export default AppointmentCreated;
