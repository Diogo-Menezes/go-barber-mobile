import React from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import { Form } from '@unform/mobile';
import { FormHandles } from '@unform/core';
import * as Yup from 'yup';

import { useAuth } from '../../hooks/auth';

import getValidationErrors from '../../utils/getValidationErrors';

import logoImg from '../../assets/logo.png';
import Input from '../../components/Input';
import Button from '../../components/Button';

import {
  Container,
  Title,
  ForgotPassword,
  ForgotPasswordText,
  CreateAccountButton,
  CreateAccountButtonText,
} from './styles';

interface SignInData {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const navigation = useNavigation();
  const formRef = React.useRef<FormHandles>(null);
  const passwordInputRef = React.useRef<TextInput>(null);

  const { signIn } = useAuth();

  const handleLogin = React.useCallback(
    async (data: SignInData) => {
      try {
        formRef.current?.setErrors({});

        const schema = Yup.object().shape({
          email: Yup.string()
            .required('You must enter your email')
            .email('Enter a valid email'),
          password: Yup.string().required('You must enter a password'),
        });

        await schema.validate(data, { abortEarly: false });
        await signIn({
          email: data.email,
          password: data.password,
        });

        // navigation.navigate('Dashboard');
      } catch (error) {
        if (error instanceof Yup.ValidationError) {
          formRef.current?.setErrors(getValidationErrors(error));
          return;
        }

        Alert.alert(
          'Authentication Error',
          'Something went wrong while trying to log you in, please check your credentials.',
        );
      }
    },
    [signIn],
  );

  return (
    <>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flex: 1 }}
        >
          <Container>
            <Image source={logoImg} />
            <Title>Make your Login</Title>
            <Form ref={formRef} onSubmit={handleLogin}>
              <Input
                autoCorrect={false}
                autoCapitalize="none"
                keyboardType="email-address"
                name="email"
                icon="mail"
                placeholder="Email"
                returnKeyType="next"
                onSubmitEditing={() => {
                  passwordInputRef.current?.focus();
                }}
              />
              <Input
                ref={passwordInputRef}
                name="password"
                icon="lock"
                placeholder="Password"
                secureTextEntry
                returnKeyType="send"
                onSubmitEditing={() => formRef.current?.submitForm()}
              />
              <Button onPress={() => formRef.current?.submitForm()}>
                Login
              </Button>
            </Form>

            <ForgotPassword onPress={() => console.log('clicked')}>
              <ForgotPasswordText>Forgot Password</ForgotPasswordText>
            </ForgotPassword>
          </Container>

          <CreateAccountButton onPress={() => navigation.navigate('Register')}>
            <Icon name="log-in" color="#FF9000" size={20} />
            <CreateAccountButtonText>Register</CreateAccountButtonText>
          </CreateAccountButton>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
};

export default Login;
