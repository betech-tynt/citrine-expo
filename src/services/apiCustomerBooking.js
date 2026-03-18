import apiClient, { notifyUnauthenticated } from './api';
import { getDeviceInfo } from './deviceInfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { log } from '../utils/handleLog';

const CUSTOMER_BOOKING_MUTATION = `
    mutation P0103_Customer_Booking_API(
        $section_id: Int!
        $start: String!
        $end: String!
        $booking_details: [CustomerBookingCreateDetailInput!]!
        $special_requests: String
        $version: String!
        $platform: String!
        $guest_count: GuestCountInput!
    ) {
        customer_booking_create(
            section_id: $section_id
            start: $start
            end: $end
            booking_details: $booking_details
            special_requests: $special_requests
            version: $version
            platform: $platform
            guest_count: $guest_count
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
 * Create a new customer booking (P0103_Customer_Booking_API)
 * @param {Object} booking - Normalized booking payload for backend.
 * @returns {Promise<Object>} - Created booking data (id, total_price, etc.).
 */
export async function createCustomerBooking(booking) {
    if (!booking || typeof booking !== 'object') {
        throw new Error('Booking payload is required');
    }

    const { version, platform } = await getDeviceInfo();
    const token = await AsyncStorage.getItem('token');

    if (!token) {
        const message = 'Unauthenticated: missing token';
        notifyUnauthenticated(message);
        throw new Error(message);
    }

    const variables = {
        section_id: Number(booking.section_id),
        start: booking.start,
        end: booking.end,
        booking_details: booking.booking_details,
        guest_count: booking.guest_count,
        special_requests: booking.special_requests || null,
        version,
        platform: String(platform || '').toUpperCase(),
    };

    try {
        const response = await apiClient(
            CUSTOMER_BOOKING_MUTATION,
            variables,
            token,
        );

        if (response.errors) {
            throw new Error(
                response.errors.map(error => error.message).join('\n'),
            );
        }

        const root = response.data?.customer_booking_create;
        const status = root?.status;
        const message = root?.message;
        const data = root?.data;

        log('[P0103] Parsed response:', {
            status,
            message,
            hasData: !!data,
            bookingId: data?.id,
            bookingCode: data?.code,
            totalPrice: data?.total_price,
        });

        if (status !== 1 || !data) {
            throw new Error(message || 'Failed to create booking');
        }

        log('[P0103] Booking created successfully:', {
            bookingId: data.id,
            bookingCode: data.code,
            totalPrice: data.total_price,
            depositAmount: data.deposit_amount,
            guestCount: data.guest_count,
            sectionName: data.section?.name,
        });

        return data;
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error creating customer booking:', error.message);
        throw new Error('Failed to create booking: ' + error.message);
    }
}
