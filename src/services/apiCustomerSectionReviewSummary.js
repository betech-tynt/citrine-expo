import apiClient, { notifyUnauthenticated } from './api';
import { getDeviceInfo } from './deviceInfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

const QUERY = `
    query P0406_Section_Review_Summary(
        $section_id: Int!
        $version: String!
        $platform: String!
    ) {
        customer_section_review_summary(
            section_id: $section_id
            version: $version
            platform: $platform
        ) {
            status
            message
            data {
                average_rating
                total_reviews
                rating_breakdown {
                    type_id
                    name
                    icon
                    score
                }
            }
        }
    }
`;

/**
 * Fetches aggregated review summary for a section (P0406).
 * @param {number} sectionId
 * @returns {Promise<{average_rating: number, total_reviews: number, rating_breakdown: Array}>}
 */
export async function fetchSectionReviewSummary(sectionId) {
    const { version, platform } = await getDeviceInfo();
    const token = await AsyncStorage.getItem('token');

    if (!token) {
        const message = 'Unauthenticated: missing token';
        notifyUnauthenticated(message);
        throw new Error(message);
    }

    const variables = {
        section_id: sectionId,
        version,
        platform: platform.toUpperCase(),
    };

    const response = await apiClient(QUERY, variables, token);

    if (response.errors) {
        throw new Error(response.errors.map(error => error.message).join('\n'));
    }

    const { status, message, data } =
        response.data.customer_section_review_summary;

    if (status !== 1 || !data) {
        throw new Error(message || 'Failed to fetch review summary');
    }

    return data;
}
