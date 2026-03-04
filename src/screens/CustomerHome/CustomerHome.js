import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Header from '../../components/Header';
import { commonStyles } from '../../theme/commonStyles';
import SearchBar from '../../components/SearchBar';
import { moderateSize } from '../../styles/moderateSize';
import CustomIcon from '../../components/CustomIcon';
import colors from '../../constants/colors';
import {
    PromotionCardPropTypes,
    LodgingCardPropTypes,
    StarRatingPropTypes,
} from '../../utils/propTypes';
import { Image } from 'react-native';
import { fetchCustomerHomeData } from '../../services/apiCustomerHome';

const MOCK_PROMOTIONS = [
    { id: '1', title: 'Giảm giá 20% cho lần đặt phòng đầu tiên!' },
    { id: '2', title: 'Ở 3 đêm, trả tiền 2 đêm' },
    { id: '3', title: 'Ở 1 đêm, trả tiền 1 đêm' },
    { id: '4', title: 'Ở 5 đêm, trả tiền 3 đêm' },
    { id: '5', title: 'Ở free 1 đêm, trả tiền 1 đêm' },
];

const StarRating = ({ rating = 0 }) => {
    const stars = useMemo(() => {
        const full = Math.floor(rating);
        const hasHalf = rating - full >= 0.5;

        return Array.from({ length: 5 }).map((_, idx) => {
            if (idx < full)
                return (
                    <CustomIcon
                        key={idx}
                        type="FontAwesome5"
                        solid
                        name="star"
                        size={12}
                        color={'#FFD700'}
                    />
                );
            if (idx === full && hasHalf)
                return (
                    <CustomIcon
                        key={idx}
                        type="FontAwesome5"
                        solid
                        name="star-half"
                        size={12}
                        color={'#FFD700'}
                    />
                );
            return (
                <CustomIcon
                    key={idx}
                    type="FontAwesome5"
                    name="star"
                    size={12}
                    color={'#FFD700'}
                />
            );
        });
    }, [rating]);

    return (
        <View style={styles.ratingRow}>
            {stars.map((s, idx) => (
                <Text key={String(idx)} style={styles.ratingStar}>
                    {s}
                </Text>
            ))}
        </View>
    );
};

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

const PromotionCard = ({ title }) => {
    return (
        <View style={styles.promotionCard}>
            <View style={styles.promotionImagePlaceholder} />
            <View style={styles.promotionTextContainer}>
                <Text style={styles.promotionTitle}>{title}</Text>
            </View>
        </View>
    );
};

