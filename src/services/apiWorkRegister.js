import apiClient, { notifyUnauthenticated } from './api';
import { getDeviceInfo } from './deviceInfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Fetches the work register list from the server.
 * @param {Object} params                   - Parameters to filter the work register list.
 * @param {string|null} params.startDate    - The start date for filtering (nullable).
 * @param {string|null} params.endDate      - The end date for filtering (nullable).
 * @param {number|null} params.employeeId   - The employee ID for filtering (nullable).
 * @returns {Promise<Object>}               - The work register list data.
 */
export async function fetchWorkRegisterList({
    startDate = null,
    endDate = null,
    employeeId = null,
} = {}) {
    const { version, platform } = await getDeviceInfo();
    console.log('Fetch Work Register List Params:', {
        startDate,
        endDate,
        employeeId,
        version,
        platform,
    });
    // Define GraphQL query for fetching work register list
    const query = `
        query Work_register_list {
            work_register_list(
                version: "${version}"
                platform: ${platform}
                start_date: ${startDate ? `"${startDate}"` : null}
                end_date: ${endDate ? `"${endDate}"` : null}
                employee_id: ${employeeId !== null ? employeeId : null}
            ) {
                status
                message
                data {
                    id
                    date
                    workshift {
                        color
                        name
                        start
                        end
                    }
                    employee {
                        id
                        username
                        name
                        role {
                            id
                            name
                        }
                    }
                }
            }
        }
    `;

    // Get token from AsyncStorage
    const token = await AsyncStorage.getItem('token');

    if (!token) {
        const message = 'Unauthenticated: missing token';
        notifyUnauthenticated(message);
        throw new Error(message);
    }

    const variables = { version, platform, startDate, endDate, employeeId };

    try {
        // Make API request
        const data = await apiClient(query, variables, token);

        // Check for errors in the response
        if (data.errors) {
            throw new Error(data.errors.map(error => error.message).join('\n'));
        }

        // Destructure and return the relevant data
        const {
            status,
            message,
            data: responseData,
        } = data.data.work_register_list;
        console.log('Work Register List Response:', {
            status,
            message,
            responseData,
        });

        if (status !== 1) {
            throw new Error(`Error fetching work register list: ${message}`);
        }

        return responseData;
    } catch (error) {
        // Log and rethrow errors
        console.error('Error fetching work register list:', error.message);
        throw new Error('Failed to fetch work register list: ' + error.message);
    }
}
