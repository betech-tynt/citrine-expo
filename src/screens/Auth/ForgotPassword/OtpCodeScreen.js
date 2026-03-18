import React, { useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Header from '../../../components/Header';
import Button from '../../../components/Button';
import OtpInput from '../../../components/OtpInput';
import colors from '../../../constants/colors';
import { commonStyles } from '../../../theme/commonStyles';
import { moderateSize } from '../../../styles';
import {
    sendOtp,
    TYPE_FORGOT_PASSWORD,
    verifyOtp,
} from '../../../services/auth';

const DEFAULT_EXPIRES_IN_MINUTES = 2;

const formatMMSS = totalSeconds => {
    const s = Math.max(0, Number(totalSeconds) || 0);
    const mm = String(Math.floor(s / 60)).padStart(2, '0');
    const ss = String(s % 60).padStart(2, '0');
    return `${mm}:${ss}`;
};

const resolveExpiresInMinutes = raw => {
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : undefined;
};

export default function OtpCodeScreen() {
    const { t } = useTranslation();
    const route = useRoute();
    const navigation = useNavigation();

    const email = route.params?.email || '';
    const showOtpMessage = route.params?.showOtpMessage || false;
    const initialExpiresInMinutes =
        resolveExpiresInMinutes(route.params?.expiresInMinutes) ??
        DEFAULT_EXPIRES_IN_MINUTES;

    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [otpMessage, setOtpMessage] = useState(showOtpMessage);
    const [expiresInMinutes, setExpiresInMinutes] = useState(
        initialExpiresInMinutes,
    );
    const [endAt, setEndAt] = useState(
        () => Date.now() + initialExpiresInMinutes * 60 * 1000,
    );
    const [secondsLeft, setSecondsLeft] = useState(
        initialExpiresInMinutes * 60,
    );

    useEffect(() => {
        if (otpMessage) {
            const timer = setTimeout(() => setOtpMessage(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [otpMessage]);

    const timeLeftText = useMemo(() => formatMMSS(secondsLeft), [secondsLeft]);

    useEffect(() => {
        const tick = () => {
            const left = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
            setSecondsLeft(left);
        };

        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [endAt]);

    const resetTimer = minutes => {
        const m =
            resolveExpiresInMinutes(minutes) ??
            resolveExpiresInMinutes(expiresInMinutes) ??
            DEFAULT_EXPIRES_IN_MINUTES;
        setExpiresInMinutes(m);
        setSecondsLeft(m * 60);
        setEndAt(Date.now() + m * 60 * 1000);
    };

    const handleResend = async () => {
        if (!email) return;

        setIsLoading(true);
        try {
            const result = await sendOtp(email, TYPE_FORGOT_PASSWORD);
            if (result?.status === 1) {
                resetTimer(result?.expires_in_minutes);
                setOtpMessage(true);
            } else {
                Alert.alert(
                    t('common.error'),
                    result?.message || t('common.error'),
                );
            }
        } catch (error) {
            Alert.alert(t('common.error'), error?.message || t('common.error'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerify = async () => {
        if (!email || otp.trim().length < 6) return;

        setIsLoading(true);
        try {
            const result = await verifyOtp(email, otp, TYPE_FORGOT_PASSWORD);
            if (result?.status === 1) {
                navigation.navigate('ResetPassword', { email, otp });
            } else {
                Alert.alert(
                    t('common.error'),
                    result?.message || t('common.error'),
                );
            }
        } catch (error) {
            Alert.alert(t('common.error'), error?.message || t('common.error'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Header title={t('otp.verifyTitle')} showCrudText={false} />

            <View style={commonStyles.main}>
                {otpMessage ? (
                    <View style={styles.successBanner}>
                        <Text style={styles.successText}>
                            {t('otp.otpSent')}
                        </Text>
                    </View>
                ) : null}

                <Text style={styles.title}>{t('otp.verifyYourEmail')}</Text>
                <Text style={styles.subtitle}>
                    {t('otp.sentToEmail', { email })}
                </Text>

                <OtpInput
                    value={otp}
                    length={6}
                    onChangeText={setOtp}
                    containerStyle={styles.otpRow}
                />

                <Text style={styles.hintText}>{t('otp.enterCodeHint')}</Text>

                <Button
                    title={t('otp.verify')}
                    style={styles.verifyButton}
                    onPress={handleVerify}
                    disabled={isLoading || otp.trim().length < 6}
                />

                <View style={styles.resendRow}>
                    <Text style={styles.resendText}>
                        {secondsLeft > 0
                            ? t('otp.expiresIn', {
                                  time: timeLeftText,
                              })
                            : t('otp.expired')}
                    </Text>
                </View>

                <TouchableOpacity
                    onPress={handleResend}
                    activeOpacity={0.7}
                    disabled={isLoading}
                    style={styles.resendButton}>
                    <Text
                        style={[
                            styles.resendLink,
                            isLoading && styles.resendLinkDisabled,
                        ]}>
                        {t('otp.resendPrompt')}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.primary,
    },
    successBanner: {
        backgroundColor: colors.success || '#4CAF50',
        padding: moderateSize(12),
        borderRadius: moderateSize(8),
        marginBottom: moderateSize(16),
    },
    successText: {
        color: '#FFFFFF',
        fontSize: moderateSize(14),
        fontWeight: '600',
        textAlign: 'center',
    },
    title: {
        fontSize: moderateSize(24),
        fontWeight: '800',
        color: colors.primary,
        marginBottom: moderateSize(6),
    },
    subtitle: {
        fontSize: moderateSize(12),
        fontWeight: '500',
        color: colors.textPrimary,
        marginBottom: moderateSize(18),
    },
    otpRow: {
        alignSelf: 'center',
        width: moderateSize(310),
        marginTop: moderateSize(10),
        marginBottom: moderateSize(12),
    },
    hintText: {
        textAlign: 'center',
        fontSize: moderateSize(12),
        color: colors.textSecondary,
        marginTop: moderateSize(8),
    },
    verifyButton: {
        marginTop: moderateSize(26),
        borderRadius: moderateSize(15),
        paddingVertical: moderateSize(14),
    },
    resendRow: {
        marginTop: moderateSize(14),
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    resendText: {
        fontSize: moderateSize(12),
        color: colors.textPrimary,
    },
    resendButton: {
        marginTop: moderateSize(8),
        alignItems: 'center',
    },
    resendLink: {
        fontSize: moderateSize(12),
        fontWeight: '700',
        color: colors.primary,
    },
    resendLinkDisabled: {
        opacity: 0.5,
    },
});
