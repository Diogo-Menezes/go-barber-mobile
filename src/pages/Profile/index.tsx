/* eslint-disable @typescript-eslint/camelcase */
import { useNavigation } from '@react-navigation/native';
import { FormHandles } from '@unform/core';
import { Form } from '@unform/mobile';
import ImagePicker from 'react-native-image-picker';
import React, { useCallback, useRef } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
} from 'react-native';
import * as Yup from 'yup';
import Icon from 'react-native-vector-icons/Feather';
import { useAuth } from '../../hooks/auth';
import Button from '../../components/Button';
import Input from '../../components/Input';
import api from '../../services/api';
import getValidationErrors from '../../utils/getValidationErrors';
import {
  Container,
  Title,
  UserAvatarButton,
  UserAvatar,
  BackButton,
} from './styles';

interface ProfileData {
  name: string;
  email: string;
  old_password: string;
  password: string;
  password_confirmation: string;
}

const Profile: React.FC = () => {
  const formRef = useRef<FormHandles>(null);
  const emailInputRef = useRef<TextInput>(null);
  const oldPasswordInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const confirmPasswordInputRef = useRef<TextInput>(null);
  const navigation = useNavigation();

  const { user, updateUser } = useAuth();

  const handleUpdate = useCallback(
    async (formData: ProfileData) => {
      try {
        formRef.current?.setErrors({});

        const schema = Yup.object().shape({
          name: Yup.string().required('Name is required'),
          email: Yup.string()
            .required('Email is required')
            .email('Enter a valid email'),
          old_password: Yup.string(),

          password: Yup.string().when('old_password', {
            is: val => val.length > 0,
            then: Yup.string()
              .required('Required')
              .min(6, 'Minimum 6 characters'),
          }),

          password_confirmation: Yup.string()
            .when('old_password', {
              is: val => val.length > 0,
              then: Yup.string()
                .required('Required')
                .min(6, 'Minimum 6 characters'),
            })
            .oneOf([Yup.ref('password'), null], "Passwords don't' match"),
        });

        await schema.validate(formData, { abortEarly: false });

        const credentials = {
          name: formData.name,
          email: formData.email,
          ...(formData.old_password
            ? {
                old_password: formData.old_password,
                password: formData.password,
                password_confirmation: formData.password_confirmation,
              }
            : {}),
        };

        const { data } = await api.put('profile', credentials);

        updateUser(data);

        Alert.alert('Profile updated', 'Your profile was updated successfully');

        navigation.goBack();
      } catch (error) {
        if (error instanceof Yup.ValidationError) {
          formRef.current?.setErrors(getValidationErrors(error));
          return;
        }

        Alert.alert(
          'Profile update error',
          'Something went wrong while trying to update your profile, please try again.',
        );
      }
    },
    [navigation, updateUser],
  );

  const handleUpdateAvatar = useCallback(() => {
    ImagePicker.showImagePicker(
      { title: 'Select an Profile Picture ' },
      response => {
        if (response.didCancel) {
          return;
        }

        if (response.error) {
          Alert.alert('Error', response.error);
        }

        const data = new FormData();

        data.append('avatar', {
          uri: response.uri,
          type: 'image/jpeg',
          name: `${user.id}`,
        });

        api.patch('users/avatar', data).then(resp => {
          updateUser(resp.data);
        });
      },
    );
  }, [updateUser, user.id]);

  return (
    <>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        enabled
      >
        <ScrollView keyboardShouldPersistTaps="handled">
          <Container>
            <BackButton onPress={() => navigation.goBack()}>
              <Icon name="chevron-left" size={24} color="#999591" />
            </BackButton>
            <UserAvatarButton onPress={handleUpdateAvatar}>
              <UserAvatar source={{ uri: user.avatar_url }} />
            </UserAvatarButton>
            <Title>My Profile</Title>
            <Form
              ref={formRef}
              onSubmit={data => handleUpdate(data)}
              initialData={user}
            >
              <Input
                name="name"
                icon="user"
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
                onSubmitEditing={() => oldPasswordInputRef.current?.focus()}
              />
              <Input
                ref={oldPasswordInputRef}
                name="old_password"
                icon="lock"
                placeholder="Current password"
                returnKeyType="next"
                secureTextEntry
                containerStyle={{ marginTop: 24 }}
                textContentType="newPassword"
                onSubmitEditing={() => passwordInputRef.current?.focus()}
              />
              <Input
                ref={passwordInputRef}
                name="password"
                icon="lock"
                placeholder="New password"
                returnKeyType="next"
                secureTextEntry
                textContentType="newPassword"
                onSubmitEditing={() => confirmPasswordInputRef.current?.focus()}
              />
              <Input
                ref={confirmPasswordInputRef}
                name="password_confirmation"
                icon="lock"
                placeholder="Confirm password"
                returnKeyType="send"
                secureTextEntry
                textContentType="newPassword"
                onSubmitEditing={() => formRef.current?.submitForm()}
              />
              <Button onPress={() => formRef.current?.submitForm}>
                Update
              </Button>
            </Form>
          </Container>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
};

export default Profile;
