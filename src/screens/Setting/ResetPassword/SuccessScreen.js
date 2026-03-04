import React from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Success from '../../../components/Success';

export default function SuccessScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { t } = useTranslation();

    // Get message from route params, or use default translation
    const message =
        route.params?.message || 'Your password has been reset successfully!'

    const handleDone = () => {
        navigation.goBack();
    };

    return (
        <Success
            message={message}
            onDone={handleDone}
            title={t('resetPassword.successTitle', {
                defaultValue: 'Success!',
            })}
            buttonTitle={t('resetPassword.doneButton', {
                defaultValue: 'Done',
            })}
        />
    );
}
