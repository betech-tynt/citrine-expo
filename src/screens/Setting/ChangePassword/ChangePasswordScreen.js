import React, { useState } from 'react';
import { StyleSheet, Text, View, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { commonStyles } from '../../../theme/commonStyles';
import Header from '../../../components/Header';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import { changePassword } from '../../../services/auth';

export default function ChangePasswordScreen() {
    const navigation = useNavigation();
    const { t } = useTranslation();
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

    const handleConfirm = async () => {
        // Clear old errors
        setCurrentPasswordError('');
        setNewPasswordError('');
        setConfirmPasswordError('');

        // Validation
        if (!currentPassword.trim()) {
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

        if (newPassword !== confirmPassword) {
            setConfirmPasswordError(t('changePassword.validation.notMatch'));
            return;
        }

        if (currentPassword === newPassword) {
            setNewPasswordError(t('changePassword.validation.sameAsCurrent'));
            return;
        }

        setIsLoading(true);
        try {
            const response = await changePassword(currentPassword, newPassword);
            const { status, message } = response;

            // Check status from API response
            if (status === 1) {
                // Success: status = 1
                Alert.alert(t('common.success'), message, [
                    {
                        text: t('common.ok'),
                        onPress: () => {
                            // Reset form after success
                            setCurrentPassword('');
                            setNewPassword('');
                            setConfirmPassword('');
                            // Navigate to Home screen
                            navigation.navigate('Main', { screen: 'Home' });
                        },
                    },
                ]);
            } else {
                // Status = 0 means current password is incorrect
                setCurrentPasswordError(message);
            }
        } catch (error) {
            // Handle network errors or other exceptions
            const errorMessage =
                (error && error.message && String(error.message)) ||
                t('changePassword.errors.generic');
            Alert.alert(t('common.error'), errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Header title={t('changePassword.title')} showCrudText={false} />
            <View style={commonStyles.main}>
                <View style={styles.fieldGroup}>
                    <Text style={styles.label}>
                        {t('changePassword.currentPassword')}
                    </Text>
                    <Input
                        placeholder={t('changePassword.enterCurrentPassword')}
                        secureTextEntry={!showCurrentPassword}
                        value={currentPassword}
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
                    {currentPasswordError && (
                        <Text style={styles.errorText}>
                            {currentPasswordError}
                        </Text>
                    )}
                </View>

                <View style={styles.fieldGroup}>
                    <Text style={styles.label}>
                        {t('changePassword.newPassword')}
                    </Text>
                    <Input
                        placeholder={t('changePassword.enterNewPassword')}
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
                        {t('changePassword.confirmPassword')}
                    </Text>
                    <Input
                        placeholder={t('changePassword.confirmPassword')}
                        secureTextEntry={!showConfirmPassword}
                        value={confirmPassword}
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
                    {confirmPasswordError && (
                        <Text style={styles.errorText}>
                            {confirmPasswordError}
                        </Text>
                    )}
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
        marginBottom: 8,
        fontSize: 14,
        fontWeight: '600',
    },
    confirmButton: {
        marginTop: 20,
    },
    loader: {
        marginTop: 10,
    },
    errorText: {
        marginTop: -18,
        marginBottom: 12,
        color: '#D32F2F',
        fontSize: 12,
        fontWeight: '500',
    },
});
