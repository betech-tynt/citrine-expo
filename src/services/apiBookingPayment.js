import apiClient, { notifyUnauthenticated } from './api';
import { getDeviceInfo } from './deviceInfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { log } from '../utils/handleLog';

const CUSTOMER_BOOKING_PAYMENT_MUTATION = `
    mutation P0104_Customer_Booking_Payment_API(
        $booking_id: Int!
        $version: String!
        $platform: String!
    ) {
        customer_booking_payment(
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
                    id
                    user_id
                    name
                    first_name
                    last_name
                    phone_number
                    code
                    gender
                    gender_name
                    type
                    type_name
                    status
                }
                section {
                    name
                    address
                    latitude
                    longitude
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
                    status
                    created_at
                }
            }
        }
    }
`;

/**
 * Confirm customer booking payment (P0104_Customer_Booking_Payment_API).
 * @param {number} bookingId - The unique identifier of the booking.
 * @returns {Promise<Object>} - Payment-confirmed booking data.
 */
export async function customerBookingPayment(bookingId) {
    if (!bookingId && bookingId !== 0) {
        throw new Error('Booking ID is required');
    }

    const { version, platform } = await getDeviceInfo();
    const token = await AsyncStorage.getItem('token');

    if (!token) {
        const message = 'Unauthenticated: missing token';
        notifyUnauthenticated(message);
        throw new Error(message);
    }

    const variables = {
        booking_id: Number(bookingId),
        version,
        platform: String(platform || '').toUpperCase(),
    };

    try {
        const response = await apiClient(
            CUSTOMER_BOOKING_PAYMENT_MUTATION,
            variables,
            token,
        );

        if (response.errors) {
            throw new Error(
                response.errors.map(error => error.message).join('\n'),
            );
        }

        const root = response?.data?.customer_booking_payment;
        const status = root?.status;
        const message = root?.message;
        const data = root?.data;

        log('[P0104] Parsed response:', {
            status,
            message,
            hasData: !!data,
            bookingId: data?.id,
            bookingCode: data?.code,
            totalPrice: data?.total_price,
        });

        if (status !== 1 || !data) {
            throw new Error(message || 'Failed to confirm booking payment');
        }

        log('[P0104] Booking payment confirmed successfully:', {
            bookingId: data.id,
            bookingCode: data.code,
            totalPrice: data.total_price,
            depositAmount: data.deposit_amount,
            paymentCount: Array.isArray(data.payments)
                ? data.payments.length
                : 0,
        });

        return data;
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error confirming booking payment:', error.message);
        throw new Error('Failed to confirm booking payment: ' + error.message);
    }
}
