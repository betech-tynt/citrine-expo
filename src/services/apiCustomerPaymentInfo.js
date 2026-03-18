import apiClient, { notifyUnauthenticated } from './api';
import { getDeviceInfo } from './deviceInfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CUSTOMER_PAYMENT_INFO_QUERY = `
    query Customer_payment_info(
        $id: Int!
        $version: String!
        $platform: String!
    ) {
        customer_payment_info(
            id: $id
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
                    booking_details {
                        id
                        room_count
                        price_per_night
                        total_price
                        notes
                        room_type {
                            id
                            name
                            code
                            section_id
                            description
                            price
                            bed_count
                            max_guests
                            area
                            amenities
                            status
                        }
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
            }
        }
    }
`;

/**
 * Fetch detailed payment info for a specific payment (Customer_payment_info).
 * @param {number} paymentId - The unique identifier of the payment.
 * @returns {Promise<Object>} - Detailed payment info object.
 */
export async function fetchCustomerPaymentInfo(paymentId) {
    if (!paymentId && paymentId !== 0) {
        throw new Error('Payment ID is required');
    }

    const { version, platform } = await getDeviceInfo();
    const token = await AsyncStorage.getItem('token');

    if (!token) {
        const message = 'Unauthenticated: missing token';
        notifyUnauthenticated(message);
        throw new Error(message);
    }

    const variables = {
        id: Number(paymentId),
        version,
        platform: platform.toUpperCase(),
    };

    try {
        const response = await apiClient(
            CUSTOMER_PAYMENT_INFO_QUERY,
            variables,
            token,
        );

        if (response.errors) {
            throw new Error(
                response.errors.map(error => error.message).join('\n'),
            );
        }

        const { status, message, data } =
            response.data.customer_payment_info;

        if (status !== 1 || !data) {
            throw new Error(message || 'Failed to fetch payment info');
        }

        return data;
    } catch (error) {
        console.error(
            'Error fetching customer payment info:',
            error.message,
        );
        throw new Error(
            'Failed to fetch customer payment info: ' + error.message,
        );
    }
}
