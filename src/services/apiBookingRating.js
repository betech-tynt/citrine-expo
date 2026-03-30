import apiClient, { notifyUnauthenticated } from './api';
import { getDeviceInfo } from './deviceInfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CUSTOMER_REVIEW_TYPE_LIST_QUERY = `
    query P0402_Customer_Review_Type_List(
        $version: String!
        $platform: String!
    ) {
        customer_review_type_list(
            version: $version
            platform: $platform
        ) {
            status
            message
            data {
                id
                name
                icon
                status
            }
        }
    }
`;

const CUSTOMER_REVIEW_LIST_QUERY = `
    query P0401_Customer_Review_List(
        $booking_id: Int
        $version: String!
        $platform: String!
    ) {
        customer_review_list(
            booking_id: $booking_id
            version: $version
            platform: $platform
        ) {
            status
            message
            data {
                id
                booking_id
                comment
                average_rating
                ratings {
                    id
                    name
                    icon
                    value
                }
            }
        }
    }
`;

/**
 * Fetch active review type list (P0402_Customer_Review_Type_List_API).
 * Ref: https://github.com/betech-citrine/citrine/issues/94#issuecomment-4091238667
 * @returns {Promise<Array<{id: number, name: string, icon: string}>>}
 */
export async function fetchBookingRatingCriteria() {
    const { version, platform } = await getDeviceInfo();
    const token = await AsyncStorage.getItem('token');
    if (!token) {
        const message = 'Unauthenticated: missing token';
        notifyUnauthenticated(message);
        throw new Error(message);
    }

    const variables = { version, platform: platform.toUpperCase() };
    const response = await apiClient(
        CUSTOMER_REVIEW_TYPE_LIST_QUERY,
        variables,
        token,
    );
    // Error handling
    if (response.errors) {
        throw new Error(response.errors.map(e => e.message).join('\n'));
    }
    // Validate response structure and status
    const { status, message, data } = response.data.customer_review_type_list;
    if (status !== 1 || !data) {
        throw new Error(message || 'Failed to fetch review types');
    }

    return data.map(item => ({
        id: item.id,
        name: item.name,
        icon: item.icon || '',
    }));
}

/**
 * Fetch existing review for a booking (P0401_Customer_Review_List_API).
 * Ref: https://github.com/betech-citrine/citrine/issues/94#issuecomment-4064988530
 * Returns the first review found, or null if none.
 * @param {number} bookingId
 * @returns {Promise<Object|null>}
 */
export async function fetchBookingReview(bookingId) {
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
        platform: platform.toUpperCase(),
    };

    const response = await apiClient(
        CUSTOMER_REVIEW_LIST_QUERY,
        variables,
        token,
    );

    if (response.errors) {
        throw new Error(response.errors.map(e => e.message).join('\n'));
    }

    const { status, message, data } = response.data.customer_review_list;

    if (status !== 1) {
        throw new Error(message || 'Failed to fetch reviews');
    }

    if (!data || data.length === 0) {
        return null;
    }

    return data[0];
}

const CUSTOMER_REVIEW_CREATE_MUTATION = `
    mutation P0403_Customer_Review_Create(
        $booking_id: Int!
        $rating_value: String
        $comment: String
        $version: String!
        $platform: String!
    ) {
        customer_review_create(
            booking_id: $booking_id
            rating_value: $rating_value
            comment: $comment
            version: $version
            platform: $platform
        ) {
            status
            message
            data {
                id
                booking_id
                average_rating
                comment
                ratings {
                    id
                    name
                    icon
                    value
                }
            }
        }
    }
`;

const CUSTOMER_REVIEW_UPDATE_MUTATION = `
    mutation P0404_Customer_Review_Update(
        $id: Int!
        $rating_value: String
        $comment: String
        $version: String!
        $platform: String!
    ) {
        customer_review_update(
            id: $id
            rating_value: $rating_value
            comment: $comment
            version: $version
            platform: $platform
        ) {
            status
            message
            data {
                id
                booking_id
                average_rating
                comment
                ratings {
                    id
                    name
                    icon
                    value
                }
            }
        }
    }
`;

/**
 * Submit booking rating — creates a new review (P0403) or updates an existing one (P0404).
 * Ref P0403: https://github.com/betech-citrine/citrine/issues/94#issuecomment-4064988624
 * Ref P0404: https://github.com/betech-citrine/citrine/issues/94#issuecomment-4064988685
 * @param {number} bookingId
 * @param {Array<{criteria_id: string|number, value: number}>} ratings
 * @param {string} comment
 * @param {number|null} reviewId - If provided, updates existing review (P0404); otherwise creates new (P0403).
 * @returns {Promise<Object>} - The created/updated review data.
 */
export async function submitBookingRating(
    bookingId,
    ratings,
    comment,
    reviewId,
) {
    const { version, platform } = await getDeviceInfo();
    const token = await AsyncStorage.getItem('token');

    if (!token) {
        const message = 'Unauthenticated: missing token';
        notifyUnauthenticated(message);
        throw new Error(message);
    }

    const ratingValueMap = {};
    ratings.forEach(rating => {
        ratingValueMap[rating.criteria_id] = rating.value;
    });
    const ratingValueJson = JSON.stringify(ratingValueMap);

    const isUpdate = !!reviewId;
    const mutation = isUpdate
        ? CUSTOMER_REVIEW_UPDATE_MUTATION
        : CUSTOMER_REVIEW_CREATE_MUTATION;

    const variables = isUpdate
        ? {
              id: Number(reviewId),
              rating_value: ratingValueJson,
              comment: comment || null,
              version,
              platform: platform.toUpperCase(),
          }
        : {
              booking_id: Number(bookingId),
              rating_value: ratingValueJson,
              comment: comment || null,
              version,
              platform: platform.toUpperCase(),
          };

    const response = await apiClient(mutation, variables, token);

    if (response.errors) {
        throw new Error(response.errors.map(error => error.message).join('\n'));
    }

    const root = isUpdate
        ? response.data?.customer_review_update
        : response.data?.customer_review_create;
    const { status, message, data } = root;

    if (status !== 1) {
        throw new Error(message || 'Failed to submit review');
    }

    return { status, data, message };
}
