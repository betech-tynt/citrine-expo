import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import MasterPageLayout from '../../../components/MasterPageLayout';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import { changePassword } from '../../../services/auth';
import { PASSWORD_MAX_LENGTH } from '../../../constants/utils';
import { isAuthError, handleAuthError } from '../../../utils/authErrorHandler';
import { moderateSize } from '../../../styles';
import Icon from 'react-native-vector-icons/FontAwesome';
import colors from '../../../constants/colors';

export default function ChangePasswordScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { t } = useTranslation();

    // Get currentPassword from route params (passed from OtpVerifyScreen for first-time setup)
    // If passed, it's the randomPassword and we skip current password input/validation
    const passedCurrentPassword = route.params?.currentPassword || '';
    const isFirstTimeSetup = !!passedCurrentPassword;

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [currentPasswordError, setCurrentPasswordError] = useState('');
    const [newPasswordError, setNewPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);

    const navigateToHome = useCallback(() => {
        navigation.reset({
            index: 0,
            routes: [{ name: 'Main' }],
        });
    }, [navigation]);

    const handleConfirm = async () => {
        // Clear old errors
        setCurrentPasswordError('');
        setNewPasswordError('');
        setConfirmPasswordError('');

        // Use passed password for first-time setup, otherwise use entered password
        const actualCurrentPassword = isFirstTimeSetup
            ? passedCurrentPassword
            : currentPassword;

        // Validation for current password (only in normal flow)
        if (!isFirstTimeSetup && !actualCurrentPassword.trim()) {
            setCurrentPasswordError(
                t('changePassword.validation.currentPasswordRequired'),
            );
            return;
        }

        if (!newPassword.trim()) {
            setNewPasswordError(
                t('changePassword.validation.newPasswordRequired'),
            );
            return;
        }

        if (newPassword.length < 6) {
            setNewPasswordError(t('changePassword.validation.minLength'));
            return;
        }

        if (newPassword.length > PASSWORD_MAX_LENGTH) {
            setNewPasswordError(
                t('changePassword.validation.maxLength', {
                    max: PASSWORD_MAX_LENGTH,
                }),
            );
            return;
        }

        if (newPassword !== confirmPassword) {
            setConfirmPasswordError(t('changePassword.validation.notMatch'));
            return;
        }

        if (actualCurrentPassword === newPassword) {
            setNewPasswordError(t('changePassword.validation.sameAsCurrent'));
            return;
        }

        setIsLoading(true);
        try {
            const response = await changePassword(
                actualCurrentPassword,
                newPassword,
            );
            const { status, message } = response;

            // Check status from API response
            if (status === 1) {
                // Show success message for 2 seconds before navigating
                setShowSuccessMessage(true);
                setTimeout(() => {
                    navigateToHome();
                }, 2000);
            } else {
                // Status = 0 means current password is incorrect
                setCurrentPasswordError(message);
            }
        } catch (error) {
            // Handle network errors or other exceptions
            const errorMessage =
                (error && error.message && String(error.message)) ||
                t('changePassword.errors.generic');

            // Handle auth errors – show session expired alert and redirect to Login
            if (isAuthError(errorMessage)) {
                handleAuthError(navigation);
                return;
            }

            Alert.alert(t('common.error'), errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <MasterPageLayout
                headerType="header"
                headerProps={{
                    title: t('changePassword.title'),
                    showCrudText: false,
                    showHomeIcon: false,
                }}>
                <View style={styles.formContent}>
                {/* Only show current password field in normal flow (not first-time setup) */}
                {!isFirstTimeSetup && (
                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>
                            {t('changePassword.currentPassword')}
                        </Text>
                        <Input
                            placeholder={t(
                                'changePassword.enterCurrentPassword',
                            )}
                            secureTextEntry={!showCurrentPassword}
                            value={currentPassword}
                            maxLength={PASSWORD_MAX_LENGTH}
                            onChangeText={text => {
                                setCurrentPassword(text);
                                if (currentPasswordError)
                                    setCurrentPasswordError('');
                            }}
                            endIcon={showCurrentPassword ? 'eye-slash' : 'eye'}
                            onEndIconPress={() =>
                                setShowCurrentPassword(prev => !prev)
                            }
                        />
                        {currentPasswordError ? (
                            <Text style={styles.errorText}>
                                {currentPasswordError}
                            </Text>
                        ) : currentPassword.length >= PASSWORD_MAX_LENGTH ? (
                            <Text style={styles.maxLengthHint}>
                                {t('changePassword.validation.maxLength', {
                                    max: PASSWORD_MAX_LENGTH,
                                })}
                            </Text>
                        ) : null}
                    </View>
                )}

                <View style={styles.fieldGroup}>
                    <Text style={styles.label}>
                        {t('changePassword.newPassword')}
                    </Text>
                    <Input
                        placeholder={t('changePassword.enterNewPassword')}
                        secureTextEntry={!showNewPassword}
                        value={newPassword}
                        maxLength={PASSWORD_MAX_LENGTH}
                        onChangeText={text => {
                            setNewPassword(text);
                            if (newPasswordError) setNewPasswordError('');
                        }}
                        endIcon={showNewPassword ? 'eye-slash' : 'eye'}
                        onEndIconPress={() => setShowNewPassword(prev => !prev)}
                    />
                    {newPasswordError ? (
                        <Text style={styles.errorText}>{newPasswordError}</Text>
                    ) : newPassword.length >= PASSWORD_MAX_LENGTH ? (
                        <Text style={styles.maxLengthHint}>
                            {t('changePassword.validation.maxLength', {
                                max: PASSWORD_MAX_LENGTH,
                            })}
                        </Text>
                    ) : null}
                </View>

                <View style={styles.fieldGroup}>
                    <Text style={styles.label}>
                        {t('changePassword.confirmPassword')}
                    </Text>
                    <Input
                        placeholder={t('changePassword.confirmPassword')}
                        secureTextEntry={!showConfirmPassword}
                        value={confirmPassword}
                        maxLength={PASSWORD_MAX_LENGTH}
                        onChangeText={text => {
                            setConfirmPassword(text);
                            if (confirmPasswordError)
                                setConfirmPasswordError('');
                        }}
                        endIcon={showConfirmPassword ? 'eye-slash' : 'eye'}
                        onEndIconPress={() =>
                            setShowConfirmPassword(prev => !prev)
                        }
                    />
                    {confirmPasswordError ? (
                        <Text style={styles.errorText}>
                            {confirmPasswordError}
                        </Text>
                    ) : confirmPassword.length >= PASSWORD_MAX_LENGTH ? (
                        <Text style={styles.maxLengthHint}>
                            {t('changePassword.validation.maxLength', {
                                max: PASSWORD_MAX_LENGTH,
                            })}
                        </Text>
                    ) : null}
                </View>

                <Button
                    title={
                        isLoading ? t('common.processing') : t('common.confirm')
                    }
                    onPress={handleConfirm}
                    style={styles.confirmButton}
                    disabled={isLoading}
                />
                {isLoading && (
                    <ActivityIndicator
                        size="small"
                        color="#3629B7"
                        style={styles.loader}
                    />
                )}
                </View>
            </MasterPageLayout>

            {showSuccessMessage && (
                <View style={styles.successOverlay}>
                    <View style={styles.successBox}>
                        <View style={styles.successIconWrapper}>
                            <Icon
                                name="check-circle"
                                size={moderateSize(48)}
                                color="#4CAF50"
                            />
                        </View>
                        <Text style={styles.successText}>
                            {isFirstTimeSetup
                                ? t('auth.registrationSuccess')
                                : t('auth.passwordChangeSuccess')}
                        </Text>
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    formContent: {
        flex: 1,
        padding: moderateSize(16),
    },
    fieldGroup: {
        width: '100%',
    },
    label: {
        marginBottom: moderateSize(8),
        fontSize: moderateSize(14),
        fontWeight: '600',
    },
    confirmButton: {
        marginTop: moderateSize(20),
    },
    loader: {
        marginTop: moderateSize(10),
    },
    errorText: {
        marginTop: moderateSize(-18),
        marginBottom: moderateSize(12),
        color: colors.error,
        fontSize: moderateSize(12),
        fontWeight: '500',
    },
    maxLengthHint: {
        marginTop: moderateSize(-18),
        marginBottom: moderateSize(12),
        color: colors.error,
        fontSize: moderateSize(11),
    },
    successOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999,
    },
    successBox: {
        backgroundColor: '#FFFFFF',
        borderRadius: moderateSize(16),
        paddingVertical: moderateSize(32),
        paddingHorizontal: moderateSize(40),
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    successIconWrapper: {
        marginBottom: moderateSize(12),
    },
    successText: {
        fontSize: moderateSize(16),
        fontWeight: '600',
        color: '#333333',
        textAlign: 'center',
    },
});
