import React, {
    useState,
    useMemo,
    useCallback,
    useEffect,
    useRef,
} from 'react';
import {
    StyleSheet,
    View,
    FlatList,
    Text,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import Header from '../../components/Header';
import SearchBar from '../../components/SearchBar';
import RoomItem from '../../components/RoomItem';
import CustomIcon from '../../components/CustomIcon';
import CustomerSearchFilterModal from '../../components/modals/CustomerSearchFilterModal';
import { commonStyles } from '../../theme/commonStyles';
import colors from '../../constants/colors';
import { moderateSize } from '../../styles';
import { fetchCustomerSectionSearch } from '../../services/apiCustomerSectionSearch';
import { formatCurrency } from '../../utils/formatCurrency';

export default function CustomerSearchRoomScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { t, i18n } = useTranslation();
    const currentLanguage = i18n.language;

    // Get initial search query from route params
    const initialSearchQuery = route.params?.searchQuery || '';
    const shouldOpenFilterModal = route.params?.openFilterModal || false;
    const hasTriggeredInitialSearch = useRef(false);
    const searchInputRef = useRef(null);

    const [selectedFilter, setSelectedFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [sections, setSections] = useState([]);
    const [paginatorInfo, setPaginatorInfo] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const DEFAULT_FILTER = useMemo(() => {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const toISO = d => {
            const yyyy = `${d.getFullYear()}`;
            const mm = `${d.getMonth() + 1}`.padStart(2, '0');
            const dd = `${d.getDate()}`.padStart(2, '0');
            return `${yyyy}-${mm}-${dd}`;
        };

        return {
            checkInISO: toISO(today),
            checkOutISO: toISO(tomorrow),
            adults: 2,
            children: 0,
        };
    }, []);

    const [filterVisible, setFilterVisible] = useState(false);
    const [appliedFilter, setAppliedFilter] = useState(DEFAULT_FILTER);
    const [draftFilter, setDraftFilter] = useState(DEFAULT_FILTER);

    // Auto-focus search input when screen mounts (only if not opening filter modal)
    useEffect(() => {
        if (!shouldOpenFilterModal) {
            const timer = setTimeout(() => {
                if (searchInputRef.current) {
                    searchInputRef.current.focus();
                }
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [shouldOpenFilterModal]);

    // Open filter modal if requested from navigation params
    useEffect(() => {
        if (shouldOpenFilterModal) {
            setFilterVisible(true);
        }
    }, [shouldOpenFilterModal]);

    // Map category filter to type_id: 1=Hotel, 2=Apartment, 3=Resort, 'all'=null (get all)
    const getTypeIdFromFilter = useCallback(filter => {
        const typeIdMap = {
            all: null,
            hotel: 1,
            apartment: 2,
            resort: 3,
        };
        return typeIdMap[filter] ?? null;
    }, []);

    const handleBackPress = () => {
        if (navigation.canGoBack()) {
            navigation.goBack();
        } else {
            navigation.navigate('Home');
        }
    };

    const performSearch = useCallback(
        async (
            query,
            typeId = null,
            pageNum = 1,
            isLoadMore = false,
            filter = null,
        ) => {
            try {
                if (!isLoadMore) {
                    setLoading(true);
                } else {
                    setIsLoadingMore(true);
                }
                setError(null);
                const address = query?.trim() ?? '';
                const result = await fetchCustomerSectionSearch({
                    address,
                    type_id: typeId,
                    checkin_date: filter?.checkInISO ?? null,
                    checkout_date: filter?.checkOutISO ?? null,
                    adults: filter?.adults ?? null,
                    children: filter?.children ?? null,
                    page: pageNum,
                    limit: 10,
                    sort_by: 'rating_value',
                    order: 'desc',
                });

                if (isLoadMore) {
                    // Append new sections to existing
                    setSections(prevSections => [
                        ...prevSections,
                        ...(result.sections || []),
                    ]);
                } else {
                    // Reset sections
                    setSections(result.sections || []);
                }
                setPaginatorInfo(result.paginatorInfo);
                setCurrentPage(pageNum);
            } catch (err) {
                console.error('Error searching sections:', err);
                const errorMessage = err.message || 'Failed to search';

                // Check if error is "No sections found" - treat as empty result, not error
                if (
                    errorMessage.toLowerCase().includes('no sections found') ||
                    errorMessage.toLowerCase().includes('no results found')
                ) {
                    if (!isLoadMore) {
                        setSections([]);
                        setPaginatorInfo({
                            total: 0,
                            currentPage: 1,
                            lastPage: 1,
                            perPage: 10,
                        });
                    }
                    setError(null);
                } else {
                    setError(errorMessage);
                    if (!isLoadMore) {
                        setSections([]);
                        setPaginatorInfo(null);
                    }
                }
            } finally {
                if (!isLoadMore) {
                    setLoading(false);
                } else {
                    setIsLoadingMore(false);
                }
            }
        },
        [],
    );

    const loadMore = useCallback(() => {
        if (
            isLoadingMore ||
            !paginatorInfo ||
            paginatorInfo.currentPage >= paginatorInfo.lastPage ||
            sections.length === 0
        ) {
            return;
        }

        const typeId = getTypeIdFromFilter(selectedFilter);
        const nextPage = currentPage + 1;
        performSearch(searchQuery, typeId, nextPage, true, appliedFilter);
    }, [
        isLoadingMore,
        paginatorInfo,
        sections.length,
        currentPage,
        selectedFilter,
        searchQuery,
        appliedFilter,
        getTypeIdFromFilter,
        performSearch,
    ]);

    const resetPagination = useCallback(() => {
        setSections([]);
        setCurrentPage(1);
        setIsLoadingMore(false);
        setPaginatorInfo(null);
    }, []);

    const handleSearch = useCallback(() => {
        resetPagination();
        const typeId = getTypeIdFromFilter(selectedFilter);
        performSearch(searchQuery, typeId, 1, false, appliedFilter);
    }, [
        resetPagination,
        getTypeIdFromFilter,
        performSearch,
        selectedFilter,
        searchQuery,
        appliedFilter,
    ]);

    // Auto-trigger search if initial query is provided from route params (only once on mount)
    useEffect(() => {
        if (initialSearchQuery.trim() && !hasTriggeredInitialSearch.current) {
            hasTriggeredInitialSearch.current = true;
            const timer = setTimeout(() => {
                resetPagination();
                const typeId = getTypeIdFromFilter(selectedFilter);
                performSearch(
                    initialSearchQuery,
                    typeId,
                    1,
                    false,
                    appliedFilter,
                );
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [
        initialSearchQuery,
        selectedFilter,
        appliedFilter,
        getTypeIdFromFilter,
        performSearch,
        resetPagination,
    ]);

    // Re-search when selectedFilter (category tab) changes
    // NOTE: appliedFilter is NOT in dependency array to avoid race condition with applyFilter()
    const appliedFilterRef = useRef(appliedFilter);
    useEffect(() => {
        appliedFilterRef.current = appliedFilter;
    }, [appliedFilter]);

    useEffect(() => {
        resetPagination();
        const typeId = getTypeIdFromFilter(selectedFilter);
        performSearch(
            searchQuery || '',
            typeId,
            1,
            false,
            appliedFilterRef.current,
        );
    }, [selectedFilter, getTypeIdFromFilter, performSearch, resetPagination]); // appliedFilter intentionally excluded - handled by applyFilter()

    const handleRetry = () => {
        handleSearch();
    };

    const openFilter = useCallback(() => {
        setDraftFilter(appliedFilter);
        setFilterVisible(true);
    }, [appliedFilter]);

    const closeFilter = useCallback(() => {
        setFilterVisible(false);
    }, []);

    const applyFilter = useCallback(() => {
        setAppliedFilter(draftFilter);
        setFilterVisible(false);
        // Trigger re-search with new filter values
        resetPagination();
        const typeId = getTypeIdFromFilter(selectedFilter);
        performSearch(searchQuery, typeId, 1, false, draftFilter);
    }, [
        draftFilter,
        resetPagination,
        getTypeIdFromFilter,
        selectedFilter,
        searchQuery,
        performSearch,
    ]);

    // No need for client-side filtering anymore since API handles it via type_id
    const filteredRooms = useMemo(() => {
        return sections;
    }, [sections]);

    const renderCategoryFilters = () => {
        const categories = [
            { key: 'all', label: t('customerSearch.filters.all') },
            { key: 'hotel', label: t('customerSearch.filters.hotel') },
            { key: 'apartment', label: t('customerSearch.filters.apartment') },
            { key: 'resort', label: t('customerSearch.filters.resort') },
        ];

        return (
            <View style={styles.categoryRow}>
                {categories.map(cat => {
                    const isActive = selectedFilter === cat.key;
                    return (
                        <TouchableOpacity
                            key={cat.key}
                            style={[
                                styles.categoryChip,
                                isActive && styles.categoryChipActive,
                            ]}
                            activeOpacity={0.8}
                            onPress={() => {
                                setSelectedFilter(cat.key);
                                // Search will be triggered by useEffect when selectedFilter changes
                            }}>
                            <Text
                                style={[
                                    styles.categoryChipText,
                                    isActive && styles.categoryChipTextActive,
                                ]}>
                                {cat.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        );
    };

    const renderRoomItem = useCallback(
        ({ item }) => {
            const hasPrice = !!item.min_price;
            const priceText = hasPrice ? formatCurrency(item.min_price) : 'N/A';

            const firstImageUrl =
                Array.isArray(item.images) && item.images.length > 0
                    ? item.images[0]?.url
                    : null;

            const room = {
                id: item.id,
                name: item.name,
                address: item.address,
                price: priceText,
                rating: item.rating_value || 0,
                reviews: 0,
                description: item.description,
                images: item.images,
                // RoomItem expects `room.image` (single URL) to render preview image
                image: firstImageUrl,
                min_price: item.min_price,
            };

            return (
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() =>
                        navigation.navigate('CustomerRoomInfo', {
                            room,
                            searchFilter: appliedFilter,
                        })
                    }>
                    <RoomItem room={room} language={currentLanguage} />
                </TouchableOpacity>
            );
        },
        [appliedFilter, currentLanguage, navigation],
    );

    // Error state - show full screen error only if there's an error and no sections
    if (error && sections.length === 0 && !loading) {
        return (
            <SafeAreaView
                edges={['left', 'right', 'bottom']}
                style={styles.container}>
                <Header
                    title={t('customerSearch.title')}
                    showCrudText={false}
                    showHomeIcon={false}
                    onLeftIconPress={handleBackPress}
                />
                <View style={styles.centerContainer}>
                    <CustomIcon
                        type="FontAwesome5"
                        name="exclamation-circle"
                        size={60}
                        color={colors.error || '#FF6B6B'}
                    />
                    <Text style={styles.errorText}>{t('common.error')}</Text>
                    <Text style={styles.errorMessage}>{error}</Text>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={handleRetry}
                        activeOpacity={0.7}>
                        <CustomIcon
                            type="FontAwesome5"
                            name="redo"
                            size={16}
                            color={colors.white}
                            style={styles.retryIcon}
                        />
                        <Text style={styles.retryButtonText}>
                            {t('common.retry')}
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <View style={styles.container}>
            <Header
                title={t('customerSearch.title')}
                showCrudText={false}
                showHomeIcon={false}
                onLeftIconPress={handleBackPress}
                rightIcon="tune"
                rightIconType="MaterialIcons"
                onRightIconPress={openFilter}
            />

            <View style={[commonStyles.main, styles.content]}>
                <View style={styles.searchContainer}>
                    <SearchBar
                        placeholder={t('customerSearch.searchPlaceholder')}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onSubmitEditing={handleSearch}
                        inputRef={searchInputRef}
                    />
                </View>

                {renderCategoryFilters()}

                {sections.length > 0 && paginatorInfo && (
                    <View style={styles.resultsInfo}>
                        <Text style={styles.resultsText}>
                            {t('customerSearch.resultsFound', {
                                count: paginatorInfo.total,
                                defaultValue: `Found ${paginatorInfo.total} results`,
                            })}
                        </Text>
                    </View>
                )}

                {loading && filteredRooms.length === 0 ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator
                            size="large"
                            color={colors.primary}
                        />
                        <Text style={styles.loadingText}>
                            {t('common.loading')}
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        style={styles.list}
                        data={filteredRooms}
                        keyExtractor={item => `room-${item.id}`}
                        renderItem={renderRoomItem}
                        contentContainerStyle={[
                            styles.roomsList,
                            filteredRooms.length === 0 && styles.emptyList,
                        ]}
                        showsVerticalScrollIndicator={false}
                        removeClippedSubviews={false}
                        onEndReached={loadMore}
                        onEndReachedThreshold={0.3}
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
                            searchQuery.trim() ? (
                                <View style={styles.emptyContainer}>
                                    <CustomIcon
                                        type="FontAwesome5"
                                        name="search"
                                        size={60}
                                        color={colors.textSecondary}
                                    />
                                    <Text style={styles.emptyText}>
                                        {t('customerSearch.noResults', {
                                            defaultValue: `No rooms found for "${searchQuery}"`,
                                        })}
                                    </Text>
                                </View>
                            ) : (
                                <View style={styles.emptyContainer}>
                                    <CustomIcon
                                        type="FontAwesome5"
                                        name="map-marker-alt"
                                        size={60}
                                        color={colors.textSecondary}
                                    />
                                    <Text style={styles.emptyText}>
                                        {t('customerSearch.noPopularRooms', {
                                            defaultValue:
                                                'No popular rooms available',
                                        })}
                                    </Text>
                                </View>
                            )
                        }
                    />
                )}
            </View>

            <CustomerSearchFilterModal
                visible={filterVisible}
                filter={draftFilter}
                onChange={setDraftFilter}
                onClose={closeFilter}
                onApply={applyFilter}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
    },
    searchContainer: {
        marginBottom: moderateSize(16),
    },
    categoryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: moderateSize(12),
        columnGap: moderateSize(8),
    },
    categoryChip: {
        paddingVertical: moderateSize(6),
        paddingHorizontal: moderateSize(12),
        borderRadius: moderateSize(16),
        backgroundColor: colors.background,
    },
    categoryChipActive: {
        backgroundColor: colors.primary,
    },
    categoryChipText: {
        fontSize: moderateSize(13),
        color: colors.textPrimary,
        fontWeight: '500',
    },
    categoryChipTextActive: {
        color: colors.white,
        fontWeight: '700',
    },
    list: {
        flex: 1,
    },
    roomsList: {
        paddingBottom: moderateSize(20),
    },
    emptyList: {
        flexGrow: 1,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: moderateSize(100),
    },
    emptyText: {
        fontSize: moderateSize(16),
        color: colors.textSecondary,
        textAlign: 'center',
        marginTop: moderateSize(16),
    },
    resultsInfo: {
        marginBottom: moderateSize(12),
        paddingHorizontal: moderateSize(16),
    },
    resultsText: {
        fontSize: moderateSize(14),
        color: colors.textSecondary,
        fontWeight: '500',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: moderateSize(40),
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: moderateSize(100),
    },
    loadingText: {
        marginTop: moderateSize(16),
        fontSize: moderateSize(16),
        color: colors.textSecondary,
    },
    errorText: {
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
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary,
        paddingVertical: moderateSize(12),
        paddingHorizontal: moderateSize(24),
        borderRadius: moderateSize(8),
    },
    retryIcon: {
        marginRight: moderateSize(8),
    },
    retryButtonText: {
        fontSize: moderateSize(16),
        fontWeight: '600',
        color: colors.white,
    },
    footerLoader: {
        paddingVertical: moderateSize(20),
        alignItems: 'center',
    },
});
