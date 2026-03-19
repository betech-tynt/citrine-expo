import React, {
    useCallback,
    useMemo,
    useRef,
    useState,
    useEffect,
} from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    Text,
    TouchableOpacity,
    FlatList,
    Image,
    ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import colors from '../../constants/colors';
import { moderateSize } from '../../styles/moderateSize';
import MasterPageLayout from '../../components/MasterPageLayout';
import CustomIcon from '../../components/CustomIcon';
import RoomQuantityModal from '../../components/modals/RoomQuantityModal';
import { openMapByQuery } from '../../utils/openMap';
import { fetchCustomerRoomInfo } from '../../services/apiCustomerRoomInfo';
import AmenityGrid from './AmenityGrid';
import BottomBookingBar from './BottomBookingBar';
import RoomTypeCard from './RoomTypeCard';
import StarRating from '../../components/StarRating';
import { formatCurrency } from '../../utils/formatCurrency';

export default function CustomerRoomInfoScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { t, i18n } = useTranslation();
    const [isFav, setIsFav] = useState(false);
    const [descExpanded, setDescExpanded] = useState(false);

    const photoListRef = useRef(null);
    const [photoPage, setPhotoPage] = useState(0);
    const [photoContainerWidth, setPhotoContainerWidth] = useState(0);

    // State management for API data
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sectionData, setSectionData] = useState(null);

    // Room type selection state
    const [roomSelections, setRoomSelections] = useState({});
    const [roomModalVisible, setRoomModalVisible] = useState(false);
    const [activeRoomType, setActiveRoomType] = useState(null);

    const amenities = useMemo(
        () => [
            {
                key: 'wifi',
                iconType: 'Feather',
                iconName: 'wifi',
                label: t('customerRoomInfo.amenities.freeWifi'),
            },
            {
                key: 'pool',
                iconType: 'MaterialCommunityIcons',
                iconName: 'pool',
                label: t('customerRoomInfo.amenities.pool'),
            },
            {
                key: 'restaurant',
                iconType: 'MaterialCommunityIcons',
                iconName: 'silverware-fork-knife',
                label: t('customerRoomInfo.amenities.restaurant'),
            },
            {
                key: 'parking',
                iconType: 'MaterialCommunityIcons',
                iconName: 'parking',
                label: t('customerRoomInfo.amenities.parking'),
            },
            {
                key: 'gym',
                iconType: 'MaterialCommunityIcons',
                iconName: 'dumbbell',
                label: t('customerRoomInfo.amenities.gym'),
            },
            {
                key: 'reception',
                iconType: 'MaterialCommunityIcons',
                iconName: 'desk',
                label: t('customerRoomInfo.amenities.reception247'),
            },
        ],
        [t],
    );

    const room = route?.params?.room;

    // Load section data from API
    const loadSectionData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const sectionId = room?.id;
            if (!sectionId) {
                throw new Error('No section ID provided');
            }
            const data = await fetchCustomerRoomInfo(sectionId);
            setSectionData(data);
        } catch (err) {
            console.error('Error loading section data:', err);
            setError(err.message || 'Failed to load section data');
            setSectionData(null);
        } finally {
            setLoading(false);
        }
    }, [room?.id]);

    // Fetch section data on component mount
    useEffect(() => {
        loadSectionData();
    }, [loadSectionData]);

    const handleRetry = () => {
        loadSectionData();
    };

    const handleBackPress = () => {
        if (navigation.canGoBack()) {
            navigation.goBack();
        } else {
            navigation.navigate('CustomerHome');
        }
    };

    // Helper: get a room field in the current language (with safe fallbacks).
    const getLocalizedRoomField = useCallback(
        (baseKey, fallback) => {
            if (!sectionData) return fallback;
            const lang = i18n.language;
            if (lang === 'en')
                return (
                    sectionData[`${baseKey}En`] ||
                    sectionData[baseKey] ||
                    fallback
                );
            if (lang === 'jp')
                return (
                    sectionData[`${baseKey}Jp`] ||
                    sectionData[baseKey] ||
                    fallback
                );
            return sectionData[baseKey] || fallback;
        },
        [i18n.language, sectionData],
    );

    const hotelName = getLocalizedRoomField('name', '');
    const address = getLocalizedRoomField('address', '');
    const description = getLocalizedRoomField('description', '');
    const rating = Number(sectionData?.rating_value ?? 4.0);
    const reviewCount = Number(room?.reviews ?? 120);
    const priceText = room?.price || '';
    const roomTypes = sectionData?.room_types || [];
    const searchFilter = route.params?.searchFilter || {};

    const activeQuantity = useMemo(() => {
        const id = activeRoomType?.id;
        if (!id) return 1;
        const existing = roomSelections?.[String(id)];
        return existing?.quantity || 1;
    }, [activeRoomType?.id, roomSelections]);

    const { totalRooms, totalPricePerNight } = useMemo(() => {
        const entries = Object.values(roomSelections || {});
        let rooms = 0;
        let total = 0;
        for (const it of entries) {
            const qty = Number(it?.quantity || 0);
            if (qty <= 0) continue;
            rooms += qty;
            total += parsePriceToNumber(it?.roomType?.price) * qty;
        }
        return { totalRooms: rooms, totalPricePerNight: total };
    }, [roomSelections]);

    const bottomPriceText = useMemo(() => {
        if (totalRooms > 0) return formatCurrency(totalPricePerNight);
        return priceText;
    }, [priceText, totalPricePerNight, totalRooms]);

    const bottomSubText = useMemo(
        () => t('customerRoomInfo.price.perNight'),
        [t],
    );

    const bottomRoomsText = useMemo(() => {
        if (totalRooms > 0)
            return t('citrine.msg000332', { count: totalRooms });
        return '';
    }, [t, totalRooms]);

    const bookingButtonDisabled = totalRooms <= 0;

    const { selectedRoom, unitPrice } = useMemo(() => {
        const roomTypes = Array.isArray(sectionData?.room_types)
            ? sectionData.room_types
            : [];

        if (roomTypes.length > 0) {
            // Pick the cheapest room type as default for this phase (single-room booking).
            const cheapestRoomType = roomTypes.reduce(
                (currentCheapest, currentRoomType) => {
                    const currentPrice = Number(currentRoomType?.price || 0);
                    if (!currentCheapest) return currentRoomType;
                    const cheapestPriceSoFar = Number(
                        currentCheapest?.price || 0,
                    );
                    const isCurrentCheaper =
                        currentPrice > 0 &&
                        (cheapestPriceSoFar <= 0 ||
                            currentPrice < cheapestPriceSoFar);
                    return isCurrentCheaper ? currentRoomType : currentCheapest;
                },
                null,
            );

            const cheapestPrice = Number(cheapestRoomType?.price || 0);
            return {
                selectedRoom: cheapestRoomType
                    ? {
                          id: cheapestRoomType.id,
                          name: cheapestRoomType.name,
                          min_price: cheapestPrice,
                      }
                    : null,
                unitPrice: cheapestPrice,
            };
        }

        const fallbackUnitPrice =
            Number(room?.min_price || 0) ||
            parsePriceToNumber(room?.price) ||
            0;

        return {
            selectedRoom: {
                id: room?.id,
                name: room?.name || '',
                min_price: fallbackUnitPrice,
            },
            unitPrice: fallbackUnitPrice,
        };
    }, [
        room?.id,
        room?.min_price,
        room?.name,
        room?.price,
        sectionData?.room_types,
    ]);

    const Images = useMemo(() => {
        if (sectionData?.images && sectionData.images.length > 0) {
            return sectionData.images.map(img => ({ uri: img.url }));
        }
        return [
            require('../../assets/images/room/room_1.jpg'),
            require('../../assets/images/room/room_2.jpg'),
            require('../../assets/images/room/room_3.jpg'),
        ];
    }, [sectionData?.images]);

    const handleOpenMap = async () => {
        await openMapByQuery(`${hotelName}, ${address}`);
    };

    const handleOpenRoomModal = useCallback(roomType => {
        setActiveRoomType(roomType);
        setRoomModalVisible(true);
    }, []);

    const handleCloseRoomModal = useCallback(() => {
        setRoomModalVisible(false);
        setActiveRoomType(null);
    }, []);

    const handleConfirmRoomQuantity = useCallback(
        quantity => {
            const rt = activeRoomType;
            if (!rt?.id) {
                handleCloseRoomModal();
                return;
            }

            const key = String(rt.id);
            setRoomSelections(prev => {
                const next = { ...(prev || {}) };
                const q = Number(quantity || 0);
                if (q > 0) {
                    next[key] = { roomType: rt, quantity: q };
                } else {
                    delete next[key];
                }
                return next;
            });

            handleCloseRoomModal();
        },
        [activeRoomType, handleCloseRoomModal],
    );

    const photoPages = useMemo(() => {
        if (!Images || Images.length === 0) return ['__placeholder__'];
        return Images;
    }, [Images]);

    const photoItemWidth = photoContainerWidth || 1;

    // Header title: use room name from params when loading, otherwise hotelName from API
    const headerTitle = hotelName || room?.name || '';
    // Loading state
    if (loading) {
        return (
            <MasterPageLayout
                headerType="header"
                headerProps={{
                    title: headerTitle,
                    showCrudText: false,
                    showHomeIcon: false,
                    onLeftIconPress: handleBackPress,
                }}>
                <View style={[styles.mainContent, styles.centerContainer]}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>
                        {t('common.loading')}
                    </Text>
                </View>
            </MasterPageLayout>
        );
    }

    // Error state
    if (error) {
        return (
            <MasterPageLayout
                headerType="header"
                headerProps={{
                    title: headerTitle,
                    showCrudText: false,
                    showHomeIcon: false,
                    onLeftIconPress: handleBackPress,
                }}>
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
            </MasterPageLayout>
        );
    }

    // Empty state
    if (!sectionData) {
        return (
            <MasterPageLayout
                headerType="header"
                headerProps={{
                    title: headerTitle,
                    showCrudText: false,
                    showHomeIcon: false,
                    onLeftIconPress: handleBackPress,
                }}>
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
            </MasterPageLayout>
        );
    }

    return (
        <MasterPageLayout
            headerType="header"
            headerProps={{
                title: headerTitle,
                showCrudText: false,
                showHomeIcon: false,
                rightIcon: isFav ? 'heart' : 'heart-o',
                rightIconType: 'FontAwesome',
                onRightIconPress: () => setIsFav(v => !v),
                onLeftIconPress: handleBackPress,
            }}>
            {/* Layout: Link */}
            <ScrollView
                style={styles.mainContent}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}>
                {/* Slide photo */}
                <View
                    onLayout={e => {
                        const w = e.nativeEvent.layout.width;
                        if (w && w !== photoContainerWidth)
                            setPhotoContainerWidth(w);
                    }}>
                    <FlatList
                        ref={photoListRef}
                        data={photoPages}
                        keyExtractor={(_, idx) => String(idx)}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        snapToInterval={photoItemWidth}
                        decelerationRate="fast"
                        onMomentumScrollEnd={e => {
                            const x = e.nativeEvent.contentOffset.x;
                            const nextPage = Math.round(x / photoItemWidth);
                            setPhotoPage(nextPage);
                        }}
                        getItemLayout={(_, index) => ({
                            length: photoItemWidth,
                            offset: photoItemWidth * index,
                            index,
                        })}
                        renderItem={({ item }) => (
                            <View style={{ width: photoItemWidth }}>
                                {item === '__placeholder__' ? (
                                    <HotelGalleryPlaceholder />
                                ) : typeof item === 'number' ? (
                                    <Image
                                        source={item}
                                        resizeMode="cover"
                                        style={styles.photoImage}
                                    />
                                ) : typeof item === 'object' && item.uri ? (
                                    <Image
                                        source={item}
                                        resizeMode="cover"
                                        style={styles.photoImage}
                                    />
                                ) : (
                                    <Image
                                        source={{ uri: String(item) }}
                                        resizeMode="cover"
                                        style={styles.photoImage}
                                    />
                                )}
                            </View>
                        )}
                    />

                    <View style={styles.dots}>
                        {photoPages.map((_, idx) => (
                            <View
                                key={`dot-${idx}`}
                                style={[
                                    styles.dot,
                                    idx === photoPage && styles.dotActive,
                                ]}
                            />
                        ))}
                    </View>
                </View>

                {/* Name + Rating + Address */}
                <View style={styles.titleBlockContainer}>
                    <Text style={styles.title}>{hotelName}</Text>

                    <View style={styles.metaRow}>
                        <StarRating
                            rating={rating}
                            countText={`(${reviewCount})`}
                            size={moderateSize(13)}
                        />

                        <TouchableOpacity
                            onPress={handleOpenMap}
                            style={styles.locationRow}
                            activeOpacity={0.8}
                            hitSlop={{
                                top: 8,
                                bottom: 8,
                                left: 8,
                                right: 8,
                            }}>
                            <CustomIcon
                                type="Entypo"
                                name="location-pin"
                                size={moderateSize(16)}
                                color={colors.textSecondary}
                                style={styles.locationIcon}
                            />
                            <Text style={styles.location} numberOfLines={1}>
                                {address}
                            </Text>
                            <CustomIcon
                                type="Feather"
                                name="map"
                                size={moderateSize(14)}
                                color={colors.primary}
                                style={styles.mapIcon}
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Description label + content */}
                <View>
                    <Text style={styles.sectionTitle}>
                        {t('customerRoomInfo.sections.description')}
                    </Text>

                    {!descExpanded ? (
                        <Text style={styles.desc} numberOfLines={3}>
                            {description || ''}
                        </Text>
                    ) : (
                        <Text style={styles.desc}>{description || ''}</Text>
                    )}

                    <TouchableOpacity onPress={() => setDescExpanded(v => !v)}>
                        <Text style={styles.readMore}>
                            {descExpanded
                                ? t('customerRoomInfo.actions.seeLess')
                                : t('customerRoomInfo.actions.seeMore')}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Service list */}
                <Text style={styles.sectionTitle}>
                    {t('customerRoomInfo.sections.amenities')}
                </Text>
                <AmenityGrid items={amenities} />

                {/* Room types */}
                {roomTypes?.length ? (
                    <View>
                        <Text style={styles.sectionTitle}>
                            {t('citrine.msg000328')}
                        </Text>

                        <View style={styles.roomTypesContainer}>
                            {roomTypes.map(rt => (
                                <RoomTypeCard
                                    key={String(rt.id)}
                                    roomType={rt}
                                    onChoose={() => handleOpenRoomModal(rt)}
                                    chooseLabel={t('citrine.msg000333')}
                                />
                            ))}
                        </View>
                    </View>
                ) : null}

                {/* Map location */}
                <View>
                    <Text style={styles.sectionTitle}>
                        {t('customerRoomInfo.sections.location')}
                    </Text>
                    <View style={styles.mapContainer}>
                        <View style={styles.fallback}>
                            <CustomIcon
                                type="Feather"
                                name="map-pin"
                                size={moderateSize(20)}
                                color={colors.primary}
                            />
                            <Text style={styles.fallbackText} numberOfLines={2}>
                                {address}
                            </Text>
                        </View>
                        <TouchableOpacity
                            onPress={handleOpenMap}
                            activeOpacity={0.85}
                            style={styles.openBtn}
                            hitSlop={{
                                top: 10,
                                bottom: 10,
                                left: 10,
                                right: 10,
                            }}>
                            <CustomIcon
                                type="Feather"
                                name="external-link"
                                size={moderateSize(16)}
                                color={colors.white}
                            />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.address} numberOfLines={1}>
                        {address}
                    </Text>
                </View>
            </ScrollView>

            <RoomQuantityModal
                visible={roomModalVisible}
                title={t('citrine.msg000330')}
                roomName={activeRoomType?.name || ''}
                roomPriceText={`${formatCurrency(
                    parsePriceToNumber(activeRoomType?.price),
                )}/${t('customerRoomInfo.price.perNight')}`}
                quantityLabel={t('citrine.msg000331')}
                cancelText={t('common.cancel')}
                confirmText={t('common.confirm')}
                initialQuantity={activeQuantity}
                onClose={handleCloseRoomModal}
                onConfirm={handleConfirmRoomQuantity}
            />

            {/* Price + button Select */}
            <BottomBookingBar
                priceText={bottomPriceText}
                perNightText={bottomSubText}
                roomsText={bottomRoomsText}
                buttonText={t('citrine.msg000329')}
                // BookingScreen
                onPress={() => {
                    if (bookingButtonDisabled) return;
                    const bookingDraft = {
                        sectionId: sectionData?.id || room?.id,
                        hotelName,
                        address,
                        images: sectionData?.images || [],
                        selectedRoom,
                        unitPrice,
                        roomCount: totalRooms || 1,
                        checkInISO: searchFilter?.checkInISO || '',
                        checkOutISO: searchFilter?.checkOutISO || '',
                        adults: searchFilter?.adults ?? 0,
                        children: searchFilter?.children ?? 0,
                    };

                    navigation.navigate('CustomerBookingScreen', {
                        bookingDraft,
                        selections: roomSelections,
                        totalRooms,
                        totalPricePerNight,
                    });
                }}
                disabled={bookingButtonDisabled}
            />
        </MasterPageLayout>
    );
}

