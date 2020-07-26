/* eslint-disable @typescript-eslint/camelcase */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Platform, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { format } from 'date-fns';
import { useAuth } from '../../hooks/auth';
import api from '../../services/api';
import { Provider } from '../Dashboard';

import {
  BackButton,
  Calendar,
  Container,
  Header,
  HeaderTitle,
  Content,
  OpenDatePickerButton,
  OpenDatePickerText,
  ProviderAvatar,
  ProviderContainer,
  ProviderName,
  ProvidersList,
  ProvidersListContainer,
  Title,
  UserAvatar,
  Schedule,
  Section,
  SectionTitle,
  SectionContent,
  Hour,
  HourText,
  CreateAppointmentButton,
  CreateAppointmentButtonText,
} from './styles';

interface RouteParams {
  providerId: string;
}

interface AvailabilityItem {
  hour: number;
  available: boolean;
}

const CreateAppointment: React.FC = () => {
  const route = useRoute();
  const { user, signOut } = useAuth();
  const routeParams = route.params as RouteParams;
  const navigation = useNavigation();

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [availability, setAvailability] = useState<AvailabilityItem[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedHour, setSelectedHour] = useState(0);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState(
    routeParams.providerId,
  );

  const navigateBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleDateChanged = useCallback((_: any, date: Date | undefined) => {
    if (Platform.OS === 'android') setShowDatePicker(state => !state);
    if (date) setSelectedDate(date);
  }, []);

  const handleToggleDatePicker = useCallback(() => {
    setShowDatePicker(state => !state);
  }, []);

  const handleSelectProvider = useCallback(async (providerId: string) => {
    setSelectedProvider(providerId);
  }, []);

  useEffect(() => {
    api.get('providers').then(response => {
      setProviders(response.data);
    });
  }, []);

  useEffect(() => {
    api
      .get(`providers/${selectedProvider}/dayAvailability`, {
        params: {
          year: selectedDate.getFullYear(),
          month: selectedDate.getMonth() + 1,
          day: selectedDate.getDate(),
        },
      })
      .then(({ data }) => setAvailability(data));
  }, [selectedDate, selectedProvider]);

  const morningAvailability = useMemo(() => {
    return availability
      .filter(({ hour }) => hour < 12)
      .map(({ hour, available }) => {
        return {
          hour,
          available,
          hourFormatted: format(new Date().setHours(hour), 'HH:00'),
        };
      });
  }, [availability]);

  const afternoonAvailability = useMemo(() => {
    return availability
      .filter(({ hour }) => hour >= 12)
      .map(({ hour, available }) => {
        return {
          hour,
          available,
          hourFormatted: format(new Date().setHours(hour), 'HH:00'),
        };
      });
  }, [availability]);

  const handleSelectHour = useCallback((hour: number) => {
    setSelectedHour(hour);
  }, []);

  const handleCreateAppointment = useCallback(async () => {
    try {
      const date = new Date(selectedDate);
      date.setHours(selectedHour);
      date.setMinutes(0);

      await api.post('appointments', { provider_id: selectedProvider, date });
      navigation.navigate('AppointmentCreated', { date: date.getTime() });
    } catch (error) {
      Alert.alert(
        'Error trying to create the appointment',
        'An error ocurred while trying to create the appointment',
      );
    }
  }, [navigation, selectedDate, selectedHour, selectedProvider]);

  return (
    <Container>
      <Header>
        <BackButton onPress={navigateBack}>
          <Icon name="chevron-left" size={24} color="#999591" />
        </BackButton>
        <HeaderTitle>Hairdressers</HeaderTitle>
        <UserAvatar source={{ uri: user.avatar_url }} />
      </Header>
      <Content>
        <ProvidersListContainer>
          <ProvidersList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={providers}
            keyExtractor={provider => provider.id}
            renderItem={({ item: provider }) => (
              <ProviderContainer
                selected={provider.id === selectedProvider}
                onPress={() => handleSelectProvider(provider.id)}
              >
                <ProviderAvatar source={{ uri: provider.avatar_url }} />
                <ProviderName selected={provider.id === selectedProvider}>
                  {provider.name}
                </ProviderName>
              </ProviderContainer>
            )}
          />
        </ProvidersListContainer>

        <Calendar>
          <Title> Choose the date </Title>
          <OpenDatePickerButton onPress={handleToggleDatePicker}>
            <OpenDatePickerText>Change date</OpenDatePickerText>
          </OpenDatePickerButton>
          {showDatePicker && (
            <DateTimePicker
              mode="date"
              display="calendar"
              textColor="#f4ede8"
              value={selectedDate}
              onChange={handleDateChanged}
            />
          )}
        </Calendar>

        <Schedule>
          <Title>Choose the time</Title>
          <Section>
            <SectionTitle>Morning</SectionTitle>
            <SectionContent>
              {morningAvailability.map(({ hourFormatted, hour, available }) => (
                <Hour
                  key={hourFormatted}
                  enabled={available}
                  selected={hour === selectedHour}
                  available={available}
                  onPress={() => handleSelectHour(hour)}
                >
                  <HourText selected={hour === selectedHour}>
                    {hourFormatted}
                  </HourText>
                </Hour>
              ))}
            </SectionContent>
          </Section>
          <Section>
            <SectionTitle>Afternoon</SectionTitle>
            <SectionContent>
              {afternoonAvailability.map(
                ({ hourFormatted, hour, available }) => (
                  <Hour
                    enabled={available}
                    key={hourFormatted}
                    selected={hour === selectedHour}
                    available={available}
                    onPress={() => handleSelectHour(hour)}
                  >
                    <HourText selected={hour === selectedHour}>
                      {hourFormatted}
                    </HourText>
                  </Hour>
                ),
              )}
            </SectionContent>
          </Section>
        </Schedule>
        <CreateAppointmentButton onPress={handleCreateAppointment}>
          <CreateAppointmentButtonText>Book</CreateAppointmentButtonText>
        </CreateAppointmentButton>
      </Content>
    </Container>
  );
};

export default CreateAppointment;
