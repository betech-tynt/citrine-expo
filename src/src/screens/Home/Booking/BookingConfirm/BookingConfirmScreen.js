import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Header from '../../../../components/Header';
import colors from '../../../../constants/colors';
import { moderateSize } from '../../../../styles';
import { formatCurrency } from '../../../../utils/formatCurrency';
import { SAMPLE_BOOKING_DATA } from '../../../../constants/utils';
import { InfoRowPropTypes } from '../../../../utils/propTypes';
import { commonStyles } from '../../../../theme/commonStyles';

// Helper component to render a label/value row
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

const BookingConfirmScreen = () => {
    const navigation = useNavigation();
    const { t } = useTranslation();

    // Use sample data from constants/utils.js
    // Will be replaced with route params later
    const bookingData = SAMPLE_BOOKING_DATA;

    // Handle confirm button press
    const handleConfirmPress = () => {
        navigation.navigate('BookingPaymentScreen');
    };

    return (
        <View style={styles.container}>
            <Header title={t('booking.confirm')} showCrudText={false} />
            <ScrollView
                style={commonStyles.bookingMain}
                contentContainerStyle={[
                    commonStyles.bookingContentContainer,
                    styles.scrollContent,
                ]}>
                <View style={styles.contentContainer}>
                    {/* Section: Customer Information */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            {t('booking.customerInfo')}
                        </Text>
                        <View style={styles.infoGroup}>
                            <InfoRow
                                label={t('booking.fullName')}
                                value={bookingData.customer.fullName}
                                isFirst={true}
                            />
                            <InfoRow
                                label={t('booking.email')}
                                value={bookingData.customer.email}
                            />
                            <InfoRow
                                label={t('booking.phoneNumber')}
                                value={bookingData.customer.phoneNumber}
                            />
                        </View>
                    </View>

                    {/* Section: Booking Details */}
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
                                value={`${bookingData.numberOfGuests} ${t(
                                    'booking.adults',
                                )}`}
                            />
                        </View>
                    </View>

                    {/* Section: Payment Details */}
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
                    style={styles.confirmButton}
                    onPress={handleConfirmPress}>
                    <Text style={styles.confirmButtonText}>
                        {t('booking.confirmAndPay')}
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
    scrollContent: {
        // Keep space for the sticky bottom bar so content isn't covered
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
    confirmButtonText: {
        color: colors.textWhite,
        fontSize: moderateSize(16),
        fontWeight: 'bold',
    },
});

export default BookingConfirmScreen;
