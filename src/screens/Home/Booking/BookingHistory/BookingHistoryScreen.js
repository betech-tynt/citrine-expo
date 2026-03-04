import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../../../components/Header';
import colors from '../../../../constants/colors';
import {
    BOOKING_STATUS,
    BOOKING_STATUS_COLORS,
    BOOKING_STATUS_I18N_KEY,
    getBookingStatusStyle,
    normalizeBookingStatus,
} from '../../../../constants/utils';
import { fetchCustomerBookingHistory } from '../../../../services/apiBookingHistory';
import { moderateSize } from '../../../../styles';
import { commonStyles } from '../../../../theme/commonStyles';
import { formatCurrency } from '../../../../utils/formatCurrency';
import { formatDate } from '../../../../utils/formatDate';
import { BookingHistoryCardPropTypes } from '../../../../utils/propTypes';

// Use shared utility function for status styles
const getStatusStyle = status => getBookingStatusStyle(status, styles);

// Booking card component for displaying booking information
const BookingCard = ({ booking, t }) => {
    const navigation = useNavigation();
    const normalizedStatus = normalizeBookingStatus(booking.status);
    const statusStyle = getStatusStyle(normalizedStatus);
    const statusKey =
        BOOKING_STATUS_I18N_KEY[normalizedStatus] ||
        BOOKING_STATUS_I18N_KEY[BOOKING_STATUS.CANCELLED];
    const statusLabel = t(statusKey);

    const canCancel =
        normalizedStatus === BOOKING_STATUS.PENDING ||
        normalizedStatus === BOOKING_STATUS.CONFIRMED;

    const handleCardPress = () => {
        navigation.navigate('BookingInfoScreen', { booking });
    };

    const handleCancelPress = e => {
        e.stopPropagation(); // Prevent card press when clicking cancel button
        // TODO: Pass booking via route params when API/flow is ready
        navigation.navigate('BookingCancelScreen', { booking });
    };

    const guestCount = useMemo(() => {
        const adults = booking.guest_count?.adults || 0;
        const children = booking.guest_count?.children || 0;
        return adults + children;
    }, [booking.guest_count]);

    const guestDetails = useMemo(() => {
        const adults = booking.guest_count?.adults || 0;
        const children = booking.guest_count?.children || 0;

        const parts = [];
        if (adults > 0) {
            parts.push(`${adults} x ${t('booking.adult')}`);
        }
        if (children > 0) {
            parts.push(`${children} x ${t('booking.children')}`);
        }

        // Fallback: if no breakdown available, display total guest count
        if (parts.length === 0 && guestCount > 0) {
            return `${guestCount}`;
        }

        return parts.join(', ');
    }, [booking.guest_count, guestCount, t]);

    const formattedRoomDetails = useMemo(() => {
        if (!booking.room_details) return '';
        // Add spacing between rooms if multiple rooms exist
        return booking.room_details
            .split(',')
            .map(room => room.trim())
            .join(', ');
    }, [booking.room_details]);

    return (
        <TouchableOpacity
            style={styles.bookingCard}
            onPress={handleCardPress}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`Booking at ${booking.section_name}, status ${statusLabel}`}>
            <View style={styles.bookingHeader}>
                <Text
                    style={styles.bookingHotel}
                    accessibilityRole="text"
                    accessibilityLabel={`Hotel: ${booking.section_name}`}>
                    {booking.section_name}
                </Text>
                <View
                    style={[styles.bookingStatus, statusStyle.container]}
                    accessibilityRole="text"
                    accessibilityLabel={`Status: ${statusLabel}`}>
                    <Text style={statusStyle.text}>{statusLabel}</Text>
                </View>
            </View>

            <View style={styles.bookingDates}>
                <Text
                    style={styles.dateText}
                    accessibilityRole="text"
                    accessibilityLabel={`Check-in: ${formatDate(
                        booking.check_in_at,
                    )}`}>
                    {formatDate(booking.check_in_at)}
                </Text>
                <Text style={styles.dateSeparator}>→</Text>
                <Text
                    style={styles.dateText}
                    accessibilityRole="text"
                    accessibilityLabel={`Check-out: ${formatDate(
                        booking.check_out_at,
                    )}`}>
                    {formatDate(booking.check_out_at)}
                </Text>
            </View>

            <View style={[styles.infoRow, styles.infoRowFirst]}>
                <Text style={styles.infoLabel}>{t('bookingHistory.room')}</Text>
                <Text
                    style={styles.infoValue}
                    numberOfLines={3}
                    ellipsizeMode="tail">
                    {formattedRoomDetails}
                </Text>
            </View>
            <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>
                    {t('bookingHistory.guests')}
                </Text>
                <Text
                    style={styles.infoValue}
                    numberOfLines={3}
                    ellipsizeMode="tail">
                    {guestDetails}
                </Text>
            </View>
            <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>
                    {t('bookingHistory.totalAmount')}
                </Text>
                <Text style={styles.totalPrice}>
                    {formatCurrency(booking.total_price)}
                </Text>
            </View>

            {canCancel && (
                <TouchableOpacity
                    style={styles.cancelOutlineButton}
                    onPress={handleCancelPress}
                    activeOpacity={0.85}
                    accessibilityRole="button"
                    accessibilityLabel={t('citrine.msg000311')}>
                    <Text style={styles.cancelOutlineButtonText}>
                        {t('citrine.msg000311')}
                    </Text>
                </TouchableOpacity>
            )}
        </TouchableOpacity>
    );
};

