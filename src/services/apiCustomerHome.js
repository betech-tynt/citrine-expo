import apiClient, { notifyUnauthenticated } from './api';
import { getDeviceInfo } from './deviceInfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Check if the message is an Unauthenticated message
 * @param {string} message - The message to check
 * @returns {boolean} - True if the message is an Unauthenticated message, false otherwise
 */
function isUnauthenticatedMessage(message) {
    if (!message) return false;
    const m = String(message).toLowerCase();
    return (
        m.includes('unauthenticated') ||
        m.includes('unauthorized') ||
        m.includes('jwt')
    );
}

/**
 * Fetches the customer home data from the server (P0100_Customer_Home_API).
 * @returns {Promise<Object>} - The customer home data including rooms and promotions.
 */
export async function fetchCustomerHomeData() {
    const { version, platform } = await getDeviceInfo();
    console.log('Fetch Customer Home Data Params:', {
        version,
        platform,
    });

    // Define GraphQL query for fetching customer home data
    const query = `
        query P0100_Customer_Home_API($version: String!, $platform: String!) {
            customer_home(
                version: $version
                platform: $platform
            ) {
                status
                message
                data {
                    sections {
                        id
                        name
                        address
                        latitude
                        longitude
                        rating_value
                        min_price
                        description
                        google_map_url
                        images {
                            id
                            url
                            alt_text
                            title
                        }
                    }
                    user_data {
                        user {
                            id
                            username
                            email
                            name
                            status
                            section_id
                            role {
                                id
                                name
                                code
                                status
                                users {
                                    id
                                    username
                                    email
                                    name
                                    status
                                    section_id
                                }
                            }
                        }
                    }
                }
            }
        }
    `;

    // Get token from AsyncStorage
    const token = await AsyncStorage.getItem('token');

    // If token is missing, do not call authenticated API to avoid Unauthenticated errors
    if (!token) {
        const message = 'Unauthenticated: missing token. Please login again.';
        console.error('Error loading customer home data:', message);
        notifyUnauthenticated(message);
        throw new Error(message);
    }

    const variables = { version, platform: platform.toUpperCase() };

    try {
        // Make API request
        const data = await apiClient(query, variables, token);

        // Check for errors in the response
        if (data.errors) {
            const errorMsg = data.errors.map(error => error.message).join('\n');
            if (isUnauthenticatedMessage(errorMsg)) {
                await AsyncStorage.removeItem('token');
            }
            throw new Error(errorMsg);
        }

        // Destructure and return the relevant data
        const { status, message, data: responseData } = data.data.customer_home;

        const user = responseData?.user_data?.user;
        const roleCode = user?.role?.code;

        console.log('Customer Home Response:', {
            status,
            message,
            responseData,
            roleCode,
        });

        // If the status is not 1, throw an error
        if (status !== 1) {
            if (isUnauthenticatedMessage(message)) {
                await AsyncStorage.removeItem('token');
            }
            throw new Error(`Error fetching customer home data: ${message}`);
        }

        // Persist role code for later usage in navigation / permission checks
        if (roleCode) {
            try {
                await AsyncStorage.setItem('userRoleCode', String(roleCode));
            } catch (storageError) {
                console.warn(
                    'Failed to persist userRoleCode to AsyncStorage:',
                    storageError,
                );
            }
        }

        // Persist basic customer user profile for booking screens (name, email, etc.)
        if (user) {
            try {
                await AsyncStorage.setItem(
                    'customerUser',
                    JSON.stringify(user),
                );
            } catch (storageError) {
                console.warn(
                    'Failed to persist customerUser to AsyncStorage:',
                    storageError,
                );
            }
        }

        // The 'sections' array now directly contains the lodging data.
        // The API does not seem to return promotions, so we return an empty array.
        return {
            rooms: responseData.sections || [],
            promotions: [],
        };
    } catch (error) {
        // Log and rethrow errors
        console.error('Error fetching customer home data:', error.message);
        throw new Error('Failed to fetch customer home data: ' + error.message);
    }
}
