import apiClient, { notifyUnauthenticated } from './api';
import { getDeviceInfo } from './deviceInfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Fetches detailed information for a specific section (P0102_Customer_Section_Info_API).
 * @param {string} sectionId - The unique ID of the section to retrieve.
 * @returns {Promise<Object>} - The section details with room types.
 */
export async function fetchCustomerRoomInfo(sectionId) {
    const { version, platform } = await getDeviceInfo();
    console.log('Fetch Customer Section Info Params:', {
        sectionId,
        version,
        platform,
    });

    const query = `
        query P0102_Customer_Section_Info_API($section_id: Int!, $version: String!, $platform: String!) {
            customer_section_info(
                section_id: $section_id,
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

    try {
        const response = await apiClient(query, variables, token);

        if (response.errors) {
            throw new Error(response.errors.map((error) => error.message).join('\n'));
        }

        const { status, message, data } = response.data.customer_section_info;

        console.log('Customer Section Info Response:', {
            status,
            message,
            data,
        });

        if (status !== 1) {
            throw new Error(`Error fetching section info: ${message}`);
        }

        return data;
    } catch (error) {
        console.error('Error fetching customer section info:', error.message);
        throw new Error('Failed to fetch customer section info: ' + error.message);
    }
}
