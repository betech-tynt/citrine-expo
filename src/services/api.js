import AsyncStorage from '@react-native-async-storage/async-storage';
import { publicToken } from '../../package.json';
import { API_URL } from '../constants/utils';

/**
 * apiClient function to handle API requests
 * @param query
 * @param variables
 * @param token
 * @param method
 * @returns
 */
async function apiClient(query, variables = {}, token = null, method = 'POST') {
    // Initialize headers for the request
    const headers = {
        'Content-Type': 'application/json',
        'x-api-key': publicToken,
    };

    // If token isn't provided, attempt to load it from AsyncStorage
    let resolvedToken = token;
    if (!resolvedToken) {
        try {
            resolvedToken = await AsyncStorage.getItem('token');
        } catch (e) {
            // ignore storage errors and proceed without token
        }
    }

    // If there is a token, add it to the headers
    if (resolvedToken) {
        headers['Authorization'] = `Bearer ${resolvedToken}`;
    }

    // Send request to API with method, headers, and request body
    const response = await fetch(API_URL, {
        method,
        headers,
        body:
            method === 'POST'
                ? JSON.stringify({ query, variables })
                : undefined,
    });

    // Check if the response is successful
    if (!response.ok) {
        const errorData = await response.json();
        console.log('Error Data:', errorData);
        throw new Error(
            errorData.errors?.map(error => error.message).join('\n') ||
                'An error occurred',
        );
    }

    return response.json();
}

export default apiClient;
