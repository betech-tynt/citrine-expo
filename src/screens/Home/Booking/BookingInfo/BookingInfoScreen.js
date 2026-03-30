import React, {
    useMemo,
    useState,
    useEffect,
    useCallback,
    useRef,
} from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    Alert,
    TextInput,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/FontAwesome';
import { ActivityIndicator } from 'react-native';
import ChildrenLayout from '../../../../components/ChildrenLayout';
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
import {
    fetchBookingRatingCriteria,
    fetchBookingReview,
    submitBookingRating,
} from '../../../../services/apiBookingRating';
import { formatDate } from '../../../../utils/formatDate';
import KeyboardAwareWrapper from '../../../../components/KeyboardAwareWrapper';
import RatingCriteriaCard from './RatingCriteriaCard';
import CustomIcon from '../../../../components/CustomIcon';
import { log } from '../../../../utils/handleLog';

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

    const [ratingCriteria, setRatingCriteria] = useState([]);

    const [criteriaLoading, setCriteriaLoading] = useState(false);
    // Fetch rating criteria (Review type) from P0402
    useEffect(() => {
        // IF not checkout, skip fetching criteria and don't show rating section at all
        if (normalizedStatus !== BOOKING_STATUS.CHECKED_OUT) return;
        let isMounted = true;
        setCriteriaLoading(true);
        fetchBookingRatingCriteria()
            .then(data => {
                // When API call succeeds, use returned criteria list (may be empty)
                if (isMounted) setRatingCriteria(data);
            })
            .catch(() => {
                console.warn('Failed to fetch rating criteria, using defaults');
                if (isMounted) setRatingCriteria([]);
            })
            .finally(() => {
                if (isMounted) setCriteriaLoading(false);
            });
        return () => {
            isMounted = false;
        };
    }, [normalizedStatus]);

    const [ratingValues, setRatingValues] = useState({});
    const [apiAverageRating, setApiAverageRating] = useState(null);
    const [reviewId, setReviewId] = useState(null);
    const [comment, setComment] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const successTimerRef = useRef(null);

    useEffect(() => {
        return () => clearTimeout(successTimerRef.current);
    }, []);

    // Live average across all criteria — only active when user edits stars (apiAverageRating is null)
    const calculatedRating = useMemo(() => {
        if (ratingCriteria.length === 0) return 0;
        const filledCriteria = ratingCriteria.filter(
            criterion => (ratingValues[criterion.id] || 0) > 0,
        );
        if (filledCriteria.length === 0) return 0;
        const totalScore = ratingCriteria.reduce(
            (sum, criterion) => sum + (ratingValues[criterion.id] || 0),
            0,
        );
        // Divide by total criteria (not filled) to penalize unanswered ones
        return totalScore / ratingCriteria.length;
    }, [ratingValues, ratingCriteria]);

    const overallRating = apiAverageRating ?? calculatedRating;

    // Apply review data returned from P0401 into form state.
    // withCriteria=true: also set ratingCriteria fallback (used on initial load only).
    const loadReview = useCallback((review, withCriteria = false) => {
        if (!review) return;
        const ratings = review.ratings || [];

        if (withCriteria && ratings.length > 0) {
            const criteriaFromReview = ratings.map(rating => ({
                id: rating.id,
                name: rating.name,
                icon: rating.icon,
            }));
            setRatingCriteria(prev =>
                prev.length > 0 ? prev : criteriaFromReview,
            );
        }

        const ratingValueMap = {};
        ratings.forEach(rating => {
            ratingValueMap[rating.id] = rating.value;
        });

        setReviewId(review.id ?? null);
        setRatingValues(ratingValueMap);
        setApiAverageRating(review.average_rating ?? null);
        setComment(review.comment || '');
    }, []);

    // Fetch existing review for this booking (P0401) and pre-fill form if found
    useEffect(() => {
        if (!bookingId || normalizedStatus !== BOOKING_STATUS.CHECKED_OUT) {
            return;
        }
        let isMounted = true;
        fetchBookingReview(bookingId)
            .then(review => {
                if (isMounted) loadReview(review, true);
            })
            .catch(() => {
                // No existing review or network error
            });
        return () => {
            isMounted = false;
        };
    }, [bookingId, normalizedStatus, loadReview]);

    const getRatingLabel = useCallback(
        value => {
            const labels = [
                '',
                t('citrine.msg000712'),
                t('citrine.msg000713'),
                t('citrine.msg000714'),
                t('citrine.msg000715'),
                t('citrine.msg000716'),
            ];
            return labels[Math.round(value)] || t('citrine.msg000711');
        },
        [t],
    );

    const handleStarPress = useCallback((criteriaId, starValue) => {
        setApiAverageRating(null);
        setRatingValues(prev => ({ ...prev, [criteriaId]: starValue }));
    }, []);

    const handleSubmitRating = async () => {
        // Count unfilled criteria
        const unfilled = ratingCriteria.filter(
            criterion => (ratingValues[criterion.id] || 0) === 0,
        ).length;
        if (unfilled > 0) {
            Alert.alert(t('citrine.msg000719', { count: unfilled }));
            return;
        }

        // Disable button + show spinner
        setIsSubmitting(true);
        try {
            const ratingsPayload = ratingCriteria.map(criterion => ({
                criteria_id: criterion.id,
                value: ratingValues[criterion.id],
            }));
            const { status: submitStatus, message: submitMessage } =
                await submitBookingRating(
                    bookingId,
                    ratingsPayload,
                    comment,
                    reviewId,
                );

            // Refresh review data from P0401 so UI reflects latest saved state
            fetchBookingReview(bookingId)
                .then(review => loadReview(review))
                .catch(() => {});

            clearTimeout(successTimerRef.current);
            log('[info][submitBookingRating]:', submitStatus, submitMessage);
            setShowSuccess(true);
            successTimerRef.current = setTimeout(
                () => setShowSuccess(false),
                5000,
            );
        } catch (e) {
            log('[error][submitBookingRating]:', e.message);
            Alert.alert(
                t(reviewId ? 'citrine.msg000721' : 'citrine.msg000720'),
            );
        } finally {
            // Restore button icon (spinner → check)
            setIsSubmitting(false);
        }
    };

    const headerProps = {
        title: t('citrine.msg000312'),
    };

    if (loading && !bookingInfo) {
        return (
            <ChildrenLayout headerType="header" headerProps={headerProps}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </ChildrenLayout>
        );
    }

    if (error && !bookingInfo) {
        return (
            <ChildrenLayout headerType="header" headerProps={headerProps}>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            </ChildrenLayout>
        );
    }

    return (
        <ChildrenLayout headerType="header" headerProps={headerProps}>
            <KeyboardAwareWrapper
                scrollEnabled={true}
                style={styles.keyboardWrapper}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled">
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

                        {/* Section: Service Rating — only visible for completed bookings */}
                        {normalizedStatus === BOOKING_STATUS.CHECKED_OUT && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>
                                    {t('citrine.msg000700')}
                                </Text>

                                {/* Alert info box */}
                                <View style={styles.alertBox}>
                                    <Icon
                                        name="info-circle"
                                        size={moderateSize(18)}
                                        color="#1565C0"
                                        style={styles.alertBoxIcon}
                                    />
                                    <Text style={styles.alertBoxText}>
                                        {t('citrine.msg000717')}
                                    </Text>
                                </View>

                                {/* Overall rating display */}
                                <View style={styles.overallRatingBox}>
                                    <Text style={styles.overallRatingValue}>
                                        {overallRating > 0
                                            ? overallRating.toFixed(1)
                                            : '0.0'}
                                    </Text>
                                    <Text style={styles.overallRatingLabel}>
                                        {t('citrine.msg000707')}
                                    </Text>
                                </View>

                                {/* Rating criteria */}
                                {criteriaLoading ? (
                                    <ActivityIndicator
                                        size="small"
                                        color={colors.primary}
                                        style={styles.criteriaLoader}
                                    />
                                ) : (
                                    ratingCriteria.map(criteria => {
                                        const currentValue =
                                            ratingValues[criteria.id] || 0;
                                        const valueLabel =
                                            currentValue > 0
                                                ? `${currentValue}/5 - ${getRatingLabel(
                                                      currentValue,
                                                  )}`
                                                : t('citrine.msg000711');
                                        return (
                                            <RatingCriteriaCard
                                                key={criteria.id}
                                                name={criteria.name}
                                                icon={criteria.icon}
                                                value={currentValue}
                                                onPress={star =>
                                                    handleStarPress(
                                                        criteria.id,
                                                        star,
                                                    )
                                                }
                                                readonly={isSubmitting}
                                                valueLabel={valueLabel}
                                            />
                                        );
                                    })
                                )}

                                {/* Comment section */}
                                <View style={styles.commentSection}>
                                    <View style={styles.commentLabelRow}>
                                        <Icon
                                            name="comment"
                                            size={moderateSize(16)}
                                            color={colors.textPrimary}
                                            style={styles.commentLabelIcon}
                                        />
                                        <Text style={styles.commentLabel}>
                                            {t('citrine.msg000708')}
                                        </Text>
                                    </View>
                                    <TextInput
                                        style={styles.commentBox}
                                        placeholder={t('citrine.msg000709')}
                                        placeholderTextColor={
                                            colors.textSecondary
                                        }
                                        multiline
                                        maxLength={1000}
                                        value={comment}
                                        onChangeText={setComment}
                                        textAlignVertical="top"
                                        editable={!isSubmitting}
                                    />
                                    <Text style={styles.charCount}>
                                        {comment.length}/1000
                                    </Text>
                                </View>

                                {/* Success message — shown after submit */}
                                {showSuccess && (
                                    <View style={styles.successMessage}>
                                        <Icon
                                            name="check-circle"
                                            size={moderateSize(14)}
                                            color={colors.white}
                                            style={styles.successMessageIcon}
                                        />
                                        <Text style={styles.successMessageText}>
                                            {t('citrine.msg000718')}
                                        </Text>
                                    </View>
                                )}

                                {/* Submit button */}
                                <TouchableOpacity
                                    style={[
                                        styles.submitRatingButton,
                                        isSubmitting &&
                                            styles.submitRatingButtonDisabled,
                                    ]}
                                    onPress={handleSubmitRating}
                                    activeOpacity={0.8}
                                    disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <ActivityIndicator
                                            size="small"
                                            color={colors.textWhite}
                                            style={styles.submitRatingIcon}
                                        />
                                    ) : (
                                        <CustomIcon
                                            name="check"
                                            size={moderateSize(14)}
                                            color={colors.textWhite}
                                            style={styles.submitRatingIcon}
                                        />
                                    )}
                                    <Text style={styles.submitRatingText}>
                                        {t('citrine.msg000710')}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </ScrollView>
            </KeyboardAwareWrapper>
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
        </ChildrenLayout>
    );
};

