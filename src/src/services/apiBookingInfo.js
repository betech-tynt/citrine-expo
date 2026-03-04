import apiClient from './api';
import { getDeviceInfo } from './deviceInfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CUSTOMER_BOOKING_INFO_QUERY = `
    query P0107_Customer_Booking_Info_API(
        $booking_id: Int!
        $version: String!
        $platform: String!
    ) {
        customer_booking_info(
            booking_id: $booking_id
            version: $version
            platform: $platform
        ) {
            status
            message
            data {
                id
                code
                status
                start
                end
                check_in_at
                check_out_at
                guest_count {
                    adults
                    children
                }
                total_price
                deposit_amount
                special_requests
                cancel_reason
                customer {
                    name
                    first_name
                    last_name
                    phone_number
                    user {
                        email
                    }
                }
                section {
                    name
                    address
                }
                booking_details {
                    id
                    room_type {
                        id
                        name
                        images {
                            url
                        }
                    }
                    room_count
                    guest_count {
                        adults
                        children
                    }
                    price_per_night
                    total_price
                    notes
                    assigned_rooms {
                        id
                        name
                    }
                }
                payments {
                    id
                    method_name
                    total
                    tax
                    discount
                    final
                }
            }
        }
    }
`;

/**
 * Fetch detailed booking info for a specific booking (P0107_Customer_Booking_Info_API).
 * @param {number} bookingId - The unique identifier of the booking.
 * @returns {Promise<Object>} - Detailed booking info object.
 */
export async function fetchCustomerBookingInfo(bookingId) {
    if (!bookingId && bookingId !== 0) {
        throw new Error('Booking ID is required');
    }

    const { version, platform } = await getDeviceInfo();
    const token = await AsyncStorage.getItem('token');

    const variables = {
        booking_id: Number(bookingId),
        version,
        platform: platform.toUpperCase(),
    };

    try {
        const response = await apiClient(
            CUSTOMER_BOOKING_INFO_QUERY,
            variables,
            token,
        );

        if (response.errors) {
            throw new Error(
                response.errors.map(error => error.message).join('\n'),
            );
        }

        const { status, message, data } = response.data.customer_booking_info;

        if (status !== 1 || !data) {
            throw new Error(message || 'Failed to fetch booking info');
        }

        return data;
    } catch (error) {
        console.error('Error fetching customer booking info:', error.message);
        throw new Error(
            'Failed to fetch customer booking info: ' + error.message,
        );
    }
}