function HotelGalleryPlaceholder() {
    return (
        <View style={styles.galleryPlaceholderRow}>
            <View
                style={[
                    styles.galleryPlaceholderBlock,
                    styles.galleryPlaceholderLeft,
                ]}
            />
            <View style={styles.galleryPlaceholderRightCol}>
                <View
                    style={[
                        styles.galleryPlaceholderBlock,
                        styles.galleryPlaceholderRight,
                    ]}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContent: {
        flex: 1,
        padding: moderateSize(16),
    },
    container: {
        flex: 1,
        backgroundColor: colors.primary,
    },
    content: {
        paddingBottom: moderateSize(110),
    },
    sectionTitle: {
        marginTop: moderateSize(14),
        marginBottom: moderateSize(10),
        color: colors.textPrimary,
        fontSize: moderateSize(16),
        fontWeight: '800',
    },

    // Photo slider
    photoImage: {
        width: '100%',
        height: moderateSize(140),
        borderRadius: moderateSize(14),
        backgroundColor: colors.background,
    },
    dots: {
        marginTop: moderateSize(10),
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: moderateSize(6),
    },
    dot: {
        width: moderateSize(6),
        height: moderateSize(6),
        borderRadius: moderateSize(3),
        backgroundColor: colors.grey,
    },
    dotActive: {
        width: moderateSize(16),
        backgroundColor: colors.primary,
    },

    // Title block
    titleBlockContainer: {
        marginBottom: moderateSize(14),
    },
    title: {
        color: colors.textPrimary,
        fontSize: moderateSize(20),
        fontWeight: '800',
        marginBottom: moderateSize(10),
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        maxWidth: '55%',
    },
    locationIcon: {
        marginRight: moderateSize(2),
    },
    location: {
        color: colors.textSecondary,
        fontSize: moderateSize(12),
        fontWeight: '500',
        flexShrink: 1,
    },
    mapIcon: {
        marginLeft: moderateSize(6),
    },

    // Description
    desc: {
        color: colors.textSecondary,
        fontSize: moderateSize(13),
        lineHeight: moderateSize(18),
    },
    readMore: {
        marginTop: moderateSize(6),
        color: colors.primary,
        fontSize: moderateSize(13),
        fontWeight: '700',
    },

    // Map location
    mapContainer: {
        marginTop: moderateSize(2),
        height: moderateSize(160),
        borderRadius: moderateSize(14),
        overflow: 'hidden',
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.grey,
    },
    fallback: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: moderateSize(12),
        gap: moderateSize(8),
        backgroundColor: colors.background,
    },
    fallbackText: {
        color: colors.textSecondary,
        fontSize: moderateSize(12),
        fontWeight: '600',
        textAlign: 'center',
    },
    openBtn: {
        position: 'absolute',
        right: moderateSize(10),
        top: moderateSize(10),
        width: moderateSize(34),
        height: moderateSize(34),
        borderRadius: moderateSize(10),
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    address: {
        marginTop: moderateSize(8),
        color: colors.textSecondary,
        fontSize: moderateSize(12),
        fontWeight: '500',
    },

    // AmenityGrid
    amenityGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        rowGap: moderateSize(10),
        columnGap: moderateSize(12),
    },
    amenityItem: {
        width: '47%',
        flexDirection: 'row',
        alignItems: 'center',
    },
    amenityIcon: {
        width: moderateSize(26),
        alignItems: 'center',
        justifyContent: 'center',
    },
    amenityLabel: {
        marginLeft: moderateSize(8),
        color: colors.textPrimary,
        fontSize: moderateSize(13),
        fontWeight: '500',
        flex: 1,
    },

    // Room types
    roomTypesContainer: {
        gap: moderateSize(14),
    },
    roomTypeCard: {
        backgroundColor: colors.white,
        borderRadius: moderateSize(14),
        overflow: 'hidden',
        marginHorizontal: moderateSize(2),
        shadowColor: colors.black,
        shadowOpacity: 0.06,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    roomTypeImage: {
        width: '100%',
        height: moderateSize(140),
        backgroundColor: colors.background,
    },
    roomTypeImagePlaceholder: {
        width: '100%',
        height: moderateSize(140),
        backgroundColor: colors.background,
    },
    roomTypeInfo: {
        padding: moderateSize(14),
    },
    roomTypeName: {
        color: colors.textPrimary,
        fontSize: moderateSize(14),
        fontWeight: '800',
        marginBottom: moderateSize(6),
    },
    roomTypeDesc: {
        color: colors.textSecondary,
        fontSize: moderateSize(12),
        fontWeight: '500',
        lineHeight: moderateSize(16),
        marginBottom: moderateSize(10),
    },
    roomTypeFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    roomTypePrice: {
        color: colors.primary,
        fontSize: moderateSize(14),
        fontWeight: '800',
    },
    roomTypeChooseBtn: {
        backgroundColor: '#E8E7F9',
        paddingVertical: moderateSize(8),
        paddingHorizontal: moderateSize(14),
        borderRadius: moderateSize(10),
    },
    roomTypeChooseText: {
        color: colors.primary,
        fontSize: moderateSize(12),
        fontWeight: '700',
    },

    // BottomBookingBar
    bookingBarContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: colors.white,
        zIndex: 10,
        paddingHorizontal: moderateSize(16),
        paddingTop: moderateSize(12),
        paddingBottom: moderateSize(14),
        flexDirection: 'row',
        alignItems: 'center',
        borderTopLeftRadius: moderateSize(22),
        borderTopRightRadius: moderateSize(22),
        shadowColor: colors.black,
        shadowOpacity: 0.08,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: -4 },
        elevation: 8,
    },
    bookingBarPriceCol: {
        flex: 1,
    },
    bookingBarPrice: {
        color: colors.primary,
        fontSize: moderateSize(18),
        fontWeight: '800',
    },
    bookingBarPerNight: {
        marginTop: moderateSize(2),
        color: colors.textSecondary,
        fontSize: moderateSize(12),
        fontWeight: '500',
    },
    bookingBarRooms: {
        marginTop: moderateSize(2),
        color: colors.textSecondary,
        fontSize: moderateSize(12),
        fontWeight: '500',
    },
    bookingBarBtnCol: {
        width: moderateSize(140),
    },
    bookingBarButton: {
        paddingVertical: moderateSize(12),
        borderRadius: moderateSize(12),
    },
    bookingBarButtonText: {
        fontSize: moderateSize(14),
        fontWeight: '700',
    },

    // HotelGalleryPlaceholder
    galleryPlaceholderRow: {
        flexDirection: 'row',
        gap: moderateSize(10),
        marginBottom: moderateSize(14),
    },
    galleryPlaceholderBlock: {
        backgroundColor: colors.background,
        borderRadius: moderateSize(14),
    },
    galleryPlaceholderLeft: {
        flex: 1,
        height: moderateSize(140),
    },
    galleryPlaceholderRightCol: {
        width: moderateSize(84),
    },
    galleryPlaceholderRight: {
        width: '100%',
        height: moderateSize(140),
    },

    // StarRating
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingStars: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingStar: {
        marginRight: moderateSize(2),
    },
    ratingCount: {
        marginLeft: moderateSize(6),
        color: colors.textSecondary,
        fontSize: moderateSize(12),
        fontWeight: '400',
    },

    // Loading/Error/Empty states
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

function parsePriceToNumber(price) {
    if (typeof price === 'number' && Number.isFinite(price)) return price;
    if (typeof price === 'string') {
        const digits = price.replace(/[^\d]/g, '');
        return digits ? Number(digits) : 0;
    }
    return 0;
}
