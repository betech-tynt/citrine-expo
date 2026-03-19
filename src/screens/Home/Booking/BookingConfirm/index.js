import React, { useEffect, useMemo, useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MasterPageLayout from '../../../../components/MasterPageLayout';
import colors from '../../../../constants/colors';
import { moderateSize } from '../../../../styles';
import { formatCurrency } from '../../../../utils/formatCurrency';
import { SAMPLE_BOOKING_DATA } from '../../../../constants/utils';
import { InfoRowPropTypes } from '../../../../utils/propTypes';
import { createCustomerBooking } from '../../../../services/apiCustomerBooking';
import {
    isAuthError,
    handleAuthError,
} from '../../../../utils/authErrorHandler';

/**
 * InfoRow Component
 * Displays a label-value pair with optional styling for totals and borders
 */
const InfoRow = ({ label, value, isTotal = false, isFirst = false }) => (
    <View style={[styles.infoRow, !isFirst && styles.infoRowWithBorder]}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={[styles.infoValue, isTotal && styles.infoValueTotal]}>
            {value}
        </Text>
    </View>
);

// Define prop types once (avoid re-assigning inside render)
InfoRow.propTypes = InfoRowPropTypes;

/**
 * BookingConfirmScreen
 * Displays booking confirmation details and handles booking creation via API
 */
const BookingConfirmScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { t } = useTranslation();

    const params = route?.params || {};
    const initialBookingData = params.bookingData || SAMPLE_BOOKING_DATA;
    const bookingDraft = params.bookingDraft || {};
    const selections = params.selections || {};
    const guestCountFromParams =
        params.guestCount || initialBookingData.guestCount;

    const [bookingData] = useState(initialBookingData);
    const [customerInfo, setCustomerInfo] = useState(() => {
        const base = bookingData.customer || {};
        return {
            fullName: base.fullName || '-',
            email: base.email || '-',
            phoneNumber: base.phoneNumber || '-',
        };
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    /**
     * Load customer information from AsyncStorage
     * Priority: customerUser (from customer_home API) > userInfo (legacy)
     * Falls back to bookingData.customer or '-' if not available
     */
    useEffect(() => {
        let isMounted = true;

        const loadCustomerInfo = async () => {
            try {
                const storedCustomerUser = await AsyncStorage.getItem(
                    'customerUser',
                );

                let user = null;

                if (storedCustomerUser) {
                    user = JSON.parse(storedCustomerUser);
                } else {
                    const storedUserInfo = await AsyncStorage.getItem(
                        'userInfo',
                    );
                    if (storedUserInfo) {
                        const parsed = JSON.parse(storedUserInfo);
                        user = parsed?.user || null;
                    }
                }

                const baseCustomer = bookingData.customer || {};

                const fullName =
                    (user && user.name) ||
                    (user &&
                        [user.last_name, user.first_name]
                            .filter(Boolean)
                            .join(' ')
                            .trim()) ||
                    baseCustomer.fullName ||
                    '-';

                const email = (user && user.email) || baseCustomer.email || '-';

                const phoneNumber =
                    (user && (user.phone_number || user.phone)) ||
                    baseCustomer.phoneNumber ||
                    '-';

                if (isMounted) {
                    setCustomerInfo({ fullName, email, phoneNumber });
                }
            } catch (error) {
                console.error(
                    '[BookingConfirmScreen] Failed to load customer info:',
                    error,
                );
            }
        };

        loadCustomerInfo();

        return () => {
            isMounted = false;
        };
    }, [bookingData.customer]);

    /**
     * Format guest count for display
     * Shows "X x Adults, Y x Children" format or total number
     */
    const guestsDisplay = useMemo(() => {
        const gc = guestCountFromParams || bookingData.guestCount;

        if (gc) {
            const adults = Number(gc.adults || 0);
            const children = Number(gc.children || 0);
            const parts = [];

            if (adults > 0) {
                parts.push(`${t('booking.adult')}：${adults}人`);
            }
            if (children > 0) {
                parts.push(`${t('booking.children')}：${children}人`);
            }

            if (parts.length > 0) {
                return parts.join('　');
            }

            const totalGuests = adults + children;
            if (totalGuests > 0) {
                return String(totalGuests);
            }
        }

        if (typeof bookingData.numberOfGuests === 'number') {
            return String(bookingData.numberOfGuests);
        }

        return String(SAMPLE_BOOKING_DATA.numberOfGuests);
    }, [
        bookingData.guestCount,
        bookingData.numberOfGuests,
        guestCountFromParams,
        t,
    ]);

    /**
     * Calculate guest totals for API payload
     * Returns { adults, children, total }
     */
    const guestTotals = useMemo(() => {
        const gc = guestCountFromParams || bookingData.guestCount;
        if (gc) {
            const adults = Number(gc.adults || 0);
            const children = Number(gc.children || 0);
            return {
                adults,
                children,
                total: adults + children,
            };
        }
        const totalFromBooking =
            typeof bookingData.numberOfGuests === 'number'
                ? bookingData.numberOfGuests
                : SAMPLE_BOOKING_DATA.numberOfGuests;
        return {
            adults: totalFromBooking,
            children: 0,
            total: totalFromBooking,
        };
    }, [
        bookingData.guestCount,
        bookingData.numberOfGuests,
        guestCountFromParams,
    ]);

    /**
     * Parse date string from DD/MM/YYYY to YYYY-MM-DD (ISO format)
     * Returns null if format is invalid
     */
    const parseDateToISO = dateStr => {
        if (!dateStr || typeof dateStr !== 'string') return null;
        const parts = dateStr.split('/');
        if (parts.length === 3) {
            const [day, month, year] = parts;
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
        if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
            return dateStr;
        }
        return null;
    };

    /**
     * Handle confirm button press
     * Creates booking via API and navigates to payment screen on success
     * Handles various error cases with user-friendly messages
     */
    const handleConfirmPress = async () => {
        if (isSubmitting) return;

        // Get ISO dates from bookingDraft or parse from bookingData
        let finalCheckInISO =
            bookingDraft?.checkInISO ||
            parseDateToISO(bookingData.checkIn) ||
            '';
        let finalCheckOutISO =
            bookingDraft?.checkOutISO ||
            parseDateToISO(bookingData.checkOut) ||
            '';

        // Fallback: Navigate without API call if essential data is missing
        if (!bookingDraft.sectionId || !finalCheckInISO || !finalCheckOutISO) {
            navigation.navigate('BookingPaymentScreen', {
                totalAmount: bookingData.total,
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const selectionEntries = Object.values(selections || {});
            if (selectionEntries.length === 0) {
                navigation.navigate('BookingPaymentScreen', {
                    totalAmount: bookingData.total,
                });
                setIsSubmitting(false);
                return;
            }

            // Build booking details array from selections
            const bookingDetails = selectionEntries
                .map(sel => {
                    const rt = sel?.roomType || {};
                    const qty = Number(sel?.quantity || 0);
                    if (!rt.id || qty <= 0) return null;
                    return {
                        room_type_id: Number(rt.id),
                        room_count: qty,
                        notes: bookingDraft.notes || '',
                    };
                })
                .filter(Boolean);

            if (bookingDetails.length === 0) {
                Alert.alert(t('common.error'), t('booking.noValidRooms'));
                setIsSubmitting(false);
                return;
            }

            // Build API payload
            const bookingPayload = {
                section_id: bookingDraft.sectionId,
                start: finalCheckInISO,
                end: finalCheckOutISO,
                booking_details: bookingDetails,
                guest_count: {
                    adults: guestTotals.adults,
                    children: guestTotals.children,
                },
                special_requests:
                    bookingDraft.specialRequests || bookingDraft.notes || '',
            };

            // Call API to create booking
            const created = await createCustomerBooking(bookingPayload);
            const bookingId = created.id;
            const totalAmount = created.total_price || bookingData.total;
            const hotelName =
                created.section?.name ||
                bookingData.hotel ||
                SAMPLE_BOOKING_DATA.hotel;

            // Navigate to payment screen with booking data
            await clearGuestCache();
            navigation.navigate('BookingPaymentScreen', {
                bookingId,
                totalAmount,
                bookingSummary: {
                    hotel: hotelName,
                    guests: guestsDisplay,
                    checkIn: bookingData.checkIn,
                    checkOut: bookingData.checkOut,
                },
            });
        } catch (error) {
            // Handle different error types with appropriate messages
            let errorMessage = error.message || t('common.error');
            const errorMsgLower = errorMessage.toLowerCase();

            if (isAuthError(errorMessage)) {
                handleAuthError(navigation);
                return;
            }

            if (
                errorMsgLower.includes('already') ||
                errorMsgLower.includes('duplicate') ||
                errorMsgLower.includes('exists') ||
                errorMsgLower.includes('conflict') ||
                errorMsgLower.includes('active booking')
            ) {
                errorMessage =
                    t('booking.activeBookingExists') ||
                    t('booking.duplicateBooking');
            } else if (
                errorMsgLower.includes('capacity exceeded') ||
                errorMsgLower.includes('exceeded capacity') ||
                errorMsgLower.includes('too many guests') ||
                errorMsgLower.includes('room capacity') ||
                errorMsgLower.includes('guest capacity')
            ) {
                errorMessage = t('booking.capacityExceeded');
            } else if (
                errorMsgLower.includes('invalid') ||
                errorMsgLower.includes('validation') ||
                errorMsgLower.includes('required')
            ) {
                errorMessage = t('booking.invalidBookingData');
            } else if (
                errorMsgLower.includes('network') ||
                errorMsgLower.includes('timeout') ||
                errorMsgLower.includes('connection')
            ) {
                errorMessage = t('common.networkError');
            } else if (
                errorMsgLower.includes('not available') ||
                errorMsgLower.includes('selected dates')
            ) {
                errorMessage = t('booking.roomUnavailable');
            }

            Alert.alert(t('common.error'), errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Clear cached guest counts after a booking is successfully submitted.
    const clearGuestCache = async () => {
        try {
            const sectionKey = bookingDraft?.sectionId || 'default';
            await AsyncStorage.removeItem(`booking_guests_${sectionKey}`);
        } catch (error) {
            console.warn(
                '[BookingConfirmScreen] Failed to clear guest cache:',
                error,
            );
        }
    };

    return (
        <MasterPageLayout
            headerType="header"
            headerProps={{ title: t('booking.confirm'), showCrudText: false }}>
            <ScrollView
                style={styles.mainContent}
                contentContainerStyle={[styles.scrollContent]}>
                <View style={styles.contentContainer}>
                    {/* Customer Information Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            {t('booking.customerInfo')}
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

                    {/* Booking Details Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            {t('booking.bookingDetails')}
                        </Text>
                        <View style={styles.infoGroup}>
                            <InfoRow
                                label={t('booking.hotel')}
                                value={bookingData.hotel}
                                isFirst={true}
                            />
                            <InfoRow
                                label={t('booking.room')}
                                value={bookingData.rooms
                                    .map(
                                        room =>
                                            `${room.name} x${room.quantity}`,
                                    )
                                    .join(', ')}
                            />
                            <InfoRow
                                label={t('booking.checkIn')}
                                value={bookingData.checkIn}
                            />
                            <InfoRow
                                label={t('booking.checkOut')}
                                value={bookingData.checkOut}
                            />
                            <InfoRow
                                label={t('booking.numberOfGuests')}
                                value={guestsDisplay}
                            />
                        </View>
                    </View>

                    {/* Payment Details Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            {t('booking.paymentDetails')}
                        </Text>
                        <View style={styles.infoGroup}>
                            <InfoRow
                                label={t('booking.roomPrice', {
                                    nights: bookingData.nights,
                                })}
                                value={formatCurrency(bookingData.roomPrice)}
                                isFirst={true}
                            />
                            <InfoRow
                                label={t('booking.taxAndFees')}
                                value={formatCurrency(bookingData.taxAndFees)}
                            />
                            <InfoRow
                                label={t('booking.total')}
                                value={formatCurrency(bookingData.total)}
                                isTotal={true}
                            />
                        </View>
                    </View>
                </View>
            </ScrollView>
            <View style={styles.bottomBar}>
                <TouchableOpacity
                    style={[
                        styles.confirmButton,
                        isSubmitting && styles.confirmButtonDisabled,
                    ]}
                    onPress={handleConfirmPress}
                    disabled={isSubmitting}>
                    {isSubmitting ? (
                        <ActivityIndicator color={colors.textWhite} />
                    ) : (
                        <Text style={styles.confirmButtonText}>
                            {t('booking.confirmAndPay')}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        </MasterPageLayout>
    );
};

const styles = StyleSheet.create({
    mainContent: {
        flex: 1,
    },
    container: {
        flex: 1,
        backgroundColor: colors.surfaceSoft,
    },
    scrollContent: {
        padding: moderateSize(16),
        paddingBottom: moderateSize(120),
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
        shadowColor: colors.black,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        marginHorizontal: moderateSize(2),
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    infoLabel: {
        fontSize: moderateSize(16),
        color: colors.textSecondary,
        flex: 1,
        paddingRight: moderateSize(12),
    },
    infoRowWithBorder: {
        marginTop: moderateSize(15),
        paddingTop: moderateSize(15),
        borderTopWidth: 1,
        borderTopColor: colors.borderColorGrey01,
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
    },
    confirmButton: {
        backgroundColor: colors.primary,
        padding: moderateSize(15),
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    confirmButtonDisabled: {
        opacity: 0.6,
    },
    confirmButtonText: {
        color: colors.textWhite,
        fontSize: moderateSize(16),
        fontWeight: 'bold',
    },
});

export default BookingConfirmScreen;
