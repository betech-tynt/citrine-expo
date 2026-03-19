import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Alert,
} from 'react-native';
import React, { useState, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import MasterPageLayout from '../../../components/MasterPageLayout';
import { useTranslation } from 'react-i18next';
import { AppInput } from '../../../components/Input';
import Button from '../../../components/Button';
import { moderateSize } from '../../../styles';
import colors from '../../../constants/colors';
import {
    registerCustomerWithEmail,
    TYPE_REGISTER,
} from '../../../services/auth';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignUpScreen() {
    const { t } = useTranslation();
    const navigation = useNavigation();
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const validateEmail = useCallback(
        currentEmail => {
            const trimmed = (currentEmail ?? email).trim();
            if (!trimmed) {
                return t('validate.required', { field: 'Email' });
            }
            if (!EMAIL_REGEX.test(trimmed)) {
                return t('auth.invalidEmail');
            }
            return '';
        },
        [email, t],
    );

    const handleEmailChange = useCallback(
        text => {
            setEmail(text);
            // Clear error when user starts typing
            if (emailError) {
                setEmailError('');
            }
        },
        [emailError],
    );

    const handleEmailBlur = useCallback(() => {
        // Only validate on blur if field has been touched (has content)
        if (email.trim()) {
            setEmailError(validateEmail(email));
        }
    }, [email, validateEmail]);

    const handleSignUp = async () => {
        const error = validateEmail(email);
        if (error) {
            setEmailError(error);
            return;
        }

        setIsLoading(true);
        try {
            const randomPassword = Math.random().toString(36).slice(-8) + 'A1!';
            const result = await registerCustomerWithEmail(
                email,
                randomPassword,
            );

            if (result.status === 1) {
                // Navigate immediately to OTP verification with flag to show message
                navigation.navigate('OtpVerify', {
                    email,
                    randomPassword,
                    showOtpMessage: true,
                    expiresInMinutes: result.expires_in_minutes,
                    otpType: TYPE_REGISTER,
                });
            } else {
                Alert.alert(t('common.error'), result.message);
            }
        } catch (error) {
            Alert.alert(
                t('common.error'),
                error.message || 'An error occurred',
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignInPress = () => {
        navigation.navigate('Login');
    };

    return (
        <MasterPageLayout headerType="header" headerProps={{ title: t('auth.signUp'), showCrudText: false, showHomeIcon: false }}>
            <View style={styles.mainContent}>
                <Text style={styles.signUpPrompt}>
                    {t('auth.signUpPrompt')}
                </Text>

                <Image
                    source={require('../../../assets/images/signup/sign_up.png')}
                    style={styles.signUpImage}
                    resizeMode="contain"
                />

                <AppInput
                    label={t('profile.email')}
                    placeholder={
                        t('auth.emailPlaceholder') || 'Enter your email'
                    }
                    value={email}
                    onChangeText={handleEmailChange}
                    onBlur={handleEmailBlur}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    errorMessage={emailError}
                />

                <Button
                    title={t('auth.signUp')}
                    onPress={handleSignUp}
                    loading={isLoading}
                    style={styles.signUpButton}
                />

                <View style={styles.signInContainer}>
                    <Text style={styles.signInText}>
                        {t('auth.haveAccount')}
                    </Text>
                    <TouchableOpacity onPress={handleSignInPress}>
                        <Text style={styles.signInLink}>
                            {t('auth.signIn')}
                        </Text>
                    </TouchableOpacity>
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
    signUpPrompt: {
        fontSize: moderateSize(14),
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: moderateSize(20),
        marginTop: moderateSize(10),
    },
    signUpImage: {
        width: moderateSize(200),
        height: moderateSize(180),
        alignSelf: 'center',
        marginBottom: moderateSize(24),
    },
    signUpButton: {
        marginTop: moderateSize(20),
    },
    signInContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: moderateSize(16),
    },
    signInText: {
        fontSize: moderateSize(14),
        color: colors.textPrimary,
    },
    signInLink: {
        fontSize: moderateSize(14),
        color: colors.primary,
        fontWeight: '600',
        marginLeft: moderateSize(4),
    },
});