BookingCard.propTypes = BookingHistoryCardPropTypes;

const BookingHistoryScreen = () => {
    const { t } = useTranslation();
    const [bookings, setBookings] = useState([]);
    const [paginatorInfo, setPaginatorInfo] = useState(null);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const loadBookings = useCallback(async (currentPage, isRefreshing) => {
        setLoading(true);
        setError(null);
        try {
            const { bookings: newBookings = [], paginatorInfo: pInfo } =
                await fetchCustomerBookingHistory({
                    page: currentPage,
                });

            const safeBookings = Array.isArray(newBookings) ? newBookings : [];

            if (isRefreshing) {
                setBookings(safeBookings);
            } else {
                setBookings(prev => [...prev, ...safeBookings]);
            }
            setPaginatorInfo(pInfo);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            setPage(1);
            loadBookings(1, true);
        }, [loadBookings]),
    );

    const handleLoadMore = () => {
        if (
            !loading &&
            paginatorInfo &&
            paginatorInfo.currentPage < paginatorInfo.lastPage
        ) {
            const nextPage = page + 1;
            setPage(nextPage);
            loadBookings(nextPage, false);
        }
    };

    const onRefresh = () => {
        setPage(1);
        loadBookings(1, true);
    };

    // Render booking card
    const renderBookingCard = ({ item }) => (
        <BookingCard booking={item} t={t} />
    );

    // Empty state component
    const renderEmptyState = () => {
        if (loading) return null;
        return (
            <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>📄</Text>
                <Text style={styles.emptyText}>
                    {t('bookingHistory.empty')}
                </Text>
            </View>
        );
    };

    const renderFooter = () => {
        if (!loading || page === 1) return null;
        return (
            <View style={styles.loadingFooter}>
                <ActivityIndicator size="small" color={colors.primary} />
            </View>
        );
    };

    if (loading && page === 1) {
        return (
            <SafeAreaView
                edges={['left', 'right', 'bottom']}
                style={styles.container}>
                <Header
                    title={t('bookingHistory.title')}
                    showCrudText={false}
                />
                <View style={commonStyles.bookingMain}>
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator
                            size="large"
                            color={colors.primary}
                        />
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView
                edges={['left', 'right', 'bottom']}
                style={styles.container}>
                <Header
                    title={t('bookingHistory.title')}
                    showCrudText={false}
                />
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView
            edges={['left', 'right', 'bottom']}
            style={styles.container}>
            <Header title={t('bookingHistory.title')} showCrudText={false} />
            <View style={commonStyles.bookingMain}>
                <FlatList
                    data={bookings}
                    renderItem={renderBookingCard}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={[
                        commonStyles.bookingScrollContent,
                        commonStyles.bookingContentContainer,
                        bookings.length === 0 && styles.emptyContainer,
                    ]}
                    ListEmptyComponent={renderEmptyState}
                    showsVerticalScrollIndicator={false}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={renderFooter}
                    onRefresh={onRefresh}
                    refreshing={loading && page === 1}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.surfaceSoft,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: moderateSize(20),
    },
    errorText: {
        fontSize: moderateSize(16),
        color: colors.danger,
        textAlign: 'center',
    },
    loadingFooter: {
        paddingVertical: moderateSize(20),
    },
    emptyContainer: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    bookingCard: {
        backgroundColor: colors.white,
        borderRadius: moderateSize(10),
        padding: moderateSize(14),
        marginBottom: moderateSize(12),
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    cancelOutlineButton: {
        marginTop: moderateSize(12),
        height: moderateSize(38),
        width: '33%',
        minWidth: moderateSize(110),
        alignSelf: 'flex-end',
        borderRadius: moderateSize(10),
        borderWidth: 1,
        borderColor: colors.danger,
        backgroundColor: 'rgba(231, 76, 60, 0.08)',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: moderateSize(12),
    },
    cancelOutlineButtonText: {
        color: colors.danger,
        fontSize: moderateSize(13),
        fontWeight: '600',
    },
    bookingHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: moderateSize(8),
    },
    bookingHotel: {
        fontSize: moderateSize(16),
        fontWeight: 'bold',
        color: colors.textPrimary,
        flex: 1,
        paddingRight: moderateSize(8),
    },
    bookingStatus: {
        paddingVertical: moderateSize(4),
        paddingHorizontal: moderateSize(10),
        borderRadius: moderateSize(12),
    },
    statusCompleted: {
        backgroundColor:
            BOOKING_STATUS_COLORS[BOOKING_STATUS.CHECKED_OUT].backgroundColor,
    },
    statusCompletedText: {
        color: BOOKING_STATUS_COLORS[BOOKING_STATUS.CHECKED_OUT].textColor,
        fontSize: moderateSize(12),
        fontWeight: 'bold',
    },
    statusConfirmed: {
        backgroundColor:
            BOOKING_STATUS_COLORS[BOOKING_STATUS.CONFIRMED].backgroundColor,
    },
    statusConfirmedText: {
        color: BOOKING_STATUS_COLORS[BOOKING_STATUS.CONFIRMED].textColor,
        fontSize: moderateSize(12),
        fontWeight: 'bold',
    },
    statusPending: {
        backgroundColor:
            BOOKING_STATUS_COLORS[BOOKING_STATUS.PENDING].backgroundColor,
    },
    statusPendingText: {
        color: BOOKING_STATUS_COLORS[BOOKING_STATUS.PENDING].textColor,
        fontSize: moderateSize(12),
        fontWeight: 'bold',
    },
    statusCheckedIn: {
        backgroundColor:
            BOOKING_STATUS_COLORS[BOOKING_STATUS.CHECKED_IN].backgroundColor,
    },
    statusCheckedInText: {
        color: BOOKING_STATUS_COLORS[BOOKING_STATUS.CHECKED_IN].textColor,
        fontSize: moderateSize(12),
        fontWeight: 'bold',
    },
    statusCancelled: {
        backgroundColor:
            BOOKING_STATUS_COLORS[BOOKING_STATUS.CANCELLED].backgroundColor,
    },
    statusCancelledText: {
        color: BOOKING_STATUS_COLORS[BOOKING_STATUS.CANCELLED].textColor,
        fontSize: moderateSize(12),
        fontWeight: 'bold',
    },
    statusRefunded: {
        backgroundColor:
            BOOKING_STATUS_COLORS[BOOKING_STATUS.REFUNDED].backgroundColor,
    },
    statusRefundedText: {
        color: BOOKING_STATUS_COLORS[BOOKING_STATUS.REFUNDED].textColor,
        fontSize: moderateSize(12),
        fontWeight: 'bold',
    },
    bookingDates: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: moderateSize(8),
    },
    dateText: {
        fontSize: moderateSize(14),
        color: colors.textSecondary,
    },
    dateSeparator: {
        marginHorizontal: moderateSize(4),
        color: colors.textSecondary,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingVertical: moderateSize(6),
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: colors.borderColorGrey01,
    },
    infoRowFirst: {
        borderTopWidth: 0,
    },
    infoLabel: {
        fontSize: moderateSize(16),
        color: colors.textSecondary,
        marginRight: moderateSize(12),
        flexShrink: 0,
    },
    infoValue: {
        fontSize: moderateSize(16),
        color: colors.textPrimary,
        fontWeight: '500',
        flex: 1,
        textAlign: 'right',
    },
    totalPrice: {
        fontSize: moderateSize(18),
        color: colors.primary,
        fontWeight: 'bold',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: moderateSize(40),
    },
    emptyIcon: {
        fontSize: moderateSize(40),
        marginBottom: moderateSize(12),
    },
    emptyText: {
        fontSize: moderateSize(16),
        color: colors.textSecondary,
        textAlign: 'center',
    },
});

export default BookingHistoryScreen;
