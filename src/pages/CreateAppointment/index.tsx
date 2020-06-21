import React, { useCallback, useEffect, useState } from 'react';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import { useAuth } from '../../hooks/auth';
// import DateTimePicker from '@react-native-community/datetimepicker';
import {
    Container,
    Header,
    BackButton,
    HeaderTitle,
    UserAvatar,
    ProvidersList,
    ProvidersListContainer,
    ProviderContainer,
    ProviderAvatar,
    ProviderName,
} from './styles';
import api from '../../services/api';

interface RouteParams {
    providerId: string;
}

export interface Provider {
    id: string;
    name: string;
    avatar_url: string;
}

const CreateAppointment: React.FC = () => {
    const route = useRoute();
    const { user } = useAuth();
    const [providers, setProviders] = useState<Provider[]>([]);
    const routeParams = route.params as RouteParams;
    const { goBack } = useNavigation();
    const [selectedProvider, setSelectedProvider] = useState(
        routeParams.providerId,
    );
    const navigateBack = useCallback(() => {
        goBack();
    }, [goBack]);

    useEffect(() => {
        api.get('providers').then((response) => setProviders(response.data));
    }, []);
    const handleSelectedProvider = useCallback((providerId: string) => {
        setSelectedProvider(providerId);
    }, []);
    return (
        <Container>
            <Header>
                <BackButton onPress={navigateBack}>
                    <Icon name="chevron-left" size={24} color="#999591" />
                </BackButton>
                <HeaderTitle>Cabeleireiros</HeaderTitle>
                <UserAvatar source={{ uri: user.avatar_url }} />
            </Header>
            <ProvidersListContainer>
                <ProvidersList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={providers}
                    keyExtractor={(provider) => provider.id}
                    renderItem={({ item: provider }) => (
                        <ProviderContainer
                            onPress={() => handleSelectedProvider(provider.id)}
                            selected={provider.id === selectedProvider}
                        >
                            <ProviderAvatar
                                source={{ uri: provider.avatar_url }}
                            />

                            <ProviderName
                                selected={provider.id === selectedProvider}
                            >
                                {provider.name}
                            </ProviderName>
                        </ProviderContainer>
                    )}
                />
            </ProvidersListContainer>
        </Container>
    );
};

export default CreateAppointment;