import apiClient, { notifyUnauthenticated } from './api';
import { getDeviceInfo } from './deviceInfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Searches for sections (hotels, resorts) with filtering and sorting.
 * @param {Object} params - Search parameters
 * @param {string} params.address - Filter sections by address (optional)
 * @param {number} params.type_id - Filter sections by type: 1=Hotel, 2=Apartment, 3=Resort (optional, if not provided gets all)
 * @param {string} params.checkin_date - Check-in date in ISO format YYYY-MM-DD (optional)
 * @param {string} params.checkout_date - Check-out date in ISO format YYYY-MM-DD (optional)
 * @param {number} params.adults - Number of adult guests (optional)
 * @param {number} params.children - Number of child guests (optional)
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
        checkin_date = null,
        checkout_date = null,
        adults = null,
        children = null,
        page = 1,
        limit = 10,
        sort_by = 'rating_value',
        order = 'desc',
    } = params;

    console.log('Fetch Customer Section Search Params:', {
        address,
        type_id,
        checkin_date,
        checkout_date,
        adults,
        children,
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
            $checkin_date: String,
            $checkout_date: String,
            $adults: Int,
            $children: Int,
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
                checkin_date: $checkin_date,
                checkout_date: $checkout_date,
                adults: $adults,
                children: $children,
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
                    available_rooms
                    description
                    google_map_url
                    check_in_time
                    check_out_time
                    phone
                    email
                    type_id
                    status
                    room_types {
                        id
                        name
                        code
                        section_id
                        description
                        price
                        bed_count
                        max_guests
                        available_rooms
                        area
                        amenities
                        status
                    }
                    images {
                        id
                        url
                        order
                        alt_text
                        title
                    }
                    company {
                        id
                        name
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

    if (!token) {
        const message = 'Unauthenticated: missing token';
        notifyUnauthenticated(message);
        throw new Error(message);
    }

    const variables = {
        address: address || null,
        type_id: type_id || null,
        checkin_date: checkin_date || null,
        checkout_date: checkout_date || null,
        adults: adults ?? null,
        children: children ?? null,
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
            throw new Error(
                response.errors.map(error => error.message).join('\n'),
            );
        }

        const { status, message, data, paginatorInfo } =
            response.data.customer_section_search;

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
            paginatorInfo: paginatorInfo || {
                total: 0,
                currentPage: 1,
                lastPage: 1,
                perPage: 10,
            },
        };
    } catch (error) {
        console.error('Error fetching customer section search:', error.message);
        throw new Error('Failed to search sections: ' + error.message);
    }
}
