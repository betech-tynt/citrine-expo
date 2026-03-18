import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../config/i18n';

/**
 * Patterns that indicate an authentication failure.
 */
const AUTH_ERROR_PATTERNS = [
    'unauthenticated',
    'unauthorized',
    'missing token',
    'jwt',
];

/**
 * Check whether an error message indicates an authentication failure.
 * @param {string} message - The error message to check.
 * @returns {boolean}
 */
export function isAuthError(message) {
    if (!message) return false;
    const lower = String(message).toLowerCase();
    return AUTH_ERROR_PATTERNS.some(pattern => lower.includes(pattern));
}

/**
 * Keys to remove from AsyncStorage when the session is invalid.
 */
const AUTH_STORAGE_KEYS = [
    'token',
    'userInfo',
    'userRoleCode',
    'customerUser',
    'isLogin',
];

/**
 * Handle an unauthenticated error by showing an alert and redirecting to Login
 * @param {object} navigation - React Navigation navigation object.
 */
export function handleAuthError(navigation) {
    const t = key => i18n.t(key);

    Alert.alert(t('common.error'), t('auth.sessionExpired'), [
        {
            text: t('common.ok'),
            onPress: async () => {
                try {
                    await AsyncStorage.multiRemove(AUTH_STORAGE_KEYS);
                } catch (e) {
                    console.error(
                        '[authErrorHandler] Failed to clear auth state:',
                        e,
                    );
                }
                if (navigation) {
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'Login' }],
                    });
                }
            },
        },
    ]);
}
