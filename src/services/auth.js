import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../config/i18n';
import { log } from '../utils/handleLog';
import apiClient, { notifyUnauthenticated } from './api';
import { getDeviceInfo, getUniqueId } from './deviceInfo';

// OTP Types (shared across OTP flows)
export const TYPE_REGISTER = 1;
export const TYPE_FORGOT_PASSWORD = 2;

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
        log('Login Response:', {
            status,
            message,
            token,
            userData,
        });

        // Check for successful login
        if (status !== 1) {
            throw new Error(`Login failed: ${message}`);
        }

        // Save token to AsyncStorage
        if (token) {
            await AsyncStorage.setItem('token', token);
            await AsyncStorage.setItem('userInfo', JSON.stringify(userData)); // Save role and permissions
        } else {
            console.warn('Received null token, not saving to AsyncStorage.');
        }

        // Return the full result including status and message for navigation logic
        return { status, message, token, data: userData };
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

    // If token is missing, do not call authenticated API to avoid Unauthenticated errors
    if (!token) {
        const message = 'Unauthenticated: missing token. Please login again.';
        console.error('Error in changePassword:', message);
        notifyUnauthenticated(message);
        throw new Error(message);
    }

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
 * P0005_Send_OTP_API - Send OTP code to user's email (forgot password / register)
 * Guard: No
 * @param {string} email
 * @param {number} type - OTP type (1: register, 2: forgot_password)
 * @returns {Promise<{status: number, message: string, expires_in_minutes?: number}>}
 */
export async function sendOtp(email, type = TYPE_REGISTER) {
    const { version, platform } = await getDeviceInfo();

    const query = `
        mutation Send_otp(
            $email: String!
            $type: Int!
            $version: String!
            $platform: String!
        ) {
        send_otp(
            email: $email
            type: $type
            version: $version
            platform: $platform
        ) {
            status
            message
            expires_in_minutes
        }}
    `;

    const variables = { email, type, version, platform };

    try {
        const data = await apiClient(query, variables);

        if (data.errors) {
            throw new Error(data.errors.map(error => error.message).join('\n'));
        }

        const result = data.data.send_otp;
        const { status, message, expires_in_minutes } = result || {};
        log(
            'Send OTP Response:',
            { status, message, expires_in_minutes },
            { email, type },
        );
        return { status, message, expires_in_minutes };
    } catch (error) {
        console.error('Send OTP Error:', error.message);
        throw error;
    }
}

/**
 * P0006_Verify_OTP_API - Verify OTP (register/forgot password)
 * Guard: No
 * @param {string} email
 * @param {string} otp
 * @param {number} type - OTP type (1: register, 2: forgot_password)
 * @returns {Promise<{status:number,message:string}>}
 */
export async function verifyOtp(email, otp, type = TYPE_FORGOT_PASSWORD) {
    const { version, platform } = await getDeviceInfo();

    const query = `
        mutation Verify_otp(
            $email: String!
            $otp: String!
            $type: Int!
            $version: String!
            $platform: String!
        ) {
        verify_otp(
            email: $email
            otp: $otp
            type: $type
            version: $version
            platform: $platform
        ) {
            status
            message
        }}
    `;

    const variables = { email, otp, type, version, platform };

    try {
        const data = await apiClient(query, variables);

        if (data.errors) {
            throw new Error(data.errors.map(error => error.message).join('\n'));
        }

        const result = data.data.verify_otp;
        log('Verify OTP response:', result, { email, type });
        return result;
    } catch (error) {
        console.error('Verify OTP error:', error.message);
        throw error;
    }
}

/**
 * P0007_Forgot_Password_API - Reset password using OTP
 * Guard: No
 * @param {string} email
 * @param {string} newPassword
 * @param {string} otp
 * @returns {Promise<{status:number,message:string}>}
 */
export async function forgotPassword(email, newPassword, otp) {
    const { version, platform } = await getDeviceInfo();

    const query = `
        mutation Forgot_password(
            $email: String!
            $new_pass: String!
            $otp: String!
            $version: String!
            $platform: String!
        ) {
        forgot_password(
            email: $email
            new_pass: $new_pass
            otp: $otp
            version: $version
            platform: $platform
        ) {
            status
            message
        }}
    `;

    const variables = { email, new_pass: newPassword, otp, version, platform };

    try {
        const data = await apiClient(query, variables);

        if (data.errors) {
            throw new Error(data.errors.map(error => error.message).join('\n'));
        }

        const result = data.data.forgot_password;
        log('Forgot Password (Confirm) Response:', result, { email });
        return result;
    } catch (error) {
        console.error('Forgot Password (Confirm) Error:', error.message);
        throw error;
    }
}

