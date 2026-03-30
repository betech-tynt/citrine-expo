import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SplashScreen from '../../components/Splash';
import colors from '../../constants/colors';
import { moderateSize } from '../../styles/moderateSize';
import { fetchSectionReviewSummary } from '../../services/apiCustomerSectionReviewSummary';
import { fetchCustomerReviewList } from '../../services/apiCustomerReviewList';
import { formatDate } from '../../utils/formatDate';
import { log } from '../../utils/handleLog';
import ChildrenLayout from '../../components/ChildrenLayout';
import ReviewCard from './components/ReviewCard';
import SummaryCard from './components/SummaryCard';
import FilterChips from './components/FilterChips';
import EmptyState from './components/EmptyState';

const PAGE_LIMIT = 10;

// Maps a filter key to API query params for fetchCustomerReviewList
const filterToParams = filter => {
    const star = Number(filter);
    if (star >= 1 && star <= 5) {
        return { star };
    }
    if (filter === 'helpful') {
        return { isHelpful: true, sortBy: 'helpful_vote_count', order: 'desc' };
    }
    return {};
};

// Maps P0406 API response to summary card data shape
const mapSummary = apiData => ({
    overallRating: apiData.average_rating || 0,
    reviewCount: apiData.total_reviews || 0,
    breakdown: (apiData.rating_breakdown || []).map(item => ({
        id: item.type_id,
        name: item.name,
        icon: item.icon,
        score: item.score || 0,
    })),
});

// Maps a single P0401 review item to review card data shape
const mapReview = (apiItem, userId) => ({
    id: String(apiItem.id),
    reviewerName: apiItem.customer?.name || '',
    roomTypes: apiItem.room_types || [],
    averageRating: apiItem.average_rating || 0,
    criteria: apiItem.ratings || [],
    comment: apiItem.comment || '',
    helpfulCount: apiItem.helpful_vote_count || 0,
    voted:
        apiItem.votes?.some(
            v => Number(v.customer?.user_id) === Number(userId),
        ) || false,
    date: formatDate(apiItem.created_at),
});

export default function SectionRatingScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { t } = useTranslation();

    const sectionId = parseInt(route.params?.sectionId, 10);
    const mountedRef = useRef(true);

    const [activeFilter, setActiveFilter] = useState('all');
    const [summary, setSummary] = useState(null);
    const [summaryLoading, setSummaryLoading] = useState(true);
    const [summaryError, setSummaryError] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [reviewsError, setReviewsError] = useState(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);

    // Track mount state to prevent setState after unmount
    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);

    // Load summary once on mount (P0406)
    useEffect(() => {
        if (!sectionId) return;
        setSummaryLoading(true);
        setSummaryError(null);
        fetchSectionReviewSummary(sectionId)
            .then(data => {
                if (mountedRef.current) setSummary(mapSummary(data));
            })
            .catch(err => {
                if (mountedRef.current)
                    setSummaryError(err?.message || t('common.error'));
            })
            .finally(() => {
                if (mountedRef.current) setSummaryLoading(false);
            });
    }, [sectionId, t]);

    // Fetches reviews for the given filter and page
    const loadReviews = useCallback(
        async (filter, pageNum, append) => {
            setReviewsLoading(true);
            if (!append) setReviewsError(null);
            const filterParams = filterToParams(filter);

            try {
                // Get current user ID to correctly map the "voted" status
                const customerStr = await AsyncStorage.getItem('customerUser');

                let userId = null;
                if (customerStr) {
                    try {
                        const parsed = JSON.parse(customerStr);
                        userId = Number(parsed?.id);
                    } catch (e) {
                        // ignore parsing error
                    }
                }

                const result = await fetchCustomerReviewList({
                    sectionId,
                    ...filterParams,
                    page: pageNum,
                    limit: PAGE_LIMIT,
                });

                if (!mountedRef.current) return;

                const mapped = result.reviews.map(item =>
                    mapReview(item, userId),
                );
                setReviews(prev => (append ? [...prev, ...mapped] : mapped));

                // Update pagination state
                setPage(result.paginatorInfo.currentPage);
                setHasMore(
                    result.paginatorInfo.currentPage <
                        result.paginatorInfo.lastPage,
                );
            } catch (err) {
                if (mountedRef.current) {
                    log('Error fetching reviews:', err.message || err);
                    setReviewsError(t('common.error'));
                }
            } finally {
                if (mountedRef.current) setReviewsLoading(false);
            }
        },
        [sectionId, t],
    );

    // Load first page of reviews on mount
    useEffect(() => {
        if (!sectionId) return;
        loadReviews('all', 1, false);
    }, [sectionId, loadReviews]);

    // Resets the review list and reloads with the selected filter
    const handleFilterPress = filter => {
        if (filter === activeFilter) return;
        setActiveFilter(filter);
        setReviews([]);
        setPage(1);
        setHasMore(false);
        loadReviews(filter, 1, false);
    };

    // Loads the next page when the user scrolls near the bottom
    const handleLoadMore = () => {
        if (!hasMore || reviewsLoading) return;
        loadReviews(activeFilter, page + 1, true);
    };

    const handleBackPress = () => {
        if (navigation.canGoBack()) navigation.goBack();
    };

    // FlatList header: summary card + filter chips
    const renderListHeader = () => (
        <View>
            <SummaryCard
                loading={summaryLoading}
                error={summaryError}
                summary={summary}
                t={t}
            />
            <FilterChips
                activeFilter={activeFilter}
                onFilterPress={handleFilterPress}
                t={t}
            />
        </View>
    );

    // FlatList footer: spinner while loading more pages
    const renderListFooter = () => {
        if (!reviewsLoading) return null;
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    };

    const screenTitle = t('sectionRating.title');

    // Initial load: show full-screen splash before any data is ready
    if (summaryLoading && reviews.length === 0) {
        return (
            <ChildrenLayout
                headerType="header"
                headerProps={{
                    title: screenTitle,
                    onLeftIconPress: handleBackPress,
                }}>
                <SplashScreen />
            </ChildrenLayout>
        );
    }

    // Main content
    return (
        <ChildrenLayout
            headerType="header"
            headerProps={{
                title: screenTitle,
                onLeftIconPress: handleBackPress,
            }}>
            <FlatList
                style={styles.flatList}
                contentContainerStyle={styles.scrollContent}
                data={reviews}
                keyExtractor={item => item.id}
                renderItem={({ item }) => <ReviewCard item={item} t={t} />}
                ListHeaderComponent={renderListHeader}
                ListFooterComponent={renderListFooter}
                ListEmptyComponent={
                    <EmptyState
                        loading={reviewsLoading}
                        error={reviewsError}
                        t={t}
                    />
                }
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.2}
                showsVerticalScrollIndicator={false}
            />
        </ChildrenLayout>
    );
}

const styles = StyleSheet.create({
    flatList: {
        flex: 1,
        backgroundColor: colors.backgroundSecondary,
    },
    scrollContent: {
        paddingTop: moderateSize(16),
        paddingHorizontal: moderateSize(16),
        paddingBottom: moderateSize(30),
    },
    separator: {
        height: moderateSize(12),
    },
    loadingContainer: {
        paddingVertical: moderateSize(40),
        alignItems: 'center',
    },
});
