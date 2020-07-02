import React, { useRef, useCallback } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TextInput,
    Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Form } from '@unform/mobile';
import { FormHandles } from '@unform/core';
import * as Yup from 'yup';
import getValidationErrors from '../../utils/getValidationErrors';
import api from '../../services/api';
import Icon from 'react-native-vector-icons/Feather';
import Button from '../../components/Button';
import Input from '../../components/Input';
import ImagePicker from 'react-native-image-picker';

import {
    Container,
    Title,
    UserAvatarButton,
    UserAvatar,
    BackButton,
} from './styles';
import { useAuth } from '../../hooks/auth';

interface ProfileFormData {
    name: string;
    email: string;
    password: string;
    old_password: string;
    password_confirmation: string;
}
const SignUp: React.FC = () => {
    const navigation = useNavigation();

    const handleSignUp = useCallback(
        async (data: ProfileFormData) => {
            try {
                formRef.current?.setErrors({});
                const schema = Yup.object().shape({
                    name: Yup.string().required('Nome obrigatório'),
                    email: Yup.string()
                        .required('Email obrigatório')
                        .email('Digite um email válido'),
                    old_password: Yup.string(),
                    password: Yup.string().when('old_password', {
                        is: (val) => !!val.length,
                        then: Yup.string()
                            .required('Campo orbrigatório')
                            .min(6, 'No mínimo 6 dígitos'),
                        otherwise: Yup.string(),
                    }),
                    password_confirmation: Yup.string()
                        .when('old_password', {
                            is: (val) => !!val.length,
                            then: Yup.string()
                                .required('Campo orbrigatório')
                                .min(6, 'No mínimo 6 dígitos'),
                            otherwise: Yup.string(),
                        })
                        .oneOf(
                            [Yup.ref('password'), null],
                            'Confirmação incorreta',
                        ),
                });
                await schema.validate(data, { abortEarly: false });
                const {
                    name,
                    email,
                    password,
                    old_password,
                    password_confirmation,
                } = data;
                const formData = {
                    name,
                    email,
                    ...(old_password
                        ? {
                              old_password,
                              password_confirmation,
                              password,
                          }
                        : {}),
                };
                const response = await api.put('/profile', formData);
                updateUser(response.data);
                Alert.alert('Perfil atualizado com sucesso!');
                navigation.goBack();
            } catch (error) {
                console.log(data);
                console.log(error);
                if (error instanceof Yup.ValidationError) {
                    const errors = getValidationErrors(error);
                    formRef.current?.setErrors(errors);
                }
                Alert.alert(
                    'Erro na atualização do perfil',
                    'Ocorreu um erro ao atualiar seu perfil, tente novamente!',
                );
            }
        },
        [navigation],
    );
    const formRef = useRef<FormHandles>(null);
    const emailInputRef = useRef<TextInput>(null);
    const oldPasswordInputRef = useRef<TextInput>(null);
    const passwordInputRef = useRef<TextInput>(null);
    const confirmPasswordInputRef = useRef<TextInput>(null);
    const { user, updateUser } = useAuth();

    const handleGoBack = useCallback(() => {
        navigation.goBack();
    }, [navigation]);

    const handleUpdateAvatar = useCallback(() => {
        ImagePicker.showImagePicker(
            {
                title: 'Selecione um avatar',
                cancelButtonTitle: 'Cancelar',
                takePhotoButtonTitle: 'Usar câmera',
                chooseFromLibraryButtonTitle: 'Escolhe da galeria',
            },
            (response) => {
                if (response.didCancel) {
                    return;
                }
                if (response.error) {
                    Alert.alert('Erro ao atualizar seu avatar');
                    return;
                }
                const data = new FormData();
                data.append('avatar', {
                    type: 'image/jpeg',
                    name: `${user.id}.jpg`,
                    uri: response.uri,
                });
                api.patch('users/avatar, data').then((apiResponse) => {
                    updateUser(apiResponse.data);
                });
            },
        );
    }, []);
    return (
        <>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                enabled
            >
                <ScrollView
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{ flex: 1 }}
                >
                    <Container>
                        <BackButton onPress={handleGoBack}>
                            <Icon
                                name="chevron-left"
                                size={24}
                                color="#999591"
                            />
                        </BackButton>
                        <UserAvatarButton onPress={handleUpdateAvatar}>
                            <UserAvatar source={{ uri: user.avatar_url }} />
                        </UserAvatarButton>

                        <Title>Meu perfil</Title>
                        <Form
                            initialData={user}
                            ref={formRef}
                            onSubmit={handleSignUp}
                        >
                            <Input
                                name="name"
                                icon="user"
                                placeholder="Nome"
                                autoCapitalize="words"
                                returnKeyType="next"
                                onSubmitEditing={() => {
                                    emailInputRef.current?.focus();
                                }}
                            />
                            <Input
                                ref={emailInputRef}
                                name="email"
                                icon="mail"
                                placeholder="E-mail"
                                autoCapitalize="none"
                                autoCorrect={false}
                                returnKeyType="next"
                                onSubmitEditing={() => {
                                    oldPasswordInputRef.current?.focus();
                                }}
                            />
                            <Input
                                ref={oldPasswordInputRef}
                                secureTextEntry
                                name="old_password"
                                icon="lock"
                                placeholder="Senha atual"
                                textContentType="newPassword"
                                returnKeyType="next"
                                containerStyle={{ marginTop: 16 }}
                                onSubmitEditing={() => {
                                    passwordInputRef.current?.focus();
                                }}
                            />
                            <Input
                                ref={passwordInputRef}
                                secureTextEntry
                                name="password"
                                icon="lock"
                                placeholder="Nova senha"
                                textContentType="newPassword"
                                returnKeyType="next"
                                onSubmitEditing={() =>
                                    confirmPasswordInputRef.current?.focus()
                                }
                            />
                            <Input
                                ref={confirmPasswordInputRef}
                                secureTextEntry
                                name="password_confirmation"
                                icon="lock"
                                placeholder="Confirmar senha"
                                textContentType="newPassword"
                                returnKeyType="send"
                                onSubmitEditing={() =>
                                    formRef.current?.submitForm()
                                }
                            />

                            <Button
                                onPress={() => formRef.current?.submitForm()}
                            >
                                Confirmar mudanças
                            </Button>
                        </Form>
                    </Container>
                </ScrollView>
            </KeyboardAvoidingView>
        </>
    );
};

export default SignUp;