/**
 * Register customer with email
 * Guard: No
 * @param {string} email - Email address of the customer
 * @param {string} password - Random password generated by frontend
 * @returns {Promise<{status: number, message: string, expires_in_minutes?: number}>}
 */
export async function registerCustomerWithEmail(email, password) {
    const { version, platform } = await getDeviceInfo();

    const query = `
        mutation Register_customer_with_email(
            $email: String!
            $password: String!
            $version: String!
            $platform: String!
        ) {
        register_customer_with_email(
            email: $email
            password: $password
            version: $version
            platform: $platform
        ) {
            status
            message
            expires_in_minutes
        }}
    `;

    const variables = { email, password, version, platform };

    try {
        const data = await apiClient(query, variables);

        if (data.errors) {
            throw new Error(data.errors.map(error => error.message).join('\n'));
        }

        const result = data.data.register_customer_with_email;
        log('Register Customer Response:', result, { email });
        return result;
    } catch (error) {
        console.error('Register Customer Error:', error.message);
        throw error;
    }
}

/**
 * Verify OTP for customer registration
 * Guard: No
 * @param {string} email - Email address used during registration
 * @param {string} otp - The OTP code sent to the user's email
 * @returns {Promise<{status: number, message: string}>}
 */
export async function verifyRegisterOtp(email, otp, deviceToken) {
    const { version, platform } = await getDeviceInfo();

    // Use provided deviceToken or get from DeviceInfo if not provided
    const resolvedDeviceToken = deviceToken || (await getUniqueId());

    const query = `
        mutation Verify_register_otp(
            $email: String!
            $otp: String!
            $device_token: String!
            $version: String!
            $platform: String!
        ) {
        verify_register_otp(
            email: $email
            otp: $otp
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

    const variables = {
        email,
        otp,
        device_token: resolvedDeviceToken,
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
        const {
            status,
            message,
            token,
            data: userData,
        } = data.data.verify_register_otp;

        // Log response
        log('Verify Register OTP Response:', {
            status,
            message,
            token,
            userData,
        });

        // Check for successful verification
        if (status !== 1) {
            throw new Error(
                i18n.t('otp.invalidOtp') + '\n' + i18n.t('otp.pleaseTryAgain'),
            );
        }

        // Save token to AsyncStorage
        if (token) {
            await AsyncStorage.setItem('token', token);
            await AsyncStorage.setItem('userInfo', JSON.stringify(userData)); // Save role and permissions
        } else {
            console.warn('Received null token, not saving to AsyncStorage.');
        }

        // Return the full result including status and message for navigation logic
        return { status, message, token, data: userData };
    } catch (error) {
        // Log errors if there is a problem
        console.error('Verify Register OTP Error:', error.message);
        throw error;
    }
}

/**
 * Get user data from the authenticated API
 * Guard: Yes (Requires authentication via @guard directive)
 * The token is automatically retrieved from AsyncStorage by apiClient
 * @returns {Promise<Object>} - User data including profile, configs, and permissions
 */
export async function getUserData() {
    const { version, platform } = await getDeviceInfo();

    // Define GraphQL query for fetching user data
    const query = `
        query UserData(
            $version: String!
            $platform: String!
        ) {
            user_data(
                version: $version
                platform: $platform
            ) {
                status
                message
                data {
                    user {
                        id
                        username
                        email
                        name
                        status
                        role {
                            id
                            name
                            code
                        }
                        profile {
                            id
                            user_id
                            first_name
                            last_name
                            kana_first_name
                            kana_last_name
                            fullname
                            email
                            phone_number
                            postal_code
                            ward
                            full_address
                            birthday
                            code
                            address
                            gender
                            company_id
                            status
                            company {
                                id
                                code
                                name
                                phone
                                email
                                open_date
                                address
                                director
                                status
                            }
                        }
                    }
                    configs {
                        settings {
                            key
                            value
                        }
                    }
                }
            }
        }
    `;

    const variables = { version, platform };

    try {
        // apiClient automatically retrieves the token from AsyncStorage
        const data = await apiClient(query, variables);

        // Check for errors in the response
        if (data.errors) {
            throw new Error(data.errors.map(error => error.message).join('\n'));
        }

        // Get status and message from API response
        const { status, message, data: userData } = data.data.user_data;

        log('Get User Data Response:', { status, message, userData });

        // If the status is not 1, throw an error
        if (status !== 1) {
            throw new Error(`Error fetching user data: ${message}`);
        }

        return userData;
    } catch (error) {
        console.error('Get User Data Error:', error.message);
        throw new Error('Failed to fetch user data: ' + error.message);
    }
}

/**
 * Update profile information
 * Guard: Yes (Requires authentication)
 * @param {Object} profileData - Profile data to update
 * @returns {Promise<{status: number, message: string, data: Object}>}
 */
export async function updateProfile(profileData) {
    const { version, platform } = await getDeviceInfo();

    // Define GraphQL mutation for profile update
    const query = `
        mutation Profile_update(
            $first_name: String
            $last_name: String
            $kana_first_name: String
            $kana_last_name: String
            $phone_number: String
            $address: String
            $postal_code: String
            $ward: String
            $chome: String
            $ban: String
            $go: String
            $building: String
            $room: String
            $latitude: Float
            $longitude: Float
            $gender: Int
            $birthday: String
            $type: Int
            $company_id: Int
            $version: String!
            $platform: String!
        ) {
        profile_update(
            first_name: $first_name
            last_name: $last_name
            kana_first_name: $kana_first_name
            kana_last_name: $kana_last_name
            phone_number: $phone_number
            address: $address
            postal_code: $postal_code
            ward: $ward
            chome: $chome
            ban: $ban
            go: $go
            building: $building
            room: $room
            latitude: $latitude
            longitude: $longitude
            gender: $gender
            birthday: $birthday
            type: $type
            company_id: $company_id
            version: $version
            platform: $platform
        ) {
            status
            message
            data {
                id
                user_id
                first_name
                last_name
                kana_first_name
                kana_last_name
                fullname
                email
                phone_number
                postal_code
                ward
                full_address
                birthday
                code
                address
                gender
                company_id
                status
                company {
                    id
                    name
                    code
                    address
                }
                user {
                    id
                    name
                    email
                }
            }
        }}
    `;

    // Get token from AsyncStorage
    const token = await AsyncStorage.getItem('token');

    // Build variables object - only include provided fields
    const variables = {
        version,
        platform,
    };

    // Conditionally add fields that are provided
    if (profileData.first_name !== undefined)
        variables.first_name = profileData.first_name;
    if (profileData.last_name !== undefined)
        variables.last_name = profileData.last_name;
    if (profileData.kana_first_name !== undefined)
        variables.kana_first_name = profileData.kana_first_name;
    if (profileData.kana_last_name !== undefined)
        variables.kana_last_name = profileData.kana_last_name;
    if (profileData.phone_number !== undefined)
        variables.phone_number = profileData.phone_number;
    if (profileData.address !== undefined)
        variables.address = profileData.address;
    if (profileData.postal_code !== undefined)
        variables.postal_code = profileData.postal_code;
    if (profileData.ward !== undefined) variables.ward = profileData.ward;
    if (profileData.chome !== undefined) variables.chome = profileData.chome;
    if (profileData.ban !== undefined) variables.ban = profileData.ban;
    if (profileData.go !== undefined) variables.go = profileData.go;
    if (profileData.building !== undefined)
        variables.building = profileData.building;
    if (profileData.room !== undefined) variables.room = profileData.room;
    if (profileData.latitude !== undefined)
        variables.latitude = profileData.latitude;
    if (profileData.longitude !== undefined)
        variables.longitude = profileData.longitude;
    if (profileData.gender !== undefined) variables.gender = profileData.gender;
    if (profileData.birthday !== undefined)
        variables.birthday = profileData.birthday;
    if (profileData.type !== undefined) variables.type = profileData.type;
    if (profileData.company_id !== undefined)
        variables.company_id = profileData.company_id;

    try {
        const data = await apiClient(query, variables, token);

        // Check for errors in the response
        if (data.errors) {
            throw new Error(data.errors.map(error => error.message).join('\n'));
        }

        // Get result from API response
        const result = data.data.profile_update;
        log('Update Profile Response:', result);

        // Return the result
        return result;
    } catch (error) {
        console.error('Update Profile Error:', error.message);
        throw error;
    }
}
