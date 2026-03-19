import React, { useMemo, useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/FontAwesome';
import { ActivityIndicator } from 'react-native';
import MasterPageLayout from '../../../../components/MasterPageLayout';
import colors from '../../../../constants/colors';
import { moderateSize } from '../../../../styles';
import { formatCurrency } from '../../../../utils/formatCurrency';
import {
    SAMPLE_BOOKING_HISTORY,
    BOOKING_STATUS,
    BOOKING_STATUS_I18N_KEY,
    BOOKING_STATUS_COLORS,
    normalizeBookingStatus,
    getBookingStatusStyle,
} from '../../../../constants/utils';
import { InfoRowPropTypes } from '../../../../utils/propTypes';
import PropTypes from 'prop-types';
import { fetchCustomerBookingInfo } from '../../../../services/apiBookingInfo';
import { formatDate } from '../../../../utils/formatDate';

// Use shared utility function for status styles
const getStatusStyle = status => getBookingStatusStyle(status, styles);

// Helper component to render a label/value row
const InfoRow = ({ label, value, isTotal = false, isFirst = false }) => (
    <View style={[styles.infoRow, !isFirst && styles.infoRowWithBorder]}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={[styles.infoValue, isTotal && styles.infoValueTotal]}>
            {value}
        </Text>
    </View>
);

InfoRow.propTypes = InfoRowPropTypes;

// Status badge component
const StatusBadge = ({ status, t }) => {
    const normalizedStatus = normalizeBookingStatus(status);
    const statusStyle = getStatusStyle(normalizedStatus);
    const statusKey =
        BOOKING_STATUS_I18N_KEY[normalizedStatus] ||
        BOOKING_STATUS_I18N_KEY[BOOKING_STATUS.CANCELLED];
    const statusLabel = t(statusKey);

    // Get icon based on status
    let iconName = 'circle';
    if (normalizedStatus === BOOKING_STATUS.CHECKED_OUT) {
        iconName = 'check-circle';
    } else if (normalizedStatus === BOOKING_STATUS.CANCELLED) {
        iconName = 'times-circle';
    } else if (normalizedStatus === BOOKING_STATUS.CONFIRMED) {
        iconName = 'check';
    } else if (normalizedStatus === BOOKING_STATUS.PENDING) {
        iconName = 'clock-o';
    } else if (normalizedStatus === BOOKING_STATUS.CHECKED_IN) {
        iconName = 'sign-in';
    } else if (normalizedStatus === BOOKING_STATUS.REFUNDED) {
        iconName = 'undo';
    }

    // Use shared status color configuration so icon color matches text color
    const statusColors =
        BOOKING_STATUS_COLORS[normalizedStatus] ||
        BOOKING_STATUS_COLORS[BOOKING_STATUS.CANCELLED];
    const iconColor = statusColors.textColor;

    return (
        <View style={[styles.statusBadge, statusStyle.container]}>
            <Icon
                name={iconName}
                size={moderateSize(12)}
                color={iconColor}
                style={styles.statusBadgeIcon}
            />
            <Text style={[styles.statusBadgeText, statusStyle.text]}>
                {statusLabel}
            </Text>
        </View>
    );
};

StatusBadge.propTypes = {
    status: PropTypes.oneOfType([
        // Accept numeric status codes from API (BOOKING_STATUS) and raw strings
        PropTypes.oneOf(Object.values(BOOKING_STATUS)),
        PropTypes.number,
    ]).isRequired,
    t: PropTypes.func.isRequired,
};

const BookingInfoScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { t } = useTranslation();

    // Get booking from route params
    const initialBooking = useMemo(() => {
        return route.params?.booking || SAMPLE_BOOKING_HISTORY[0];
    }, [route.params]);

    const [bookingInfo, setBookingInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const bookingId = initialBooking?.id;

    // Fetch detailed booking info from API
    useEffect(() => {
        let isMounted = true;

        const loadBookingInfo = async () => {
            if (!bookingId) return;
            setLoading(true);
            setError(null);
            try {
                const data = await fetchCustomerBookingInfo(bookingId);
                if (isMounted) {
                    setBookingInfo(data);
                }
            } catch (e) {
                if (isMounted) {
                    setError(e.message);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadBookingInfo();

        return () => {
            isMounted = false;
        };
    }, [bookingId]);

    // Use detailed booking info if available, otherwise fall back to initial booking
    const booking = bookingInfo || initialBooking;

    // Merge with customer info
    const customerInfo = useMemo(() => {
        const customer = booking.customer || {};

        // API P0107 fields
        const fullName =
            customer.name ||
            [customer.last_name, customer.first_name]
                .filter(Boolean)
                .join(' ')
                .trim();

        return {
            fullName: fullName || '-',
            // Prefer email from related user, fallback to any email on customer
            email: customer?.user?.email || customer?.email || '-',
            phoneNumber: customer.phone_number || '-',
        };
    }, [booking]);

    // Format booking code
    const bookingCode = useMemo(() => {
        if (booking.code) {
            return booking.code;
        }
        const id = booking?.id ? String(booking.id) : '0';
        return `BK#${id.padStart(6, '0')}`;
    }, [booking]);

    // Calculate nights from start/end if available (API), otherwise from checkIn/checkOut or fallback
    const nights = useMemo(() => {
        const startDateRaw = booking.check_in_at;
        const endDateRaw = booking.check_out_at;

        if (startDateRaw && endDateRaw) {
            const startDate = new Date(startDateRaw);
            const endDate = new Date(endDateRaw);
            if (
                !Number.isNaN(startDate.getTime()) &&
                !Number.isNaN(endDate.getTime())
            ) {
                const diffMs = endDate.getTime() - startDate.getTime();
                const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
                if (diffDays > 0) {
                    return diffDays;
                }
            }
        }

        return booking.nights || 1;
    }, [booking]);

    // Calculate payment details based on API data or fallbacks
    const paymentDetails = useMemo(() => {
        const primaryPayment = Array.isArray(booking.payments)
            ? booking.payments[0]
            : null;

        const roomPrice =
            booking.total_price ||
            (primaryPayment ? primaryPayment.total : 0) ||
            0;

        const taxAndFees = (primaryPayment && primaryPayment.tax) || 0;

        const total = roomPrice + taxAndFees;
        return { roomPrice, taxAndFees, total };
    }, [booking]);

    // Derived display values
    const hotelName = useMemo(() => {
        if (booking.section && booking.section.name) {
            return booking.section.name;
        }
        return booking.hotelName || booking.hotel || '-';
    }, [booking]);

    const roomName = useMemo(() => {
        if (
            Array.isArray(booking.booking_details) &&
            booking.booking_details.length > 0
        ) {
            return (
                booking.booking_details[0]?.room_type?.name ||
                booking.booking_details[0]?.notes ||
                ''
            );
        }
        return booking.roomName || '';
    }, [booking]);

    // Format room details similar to BookingHistoryScreen
    const roomDisplay = useMemo(() => {
        // From detailed booking info
        if (
            Array.isArray(booking.booking_details) &&
            booking.booking_details.length > 0
        ) {
            const parts = booking.booking_details.map(detail => {
                const name =
                    detail?.room_type?.name || detail?.notes || roomName || '';
                const count = detail?.room_count || 1;
                if (!name) return '';
                // Always show quantity, even when it's 1, to reflect room_count clearly
                return `${name} x ${count}`;
            });
            return parts.filter(Boolean).join(', ');
        }

        // From history API: room_details string
        if (booking.room_details) {
            return booking.room_details
                .split(',')
                .map(room => room.trim())
                .join(', ');
        }

        return roomName || '-';
    }, [booking, roomName]);

    const checkInDisplay = useMemo(() => {
        if (booking.check_in_at) {
            return formatDate(booking.check_in_at);
        }
        return '-';
    }, [booking]);

    const checkOutDisplay = useMemo(() => {
        if (booking.check_out_at) {
            return formatDate(booking.check_out_at);
        }
        return '-';
    }, [booking]);

    // Format guests similar to BookingHistoryScreen
    const guestsDisplay = useMemo(() => {
        const guestCountObj = booking.guest_count;

        if (guestCountObj) {
            const adults = guestCountObj.adults || 0;
            const children = guestCountObj.children || 0;

            const parts = [];
            if (adults > 0) {
                parts.push(`${adults} x ${t('booking.adult')}`);
            }
            if (children > 0) {
                parts.push(`${children} x ${t('booking.children')}`);
            }

            if (parts.length > 0) {
                return parts.join(', ');
            }

            const totalGuests = adults + children;
            if (totalGuests > 0) {
                return String(totalGuests);
            }
        }

        if (booking.guests) {
            return String(booking.guests);
        }

        return '-';
    }, [booking, t]);

    // Normalize status
    const normalizedStatus = normalizeBookingStatus(booking.status);

    // Button enable/disable logic
    const canCancel =
        normalizedStatus === BOOKING_STATUS.PENDING ||
        normalizedStatus === BOOKING_STATUS.CONFIRMED;

    const canPrintInvoice = normalizedStatus === BOOKING_STATUS.CHECKED_OUT;

    // Handle cancel button press
    const handleCancelPress = () => {
        if (!canCancel) return;
        navigation.navigate('BookingCancelScreen', { booking });
    };

    // Handle print invoice button press
    const handlePrintInvoicePress = () => {
        if (!canPrintInvoice) return;
        // TODO: Implement actual print functionality
        Alert.alert(t('citrine.msg000319'));
    };

    const headerProps = {
        title: t('citrine.msg000312'),
        showCrudText: false,
    };

    if (loading && !bookingInfo) {
        return (
            <MasterPageLayout headerType="header" headerProps={headerProps}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </MasterPageLayout>
        );
    }

    if (error && !bookingInfo) {
        return (
            <MasterPageLayout headerType="header" headerProps={headerProps}>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            </MasterPageLayout>
        );
    }

    return (
        <View style={styles.container}>
            <MasterPageLayout headerType="header" headerProps={headerProps}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.contentContainer}>
                        {/* Section: Booking Status */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>
                                {t('citrine.msg000313')}
                            </Text>
                            <View style={styles.infoGroup}>
                                <InfoRow
                                    label={t('citrine.msg000314')}
                                    value={bookingCode}
                                    isFirst={true}
                                />
                                <View
                                    style={[
                                        styles.infoRow,
                                        styles.infoRowWithBorder,
                                    ]}>
                                    <Text style={styles.infoLabel}>
                                        {t('citrine.msg000313')}
                                    </Text>
                                    <StatusBadge
                                        status={booking.status}
                                        t={t}
                                    />
                                </View>
                            </View>
                        </View>

                        {/* Section: Customer Information */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>
                                {t('citrine.msg000315')}
                            </Text>
                            <View style={styles.infoGroup}>
                                <InfoRow
                                    label={t('booking.fullName')}
                                    value={customerInfo.fullName}
                                    isFirst={true}
                                />
                                <InfoRow
                                    label={t('booking.email')}
                                    value={customerInfo.email}
                                />
                                <InfoRow
                                    label={t('booking.phoneNumber')}
                                    value={customerInfo.phoneNumber}
                                />
                            </View>
                        </View>

                        {/* Section: Booking Details */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>
                                {t('citrine.msg000316')}
                            </Text>
                            <View style={styles.infoGroup}>
                                <InfoRow
                                    label={t('booking.hotel')}
                                    value={hotelName}
                                    isFirst={true}
                                />
                                <InfoRow
                                    label={t('booking.room')}
                                    value={roomDisplay}
                                />
                                <InfoRow
                                    label={t('booking.checkIn')}
                                    value={checkInDisplay}
                                />
                                <InfoRow
                                    label={t('booking.checkOut')}
                                    value={checkOutDisplay}
                                />
                                <InfoRow
                                    label={t('booking.numberOfGuests')}
                                    value={guestsDisplay}
                                />
                            </View>
                        </View>

                        {/* Section: Payment Details */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>
                                {t('citrine.msg000317')}
                            </Text>
                            <View style={styles.infoGroup}>
                                <InfoRow
                                    label={t('citrine.msg000320', {
                                        count: nights,
                                    })}
                                    value={formatCurrency(
                                        paymentDetails.roomPrice,
                                    )}
                                    isFirst={true}
                                />
                                <InfoRow
                                    label={t('citrine.msg000321')}
                                    value={formatCurrency(
                                        paymentDetails.taxAndFees,
                                    )}
                                />
                                <InfoRow
                                    label={t('citrine.msg000322')}
                                    value={formatCurrency(paymentDetails.total)}
                                    isTotal={true}
                                />
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </MasterPageLayout>
            <View style={styles.bottomBar}>
                <TouchableOpacity
                    style={[
                        styles.button,
                        styles.cancelButton,
                        !canCancel && styles.buttonDisabled,
                    ]}
                    onPress={handleCancelPress}
                    disabled={!canCancel}>
                    <Text
                        style={[
                            styles.buttonText,
                            styles.cancelButtonText,
                            !canCancel && styles.buttonTextDisabled,
                        ]}>
                        {t('citrine.msg000318')}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.button,
                        styles.buttonPrimary,
                        !canPrintInvoice && styles.buttonDisabled,
                    ]}
                    onPress={handlePrintInvoicePress}
                    disabled={!canPrintInvoice}>
                    <Text
                        style={[
                            styles.buttonText,
                            styles.buttonPrimaryText,
                            !canPrintInvoice && styles.buttonTextDisabled,
                        ]}>
                        {t('citrine.msg000319')}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
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
    scrollContent: {
        padding: moderateSize(16),
        paddingBottom: moderateSize(120),
    },
    contentContainer: {
        flexGrow: 1,
    },
    section: {
        marginBottom: moderateSize(20),
    },
    sectionTitle: {
        fontSize: moderateSize(18),
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: moderateSize(15),
    },
    infoGroup: {
        backgroundColor: colors.surface,
        borderRadius: 10,
        padding: moderateSize(15),
        marginHorizontal: moderateSize(2),
        shadowColor: colors.black,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    infoRowWithBorder: {
        marginTop: moderateSize(15),
        paddingTop: moderateSize(15),
        borderTopWidth: 1,
        borderTopColor: colors.borderColorGrey01,
    },
    infoLabel: {
        fontSize: moderateSize(16),
        color: colors.textSecondary,
        flex: 1,
        paddingRight: moderateSize(12),
    },
    infoValue: {
        fontSize: moderateSize(16),
        color: colors.textPrimary,
        fontWeight: '500',
        textAlign: 'right',
        flex: 2,
    },
    infoValueTotal: {
        color: colors.primary,
        fontWeight: 'bold',
        fontSize: moderateSize(18),
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: moderateSize(4),
        paddingHorizontal: moderateSize(10),
        borderRadius: moderateSize(12),
    },
    statusBadgeIcon: {
        marginRight: moderateSize(5),
    },
    statusBadgeText: {
        fontSize: moderateSize(12),
        fontWeight: 'bold',
    },
    statusCompleted: {
        backgroundColor:
            BOOKING_STATUS_COLORS[BOOKING_STATUS.CHECKED_OUT].backgroundColor,
    },
    statusCompletedText: {
        color: BOOKING_STATUS_COLORS[BOOKING_STATUS.CHECKED_OUT].textColor,
    },
    statusConfirmed: {
        backgroundColor:
            BOOKING_STATUS_COLORS[BOOKING_STATUS.CONFIRMED].backgroundColor,
    },
    statusConfirmedText: {
        color: BOOKING_STATUS_COLORS[BOOKING_STATUS.CONFIRMED].textColor,
    },
    statusPending: {
        backgroundColor:
            BOOKING_STATUS_COLORS[BOOKING_STATUS.PENDING].backgroundColor,
    },
    statusPendingText: {
        color: BOOKING_STATUS_COLORS[BOOKING_STATUS.PENDING].textColor,
    },
    statusCheckedIn: {
        backgroundColor:
            BOOKING_STATUS_COLORS[BOOKING_STATUS.CHECKED_IN].backgroundColor,
    },
    statusCheckedInText: {
        color: BOOKING_STATUS_COLORS[BOOKING_STATUS.CHECKED_IN].textColor,
    },
    statusCancelled: {
        backgroundColor:
            BOOKING_STATUS_COLORS[BOOKING_STATUS.CANCELLED].backgroundColor,
    },
    statusCancelledText: {
        color: BOOKING_STATUS_COLORS[BOOKING_STATUS.CANCELLED].textColor,
    },
    statusRefunded: {
        backgroundColor:
            BOOKING_STATUS_COLORS[BOOKING_STATUS.REFUNDED].backgroundColor,
    },
    statusRefundedText: {
        color: BOOKING_STATUS_COLORS[BOOKING_STATUS.REFUNDED].textColor,
    },
    bottomBar: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        padding: moderateSize(15),
        paddingHorizontal: moderateSize(20),
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.borderColorGrey01,
        zIndex: 10,
        elevation: 10,
        flexDirection: 'row',
        gap: moderateSize(10),
    },
    button: {
        flex: 1,
        padding: moderateSize(12),
        borderRadius: moderateSize(10),
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonPrimary: {
        backgroundColor: colors.primary,
    },
    buttonSecondary: {
        backgroundColor: '#E8E7F9',
        borderWidth: 1,
        borderColor: colors.primary,
    },
    cancelButton: {
        backgroundColor: 'rgba(231, 76, 60, 0.08)',
        borderWidth: 1,
        borderColor: colors.danger,
    },
    buttonDisabled: {
        backgroundColor: colors.disabledBg,
        opacity: 0.6,
        borderColor: colors.borderColorGrey01,
    },
    buttonText: {
        fontSize: moderateSize(16),
        fontWeight: 'bold',
    },
    buttonPrimaryText: {
        color: colors.textWhite,
    },
    buttonSecondaryText: {
        color: colors.primary,
    },
    cancelButtonText: {
        color: colors.danger,
    },
    buttonTextDisabled: {
        color: colors.disabledText,
    },
});

export default BookingInfoScreen;
