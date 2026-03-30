// s100_customer_home
import React, { useState, useEffect, useCallback } from 'react';
import {
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import ParentLayout from '../../components/ParentLayout';
import SearchBar from '../../components/SearchBar';
import { moderateSize } from '../../styles/moderateSize';
import CustomIcon from '../../components/CustomIcon';
import colors from '../../constants/colors';
import {
    PromotionCardPropTypes,
    LodgingCardPropTypes,
} from '../../utils/propTypes';
import { Image } from 'react-native';
import { fetchCustomerHomeData } from '../../services/apiCustomerHome';
import StarRating from '../../components/StarRating';
import { formatCurrency } from '../../utils/formatCurrency';
import { isAuthError } from '../../utils/authErrorHandler';

const MOCK_PROMOTIONS = [
    {
        id: '1',
        badgeKey: 'msg000560',
        titleKey: 'msg000566',
        descriptionKey: 'msg000572',
        valueKey: 'msg000578',
        conditionKeys: ['msg000584'],
        type: 'PERCENTAGE',
    },
    {
        id: '2',
        badgeKey: 'msg000561',
        titleKey: 'msg000567',
        descriptionKey: 'msg000573',
        valueKey: 'msg000579',
        conditionKeys: ['msg000585', 'msg000591'],
        type: 'PERCENTAGE',
    },
    {
        id: '3',
        badgeKey: 'msg000562',
        titleKey: 'msg000568',
        descriptionKey: 'msg000574',
        valueKey: 'msg000580',
        conditionKeys: ['msg000586'],
        type: 'FIXED_AMOUNT',
    },
    {
        id: '4',
        badgeKey: 'msg000563',
        titleKey: 'msg000569',
        descriptionKey: 'msg000575',
        valueKey: 'msg000581',
        conditionKeys: ['msg000587'],
        type: 'BUY_MORE_SAVE_MORE',
    },
    {
        id: '5',
        badgeKey: 'msg000564',
        titleKey: 'msg000570',
        descriptionKey: 'msg000576',
        valueKey: 'msg000582',
        conditionKeys: ['msg000588', 'msg000594'],
        type: 'SEASONAL',
    },
    {
        id: '6',
        badgeKey: 'msg000565',
        titleKey: 'msg000571',
        descriptionKey: 'msg000577',
        valueKey: 'msg000583',
        conditionKeys: ['msg000589'],
        type: 'LOYALTY',
    },
];

const LodgingCard = ({
    name,
    price,
    priceLabel,
    rating,
    coverImage,
    onPress,
}) => {
    return (
        <TouchableOpacity
            style={styles.lodgingCard}
            onPress={onPress}
            activeOpacity={0.7}>
            {coverImage ? (
                <Image
                    source={{ uri: coverImage }}
                    style={styles.lodgingImage}
                    resizeMode="cover"
                />
            ) : (
                <View style={styles.lodgingImagePlaceholder} />
            )}
            <Text style={styles.lodgingName}>{name}</Text>
            <View style={styles.priceContainer}>
                <Text style={styles.lodgingPrice}>{price}</Text>
                {priceLabel ? (
                    <Text style={styles.pricePerNightLabel}>{priceLabel}</Text>
                ) : null}
            </View>
            <StarRating rating={rating} />
        </TouchableOpacity>
    );
};

const PromotionCard = ({
    badge,
    title,
    description,
    value,
    conditions,
    type,
    t,
}) => {
    const getPromotionStyles = () => {
        const baseStyles = {
            borderRadius: moderateSize(15),
            padding: moderateSize(15),
            minWidth: moderateSize(280),
            flex: null,
            marginRight: moderateSize(15),
        };

        switch (type) {
            case 'PERCENTAGE':
                return {
                    ...baseStyles,
                    backgroundColor: '#4A44C4',
                };
            case 'FIXED_AMOUNT':
                return {
                    ...baseStyles,
                    backgroundColor: '#FF6B6B',
                };
            case 'BUY_MORE_SAVE_MORE':
                return {
                    ...baseStyles,
                    backgroundColor: '#4ECDC4',
                };
            case 'SEASONAL':
                return {
                    ...baseStyles,
                    backgroundColor: '#FF6348',
                };
            case 'LOYALTY':
                return {
                    ...baseStyles,
                    backgroundColor: '#FFD93D',
                };
            default:
                return {
                    ...baseStyles,
                    backgroundColor: '#4A44C4',
                };
        }
    };

    const promotionStyle = getPromotionStyles();
    const isLoyalty = type === 'LOYALTY';

    return (
        <View
            style={[
                styles.promotionCardBase,
                {
                    backgroundColor: promotionStyle.backgroundColor,
                    borderRadius: promotionStyle.borderRadius,
                    padding: promotionStyle.padding,
                    minWidth: promotionStyle.minWidth,
                    marginRight: promotionStyle.marginRight,
                },
            ]}>
            {/* Badge */}
            <View
                style={[
                    styles.promotionBadge,
                    {
                        backgroundColor: isLoyalty
                            ? 'rgba(51, 51, 51, 0.2)'
                            : 'rgba(255, 255, 255, 0.3)',
                    },
                ]}>
                <Text
                    style={[
                        styles.promotionBadgeText,
                        { color: isLoyalty ? '#333' : '#fff' },
                    ]}>
                    {badge}
                </Text>
            </View>

            {/* Title */}
            <Text
                style={[
                    styles.promotionCardTitle,
                    { color: isLoyalty ? '#333' : '#fff' },
                ]}>
                {title}
            </Text>

            {/* Description */}
            <Text
                style={[
                    styles.promotionCardDescription,
                    { color: isLoyalty ? '#333' : '#fff' },
                ]}>
                {description}
            </Text>

            {/* Details Section */}
            <View style={styles.promotionDetailsContainer}>
                <Text
                    style={[
                        styles.promotionValue,
                        { color: isLoyalty ? '#333' : '#fff' },
                    ]}>
                    {value}
                </Text>
                <View style={styles.promotionConditionsBox}>
                    {conditions.map((condition, index) => (
                        <Text
                            key={index}
                            style={[
                                styles.promotionCondition,
                                { color: isLoyalty ? '#333' : '#fff' },
                            ]}>
                            {condition}
                        </Text>
                    ))}
                </View>
            </View>
        </View>
    );
};

// Define prop types for the components
LodgingCard.propTypes = LodgingCardPropTypes;
PromotionCard.propTypes = PromotionCardPropTypes;

const CustomerHome = () => {
    const { t } = useTranslation();
    const navigation = useNavigation();

    // State management for API data
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lodgings, setLodgings] = useState([]);
    const [promotions, setPromotions] = useState([]);

    // State for search text
    const [searchText, setSearchText] = useState('');

    const loadCustomerHomeData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Double check token before calling API
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                return;
            }

            const response = await fetchCustomerHomeData();
            const rooms = response?.rooms || [];

            // Debug: log sample room data and images to verify API response
            if (rooms.length > 0) {
                console.log('[CustomerHome] sample room =', rooms[0]);
                console.log(
                    '[CustomerHome] sample room images =',
                    rooms[0]?.images,
                );
            }

            if (rooms.length > 0) {
                const mappedRooms = rooms.map(room => {
                    const hasPrice = !!room.min_price;
                    const formattedPrice = hasPrice
                        ? formatCurrency(room.min_price)
                        : t('common.priceNotAvailable');

                    return {
                        id: room.id,
                        name: room.name,
                        // Keep raw numeric price for downstream calculations (booking flow).
                        min_price: room.min_price,
                        address: room.address,
                        images: room.images,
                        price: formattedPrice,
                        priceLabel: hasPrice
                            ? t('customerRoomInfo.price.perNight')
                            : '',
                        rating: room.rating_value || 0,
                        reviews: 0,
                        coverImage:
                            room.images && room.images.length > 0
                                ? room.images[0].url
                                : null,
                        description: room.description,
                    };
                });
                setLodgings(mappedRooms);
            } else {
                setLodgings([]);
            }

            // Since the new API structure doesn't provide promotions, we'll use the mock data or an empty array.
            // If you have a new source for promotions, you can update it here.
            setPromotions(MOCK_PROMOTIONS);
        } catch (err) {
            console.error('[CustomerHome] Error loading data:', err);
            const errorMessage = err.message || '';

            // Check if error is authentication related
            if (isAuthError(errorMessage)) {
                return;
            }

            setError(errorMessage || 'Failed to load data');
            setLodgings([]);
            setPromotions([]);
        } finally {
            setLoading(false);
        }
    }, [t, navigation]);

    // Fetch customer home data on component mount
    useEffect(() => {
        loadCustomerHomeData();
    }, [loadCustomerHomeData]);

    const handleRetry = () => {
        loadCustomerHomeData();
    };

    const handleRoomPress = room => {
        navigation.navigate('CustomerRoomInfo', { room });
    };

    const handleSearchPress = () => {
        navigation.navigate('CustomerSearchRoom', { searchQuery: searchText });
    };

    const handleDateFilterPress = () => {
        navigation.navigate('CustomerSearchRoom', {
            searchQuery: searchText,
            openFilterModal: true,
        });
    };

    // Common header props
    const headerProps = {
        title: t('customerHome.welcome'),
        rightIconName: 'bell-o',
        onRightIconPress: () => {},
    };

    // Loading state
    if (loading) {
        return (
            <ParentLayout headerType="header" headerProps={headerProps}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>
                        {t('common.loading')}
                    </Text>
                </View>
            </ParentLayout>
        );
    }

    // Error state
    if (error && lodgings.length === 0) {
        return (
            <ParentLayout headerType="header" headerProps={headerProps}>
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
            </ParentLayout>
        );
    }

    // Empty state
    if (!loading && lodgings.length === 0 && promotions.length === 0) {
        return (
            <ParentLayout headerType="header" headerProps={headerProps}>
                <View style={styles.centerContainer}>
                    <CustomIcon
                        type="FontAwesome5"
                        name="inbox"
                        size={60}
                        color={colors.textSecondary}
                    />
                    <Text style={styles.emptyText}>{t('common.noData')}</Text>
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
            </ParentLayout>
        );
    }

    return (
        <ParentLayout headerType="header" headerProps={headerProps}>
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}>
                <SearchBar
                    placeholder={t('customerHome.searchPlaceholder')}
                    value={searchText}
                    onChangeText={setSearchText}
                    onSubmitEditing={handleSearchPress}
                    onPress={handleSearchPress}
                />

                <View style={styles.sectionRow}>
                    <Text style={styles.sectionTitle}>
                        {t('customerHome.lodgingTitle')}
                    </Text>

                    <TouchableOpacity
                        accessibilityRole="button"
                        style={styles.filterButton}
                        onPress={handleDateFilterPress}>
                        <Text style={styles.filterText}>
                            {t('customerHome.filterByDate')}
                        </Text>
                        <CustomIcon
                            type="FontAwesome5"
                            name="calendar-alt"
                            size={12}
                            color={colors.primary}
                        />
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={lodgings}
                    keyExtractor={item => item?.id?.toString() || ''}
                    renderItem={({ item }) => (
                        <LodgingCard
                            name={item.name}
                            price={item.price}
                            priceLabel={item.priceLabel}
                            coverImage={item.coverImage}
                            rating={item.rating}
                            onPress={() => handleRoomPress(item)}
                        />
                    )}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.lodgingListContent}
                    style={styles.lodgingList}
                />
                <View style={styles.promotionSection}>
                    <View style={styles.sectionRow}>
                        <Text style={styles.sectionTitle}>
                            {t('customerHome.promotionTitle')}
                        </Text>
                    </View>

                    <FlatList
                        data={promotions}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => (
                            <PromotionCard
                                badge={t(item.badgeKey)}
                                title={t(item.titleKey)}
                                description={t(item.descriptionKey)}
                                value={t(item.valueKey)}
                                conditions={item.conditionKeys.map(key =>
                                    t(key),
                                )}
                                type={item.type}
                                t={t}
                            />
                        )}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.promotionListContent}
                        style={styles.promotionListScroll}
                    />
                </View>
            </ScrollView>
        </ParentLayout>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },

    scroll: {
        flex: 1,
    },

    scrollContent: {
        padding: moderateSize(16),
        paddingBottom: moderateSize(20),
    },

    heroHeader: {
        backgroundColor: colors.primary,
        paddingHorizontal: moderateSize(20),
        paddingTop: moderateSize(10),
        paddingBottom: moderateSize(20),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomLeftRadius: moderateSize(20),
        borderBottomRightRadius: moderateSize(20),
    },

    heroTitle: {
        color: '#FFFFFF',
        fontSize: moderateSize(24),
        fontWeight: '700',
    },

    bellButton: {
        width: moderateSize(40),
        height: moderateSize(40),
        borderRadius: moderateSize(20),
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.15)',
    },

    bellIcon: {
        fontSize: moderateSize(20),
        color: '#FFFFFF',
    },

    searchContainer: {
        marginHorizontal: moderateSize(20),
        marginTop: moderateSize(20),
        backgroundColor: colors.white,
        borderRadius: moderateSize(10),
        paddingHorizontal: moderateSize(15),
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },

    searchInput: {
        flex: 1,
        height: moderateSize(50),
        fontSize: moderateSize(16),
        color: colors.textPrimary,
    },

    sectionRow: {
        marginTop: moderateSize(20),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    sectionTitle: {
        fontSize: moderateSize(18),
        fontWeight: '700',
        color: colors.textPrimary,
        paddingBottom: moderateSize(10),
    },

    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background,
        paddingVertical: moderateSize(8),
        paddingHorizontal: moderateSize(12),
        borderRadius: moderateSize(20),
    },

    filterText: {
        color: colors.primary,
        fontWeight: '700',
        marginRight: moderateSize(6),
    },

    lodgingList: {
        marginTop: moderateSize(15),
    },

    lodgingListContent: {
        padding: moderateSize(2),
    },

    lodgingCard: {
        width: moderateSize(200),
        backgroundColor: colors.white,
        borderRadius: moderateSize(15),
        padding: moderateSize(10),
        marginRight: moderateSize(15),
        marginVertical: moderateSize(2),
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },

    lodgingImagePlaceholder: {
        width: '100%',
        height: moderateSize(120),
        borderRadius: moderateSize(10),
        backgroundColor: '#CCCCCC',
    },

    lodgingImage: {
        width: '100%',
        height: moderateSize(120),
        borderRadius: moderateSize(10),
        backgroundColor: '#CCCCCC',
    },

    lodgingName: {
        marginTop: moderateSize(10),
        fontSize: moderateSize(16),
        fontWeight: '700',
        color: colors.textPrimary,
    },

    priceContainer: {
        marginTop: moderateSize(5),
    },

    lodgingPrice: {
        fontSize: moderateSize(14),
        color: colors.primary,
        fontWeight: '700',
    },

    pricePerNightLabel: {
        marginTop: moderateSize(2),
        fontSize: moderateSize(12),
        color: colors.textSecondary,
    },

    ratingRow: {
        marginTop: moderateSize(5),
        flexDirection: 'row',
    },

    ratingStar: {
        color: '#FFD700',
        marginRight: moderateSize(2),
        fontSize: moderateSize(18),
    },

    promotionListScroll: {
        marginTop: moderateSize(15),
    },

    promotionListContent: {
        // paddingHorizontal: moderateSize(20),
    },

    promotionCardBase: {
        shadowColor: '#000',
        shadowOpacity: 0.12,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
        marginHorizontal: moderateSize(2),
    },

    promotionBadge: {
        alignSelf: 'flex-start',
        paddingVertical: moderateSize(4),
        paddingHorizontal: moderateSize(10),
        borderRadius: moderateSize(20),
        marginBottom: moderateSize(10),
    },

    promotionBadgeText: {
        fontSize: moderateSize(12),
        fontWeight: '700',
    },

    promotionCardTitle: {
        fontSize: moderateSize(18),
        fontWeight: '700',
        marginBottom: moderateSize(8),
    },

    promotionCardDescription: {
        fontSize: moderateSize(13),
        marginBottom: moderateSize(12),
        opacity: 0.95,
        lineHeight: moderateSize(18),
    },

    promotionDetailsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },

    promotionValue: {
        fontSize: moderateSize(24),
        fontWeight: '700',
    },

    promotionConditionsBox: {
        alignItems: 'flex-end',
    },

    promotionCondition: {
        fontSize: moderateSize(12),
        opacity: 0.9,
        lineHeight: moderateSize(16),
        marginBottom: moderateSize(2),
    },

    promotionSection: {
        marginTop: moderateSize(15),
    },

    historyCard: {
        marginTop: moderateSize(16),
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: moderateSize(15),
        paddingVertical: moderateSize(12),
        paddingHorizontal: moderateSize(14),
        margin: moderateSize(2),
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    historyIconContainer: {
        width: moderateSize(32),
        height: moderateSize(32),
        borderRadius: moderateSize(16),
        backgroundColor: colors.background,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: moderateSize(10),
    },
    historyTextContainer: {
        flex: 1,
    },
    historyTitle: {
        fontSize: moderateSize(15),
        fontWeight: '700',
        color: colors.textPrimary,
    },
    historySubtitle: {
        marginTop: moderateSize(4),
        fontSize: moderateSize(12),
        color: colors.textSecondary,
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
        paddingHorizontal: moderateSize(40),
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

    emptyText: {
        marginTop: moderateSize(16),
        fontSize: moderateSize(16),
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

export default CustomerHome;
