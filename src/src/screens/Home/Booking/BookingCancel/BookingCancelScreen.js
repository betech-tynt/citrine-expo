import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';
import Header from '../../../../components/Header';
import { commonStyles } from '../../../../theme/commonStyles';
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

const BookingCancelScreen = () => {
    const { t } = useTranslation();
    const [reason, setReason] = useState('');
    const [isTouched, setIsTouched] = useState(false);
    const [bottomBarHeight, setBottomBarHeight] = useState(0);

    // TODO: Replace with route.params booking when API/navigation params are ready
    const booking = useMemo(() => {
        const eligible = SAMPLE_BOOKING_HISTORY.find(b => {
            const st = normalizeBookingStatus(b.status);
            return (
                st === BOOKING_STATUS.PENDING ||
                st === BOOKING_STATUS.CONFIRMED
            );
        });
        return eligible || SAMPLE_BOOKING_HISTORY[0];
    }, []);

    const bookingCode = useMemo(() => {
        const id = booking?.id ? String(booking.id) : '0';
        return `#BK${id.padStart(6, '0')}`;
    }, [booking]);

    const trimmedReason = reason.trim();
    const isReasonValid = trimmedReason.length > 0;
    const showReasonError = isTouched && !isReasonValid;

    const handleConfirmCancel = () => {
        setIsTouched(true);
        if (!isReasonValid) return;
        // TODO: Call cancel booking API when available
        // eslint-disable-next-line no-console
        console.warn('Cancel booking requested. Reason:', trimmedReason);
    };

    return (
        <View style={styles.container}>
            <Header title={t('citrine.msg000300')} showCrudText={false} />

            <ScrollView
                style={commonStyles.bookingMain}
                contentContainerStyle={[
                    commonStyles.bookingContentContainer,
                    styles.scrollContent,
                    { paddingBottom: bottomBarHeight || moderateSize(120) },
                ]}
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
                            value={booking?.hotelName || booking?.hotel || '-'}
                        />
                        <InfoRow
                            label={t('citrine.msg000304')}
                            value={formatCurrency(
                                booking?.totalAmount ?? booking?.total ?? 0,
                            )}
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
                                showReasonError && styles.textAreaError,
                            ]}
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
                    title={t('citrine.msg000310')}
                    onPress={handleConfirmCancel}
                    disabled={!isReasonValid}
                    style={[styles.confirmButton, styles.confirmButtonDanger]}
                />
            </View>
        </View>
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
});

export default BookingCancelScreen;
