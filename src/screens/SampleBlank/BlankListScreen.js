/**
 * Template: FlatList Screen (Infinite Scroll + Pagination)
 * Header: Header (back button + title)
 * Content: FlatList (infinite scroll)
 */
import React, { useState, useCallback, useRef } from 'react';
import {
    StyleSheet,
    View,
    FlatList,
    Text,
    ActivityIndicator,
    TouchableOpacity,
    RefreshControl,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import MasterPageLayout from '../../components/MasterPageLayout';
import CustomIcon from '../../components/CustomIcon';
import colors from '../../constants/colors';
import { moderateSize } from '../../styles';

export default function BlankListScreen() {
    const { t } = useTranslation();
    const navigation = useNavigation(); // eslint-disable-line no-unused-vars

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [items, setItems] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const isFirstLoad = useRef(true);

    const headerProps = {
        title: 'List Title',
        showCrudText: false,
    };

    // Fetch list from API
    const fetchList = useCallback(
        async (page = 1, isRefresh = false) => {
            try {
                if (page === 1 && !isRefresh) {
                    setLoading(true);
                }
                if (page > 1) {
                    setIsLoadingMore(true);
                }
                setError(null);

                // TODO: Replace with actual API call
                // const result = await fetchSomeListApi({ page, limit: 10 });
                // const newItems = result.data || [];
                // const lastPage = result.paginatorInfo?.lastPage || 1;

                // Simulating API call
                await new Promise(resolve => setTimeout(resolve, 1000));
                const newItems = Array.from({ length: 10 }, (_, i) => ({
                    id: `${page}-${i}`,
                    title: `Item ${(page - 1) * 10 + i + 1}`,
                }));
                const lastPage = 3;

                if (page === 1) {
                    setItems(newItems);
                } else {
                    setItems(prev => [...prev, ...newItems]);
                }
                setCurrentPage(page);
                setHasMore(page < lastPage);
            } catch (err) {
                setError(err.message || t('common.error'));
                if (page === 1) {
                    setItems([]);
                }
            } finally {
                setLoading(false);
                setRefreshing(false);
                setIsLoadingMore(false);
            }
        },
        [t],
    );

    // Fetch on screen focus (first load only)
    useFocusEffect(
        useCallback(() => {
            if (isFirstLoad.current) {
                isFirstLoad.current = false;
                fetchList(1);
            }
        }, [fetchList]),
    );

    const handleRefresh = () => {
        setRefreshing(true);
        fetchList(1, true);
    };

    const handleLoadMore = () => {
        if (!isLoadingMore && hasMore && items.length > 0) {
            fetchList(currentPage + 1);
        }
    };

    // Render list item
    const renderItem = useCallback(
        ({ item }) => (
            <TouchableOpacity
                style={styles.itemCard}
                activeOpacity={0.7}
                onPress={() => {
                    // TODO: Navigate to detail screen
                    // navigation.navigate('DetailScreen', { id: item.id });
                }}>
                <Text style={styles.itemTitle}>{item.title}</Text>
            </TouchableOpacity>
        ),
        [],
    );

    // Loading state (first load)
    if (loading && items.length === 0) {
        return (
            <MasterPageLayout headerType="header" headerProps={headerProps}>
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>
                        {t('common.loading')}
                    </Text>
                </View>
            </MasterPageLayout>
        );
    }

    // Error state (no data)
    if (error && items.length === 0) {
        return (
            <MasterPageLayout headerType="header" headerProps={headerProps}>
                <View style={styles.centerContainer}>
                    <CustomIcon
                        type="FontAwesome5"
                        name="exclamation-circle"
                        size={60}
                        color={colors.error || '#FF6B6B'}
                    />
                    <Text style={styles.errorTitle}>{t('common.error')}</Text>
                    <Text style={styles.errorMessage}>{error}</Text>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={() => fetchList(1)}
                        activeOpacity={0.7}>
                        <Text style={styles.retryButtonText}>
                            {t('common.retry')}
                        </Text>
                    </TouchableOpacity>
                </View>
            </MasterPageLayout>
        );
    }

    // Main list
    return (
        <MasterPageLayout headerType="header" headerProps={headerProps}>
            <FlatList
                data={items}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                contentContainerStyle={[
                    styles.listContent,
                    items.length === 0 && styles.emptyList,
                ]}
                showsVerticalScrollIndicator={false}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.3}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={[colors.primary]}
                        tintColor={colors.primary}
                    />
                }
                ListFooterComponent={() =>
                    isLoadingMore ? (
                        <View style={styles.footerLoader}>
                            <ActivityIndicator
                                size="small"
                                color={colors.primary}
                            />
                        </View>
                    ) : null
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <CustomIcon
                            type="FontAwesome5"
                            name="inbox"
                            size={60}
                            color={colors.textSecondary}
                        />
                        <Text style={styles.emptyText}>
                            {t('common.noData', {
                                defaultValue: 'No data available',
                            })}
                        </Text>
                    </View>
                }
            />
        </MasterPageLayout>
    );
}

const styles = StyleSheet.create({
    listContent: {
        padding: moderateSize(16),
        paddingBottom: moderateSize(30),
    },
    emptyList: {
        flexGrow: 1,
    },

    // Center states
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: moderateSize(40),
    },
    loadingText: {
        marginTop: moderateSize(16),
        fontSize: moderateSize(16),
        color: colors.textSecondary,
    },
    errorTitle: {
        marginTop: moderateSize(16),
        fontSize: moderateSize(20),
        fontWeight: '700',
        color: colors.textPrimary,
    },
    errorMessage: {
        marginTop: moderateSize(8),
        fontSize: moderateSize(14),
        color: colors.textSecondary,
        textAlign: 'center',
    },
    retryButton: {
        marginTop: moderateSize(24),
        backgroundColor: colors.primary,
        paddingVertical: moderateSize(12),
        paddingHorizontal: moderateSize(24),
        borderRadius: moderateSize(8),
    },
    retryButtonText: {
        fontSize: moderateSize(16),
        fontWeight: '600',
        color: colors.white,
    },

    // List item
    itemCard: {
        backgroundColor: colors.white,
        borderRadius: moderateSize(12),
        padding: moderateSize(16),
        marginBottom: moderateSize(12),
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    itemTitle: {
        fontSize: moderateSize(16),
        fontWeight: '600',
        color: colors.textPrimary,
    },

    // Empty & Footer
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: moderateSize(100),
    },
    emptyText: {
        fontSize: moderateSize(16),
        color: colors.textSecondary,
        marginTop: moderateSize(16),
        textAlign: 'center',
    },
    footerLoader: {
        paddingVertical: moderateSize(20),
        alignItems: 'center',
    },
});
