import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { commonStyles } from '../../../theme/commonStyles';
import { log } from '../../../utils/handleLog';
import { moderateSize } from '../../../styles';
import Header from '../../../components/Header';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import colors from '../../../constants/colors';

export default function ResetPassword() {
    const { t } = useTranslation();
    const navigation = useNavigation();

    const [newPassword, setNewPassword] = useState('');
    const [reEnterNewPassword, setReEnterNewPassword] = useState('');
    const [newPasswordError, setNewPasswordError] = useState('');
    const [reEnterNewPasswordError, setReEnterNewPasswordError] = useState('');

    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showReEnterNewPassword, setShowReEnterNewPassword] = useState(false);

    const handleConfirm = async () => {
        // Clear old errors
        setNewPasswordError('');
        setReEnterNewPasswordError('');

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

        // TODO: Implement reset password functionality
        log('Reset password button pressed');

        // Navigate to success screen
        navigation.navigate('SuccessScreen', {
            message: 'Your password has been reset successfully!',
        });
    };

    return (
        <View style={styles.container}>
            <Header title={t('resetPassword.title')} showCrudText={false} />
            <View style={commonStyles.main}>
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
                        {t('resetPassword.reEnterNewPassword')}
                    </Text>
                    <Input
                        placeholder={t('resetPassword.reEnterNewPassword')}
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
        marginBottom: moderateSize(8),
        fontSize: moderateSize(12),
        fontWeight: '600',
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
    errorText: {
        marginTop: -moderateSize(18),
        marginBottom: moderateSize(12),
        color: colors.danger,
        fontSize: moderateSize(12),
        fontWeight: '500',
    },
});
