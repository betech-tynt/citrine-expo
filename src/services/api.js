import { API_URL } from '../constants/utils';
import { publicToken } from '../../package.json';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Match common authentication failure messages coming from the API.
const UNAUTHENTICATED_PATTERNS = [
    'unauthenticated',
    'unauthorized',
    'jwt',
    'missing token',
];

// Global unauthenticated handler hook (set from the navigator layer).
let unauthenticatedHandler = null;

// Register a handler that will be called when auth is invalid/expired.
export const setUnauthenticatedHandler = handler => {
    unauthenticatedHandler = handler;
};

// Notify the app when an unauthenticated message is detected.
export const notifyUnauthenticated = message => {
    if (typeof unauthenticatedHandler === 'function') {
        unauthenticatedHandler(message);
    }
};

// Normalize and check if an error message indicates auth failure.
const isUnauthenticatedMessage = message => {
    if (!message) return false;
    const lower = String(message).toLowerCase();
    return UNAUTHENTICATED_PATTERNS.some(pattern => lower.includes(pattern));
};

/**
 * apiClient function to handle API requests
 * @param query
 * @param variables
 * @param token
 * @param method
 * @returns
 */
// Shared API client that attaches auth token and flags auth errors.
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
        const errorMessage =
            errorData.errors?.map(error => error.message).join('\n') ||
            'An error occurred';

        // Raise a global auth error so the app can redirect on user confirmation.
        if (isUnauthenticatedMessage(errorMessage)) {
            notifyUnauthenticated(errorMessage);
        }

        throw new Error(errorMessage);
    }

    const json = await response.json();

    if (json?.errors) {
        const errorMessage = json.errors.map(error => error.message).join('\n');

        // Raise a global auth error so the app can redirect on user confirmation.
        if (isUnauthenticatedMessage(errorMessage)) {
            notifyUnauthenticated(errorMessage);
        }
    }

    return json;
}

export default apiClient;
