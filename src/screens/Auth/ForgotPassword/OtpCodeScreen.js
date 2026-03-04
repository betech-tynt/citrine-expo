import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Header from '../../../components/Header';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import { commonStyles } from '../../../theme/commonStyles';
import { log } from '../../../utils/handleLog';
import { moderateSize } from '../../../styles';
import { checkOtpResetPassword } from '../../../services/auth';
import colors from '../../../constants/colors';

const maskEmail = value => {
    const v = String(value || '');
    if (!v.includes('@')) return v;
    const [name, domain] = v.split('@');
    const maskedName =
        name.length <= 2 ? `${name[0] || ''}*` : `${name.slice(0, 2)}***`;
    return `${maskedName}@${domain}`;
};

export default function OtpCodeScreen() {
    const route = useRoute();
    const { t } = useTranslation();
    const navigation = useNavigation();
    const username = route.params?.username;
    const email = route.params?.email;
    const maskedEmail = useMemo(() => maskEmail(email), [email]);

    const [otp, setOtp] = useState('');
    const [errorText, setErrorText] = useState('');

    const handleConfirm = async () => {
        setErrorText('');
        const genericError = t('common.error');
        if (!otp.trim()) {
            setErrorText(t('otp.codeRequired'));
            return;
        }

        try {
            const result = await checkOtpResetPassword(username, otp);
            if (result?.status === 1) {
                navigation.navigate('ResetPassword', { username, email, otp });
            } else {
                setErrorText(result?.message || genericError);
            }
        } catch (error) {
            log('Check OTP error', error);
            setErrorText(error?.message || genericError);
        }
    };

    return (
        <View style={styles.container}>
            <Header title={t('otp.title')} showCrudText={false} />
            <View style={commonStyles.main}>
                {maskedEmail ? (
                    <Text style={styles.helperText}>
                        {t('otp.sentToEmail', { email: maskedEmail })}
                    </Text>
                ) : null}

                <View style={styles.fieldGroup}>
                    <Text style={styles.label}>{t('otp.codeLabel')}</Text>
                    <Input
                        value={otp}
                        onChangeText={text => {
                            const digitsOnly = String(text || '').replace(
                                /[^0-9]/g,
                                '',
                            );
                            setOtp(digitsOnly);
                        }}
                    />
                    {errorText ? (
                        <Text style={styles.errorText}>{errorText}</Text>
                    ) : null}
                </View>

                <View style={styles.buttonContainer}>
                    <Button
                        title={t('otp.send')}
                        style={styles.confirmButton}
                        onPress={handleConfirm}
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
    fieldGroup: {
        width: '100%',
    },
    label: {
        marginTop: moderateSize(15),
        marginBottom: moderateSize(8),
        fontSize: moderateSize(14),
        fontWeight: '600',
    },
    sendButton: {
        marginTop: moderateSize(5),
        alignSelf: 'flex-end',
        width: 'auto',
    },
    helperText: {
        marginBottom: moderateSize(4),
    },
    errorText: {
        color: colors.error,
        marginTop: moderateSize(4),
    },
    buttonContainer: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: moderateSize(20),
    },
    confirmButton: {
        width: '50%',
    },
});
