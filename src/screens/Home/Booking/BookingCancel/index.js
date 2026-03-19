import React, { useMemo, useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TextInput,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import MasterPageLayout from '../../../../components/MasterPageLayout';
import colors from '../../../../constants/colors';
import { moderateSize } from '../../../../styles';
import Button from '../../../../components/Button';
import { formatCurrency } from '../../../../utils/formatCurrency';
import {
    BOOKING_STATUS,
    normalizeBookingStatus,
    SAMPLE_BOOKING_HISTORY,
} from '../../../../constants/utils';
import { InfoRowPropTypes } from '../../../../utils/propTypes';
import { customerBookingCancel } from '../../../../services/apiBookingCancel';

const BookingCancelScreen = () => {
    const { t } = useTranslation();
    const navigation = useNavigation();
    const route = useRoute();

    const [reason, setReason] = useState('');
    const [isTouched, setIsTouched] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [bottomBarHeight, setBottomBarHeight] = useState(0);

    // Booking passed from previous screen (BookingHistory / BookingInfo).
    const bookingFromParams = route?.params?.booking;

    // Prioritize booking from route params, fallback to sample data to avoid crash when running screen independently.
    const booking = useMemo(() => {
        if (bookingFromParams) return bookingFromParams;

        const eligibleBooking = SAMPLE_BOOKING_HISTORY.find(item => {
            const status = normalizeBookingStatus(item.status);
            return (
                status === BOOKING_STATUS.PENDING ||
                status === BOOKING_STATUS.CONFIRMED
            );
        });

        return eligibleBooking || SAMPLE_BOOKING_HISTORY[0];
    }, [bookingFromParams]);

    // Normalize booking code for display (prioritize actual code from API if available).
    const bookingCode = useMemo(() => {
        if (booking?.code) return booking.code;

        const id = booking?.id ? String(booking.id) : '0';
        return `#BK${id.padStart(6, '0')}`;
    }, [booking]);

    // Validate cancel reason.
    const trimmedReason = reason.trim();
    const isReasonValid = Boolean(trimmedReason);
    const showReasonError = isTouched && !isReasonValid;

    // Main display data for booking info section.
    const bookingHotelName =
        booking?.hotelName || booking?.hotel || booking?.section_name || '-';
    const bookingTotalAmount =
        booking?.totalAmount ?? booking?.total ?? booking?.total_price ?? 0;

    // Execute API P0105 cancel booking request after user confirms.
    const submitCancelBooking = async () => {
        if (isSubmitting) return;

        setIsSubmitting(true);

        try {
            const cancelledBooking = await customerBookingCancel(
                booking.id,
                trimmedReason,
            );

            Alert.alert(t('common.success'), t('booking.cancelSuccess'), [
                {
                    text: t('common.ok'),
                    onPress: () => {
                        navigation.replace('BookingInfoScreen', {
                            booking: cancelledBooking,
                        });
                    },
                },
            ]);
        } catch (error) {
            Alert.alert(
                t('common.error'),
                error?.message || t('booking.cancelFailed'),
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    // Validate input, then show confirmation dialog before calling cancel API.
    const handleConfirmCancel = () => {
        setIsTouched(true);

        if (!isReasonValid || isSubmitting) return;

        if (!booking?.id && booking?.id !== 0) {
            Alert.alert(t('common.error'), t('payment.missingBookingId'));
            return;
        }

        Alert.alert(
            t('common.confirm'),
            t('booking.confirmCancelMessage') ||
                'Are you sure you want to cancel this booking?',
            [
                {
                    text: t('common.cancel'),
                    style: 'cancel',
                },
                {
                    text: t('common.confirm'),
                    style: 'destructive',
                    onPress: submitCancelBooking,
                },
            ],
        );
    };

    return (
        <MasterPageLayout headerType="header" headerProps={{ title: t('citrine.msg000300'), showCrudText: false }}>
            <ScrollView
                style={styles.mainContent}
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingBottom: bottomBarHeight || moderateSize(120) }]}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}>
                {/* Section: Booking details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        {t('citrine.msg000301')}
                    </Text>
                    <View style={styles.card}>
                        <InfoRow
                            label={t('citrine.msg000302')}
                            value={bookingCode}
                            isFirst
                        />
                        <InfoRow
                            label={t('citrine.msg000303')}
                            value={bookingHotelName}
                        />
                        <InfoRow
                            label={t('citrine.msg000304')}
                            value={formatCurrency(bookingTotalAmount)}
                        />
                    </View>
                </View>

                {/* Section: Cancel reason */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        {t('citrine.msg000305')}
                    </Text>
                    <View style={styles.card}>
                        <TextInput
                            style={[
                                styles.textArea,
                                showReasonError && styles.textAreaError]}
                            placeholder={t('citrine.msg000306')}
                            placeholderTextColor={colors.textSecondary}
                            value={reason}
                            onChangeText={text => setReason(text)}
                            onBlur={() => setIsTouched(true)}
                            multiline
                            textAlignVertical="top"
                            maxLength={500}
                        />
                        {showReasonError && (
                            <Text style={styles.errorText}>
                                {t('citrine.msg000307')}
                            </Text>
                        )}
                    </View>
                </View>

                {/* Section: Cancellation policy */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        {t('citrine.msg000308')}
                    </Text>
                    <View style={styles.card}>
                        <Text style={styles.policyText}>
                            {t('citrine.msg000309')}
                        </Text>
                    </View>
                </View>
            </ScrollView>

            <View
                style={styles.bottomBar}
                onLayout={event => {
                    setBottomBarHeight(event.nativeEvent.layout.height);
                }}>
                <Button
                    title={
                        isSubmitting
                            ? t('common.loading') || 'Loading...'
                            : t('citrine.msg000310')
                    }
                    onPress={handleConfirmCancel}
                    disabled={!isReasonValid || isSubmitting}
                    style={[
                        styles.confirmButton,
                        styles.confirmButtonDanger,
                        isSubmitting && styles.confirmButtonDisabled]}
                />
                {isSubmitting && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator color={colors.textWhite} />
                    </View>
                )}
            </View>
        </MasterPageLayout>
    );
};

const InfoRow = ({ label, value, isFirst }) => (
    <View style={[styles.infoRow, !isFirst && styles.infoRowWithBorder]}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
    </View>
);

InfoRow.propTypes = InfoRowPropTypes;

const styles = StyleSheet.create({
    mainContent: {
        flex: 1,
        padding: moderateSize(16),
    },
    container: {
        flex: 1,
        backgroundColor: colors.surfaceSoft,
    },
    scrollContent: {
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
    card: {
        backgroundColor: colors.surface,
        borderRadius: moderateSize(10),
        padding: moderateSize(15),
        marginHorizontal: moderateSize(2),
        shadowColor: colors.black,
        shadowOpacity: 0.05,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
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
    textArea: {
        borderWidth: 1,
        borderColor: colors.borderColorGrey01,
        borderRadius: moderateSize(8),
        padding: moderateSize(12),
        fontSize: moderateSize(16),
        color: colors.textPrimary,
        minHeight: moderateSize(110),
        backgroundColor: colors.white,
    },
    textAreaError: {
        borderColor: colors.error,
    },
    errorText: {
        marginTop: moderateSize(8),
        color: colors.error,
        fontSize: moderateSize(12),
        fontWeight: '500',
    },
    policyText: {
        fontSize: moderateSize(14),
        color: colors.textSecondary,
        lineHeight: moderateSize(20),
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
        borderRadius: moderateSize(10),
    },
    // Use Button component but override background to danger red for cancel action
    confirmButtonDanger: {
        backgroundColor: colors.danger,
    },
    confirmButtonDisabled: {
        opacity: 0.75,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default BookingCancelScreen;
