import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import MasterPageLayout from '../../../components/MasterPageLayout';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import colors from '../../../constants/colors';
import { getEmailError } from '../../../utils/validators';
import { moderateSize } from '../../../styles';

export default function ForgotPasswordErrorScreen() {
    const { t } = useTranslation();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');

    const handleRequest = () => {
        const newEmailError = getEmailError(email, t);
        setEmailError(newEmailError);
        if (newEmailError) return;
        void username;
        void email;
    };

    return (
        <MasterPageLayout headerType="header" headerProps={{ title: t('otp.title'), showCrudText: false }}>
            <View style={styles.mainContent}>
                <Text style={styles.errorTitle}>
                    {t('forgotPassword.incorrectInformation')}
                </Text>

                <View style={styles.form}>
                    <Text style={styles.label}>{t('auth.username')}</Text>
                    <Input value={username} onChangeText={setUsername} />
                    <Text style={styles.label}>{t('setting.email')}</Text>
                    <Input
                        value={email}
                        onChangeText={text => {
                            setEmail(text);
                            setEmailError(getEmailError(text, t));
                        }}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                    {emailError ? (
                        <Text style={styles.errorText}>{emailError}</Text>
                    ) : null}

                    <Button
                        title={t('forgotPassword.requestResetPassword')}
                        onPress={handleRequest}
                        style={styles.primaryButton}
                        textStyle={styles.primaryButtonText}
                    />
                </View>
            </View>
        </MasterPageLayout>
    );
}

const styles = StyleSheet.create({
    mainContent: {
        flex: 1,
        padding: moderateSize(16),
    },
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
    errorText: {
        color: colors.error,
        fontSize: 12,
        marginTop: 2,
        marginBottom: 8,
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
