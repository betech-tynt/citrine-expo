import apiClient, { notifyUnauthenticated } from './api';
import { getDeviceInfo } from './deviceInfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { log } from '../utils/handleLog';

const CUSTOMER_REVIEW_VOTE_MUTATION = `
    mutation P0405_Customer_Review_Vote_API(
        $review_id: Int!
        $version: String!
        $platform: String!
    ) {
        customer_review_vote(
            review_id: $review_id
            version: $version
            platform: $platform
        ) {
            status
            message
            data {
                voted
                count
            }
        }
    }
`;

/**
 * Toggle vote (helpful) for a customer review.
 * Calls P0405 mutation — first call = vote, second call = unvote.
 *
 * @param {number|string} reviewId - The review ID to vote/unvote.
 * @returns {Promise<{ voted: boolean, count: number }>}
 */
export async function customerReviewVote(reviewId) {
    if (!reviewId && reviewId !== 0) {
        throw new Error('Review ID is required');
    }

    const { version, platform } = await getDeviceInfo();
    const token = await AsyncStorage.getItem('token');

    if (!token) {
        const message = 'Unauthenticated: missing token';
        notifyUnauthenticated(message);
        throw new Error(message);
    }

    const variables = {
        review_id: Number(reviewId),
        version,
        platform: String(platform || '').toUpperCase(),
    };

    try {
        const response = await apiClient(
            CUSTOMER_REVIEW_VOTE_MUTATION,
            variables,
            token,
        );

        if (response.errors) {
            throw new Error(
                response.errors.map(error => error.message).join('\n'),
            );
        }

        const root = response?.data?.customer_review_vote;
        const status = root?.status;
        const message = root?.message;
        const data = root?.data;

        log('[P0405] Parsed response:', {
            status,
            message,
            voted: data?.voted,
            count: data?.count,
        });

        if (status !== 1 || !data) {
            throw new Error(message || 'Failed to vote review');
        }

        log('[P0405] Review vote toggled successfully:', {
            reviewId,
            voted: data.voted,
            count: data.count,
        });

        return {
            voted: data.voted,
            count: data.count,
        };
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error voting customer review:', error.message);
        throw new Error('Failed to vote review: ' + error.message);
    }
}