const styles = StyleSheet.create({
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
    keyboardWrapper: {
        flex: 1,
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
    alertBox: {
        backgroundColor: '#E3F2FD',
        borderLeftWidth: 4,
        borderLeftColor: '#2196F3',
        borderRadius: moderateSize(6),
        padding: moderateSize(12),
        paddingHorizontal: moderateSize(15),
        marginBottom: moderateSize(15),
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    alertBoxIcon: {
        marginRight: moderateSize(8),
        marginTop: moderateSize(2),
    },
    alertBoxText: {
        fontSize: moderateSize(14),
        color: '#1565C0',
        flex: 1,
    },
    successMessage: {
        backgroundColor: '#FFB800',
        borderRadius: moderateSize(8),
        padding: moderateSize(12),
        paddingHorizontal: moderateSize(15),
        marginBottom: moderateSize(15),
        flexDirection: 'row',
        alignItems: 'center',
    },
    successMessageIcon: {
        marginRight: moderateSize(8),
    },
    successMessageText: {
        fontSize: moderateSize(14),
        color: colors.textWhite,
        flex: 1,
    },
    overallRatingBox: {
        backgroundColor: '#FFB800',
        borderRadius: moderateSize(12),
        padding: moderateSize(20),
        marginBottom: moderateSize(12),
        alignItems: 'center',
    },
    overallRatingValue: {
        fontSize: moderateSize(48),
        fontWeight: 'bold',
        color: colors.textWhite,
    },
    overallRatingLabel: {
        fontSize: moderateSize(14),
        color: colors.textWhite,
        marginTop: moderateSize(5),
    },
    ratingCriteria: {
        backgroundColor: colors.surface,
        borderRadius: moderateSize(10),
        padding: moderateSize(15),
        marginBottom: moderateSize(12),
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    criteriaHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: moderateSize(10),
        marginBottom: moderateSize(10),
    },
    criteriaLabel: {
        fontSize: moderateSize(16),
        fontWeight: '600',
        color: colors.textPrimary,
    },
    starRow: {
        flexDirection: 'row',
        gap: moderateSize(8),
        marginTop: moderateSize(10),
    },
    starCell: {
        width: moderateSize(32),
        height: moderateSize(32),
        alignItems: 'center',
        justifyContent: 'center',
    },
    ratingValueText: {
        fontSize: moderateSize(14),
        color: colors.textSecondary,
        marginTop: moderateSize(5),
    },
    commentSection: {
        backgroundColor: colors.surface,
        borderRadius: moderateSize(10),
        padding: moderateSize(15),
        marginBottom: moderateSize(12),
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    commentLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: moderateSize(8),
        marginBottom: moderateSize(10),
    },
    commentLabelIcon: {},
    commentLabel: {
        fontSize: moderateSize(16),
        fontWeight: '600',
        color: colors.textPrimary,
    },
    commentBox: {
        borderWidth: 1,
        borderColor: colors.borderColorGrey02,
        borderRadius: moderateSize(8),
        padding: moderateSize(12),
        fontSize: moderateSize(14),
        color: colors.textPrimary,
        minHeight: moderateSize(100),
    },
    charCount: {
        textAlign: 'right',
        fontSize: moderateSize(12),
        color: colors.textSecondary,
        marginTop: moderateSize(5),
    },
    criteriaLoader: {
        marginVertical: moderateSize(20),
    },
    submitRatingButton: {
        backgroundColor: colors.primary,
        borderRadius: moderateSize(10),
        padding: moderateSize(14),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: moderateSize(15),
    },
    submitRatingButtonDisabled: {
        backgroundColor: colors.disabledBg,
        opacity: 0.6,
    },
    submitRatingIcon: {
        marginRight: moderateSize(8),
    },
    submitRatingText: {
        fontSize: moderateSize(16),
        fontWeight: 'bold',
        color: colors.textWhite,
    },
});

export default BookingInfoScreen;
