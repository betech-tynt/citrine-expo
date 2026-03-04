import apiClient from './api';
import { getDeviceInfo } from './deviceInfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Searches for sections (hotels, resorts) with filtering and sorting.
 * @param {Object} params - Search parameters
 * @param {string} params.address - Filter sections by address (optional)
 * @param {number} params.type_id - Filter sections by type: 1=Hotel, 2=Apartment, 3=Resort (optional, if not provided gets all)
 * @param {number} params.page - Page number for pagination (default: 1)
 * @param {number} params.limit - Number of items per page (default: 10)
 * @param {string} params.sort_by - Sort by field: rating_value, price_asc, price_desc (default: rating_value)
 * @param {string} params.order - Sort order: asc or desc (default: desc)
 * @returns {Promise<Object>} - The search results with pagination info
 */
export async function fetchCustomerSectionSearch(params = {}) {
    const { version, platform } = await getDeviceInfo();
    const {
        address = '',
        type_id = null,
        page = 1,
        limit = 10,
        sort_by = 'rating_value',
        order = 'desc',
    } = params;

    console.log('Fetch Customer Section Search Params:', {
        address,
        type_id,
        page,
        limit,
        sort_by,
        order,
        version,
        platform,
    });

    const query = `
        query P0101_Customer_Section_Search_API(
            $address: String,
            $type_id: Int,
            $page: Int,
            $limit: Int,
            $sort_by: String,
            $order: String,
            $version: String!,
            $platform: String!
        ) {
            customer_section_search(
                address: $address,
                type_id: $type_id,
                page: $page,
                limit: $limit,
                sort_by: $sort_by,
                order: $order,
                version: $version,
                platform: $platform
            ) {
                status
                message
                data {
                    id
                    name
                    code
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
                        order
                        alt_text
                        title
                    }
                }
                paginatorInfo {
                    total
                    currentPage
                    lastPage
                    perPage
                }
            }
        }
    `;

    const token = await AsyncStorage.getItem('token');
    const variables = {
        address: address || null,
        type_id: type_id || null,
        page: page || 1,
        limit: limit || 10,
        sort_by: sort_by || 'rating_value',
        order: order || 'desc',
        version,
        platform: platform.toUpperCase(),
    };

    try {
        const response = await apiClient(query, variables, token);

        if (response.errors) {
            throw new Error(response.errors.map((error) => error.message).join('\n'));
        }

        const { status, message, data, paginatorInfo } = response.data.customer_section_search;

        console.log('Customer Section Search Response:', {
            status,
            message,
            dataCount: data?.length || 0,
            paginatorInfo,
        });

        // If status is not success, check if it's "no results" or a real error
        if (status !== 1) {
            const errorMessage = message || 'Failed to search sections';
            // If data is empty or null, treat as "no results" instead of error
            if (!data || (Array.isArray(data) && data.length === 0)) {
                return {
                    sections: [],
                    paginatorInfo: paginatorInfo || {
                        total: 0,
                        currentPage: 1,
                        lastPage: 1,
                        perPage: 10,
                    },
                };
            }
            // Otherwise, it's a real error
            throw new Error(errorMessage);
        }

        return {
            sections: data || [],
            paginatorInfo: paginatorInfo || { total: 0, currentPage: 1, lastPage: 1, perPage: 10 },
        };
    } catch (error) {
        console.error('Error fetching customer section search:', error.message);
        throw new Error('Failed to search sections: ' + error.message);
    }
}