// Define prop types for the components
StarRating.propTypes = StarRatingPropTypes;
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

    /**
     * Handle authentication failure by clearing token and redirecting to Login
     */
    const handleAuthRedirect = useCallback(async () => {
        console.log(
            '[CustomerHome] Auth failure detected, clearing token and redirecting to Login...',
        );
        try {
            await AsyncStorage.removeItem('token');
            navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'Login' }],
                }),
            );
        } catch (e) {
            console.error('[CustomerHome] Failed to handle auth redirect:', e);
        }
    }, [navigation]);

    // State for search text
    const [searchText, setSearchText] = useState('');

    const loadCustomerHomeData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Double check token before calling API
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                await handleAuthRedirect();
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
                        ? `${room.min_price.toLocaleString()}đ`
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
            if (
                errorMessage.toLowerCase().includes('unauthenticated') ||
                errorMessage.toLowerCase().includes('unauthorized') ||
                errorMessage.toLowerCase().includes('missing token') ||
                errorMessage.toLowerCase().includes('jwt')
            ) {
                await handleAuthRedirect();
                return;
            }

            setError(errorMessage || 'Failed to load data');
            setLodgings([]);
            setPromotions([]);
        } finally {
            setLoading(false);
        }
    }, [t, handleAuthRedirect]);

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

    // Loading state
    if (loading) {
        return (
            <SafeAreaView
                edges={['left', 'right', 'bottom']}
                style={styles.container}>
                <Header
                    title={t('customerHome.welcome')}
                    showBackIcon={false}
                    showCrudText={false}
                    showHomeIcon={false}
                    rightIconName="bell-o"
                    onRightIconPress={() => {}}
                />
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>
                        {t('common.loading')}
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    // Error state
    if (error && lodgings.length === 0) {
        return (
            <SafeAreaView
                edges={['left', 'right', 'bottom']}
                style={styles.container}>
                <Header
                    title={t('customerHome.welcome')}
                    showBackIcon={false}
                    showCrudText={false}
                    showHomeIcon={false}
                    rightIconName="bell-o"
                    onRightIconPress={() => {}}
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

    // Empty state
    if (!loading && lodgings.length === 0 && promotions.length === 0) {
        return (
            <SafeAreaView
                edges={['left', 'right', 'bottom']}
                style={styles.container}>
                <Header
                    title={t('customerHome.welcome')}
                    showBackIcon={false}
                    showCrudText={false}
                    showHomeIcon={false}
                    rightIconName="bell-o"
                    onRightIconPress={() => {}}
                />
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
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView
            edges={['left', 'right', 'bottom']}
            style={styles.container}>
            <Header
                title={t('customerHome.welcome')}
                showBackIcon={false}
                showCrudText={false}
                showHomeIcon={false}
                rightIconName="bell-o"
                onRightIconPress={() => {}}
            />
            <View style={commonStyles.main}>
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

                    <TouchableOpacity
                        style={styles.historyCard}
                        accessibilityRole="button"
                        onPress={() =>
                            navigation.navigate('BookingHistoryScreen')
                        }
                        activeOpacity={0.7}>
                        <View style={styles.historyIconContainer}>
                            <CustomIcon
                                type="FontAwesome5"
                                name="history"
                                size={16}
                                color={colors.primary}
                            />
                        </View>
                        <View style={styles.historyTextContainer}>
                            <Text style={styles.historyTitle}>
                                {t('bookingHistory.title')}
                            </Text>
                            <Text style={styles.historySubtitle}>
                                {t('customerHome.viewBookingHistoryHint')}
                            </Text>
                        </View>
                        <CustomIcon
                            type="FontAwesome5"
                            name="chevron-right"
                            size={14}
                            color={colors.textSecondary}
                        />
                    </TouchableOpacity>

                    <View style={styles.sectionRow}>
                        <Text style={styles.sectionTitle}>
                            {t('customerHome.lodgingTitle')}
                        </Text>

                        <TouchableOpacity
                            accessibilityRole="button"
                            style={styles.filterButton}
                            onPress={() => {}}>
                            <Text style={styles.filterText}>
                                {t('customerHome.filterByPrice')}
                            </Text>
                            <CustomIcon
                                type="FontAwesome5"
                                name="filter"
                                size={12}
                                color={colors.primary}
                            />
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        data={lodgings}
                        keyExtractor={item => item.id}
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

                        <View style={styles.promotionList}>
                            {promotions.map(p => (
                                <PromotionCard key={p.id} title={p.title} />
                            ))}
                        </View>
                    </View>
                </ScrollView>
            </View>
        </SafeAreaView>
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
        paddingBottom: moderateSize(20),
        paddingTop: moderateSize(20),
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

    promotionList: {
        // paddingHorizontal: 20,
        marginTop: moderateSize(15),
    },

    promotionCard: {
        flexDirection: 'row',
        backgroundColor: colors.white,
        borderRadius: moderateSize(15),
        marginBottom: moderateSize(15),
        overflow: 'hidden',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },

    promotionImagePlaceholder: {
        width: moderateSize(100),
        height: moderateSize(100),
        backgroundColor: '#CCCCCC',
    },

    promotionTextContainer: {
        flex: 1,
        padding: moderateSize(15),
    },

    promotionTitle: {
        fontSize: moderateSize(16),
        fontWeight: '700',
        color: colors.textPrimary,
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
