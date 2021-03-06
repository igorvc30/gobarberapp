import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import { useAuth } from '../../hooks/auth';
import { format } from 'date-fns';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
    Container,
    Header,
    BackButton,
    HeaderTitle,
    UserAvatar,
    Content,
    ProvidersList,
    ProvidersListContainer,
    ProviderContainer,
    ProviderAvatar,
    ProviderName,
    Calendar,
    Title,
    OpenDatePickerButton,
    OpenDatePickerButtonText,
    Schedule,
    Section,
    SectionTitle,
    SectionContent,
    Hour,
    HourText,
    CreateAppointmentButton,
    CreateAppointmentButtonText,
} from './styles';
import api from '../../services/api';
import { Alert } from 'react-native';

interface RouteParams {
    providerId: string;
}

export interface Provider {
    id: string;
    name: string;
    avatar_url: string;
}

interface AvailabilityItem {
    hour: number;
    available: boolean;
}

const CreateAppointment: React.FC = () => {
    const route = useRoute();
    const { user } = useAuth();
    const [availability, setAvailability] = useState<AvailabilityItem[]>([]);
    const [providers, setProviders] = useState<Provider[]>([]);
    const routeParams = route.params as RouteParams;
    const { goBack, navigate } = useNavigation();
    const [selectedProvider, setSelectedProvider] = useState(
        routeParams.providerId,
    );
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedHour, setSelectedHour] = useState(0);
    const navigateBack = useCallback(() => {
        goBack();
    }, [goBack]);

    useEffect(() => {
        api.get('providers').then((response) => setProviders(response.data));
    }, []);
    useEffect(() => {
        api.get(`providers/${selectedProvider}/day-availability`, {
            params: {
                year: selectedDate.getFullYear(),
                month: selectedDate.getMonth(),
                day: selectedDate.getDate(),
            },
        }).then((response) => {
            setAvailability(response.data);
        });
    }, [selectedProvider, selectedDate]);
    const handleSelectedProvider = useCallback((providerId: string) => {
        setSelectedProvider(providerId);
    }, []);
    const handleToggleDatePicker = useCallback(() => {
        setShowDatePicker(true);
    }, []);
    const handleDateChanged = useCallback(
        (event: any, date: Date | undefined) => {
            setShowDatePicker(false);
            if (date) {
                setSelectedDate(date);
            }
        },
        [],
    );
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
            const response = await api.post('appointments', {
                provider: selectedProvider,
                date,
            });
            navigate('AppointmentCreated', { date: date.getTime() });
        } catch (err) {
            Alert.alert(
                'Erro ao criar um agendamento',
                'Ocorreu um erro ao tentar criar um agendamento',
            );
        }
    }, [navigate, selectedProvider, selectedDate, selectedHour]);
    return (
        <Container>
            <Header>
                <BackButton onPress={navigateBack}>
                    <Icon name="chevron-left" size={24} color="#999591" />
                </BackButton>
                <HeaderTitle>Cabeleireiros</HeaderTitle>
                <UserAvatar source={{ uri: user.avatar_url }} />
            </Header>
            <Content>
                <ProvidersListContainer>
                    <ProvidersList
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        data={providers}
                        keyExtractor={(provider) => provider.id}
                        renderItem={({ item: provider }) => (
                            <ProviderContainer
                                onPress={() =>
                                    handleSelectedProvider(provider.id)
                                }
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

                <Calendar>
                    <Title>Escolhar a data</Title>
                    <OpenDatePickerButton onPress={handleToggleDatePicker}>
                        <OpenDatePickerButtonText>
                            Selecionar data
                        </OpenDatePickerButtonText>
                    </OpenDatePickerButton>
                    {showDatePicker && (
                        <DateTimePicker
                            mode="date"
                            value={selectedDate}
                            onChange={handleDateChanged}
                            display="calendar"
                            textColor="#f4ede8"
                        />
                    )}
                </Calendar>
                <Schedule>
                    <Title>Escolha o horário</Title>
                    <Section>
                        <SectionTitle>Manhã</SectionTitle>

                        <SectionContent>
                            {morningAvailability.map(
                                ({ hourFormatted, available, hour }) => (
                                    <Hour
                                        enabled={available}
                                        selected={selectedHour === hour}
                                        onPress={() => handleSelectHour(hour)}
                                        available={available}
                                        key={hourFormatted}
                                    >
                                        <HourText
                                            selected={selectedHour === hour}
                                        >
                                            {hourFormatted}
                                        </HourText>
                                    </Hour>
                                ),
                            )}
                        </SectionContent>
                    </Section>
                    <Section>
                        <SectionTitle>Tarde</SectionTitle>

                        <SectionContent>
                            {afternoonAvailability.map(
                                ({ hourFormatted, available, hour }) => (
                                    <Hour
                                        enabled={available}
                                        selected={selectedHour === hour}
                                        onPress={() => handleSelectHour(hour)}
                                        available={available}
                                        key={hourFormatted}
                                    >
                                        <HourText
                                            selected={selectedHour === hour}
                                        >
                                            {hourFormatted}
                                        </HourText>
                                    </Hour>
                                ),
                            )}
                        </SectionContent>
                    </Section>
                </Schedule>

                <CreateAppointmentButton onPress={handleCreateAppointment}>
                    <CreateAppointmentButtonText>
                        Agendar
                    </CreateAppointmentButtonText>
                </CreateAppointmentButton>
            </Content>
        </Container>
    );
};

export default CreateAppointment;
