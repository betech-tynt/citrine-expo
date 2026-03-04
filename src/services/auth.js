import apiClient from './api';
import { getDeviceInfo } from './deviceInfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { log } from '../utils/handleLog';

/**
 * Login function to handle user authentication
 * @param {string} username Username to login
 * @param {string} password Password to login
 * @param {string} deviceToken - Device code sent from client.
 * @param {string} version - Application version.
 * @param {number} platform - Device platform (1: Android, 2: iOS).
 * @returns
 */
export async function login(username, password, deviceToken) {
    const { version, platform } = await getDeviceInfo();

    // Define GraphQL mutation with variables
    const query = `
        mutation Login(
            $username: String!
            $password: String!
            $device_token: String!
            $version: String!
            $platform: String!
        ) {
        login(
            username: $username
            password: $password
            device_token: $device_token
            version: $version
            platform: $platform
        ) {
            status
            message
            token
            data {
                permissions {
                    group
                    actions
                }
            }
        }}
    `;

    // Use GraphQL variables
    const variables = {
        username,
        password,
        device_token: deviceToken,
        version,
        platform,
    };

    try {
        const data = await apiClient(query, variables);

        // Check if there is an error from the API
        if (data.errors) {
            throw new Error(data.errors.map(error => error.message).join('\n'));
        }

        // Get token from API response
        const { status, message, token, data: userData } = data.data.login;

        // Log response
        log('Login Response:', { status, message, token, userData });

        // Check for successful login
        if (status !== 1) {
            throw new Error(`Login failed: ${message}`);
        }

        // Save token to AsyncStorage
        if (token) {
            await AsyncStorage.setItem('token', token);
            // console.log('Raw User Data:', JSON.stringify(userData, null, 2));
            await AsyncStorage.setItem('userInfo', JSON.stringify(userData)); // Save role and permissions
        } else {
            console.warn('Received null token, not saving to AsyncStorage.');
        }

        return token;
    } catch (error) {
        // Log errors if there is a problem
        console.error('Login Error:', error.message);
        throw new Error('Failed to log in: ' + error.message);
    }
}

/**
 * Logout function to handle user logout
 * @returns
 */
export async function logout() {
    const { version, platform } = await getDeviceInfo();

    // Define GraphQL mutation for logout
    const query = `
        mutation Logout(
            $version: String!
            $platform: String!
        ) {
        logout(
            version: $version
            platform: $platform
        ) {
            status
            message
        }}
    `;

    // Use GraphQL variables
    const variables = { version, platform };

    try {
        // apiClient may or may not auto-attach token; ensure we pass it explicitly
        const token = await AsyncStorage.getItem('token');
        const data = await apiClient(query, variables, token);

        // Check for errors in the response
        if (data.errors) {
            throw new Error(data.errors.map(error => error.message).join('\n'));
        }

        // Get status and message from API response
        const { status, message } = data.data.logout;
        log('Logout Response:', { status, message });

        // Check status
        if (status !== 1) {
            throw new Error('Logout failed: ' + message);
        }

        return message;
    } catch (error) {
        // Even if backend says Unauthenticated, we still want to clear local credentials
        throw new Error('Failed to log out: ' + error.message);
    } finally {
        // Always clear local credentials and login state to avoid being stuck
        await AsyncStorage.multiRemove(['token', 'userInfo', 'userRoleCode']);
        await AsyncStorage.setItem('isLogin', 'false');
    }
}

/**
 * Change password function to handle password change
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise<string>} Success message
 */
export async function changePassword(currentPassword, newPassword) {
    const { version, platform } = await getDeviceInfo();

    // Define GraphQL mutation for change password
    const query = `
        mutation Change_password(
            $current_password: String!
            $new_password: String!
            $version: String!
            $platform: String!
        ) {
        change_password(
            current_password: $current_password
            new_password: $new_password
            version: $version
            platform: $platform
        ) {
            status
            message
        }}
    `;

    // Get token from AsyncStorage
    const token = await AsyncStorage.getItem('token');
    // Use GraphQL variables
    const variables = {
        current_password: currentPassword,
        new_password: newPassword,
        version: version,
        platform: platform,
    };

    try {
        const data = await apiClient(query, variables, token);
        // Check for errors in the response
        if (data.errors) {
            throw new Error(data.errors.map(error => error.message).join('\n'));
        }
        // Get status and message from API response
        const { status, message } = data.data.change_password;
        log('Change Password Response:', { status, message });
        // Return status and message so the screen can handle based on status
        return { status, message };
    } catch (error) {
        console.error('Change Password Error:', error.message);
        throw error;
    }
}

/**
 * Forgot password - request OTP/reset link
 * Guard: No
 * @param {string} username
 * @param {string} email
 * @returns {Promise<{status: number, message: string}>}
 */
export async function forgotPassword(username, email) {
    const { version, platform } = await getDeviceInfo();

    const query = `
        mutation Forgot_password(
            $username: String!
            $email: String!
            $version: String!
            $platform: String!
        ) {
        forgot_password(
            username: $username
            email: $email
            version: $version
            platform: $platform
        ) {
            status
            message
        }}
    `;

    const variables = { username, email, version, platform };

    try {
        const data = await apiClient(query, variables);

        if (data.errors) {
            throw new Error(data.errors.map(error => error.message).join('\n'));
        }

        const { status, message } = data.data.forgot_password;
        console.log('Forgot Password Response:', { status, message });
        return { status, message };
    } catch (error) {
        console.error('Forgot Password Error:', error.message);
        throw error;
    }
}

/**
 * Check OTP for reset password
 * @param {string} username
 * @param {string} otp
 * @returns {Promise<{status:number,message:string}>}
 */
export async function checkOtpResetPassword(username, otp) {
    const { version, platform } = await getDeviceInfo();

    const query = `
        mutation Check_otp_reset_password(
            $username: String!
            $otp: String!
            $version: String!
            $platform: String!
        ) {
        check_otp_reset_password(
            username: $username
            otp: $otp
            version: $version
            platform: $platform
        ) {
            status
            message
        }}
    `;

    const variables = { username, otp, version, platform };

    try {
        const data = await apiClient(query, variables);

        if (data.errors) {
            throw new Error(data.errors.map(error => error.message).join('\n'));
        }

        const result = data.data.check_otp_reset_password;
        log('Check OTP response:', result, { username, otp });
        return result;
    } catch (error) {
        console.error('Check OTP error:', error.message);
        throw error;
    }
}
