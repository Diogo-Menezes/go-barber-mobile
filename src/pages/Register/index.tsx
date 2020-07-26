import React, {useRef, useCallback} from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {useNavigation} from '@react-navigation/native';
import {Form} from '@unform/mobile';
import {FormHandles} from '@unform/core';
import * as Yup from 'yup';
import getValidationErrors from '../../utils/getValidationErrors';
import api from '../../services/api';

import logoImg from '../../assets/logo.png';

import Input from '../../components/Input';
import Button from '../../components/Button';

import {
  Container,
  Title,
  BackToLoginButton,
  BackToLoginButtonText,
} from './styles';

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

const Register: React.FC = () => {
  const formRef = useRef<FormHandles>(null);
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const navigation = useNavigation();

  const handleRegister = useCallback(
    async (data: RegisterData) => {
      try {
        formRef.current?.setErrors({});

        const schema = Yup.object().shape({
          name: Yup.string().required('Name is required'),
          email: Yup.string()
            .required('Email is required')
            .email('Enter a valid email'),
          password: Yup.string().min(
            6,
            'The password should have at least 6 characters',
          ),
        });

        await schema.validate(data, {abortEarly: false});

        await api.post('users', data);

        Alert.alert(
          'Registration Success',
          'You registered yourself successfully. Now you can login.',
        );

        navigation.goBack();
      } catch (error) {
        if (error instanceof Yup.ValidationError) {
          formRef.current?.setErrors(getValidationErrors(error));
          return;
        }

        Alert.alert(
          'Registration Error',
          'Something went wrong while trying to make your registration, please try again.',
        );
      }
    },
    [navigation],
  );

  return (
    <>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{flex: 1}}
        >
          <Container>
            <Image source={logoImg} />
            <Title>Register your account</Title>
            <Form ref={formRef} onSubmit={data => handleRegister(data)}>
              <Input
                name="name"
                icon="person"
                placeholder="Name"
                autoCapitalize="words"
                returnKeyType="next"
                onSubmitEditing={() => {
                  emailInputRef.current?.focus();
                }}
              />
              <Input
                ref={emailInputRef}
                name="email"
                icon="lock"
                placeholder="Email"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                returnKeyType="next"
                onSubmitEditing={() => passwordInputRef.current?.focus()}
              />
              <Input
                ref={passwordInputRef}
                name="password"
                icon="lock"
                placeholder="Password"
                returnKeyType="send"
                secureTextEntry
                textContentType="newPassword"
                onSubmitEditing={() => formRef.current?.submitForm()}
              />
              <Button onPress={() => formRef.current?.submitForm}>
                Register
              </Button>
            </Form>
          </Container>

          <BackToLoginButton onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" color="#FFF" size={20} />
            <BackToLoginButtonText>Back to login</BackToLoginButtonText>
          </BackToLoginButton>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
};

export default Register;
