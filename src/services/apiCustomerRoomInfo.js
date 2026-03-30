import apiClient, { notifyUnauthenticated } from './api';
import { getDeviceInfo } from './deviceInfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Fetches detailed information for a specific section (P0102_Customer_Section_Info_API).
 * @param {string} sectionId - The unique ID of the section to retrieve.
 * @param {Object} [options] - Optional availability parameters.
 * @param {string} [options.checkin_date] - Check-in date in YYYY-MM-DD format.
 * @param {string} [options.checkout_date] - Check-out date in YYYY-MM-DD format.
 * @param {number} [options.adults] - Number of adults (default: 1 if dates provided).
 * @param {number} [options.children] - Number of children (default: 0).
 * @returns {Promise<Object>} - The section details with room types and optional availability.
 */
export async function fetchCustomerRoomInfo(sectionId, options = {}) {
    const { version, platform } = await getDeviceInfo();
    console.log('Fetch Customer Section Info Params:', {
        sectionId,
        version,
        platform,
        options,
    });

    const query = `
        query P0102_Customer_Section_Info_API($section_id: Int!, $version: String!, $platform: String!, $checkin_date: String, $checkout_date: String, $adults: Int, $children: Int) {
            customer_section_info(
                section_id: $section_id
                version: $version
                platform: $platform
                checkin_date: $checkin_date
                checkout_date: $checkout_date
                adults: $adults
                children: $children
            ) {
                status
                message
                data {
                    id
                    name
                    code
                    address
                    postal_code
                    ward
                    building
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
                    available_rooms
                    company {
                        id
                        name
                        phone
                        email
                    }
                    images {
                        id
                        url
                        order
                        alt_text
                        title
                    }
                    room_types {
                        id
                        name
                        code
                        description
                        price
                        bed_count
                        max_guests
                        area
                        amenities
                        available_rooms
                        images {
                            id
                            url
                            order
                            alt_text
                            title
                        }
                    }
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
        section_id: parseInt(sectionId, 10),
        version,
        platform: platform.toUpperCase(),
    };

    // Only add optional availability params if they exist
    if (options.checkin_date) {
        variables.checkin_date = options.checkin_date;
    }
    if (options.checkout_date) {
        variables.checkout_date = options.checkout_date;
    }
    if (options.adults !== undefined) {
        variables.adults = Number(options.adults);
    }
    if (options.children !== undefined) {
        variables.children = Number(options.children);
    }

    const hasAvailabilityParams = !!(
        options.checkin_date &&
        options.checkout_date &&
        options.adults !== undefined &&
        options.children !== undefined
    );

    try {
        const response = await apiClient(query, variables, token);

        if (response.errors) {
            throw new Error(
                response.errors.map(error => error.message).join('\n'),
            );
        }

        const { status, message, data } = response.data.customer_section_info;

        console.log('Customer Section Info Response:', {
            status,
            message,
            hasAvailability: hasAvailabilityParams,
            data,
        });

        // Log room_type available_rooms as requested
        if (data && data.room_types) {
            console.log(
                'Room Types Available Rooms:',
                data.room_types.map(room_type => ({
                    id: room_type.id,
                    name: room_type.name,
                    available_rooms: room_type.available_rooms,
                })),
            );
        }

        if (status !== 1) {
            throw new Error(`Error fetching section info: ${message}`);
        }

        data.hasAvailability = hasAvailabilityParams;
        return data;
    } catch (error) {
        console.error('Error fetching customer section info:', error.message);
        throw new Error(
            'Failed to fetch customer section info: ' + error.message,
        );
    }
}
