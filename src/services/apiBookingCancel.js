import apiClient, { notifyUnauthenticated } from './api';
import { getDeviceInfo } from './deviceInfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { log } from '../utils/handleLog';

const CUSTOMER_BOOKING_CANCEL_MUTATION = `
    mutation P0105_Customer_Booking_Cancel_API(
        $booking_id: Int!
        $cancel_reason: String!
        $version: String!
        $platform: String!
    ) {
        customer_booking_cancel(
            booking_id: $booking_id
            cancel_reason: $cancel_reason
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

export async function customerBookingCancel(bookingId, cancelReason) {
    if (!bookingId && bookingId !== 0) {
        throw new Error('Booking ID is required');
    }

    if (!String(cancelReason || '').trim()) {
        throw new Error('Cancel reason is required');
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
        cancel_reason: String(cancelReason).trim(),
        version,
        platform: String(platform || '').toUpperCase(),
    };

    try {
        const response = await apiClient(
            CUSTOMER_BOOKING_CANCEL_MUTATION,
            variables,
            token,
        );

        if (response.errors) {
            throw new Error(
                response.errors.map(error => error.message).join('\n'),
            );
        }

        const root = response?.data?.customer_booking_cancel;
        const status = root?.status;
        const message = root?.message;
        const data = root?.data;

        log('[P0105] Parsed response:', {
            status,
            message,
            hasData: !!data,
            bookingId: data?.id,
            bookingCode: data?.code,
            bookingStatus: data?.status,
        });

        if (status !== 1 || !data) {
            throw new Error(message || 'Failed to cancel booking');
        }

        log('[P0105] Booking cancelled successfully:', {
            bookingId: data.id,
            bookingCode: data.code,
            cancelReason: data.cancel_reason,
            status: data.status,
        });

        return data;
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error cancelling customer booking:', error.message);
        throw new Error('Failed to cancel booking: ' + error.message);
    }
}
