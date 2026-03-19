import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import { log } from '../../../utils/handleLog';
import { moderateSize } from '../../../styles';
import MasterPageLayout from '../../../components/MasterPageLayout';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import colors from '../../../constants/colors';
import { forgotPassword } from '../../../services/auth';

export default function ResetPassword() {
    const { t } = useTranslation();
    const navigation = useNavigation();
    const route = useRoute();
    const email = route.params?.email;
    const otp = route.params?.otp;

    const [newPassword, setNewPassword] = useState('');
    const [reEnterNewPassword, setReEnterNewPassword] = useState('');
    const [newPasswordError, setNewPasswordError] = useState('');
    const [reEnterNewPasswordError, setReEnterNewPasswordError] = useState('');
    const [submitError, setSubmitError] = useState('');

    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showReEnterNewPassword, setShowReEnterNewPassword] = useState(false);

    const handleConfirm = async () => {
        // Clear old errors
        setNewPasswordError('');
        setReEnterNewPasswordError('');
        setSubmitError('');

        // Validation
        if (!newPassword.trim()) {
            setNewPasswordError(
                t('resetPassword.validation.newPasswordRequired'),
            );
            return;
        }

        if (newPassword.length < 6) {
            setNewPasswordError(t('resetPassword.validation.minLength'));
            return;
        }

        if (!reEnterNewPassword.trim()) {
            setReEnterNewPasswordError(
                t('resetPassword.validation.reEnterPasswordRequired'),
            );
            return;
        }

        if (newPassword !== reEnterNewPassword) {
            setReEnterNewPasswordError(t('resetPassword.validation.notMatch'));
            return;
        }

        if (!email || !otp) {
            setSubmitError(t('common.error'));
            return;
        }

        try {
            const result = await forgotPassword(email, newPassword, otp);
            if (result?.status === 1) {
                navigation.navigate('SuccessScreen', {
                    message: result?.message || 'Your password has been reset successfully!',
                });
            } else {
                setSubmitError(result?.message || t('common.error'));
            }
        } catch (e) {
            log('Forgot password confirm error', e);
            setSubmitError(e?.message || t('common.error'));
        }
    };

    return (
        <MasterPageLayout headerType="header" headerProps={{ title: t('resetPassword.title'), showCrudText: false }}>
            <View style={styles.mainContent}>
                {submitError ? (
                    <Text style={styles.submitError}>{submitError}</Text>
                ) : null}
                <View style={styles.fieldGroup}>
                    <Text style={styles.label}>
                        {t('resetPassword.newPassword')}
                    </Text>
                    <Input
                        placeholder={t('resetPassword.newPassword')}
                        secureTextEntry={!showNewPassword}
                        value={newPassword}
                        onChangeText={text => {
                            setNewPassword(text);
                            if (newPasswordError) setNewPasswordError('');
                        }}
                        endIcon={showNewPassword ? 'eye-slash' : 'eye'}
                        onEndIconPress={() => setShowNewPassword(prev => !prev)}
                    />
                    {newPasswordError && (
                        <Text style={styles.errorText}>{newPasswordError}</Text>
                    )}
                </View>

                <View style={styles.fieldGroup}>
                    <Text style={styles.label}>
                        {t('citrine.msg000339', {
                            defaultValue: t('citrine.msg000339'),
                        })}
                    </Text>
                    <Input
                        placeholder={t('citrine.msg000339')}
                        secureTextEntry={!showReEnterNewPassword}
                        value={reEnterNewPassword}
                        onChangeText={text => {
                            setReEnterNewPassword(text);
                            if (reEnterNewPasswordError)
                                setReEnterNewPasswordError('');
                        }}
                        endIcon={showReEnterNewPassword ? 'eye-slash' : 'eye'}
                        onEndIconPress={() =>
                            setShowReEnterNewPassword(prev => !prev)
                        }
                    />
                    {reEnterNewPasswordError && (
                        <Text style={styles.errorText}>
                            {reEnterNewPasswordError}
                        </Text>
                    )}
                </View>

                <View style={styles.buttonContainer}>
                    <Button
                        title={t('resetPassword.buttonTitle')}
                        style={styles.confirmButton}
                        onPress={handleConfirm}
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
    submitError: {
        marginTop: moderateSize(4),
        marginBottom: moderateSize(12),
        textAlign: 'center',
        color: colors.error || colors.danger,
        fontSize: moderateSize(12),
        fontWeight: '600',
    },
    fieldGroup: {
        width: '100%',
    },
    label: {
        marginBottom: moderateSize(8),
        fontSize: moderateSize(12),
        fontWeight: '600',
    },
    buttonContainer: {
        width: '100%',
        marginTop: moderateSize(20),
    },
    confirmButton: {
        width: '100%',
    },
    errorText: {
        marginTop: -moderateSize(18),
        marginBottom: moderateSize(12),
        color: colors.danger,
        fontSize: moderateSize(12),
        fontWeight: '500',
    },
});
