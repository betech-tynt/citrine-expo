import apiClient, { notifyUnauthenticated } from './api';
import { getDeviceInfo } from './deviceInfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

//  P0302 Payment Methods List
const PAYMENT_METHODS_LIST_QUERY = `
    query Payment_methods_list(
        $version: String!
        $platform: String!
    ) {
        payment_methods_list(
            version: $version
            platform: $platform
        ) {
            status
            message
            data {
                id
                name
            }
        }
    }
`;

/**
 * Fetch the list of available payment methods (P0302_Payment_Methods_List_API).
 * @returns {Promise<Array<{id: number, name: string}>>} - Array of payment methods.
 */
export async function fetchPaymentMethodsList() {
    const { version, platform } = await getDeviceInfo();
    const token = await AsyncStorage.getItem('token');

    if (!token) {
        const message = 'Unauthenticated: missing token';
        notifyUnauthenticated(message);
        throw new Error(message);
    }

    const variables = {
        version,
        platform: platform.toUpperCase(),
    };

    try {
        const response = await apiClient(
            PAYMENT_METHODS_LIST_QUERY,
            variables,
            token,
        );

        if (response.errors) {
            throw new Error(
                response.errors.map(error => error.message).join('\n'),
            );
        }

        const { status, message, data } = response.data.payment_methods_list;

        if (status !== 1 || !data) {
            throw new Error(message || 'Failed to fetch payment methods');
        }

        return data;
    } catch (error) {
        console.error('Error fetching payment methods list:', error.message);
        throw new Error(
            'Failed to fetch payment methods list: ' + error.message,
        );
    }
}

//  P0027 User Setting Update
const USER_SETTING_UPDATE_MUTATION = `
    mutation User_setting_update(
        $key: String!
        $version: String!
        $value: String!
        $platform: String!
    ) {
        user_setting_update(
            key: $key
            version: $version
            value: $value
            platform: $platform
        ) {
            status
            message
            data {
                settings {
                    key
                    value
                }
            }
        }
    }
`;

/**
 * Update a user setting (P0027_User_Setting_Update_API).
 * @param {string} key - The setting key (e.g. "payment_method_default").
 * @param {string} value - The new value for the setting.
 * @returns {Promise<Object>} - The updated user settings data.
 */
export async function updateUserSetting(key, value) {
    if (!key) {
        throw new Error('Setting key is required');
    }

    const { version, platform } = await getDeviceInfo();
    const token = await AsyncStorage.getItem('token');

    if (!token) {
        const message = 'Unauthenticated: missing token';
        notifyUnauthenticated(message);
        throw new Error(message);
    }

    const variables = {
        key,
        version,
        value: String(value),
        platform: platform.toUpperCase(),
    };

    try {
        const response = await apiClient(
            USER_SETTING_UPDATE_MUTATION,
            variables,
            token,
        );

        if (response.errors) {
            throw new Error(
                response.errors.map(error => error.message).join('\n'),
            );
        }

        const { status, message, data } = response.data.user_setting_update;

        if (status !== 1) {
            throw new Error(message || 'Failed to update user setting');
        }

        // Convert the new settings array of objects { key, value } into a dictionary
        const settingsObject = {};
        if (data && data.settings) {
            data.settings.forEach(setting => {
                settingsObject[setting.key] = setting.value;
            });
        }

        return settingsObject;
    } catch (error) {
        console.error('Error updating user setting:', error.message);
        throw new Error('Failed to update user setting: ' + error.message);
    }
}
