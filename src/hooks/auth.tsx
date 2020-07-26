import React, { useEffect, useState } from 'react';

import AsyncStorage from '@react-native-community/async-storage';
import api from '../services/api';

interface SignInCredentials {
  email: string;
  password: string;
}

interface UserObject {
  name?: string;
  email?: string;
  id?: string;
  avatar_url?: string;
  [key: string]: any;
}

interface AuthContextData {
  user: UserObject;
  signIn(credentials: SignInCredentials): Promise<void>;
  signOut(): void;
  updateUser(user: UserObject): Promise<void>;
  loading: boolean;
}

interface AuthState {
  token: string;
  user: object;
}

const STORAGE_TOKEN = '@GoBarber:token';
const STORAGE_USER = '@GoBarber:user';

const AuthContext = React.createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC = ({ children }) => {
  const [data, setData] = useState<AuthState>({} as AuthState);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getData = async (): Promise<void> => {
      const [token, user] = await AsyncStorage.multiGet([
        STORAGE_TOKEN,
        STORAGE_USER,
      ]);

      if (token[1] && user[1]) {
        api.defaults.headers.authorization = `Bearer ${token[1]}`;

        setData({
          token: token[1],
          user: JSON.parse(user[1]),
        });
      }

      setLoading(false);
    };
    getData();
  }, []);

  const signIn = React.useCallback(async ({ email, password }) => {
    const response = await api.post('sessions', { email, password });

    const { token, user } = response.data;

    api.defaults.headers.authorization = `Bearer ${token}`;

    await AsyncStorage.multiSet([
      [STORAGE_TOKEN, token],
      [STORAGE_USER, JSON.stringify(user)],
    ]);

    setData({ token, user });
  }, []);

  const signOut = React.useCallback(async () => {
    if (!data) {
      await AsyncStorage.multiRemove([STORAGE_USER, STORAGE_TOKEN]);
    }
    setData({} as AuthState);
  }, [data]);

  const updateUser = React.useCallback(
    async (user: UserObject) => {
      setData({ token: data.token, user });
      await AsyncStorage.setItem(STORAGE_USER, JSON.stringify(user));
    },
    [data.token],
  );

  return (
    <AuthContext.Provider
      value={{ user: data.user, signIn, signOut, loading, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextData {
  const context = React.useContext(AuthContext);

  if (!context) {
    throw new Error('Must implement Auth Provider');
  }

  return context;
}
