/* eslint-disable import/no-cycle */
import React, { useCallback, useEffect, useState } from 'react';
import { View, Button } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../hooks/auth';
import {
  Container,
  Header,
  HeaderTitle,
  UserName,
  ProfileButton,
  UserAvatar,
  ProvidersList,
  ProvidersListTitle,
  ProviderContainer,
  ProviderAvatar,
  ProviderInfo,
  ProviderName,
  ProviderMeta,
  ProviderMetaText,
} from './styles';
import api from '../../services/api';

export interface Provider {
  id: string;
  name: string;
  avatar_url: string;
}

const Dashboard: React.FC = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const navigation = useNavigation();
  const { user } = useAuth();

  const navigateToProfile = useCallback(() => {
    navigation.navigate('Profile');
  }, [navigation]);

  const navigateToCreateAppointment = useCallback(
    (providerId: string) => {
      navigation.navigate('CreateAppointment', { providerId });
    },
    [navigation],
  );

  useEffect(() => {
    api.get('providers').then(response => {
      setProviders(response.data);
    });
  }, []);

  return (
    <Container>
      <Header>
        <HeaderTitle>
          Welcome,
          {'\n'}
          <UserName>{user.name}</UserName>
        </HeaderTitle>
        <ProfileButton onPress={navigateToProfile}>
          <UserAvatar source={{ uri: user.avatar_url }} />
        </ProfileButton>
      </Header>
      <ProvidersList
        ListHeaderComponent={
          <ProvidersListTitle>Hairdressers</ProvidersListTitle>
        }
        data={providers}
        keyExtractor={provider => provider.id}
        renderItem={({ item: provider }) => (
          <ProviderContainer
            onPress={() => navigateToCreateAppointment(provider.id)}
          >
            <ProviderAvatar source={{ uri: provider.avatar_url }} />
            <ProviderInfo>
              <ProviderName>{provider.name}</ProviderName>
              <ProviderMeta>
                <Icon name="calendar" size={14} color="#ff9000" />
                <ProviderMetaText>Monday to Friday</ProviderMetaText>
              </ProviderMeta>
              <ProviderMeta>
                <Icon name="clock" size={14} color="#ff9000" />
                <ProviderMetaText>8h till 18h</ProviderMetaText>
              </ProviderMeta>
            </ProviderInfo>
          </ProviderContainer>
        )}
      />
    </Container>
  );
};

export default Dashboard;
