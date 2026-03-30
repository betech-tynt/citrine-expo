import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Image,
    TouchableOpacity,
    Platform,
} from 'react-native';
import KeyboardAwareWrapper from '../../../components/KeyboardAwareWrapper';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import ChildrenLayout from '../../../components/ChildrenLayout';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import colors from '../../../constants/colors';
import { sendOtp, TYPE_FORGOT_PASSWORD } from '../../../services/auth';
import { getEmailError } from '../../../utils/validators';
import { moderateSize } from '../../../styles';
import ForgotPasswordImage from '../../../assets/images/backgrounds/forgot-password.jpg';
import { ScrollView } from 'react-native-gesture-handler';

export default function ForgotPasswordScreen() {
    const navigation = useNavigation();
    const { t } = useTranslation();
    const emailLabel = t('setting.email');

    const [email, setEmail] = useState('');
    const [submitError, setSubmitError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [errors, setErrors] = useState({
        email: '',
    });
    const [hasSubmitted, setHasSubmitted] = useState(false);

    const handleRequest = async () => {
        let newErrors = {
            email: '',
        };

        setHasSubmitted(true);
        newErrors.email = getEmailError(email, t);

        setErrors(newErrors);
        setSubmitError('');

        if (newErrors.email) {
            return;
        }

        try {
            setIsSubmitting(true);
            const result = await sendOtp(email.trim(), TYPE_FORGOT_PASSWORD);
            const { status, message, expires_in_minutes } = result || {};

            if (status === 1) {
                navigation.navigate('CheckOTPScreen', {
                    email: email.trim(),
                    expiresInMinutes: expires_in_minutes,
                    showOtpMessage: true,
                });
                return;
            }

            setSubmitError(message || t('forgotPassword.incorrectInformation'));
        } catch (e) {
            setSubmitError(
                e?.message || t('forgotPassword.incorrectInformation'),
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle back press: go back if possible, otherwise navigate to Login
    const handleBackPress = () => {
        if (navigation.canGoBack()) {
            navigation.goBack();
        } else {
            navigation.navigate('Login');
        }
    };

    return (
        <ChildrenLayout
            headerType="header"
            headerProps={{
                title: t('otp.title'),
                showHomeIcon: false,
                onBackPress: handleBackPress,
            }}>
            <KeyboardAwareWrapper
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <ScrollView
                    contentContainerStyle={{
                        flexGrow: 1,
                        padding: moderateSize(16),
                    }}>
                    {submitError ? (
                        <Text style={styles.errorTitle}>{submitError}</Text>
                    ) : null}

                    <View style={styles.form}>
                        <Text style={styles.title}>
                            {t('citrine.msg000334', {
                                defaultValue: t('forgotPassword.title'),
                            })}
                        </Text>
                        <Text style={styles.subtitle}>
                            {t('citrine.msg000335', {
                                defaultValue: t('forgotPassword.subtitle'),
                            })}
                        </Text>

                        <Image
                            source={ForgotPasswordImage}
                            style={styles.illustration}
                            resizeMode="contain"
                        />

                        <Text style={styles.label}>{emailLabel}</Text>
                        <Input
                            value={email}
                            style={styles.inputCompact}
                            onChangeText={text => {
                                setEmail(text);

                                if (errors.email) {
                                    setErrors(prev => ({
                                        ...prev,
                                        email: '',
                                    }));
                                }

                                setSubmitError('');
                            }}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                        {hasSubmitted && errors.email ? (
                            <Text style={styles.errorText}>
                                {!email.trim()
                                    ? t('validate.emailRequired')
                                    : errors.email}
                            </Text>
                        ) : null}

                        <Text style={styles.hintText}>
                            {t('citrine.msg000336', {
                                defaultValue: t('forgotPassword.hint'),
                            })}
                        </Text>

                        <Button
                            title={t('citrine.msg000337', {
                                defaultValue: t('forgotPassword.send'),
                            })}
                            onPress={handleRequest}
                            disabled={isSubmitting}
                            style={styles.primaryButton}
                            textStyle={styles.primaryButtonText}
                        />
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            {t('citrine.msg000338', {
                                defaultValue: t('forgotPassword.haveAccount'),
                            })}{' '}
                        </Text>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Login')}>
                            <Text style={styles.footerLink}>
                                {t('auth.signIn')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAwareWrapper>
        </ChildrenLayout>
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
        fontSize: moderateSize(12),
        fontWeight: '700',
    },
    form: {
        marginTop: moderateSize(6),
    },
    title: {
        fontSize: moderateSize(24),
        fontWeight: '800',
        color: colors.primary,
        marginBottom: moderateSize(6),
    },
    subtitle: {
        fontSize: moderateSize(14),
        fontWeight: '400',
        color: colors.textPrimary,
        marginBottom: moderateSize(20),
    },
    illustration: {
        width: '100%',
        height: moderateSize(200),
        marginBottom: moderateSize(20),
        alignSelf: 'center',
    },
    label: {
        marginBottom: moderateSize(8),
        fontSize: moderateSize(14),
        fontWeight: '600',
        color: colors.textPrimary,
    },
    errorText: {
        color: colors.error,
        fontSize: moderateSize(12),
        marginTop: moderateSize(2),
        marginBottom: moderateSize(8),
    },
    inputCompact: {
        marginBottom: moderateSize(13),
    },
    hintText: {
        fontSize: moderateSize(12),
        color: colors.textSecondary,
        marginTop: moderateSize(8),
        marginBottom: moderateSize(16),
    },
    primaryButton: {
        width: '100%',
        marginTop: moderateSize(0),
        borderRadius: moderateSize(15),
        paddingVertical: moderateSize(14),
    },
    primaryButtonText: {
        fontSize: moderateSize(16),
        fontWeight: '600',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: moderateSize(24),
    },
    footerText: {
        fontSize: moderateSize(12),
        color: colors.textSecondary,
    },
    footerLink: {
        fontSize: moderateSize(12),
        fontWeight: '700',
        color: colors.primary,
    },
});
