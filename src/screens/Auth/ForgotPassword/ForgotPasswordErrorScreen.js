import React, {useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import Header from '../../../components/Header';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import {commonStyles} from '../../../theme/commonStyles';
import colors from '../../../constants/colors';

export default function ForgotPasswordErrorScreen() {
    const {t} = useTranslation();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');

    const handleRequest = () => {
        void username;
        void email;
    };

    return (
        <View style={styles.container}>
            <Header title={t('otp.title')} showCrudText={false} />
            <View style={commonStyles.main}>
                <Text style={styles.errorTitle}>
                    {t('forgotPassword.incorrectInformation')}
                </Text>

                <View style={styles.form}>
                    <Text style={styles.label}>{t('auth.username')}</Text>
                    <Input
                        value={username}
                        onChangeText={setUsername}
                    />
                    <Text style={styles.label}>{t('setting.email')}</Text>
                    <Input
                        value={email}
                        onChangeText={setEmail}
                    />

                    <Button
                        title={t('forgotPassword.requestResetPassword')}
                        onPress={handleRequest}
                        style={styles.primaryButton}
                        textStyle={styles.primaryButtonText}
                    />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    errorTitle: {
        marginTop: 10,
        marginBottom: 14,
        textAlign: 'center',
        color: colors.error,
        fontSize: 12,
        fontWeight: '700',
    },
    form: {
        marginTop: 6,
    },
    label: {
        marginBottom: 8,
        fontSize: 14,
        fontWeight: '600',
    },
    primaryButton: {
        alignSelf: 'flex-end',
        marginTop: 10,
        borderRadius: 8,
    },
    primaryButtonText: {
        fontSize: 12,
        fontWeight: '700',
    },
});

