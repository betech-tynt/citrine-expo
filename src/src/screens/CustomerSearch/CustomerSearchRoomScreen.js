import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
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

export default function CustomerSearchRoomScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { t, i18n } = useTranslation();
    const currentLanguage = i18n.language;

    // Get initial search query from route params
    const initialSearchQuery = route.params?.searchQuery || '';
    const hasTriggeredInitialSearch = useRef(false);

    const [selectedFilter, setSelectedFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [sections, setSections] = useState([]);
    const [paginatorInfo, setPaginatorInfo] = useState(null);

    const DEFAULT_FILTER = useMemo(() => {
        return {
            checkInISO: '',
            checkOutISO: '',
            adults: 2,
            children: 0,
        };
    }, []);

    const [filterVisible, setFilterVisible] = useState(false);
    const [appliedFilter, setAppliedFilter] = useState(DEFAULT_FILTER);
    const [draftFilter, setDraftFilter] = useState(DEFAULT_FILTER);

    // Map category filter to type_id: 1=Hotel, 2=Apartment, 3=Resort, 'all'=null (get all)
    const getTypeIdFromFilter = useCallback((filter) => {
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

    const performSearch = useCallback(async (query, typeId = null) => {
        if (!query || !query.trim()) {
            setSections([]);
            setPaginatorInfo(null);
            setError(null);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const result = await fetchCustomerSectionSearch({
                address: query.trim(),
                type_id: typeId,
                page: 1,
                limit: 10,
                sort_by: 'rating_value',
                order: 'desc',
            });
            setSections(result.sections || []);
            setPaginatorInfo(result.paginatorInfo);
            // Clear error if search was successful
            setError(null);
        } catch (err) {
            console.error('Error searching sections:', err);
            const errorMessage = err.message || 'Failed to search';

            // Check if error is "No sections found" - treat as empty result, not error
            if (
                errorMessage.toLowerCase().includes('no sections found') ||
                errorMessage.toLowerCase().includes('no results found')
            ) {
                setSections([]);
                setPaginatorInfo({
                    total: 0,
                    currentPage: 1,
                    lastPage: 1,
                    perPage: 10,
                });
                setError(null); // Don't show error for empty results
            } else {
                // Real error occurred
                setError(errorMessage);
                setSections([]);
                setPaginatorInfo(null);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    const handleSearch = useCallback(() => {
        const typeId = getTypeIdFromFilter(selectedFilter);
        performSearch(searchQuery, typeId);
    }, [searchQuery, selectedFilter, performSearch, getTypeIdFromFilter]);

    // Auto-trigger search if initial query is provided from route params (only once on mount)
    useEffect(() => {
        if (initialSearchQuery.trim() && !hasTriggeredInitialSearch.current) {
            hasTriggeredInitialSearch.current = true;
            // Trigger search directly with the initial query
            // Use setTimeout to ensure state is properly initialized
            const timer = setTimeout(() => {
                const typeId = getTypeIdFromFilter(selectedFilter);
                performSearch(initialSearchQuery, typeId);
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [initialSearchQuery, selectedFilter, getTypeIdFromFilter, performSearch]);

    // Re-search when filter changes (if there's already a search query)
    useEffect(() => {
        if (searchQuery.trim() && hasTriggeredInitialSearch.current) {
            const typeId = getTypeIdFromFilter(selectedFilter);
            performSearch(searchQuery, typeId);
        }
    }, [selectedFilter, searchQuery, getTypeIdFromFilter, performSearch]);

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
        // UI-only per requirement: currently does not change API request
    }, [draftFilter]);

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
            const priceText = hasPrice
                ? `${item.min_price.toLocaleString()}đ`
                : 'N/A';

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
                    onPress={() => navigation.navigate('CustomerRoomInfo', { room })}>
                    <RoomItem room={room} language={currentLanguage} />
                </TouchableOpacity>
            );
        },
        [currentLanguage, navigation],
    );

    // Error state - show full screen error only if there's an error and no sections
    if (error && sections.length === 0 && !loading) {
        return (
            <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.container}>
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
                    <Text style={styles.errorText}>
                        {t('common.error')}
                    </Text>
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
                                            defaultValue: 'No rooms found',
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
                                        {t('customerSearch.inputAddress', {
                                            defaultValue:
                                                'Enter an address to search',
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
});
