import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useRoute, useNavigation } from '@react-navigation/native';
import Header from '../../../components/Header';
import Button from '../../../components/Button';
import OtpInput from '../../../components/OtpInput';
import colors from '../../../constants/colors';
import { commonStyles } from '../../../theme/commonStyles';
import { moderateSize } from '../../../styles';
import {
    verifyRegisterOtp,
    sendOtp,
    TYPE_FORGOT_PASSWORD,
} from '../../../services/auth';

const DEFAULT_EXPIRES_IN_MINUTES = 2; // Fallback to 2 minutes if not provided

const formatMMSS = totalSeconds => {
    const s = Math.max(0, Number(totalSeconds) || 0);
    const mm = String(Math.floor(s / 60)).padStart(2, '0');
    const ss = String(s % 60).padStart(2, '0');
    return `${mm}:${ss}`;
};

const OtpVerifyScreen = () => {
    const { t } = useTranslation();
    const route = useRoute();
    const navigation = useNavigation();
    // Get email and randomPassword from route params (passed from SignUpScreen)
    const email = route.params?.email || '';
    const randomPassword = route.params?.randomPassword || '';
    const showOtpMessage = route.params?.showOtpMessage || false;
    const expiresInMinutes =
        route.params?.expiresInMinutes || DEFAULT_EXPIRES_IN_MINUTES;
    const countdownSeconds = expiresInMinutes * 60;
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [hasResent, setHasResent] = useState(false);
    const [otpMessage, setOtpMessage] = useState(showOtpMessage);
    const [endAt, setEndAt] = useState(
        () => Date.now() + countdownSeconds * 1000,
    );
    const [secondsLeft, setSecondsLeft] = useState(countdownSeconds);

    // Auto-hide OTP message after 3 seconds
    useEffect(() => {
        if (otpMessage) {
            const timer = setTimeout(() => {
                setOtpMessage(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [otpMessage]);

    // Reset hasResent flag when timer expires
    useEffect(() => {
        if (secondsLeft === 0) {
            setHasResent(false);
        }
    }, [secondsLeft]);

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

    // Get OTP type from route params - default to forgot password type
    const otpType = route.params?.otpType || TYPE_FORGOT_PASSWORD;

    const handleResend = async () => {
        setIsLoading(true);
        try {
            const result = await sendOtp(email, otpType);

            if (result.status === 1) {
                // Reset countdown timer
                const newExpiresInMinutes =
                    result.expires_in_minutes || DEFAULT_EXPIRES_IN_MINUTES;
                const newCountdownSeconds = newExpiresInMinutes * 60;
                setEndAt(Date.now() + newCountdownSeconds * 1000);
                setSecondsLeft(newCountdownSeconds);

                // Mark as resent so countdown text shows "Code resent. Resend in XX:XX"
                setHasResent(true);

                // Show green success banner
                setOtpMessage(true);
            } else {
                Alert.alert(t('common.error'), result.message);
            }
        } catch (error) {
            Alert.alert(
                t('common.error'),
                error.message || t('common.networkError'),
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerify = async () => {
        if (otp.trim().length < 6) {
            return;
        }

        setIsLoading(true);
        try {
            const result = await verifyRegisterOtp(email, otp);

            if (result.status === 1) {
                // Auto-navigate to ChangePasswordScreen without showing success alert
                navigation.navigate('ChangePasswordScreen', {
                    email,
                    currentPassword: randomPassword,
                });
            } else {
                Alert.alert(t('common.error'), result.message);
            }
        } catch (error) {
            Alert.alert(
                t('common.error'),
                error.message || t('otp.verificationFailed'),
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Header
                title={t('otp.verifyTitle')}
                showCrudText={false}
                showHomeIcon={false}
            />

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
                    disabled={otp.trim().length < 6}
                    loading={isLoading}
                />

                <View style={styles.resendRow}>
                    <Text style={styles.resendText}>
                        {secondsLeft > 0
                            ? hasResent
                                ? `${t('otp.codeResent')} ${t('otp.resendIn', {
                                      time: timeLeftText,
                                  })}`
                                : t('otp.expiresIn', {
                                      time: timeLeftText,
                                  })
                            : t('otp.expired')}
                    </Text>
                </View>
                {secondsLeft === 0 && (
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
                )}
            </View>
        </View>
    );
};

OtpVerifyScreen.propTypes = {
    email: PropTypes.string,
};

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
    bottomRow: {
        marginTop: 'auto',
        paddingTop: moderateSize(24),
        paddingBottom: moderateSize(10),
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    bottomText: {
        fontSize: moderateSize(12),
        color: colors.textPrimary,
    },
    bottomLink: {
        fontSize: moderateSize(12),
        fontWeight: '700',
        color: colors.primary,
    },
});

export default OtpVerifyScreen;
