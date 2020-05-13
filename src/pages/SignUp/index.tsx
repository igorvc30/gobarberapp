import React, { useRef, useCallback } from 'react';
import {
    Image,
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

import { Container, Title, BackToSignIn, BackToSignInText } from './styles';
import logo from '../../assets/logo.png';

interface SignUpFormData {
    email: string;
    password: string;
    name: string;
}

const SignUp: React.FC = () => {
    const navigation = useNavigation();

    const handleSignUp = useCallback(
        async (data: SignUpFormData) => {
            try {
                formRef.current?.setErrors({});
                const schema = Yup.object().shape({
                    name: Yup.string().required('Nome obrigatório'),
                    email: Yup.string()
                        .required('Email obrigatório')
                        .email('Digite um email válido'),
                    password: Yup.string().required('Senha obrigatório'),
                });
                await schema.validate(data, { abortEarly: false });
                await api.post('/users', data);
                Alert.alert(
                    'Login realizado com sucesso! Voce já pode realizar login na aplicação.',
                );
                navigation.goBack();
            } catch (error) {
                console.log(data);
                console.log(error);
                if (error instanceof Yup.ValidationError) {
                    const errors = getValidationErrors(error);
                    formRef.current?.setErrors(errors);
                }
                Alert.alert(
                    'Erro na autenticação',
                    'Ocorreu um erro ao fazer cadastro, tente novamente!',
                );
            }
        },
        [navigation],
    );
    const formRef = useRef<FormHandles>(null);
    const emailInputRef = useRef<TextInput>(null);
    const passwordInputRef = useRef<TextInput>(null);
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
                        <Image source={logo} />
                        <Title>Crie sua conta</Title>
                        <Form ref={formRef} onSubmit={handleSignUp}>
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
                                    passwordInputRef.current?.focus();
                                }}
                            />
                            <Input
                                ref={passwordInputRef}
                                secureTextEntry
                                name="password"
                                icon="lock"
                                placeholder="Senha"
                                textContentType="newPassword"
                                returnKeyType="send"
                                onSubmitEditing={() =>
                                    formRef.current?.submitForm()
                                }
                            />

                            <Button
                                onPress={() => formRef.current?.submitForm()}
                            >
                                Entrar
                            </Button>
                        </Form>
                    </Container>
                    <BackToSignIn onPress={() => navigation.goBack()}>
                        <Icon name="arrow-left" size={20} color="#fff" />
                        <BackToSignInText>Voltar para logon</BackToSignInText>
                    </BackToSignIn>
                </ScrollView>
            </KeyboardAvoidingView>
        </>
    );
};

export default SignUp;
