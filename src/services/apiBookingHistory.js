import apiClient, { notifyUnauthenticated } from './api';
import { getDeviceInfo } from './deviceInfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CUSTOMER_BOOKING_HISTORY_QUERY = `
    query P0106_Customer_Booking_History_API(
        $page: Int
        $limit: Int
        $status: Int
        $date_from: String
        $date_to: String
        $sort_by: String
        $order: String
        $version: String!
        $platform: String!
    ) {
        customer_booking_history(
            page: $page
            limit: $limit
            status: $status
            date_from: $date_from
            date_to: $date_to
            sort_by: $sort_by
            order: $order
            version: $version
            platform: $platform
        ) {
            status
            message
            data {
                id
                code
                status
                check_in_at
                check_out_at
                guest_count {
                    adults
                    children
                }
                total_price
                section_name
                room_details
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

/**
 * Fetches booking history for the authenticated customer (P0106_Customer_Booking_History_API).
 * @param {object} filters - The filter and pagination options.
 * @param {number} [filters.page=1] - The page number for pagination.
 * @param {number} [filters.limit=10] - The number of items per page.
 * @param {number} [filters.status] - Filter by booking status.
 * @param {string} [filters.date_from] - Start date for filtering.
 * @param {string} [filters.date_to] - End date for filtering.
 * @param {string} [filters.sort_by] - Field to sort by.
 * @param {string} [filters.order] - Sort order ('asc' or 'desc').
 * @returns {Promise<Object>} - The booking history data and paginator info.
 */
export async function fetchCustomerBookingHistory(filters = {}) {
    const { version, platform } = await getDeviceInfo();
    const token = await AsyncStorage.getItem('token');

    if (!token) {
        const message = 'Unauthenticated: missing token';
        notifyUnauthenticated(message);
        throw new Error(message);
    }

    const variables = {
        page: filters.page || 1,
        limit: filters.limit || 10,
        status: filters.status,
        date_from: filters.date_from,
        date_to: filters.date_to,
        sort_by: filters.sort_by,
        order: filters.order,
        version,
        platform: platform.toUpperCase(),
    };

    try {
        const response = await apiClient(
            CUSTOMER_BOOKING_HISTORY_QUERY,
            variables,
            token,
        );

        if (response.errors) {
            throw new Error(
                response.errors.map(error => error.message).join('\n'),
            );
        }

        const { status, message, data, paginatorInfo } =
            response.data.customer_booking_history;

        // If status is not successful, check for "no data" case
        if (status !== 1) {
            const errorMessage = message || 'Failed to fetch booking history';

            // If no data, return empty list instead of throwing error
            if (!data || (Array.isArray(data) && data.length === 0)) {
                return {
                    bookings: [],
                    paginatorInfo: paginatorInfo || {
                        total: 0,
                        currentPage: filters.page || 1,
                        lastPage: filters.page || 1,
                        perPage: filters.limit || 10,
                    },
                };
            }

            // Other error cases: throw error
            throw new Error(errorMessage);
        }

        return {
            bookings: data || [],
            paginatorInfo: paginatorInfo || {
                total: Array.isArray(data) ? data.length : 0,
                currentPage: filters.page || 1,
                lastPage: filters.page || 1,
                perPage: filters.limit || 10,
            },
        };
    } catch (error) {
        console.error(
            'Error fetching customer booking history:',
            error.message,
        );
        throw new Error(
            'Failed to fetch customer booking history: ' + error.message,
        );
    }
}
