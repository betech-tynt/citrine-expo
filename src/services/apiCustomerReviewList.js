import apiClient, { notifyUnauthenticated } from './api';
import { getDeviceInfo } from './deviceInfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

const QUERY = `
    query P0401_Customer_Review_List(
        $section_id: Int
        $star: Int
        $is_helpful: Boolean
        $sort_by: String
        $order: String
        $page: Int
        $limit: Int
        $version: String!
        $platform: String!
    ) {
        customer_review_list(
            section_id: $section_id
            star: $star
            is_helpful: $is_helpful
            sort_by: $sort_by
            order: $order
            page: $page
            limit: $limit
            version: $version
            platform: $platform
        ) {
            status
            message
            data {
                id
                average_rating
                comment
                helpful_vote_count
                created_at
                ratings {
                    id
                    name
                    icon
                    value
                }
                customer {
                    id
                    name
                }
                room_types {
                    id
                    name
                }
                is_helpful
                votes {
                    id
                    customer {
                        user_id
                    }
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
 * Fetches paginated list of customer reviews for a section (P0401).
 * @param {object} params
 * @param {number} params.sectionId
 * @param {number} [params.star] - Filter by star rating (1-5)
 * @param {string} [params.sortBy] - Sort field
 * @param {string} [params.order] - 'asc' | 'desc'
 * @param {number} [params.page=1]
 * @param {number} [params.limit=10]
 * @returns {Promise<{reviews: Array, paginatorInfo: object}>}
 */
export async function fetchCustomerReviewList({
    sectionId,
    star,
    isHelpful,
    sortBy,
    order,
    page = 1,
    limit = 10,
}) {
    const { version, platform } = await getDeviceInfo();
    const token = await AsyncStorage.getItem('token');

    if (!token) {
        const message = 'Unauthenticated: missing token';
        notifyUnauthenticated(message);
        throw new Error(message);
    }

    const variables = {
        section_id: sectionId,
        star,
        is_helpful: isHelpful,
        sort_by: sortBy,
        order,
        page,
        limit,
        version,
        platform: platform.toUpperCase(),
    };

    const response = await apiClient(QUERY, variables, token);

    if (response.errors) {
        throw new Error(response.errors.map(error => error.message).join('\n'));
    }

    const { status, message, data, paginatorInfo } =
        response.data.customer_review_list;

    if (status !== 1) {
        throw new Error(message || 'Failed to fetch reviews');
    }

    return {
        reviews: data || [],
        paginatorInfo: paginatorInfo || {
            total: 0,
            currentPage: page,
            lastPage: page,
            perPage: limit,
        },
    };
}
