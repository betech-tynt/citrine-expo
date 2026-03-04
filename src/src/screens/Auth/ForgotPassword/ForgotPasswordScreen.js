import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import Header from '../../../components/Header';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import { commonStyles } from '../../../theme/commonStyles';
import colors from '../../../constants/colors';
import { forgotPassword } from '../../../services/auth';

export default function ForgotPasswordScreen() {
    const navigation = useNavigation();
    const { t } = useTranslation();
    const usernameLabel = t('auth.username');
    const emailLabel = t('setting.email');

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [submitError, setSubmitError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [errors, setErrors] = useState({
        username: '',
        email: '',
    });

    const handleRequest = async () => {
        let newErrors = {
            username: '',
            email: '',
        };

        if (!username.trim()) {
            newErrors.username = t('validate.required', {
                field: usernameLabel,
                defaultValue: `${usernameLabel} is required`,
            });
        }

        if (!email.trim()) {
            newErrors.email = t('validate.required', {
                field: emailLabel,
                defaultValue: `${emailLabel} is required`,
            });
        }

        setErrors(newErrors);
        setSubmitError('');

        if (newErrors.username || newErrors.email) {
            return;
        }

        try {
            setIsSubmitting(true);
            const { status, message } = await forgotPassword(
                username.trim(),
                email.trim(),
            );

            if (status === 1) {
                navigation.navigate('CheckOTPScreen', {
                    username: username.trim(),
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
        <View style={styles.container}>
            <Header 
                title={t('otp.title')} 
                showCrudText={false}
                onBackPress={handleBackPress}
            />

            <View style={commonStyles.main}>
                {submitError ? (
                    <Text style={styles.errorTitle}>{submitError}</Text>
                ) : null}

                <View style={styles.form}>
                    <Text style={styles.label}>{usernameLabel}</Text>
                    <Input
                        value={username}
                        style={styles.inputCompact}
                        onChangeText={text => {
                            setUsername(text);
                            setErrors(prev => ({ ...prev, username: '' }));
                            setSubmitError('');
                        }}
                    />
                    {errors.username ? (
                        <Text style={styles.errorText}>{errors.username}</Text>
                    ) : null}

                    <Text style={styles.label}>{emailLabel}</Text>
                    <Input
                        value={email}
                        style={styles.inputCompact}
                        onChangeText={text => {
                            setEmail(text);
                            setErrors(prev => ({ ...prev, email: '' }));
                            setSubmitError('');
                        }}
                    />
                    {errors.email ? (
                        <Text style={styles.errorText}>{errors.email}</Text>
                    ) : null}

                    <Button
                        title={t('forgotPassword.requestResetPassword')}
                        onPress={handleRequest}
                        disabled={isSubmitting}
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
    errorText: {
        color: colors.error,
        fontSize: 12,
        marginTop: 2,
        marginBottom: 8,
    },
    inputCompact: {
        marginBottom: 13,
    },
    primaryButton: {
        alignSelf: 'flex-end',
        marginTop: 0,
        borderRadius: 8,
    },
    primaryButtonText: {
        fontSize: 12,
        fontWeight: '700',
    },
});
