import apiClient, { notifyUnauthenticated } from './api';
import { getDeviceInfo } from './deviceInfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CUSTOMER_PAYMENT_LIST_QUERY = `
    query Customer_payment_list(
        $page: Int
        $limit: Int
        $version: String!
        $platform: String!
    ) {
        customer_payment_list(
            page: $page
            limit: $limit
            version: $version
            platform: $platform
        ) {
            status
            message
            data {
                id
                method_id
                method_name
                total
                tax
                discount
                final
                status
                created_at
                payment_time
                notes
                transaction_id
                booking {
                    id
                    code
                    status
                    start
                    end
                    check_in_at
                    check_out_at
                    total_price
                    deposit_amount
                    special_requests
                    cancel_reason
                    customer {
                        id
                        user_id
                        name
                        first_name
                        last_name
                        phone_number
                        code
                        address
                        postal_code
                        birthday
                        gender
                        gender_name
                        type
                        type_name
                        status
                    }
                    booking_details {
                        id
                        room_count
                        price_per_night
                        total_price
                        notes
                    }
                    section {
                        id
                        name
                        code
                        address
                        postal_code
                        ward
                        chome
                        ban
                        go
                        building
                        room
                        address_line
                        latitude
                        longitude
                        rating_value
                        description
                        google_place_id
                        google_map_url
                        phone
                        email
                        website
                        check_in_time
                        check_out_time
                        company_id
                        type_id
                        status
                        min_price
                    }
                    payments {
                        id
                        method_name
                        total
                        tax
                        discount
                        final
                        status
                        created_at
                    }
                }
                section {
                    id
                    name
                    code
                    address
                    postal_code
                    ward
                    chome
                    ban
                    go
                    building
                    room
                    address_line
                    latitude
                    longitude
                    rating_value
                    description
                    google_place_id
                    google_map_url
                    phone
                    email
                    website
                    check_in_time
                    check_out_time
                    company_id
                    type_id
                    status
                    min_price
                }
                customer {
                    id
                    user_id
                    name
                    first_name
                    last_name
                    phone_number
                    code
                    address
                    postal_code
                    birthday
                    gender
                    gender_name
                    type
                    type_name
                    status
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

/**
 * Fetches payment list for the authenticated customer.
 * @param {object} filters - The filter and pagination options.
 * @param {number} [filters.page=1] - The page number for pagination.
 * @param {number} [filters.limit=10] - The number of items per page.
 * @returns {Promise<Object>} - The payment list data and paginator info.
 */
export async function fetchCustomerPaymentList(filters = {}) {
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
        version,
        platform: platform.toUpperCase(),
    };

    try {
        const response = await apiClient(
            CUSTOMER_PAYMENT_LIST_QUERY,
            variables,
            token,
        );

        if (response.errors) {
            throw new Error(
                response.errors.map(error => error.message).join('\n'),
            );
        }

        const { status, message, data, paginatorInfo } =
            response.data.customer_payment_list;

        if (status !== 1) {
            const errorMessage =
                message || 'Failed to fetch customer payment list';

            if (!data || (Array.isArray(data) && data.length === 0)) {
                return {
                    payments: [],
                    paginatorInfo: paginatorInfo || {
                        total: 0,
                        currentPage: filters.page || 1,
                        lastPage: filters.page || 1,
                        perPage: filters.limit || 10,
                    },
                };
            }

            throw new Error(errorMessage);
        }

        return {
            payments: data || [],
            paginatorInfo: paginatorInfo || {
                total: Array.isArray(data) ? data.length : 0,
                currentPage: filters.page || 1,
                lastPage: filters.page || 1,
                perPage: filters.limit || 10,
            },
        };
    } catch (error) {
        console.error(
            'Error fetching customer payment list:',
            error.message,
        );
        throw new Error(
            'Failed to fetch customer payment list: ' + error.message,
        );
    }
}
