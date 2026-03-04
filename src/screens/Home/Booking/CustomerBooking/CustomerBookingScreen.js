import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Header from '../../../../components/Header';
import Button from '../../../../components/Button';
import { moderateSize } from '../../../../styles';
import colors from '../../../../constants/colors';
import {
    BookingInfoRowTypes,
    CounterButtonTypes,
    GuestCounterRowTypes,
} from '../../../../utils/propTypes';
import { commonStyles } from '../../../../theme/commonStyles';
import { formatDate } from '../../../../utils/formatDate';
import { formatCurrency } from '../../../../utils/formatCurrency';

export default function CustomerBookingScreen() {
    const { t } = useTranslation();
    const navigation = useNavigation();
    const route = useRoute();

    const bookingDraft = route?.params?.bookingDraft || {};
    const hotelName = bookingDraft?.hotelName || '';
    const selectedRoomName =
        bookingDraft?.selectedRoom?.name || bookingDraft?.roomName || '';
    const unitPrice = Number(
        bookingDraft?.unitPrice || bookingDraft?.selectedRoom?.min_price || 0,
    );
    const roomCount = Number(bookingDraft?.roomCount || 1);

    const [adultCount, setAdultCount] = useState(2);
    const [childrenCount, setChildrenCount] = useState(0);

    const [checkInDate, setCheckInDate] = useState(() => new Date());
    const [checkOutDate, setCheckOutDate] = useState(() => {
        const date = new Date();
        date.setDate(date.getDate() + 1);
        return date;
    });

    const addDays = (date, days) => {
        const d = date instanceof Date ? new Date(date) : new Date();
        d.setDate(d.getDate() + days);
        return d;
    };

    const handleBumpCheckIn = () => {
        const nextCheckIn = addDays(checkInDate, 1);
        setCheckInDate(nextCheckIn);
        if (checkOutDate <= nextCheckIn) {
            setCheckOutDate(addDays(nextCheckIn, 1));
        }
    };

    const handleBumpCheckOut = () => {
        const nextCheckOut = addDays(checkOutDate, 1);
        setCheckOutDate(nextCheckOut);
    };

    const nights = useMemo(() => {
        const startDate = checkInDate instanceof Date ? checkInDate : null;
        const endDate = checkOutDate instanceof Date ? checkOutDate : null;

        if (startDate && endDate) {
            if (
                !Number.isNaN(startDate.getTime()) &&
                !Number.isNaN(endDate.getTime())
            ) {
                const diffMs = endDate.getTime() - startDate.getTime();
                const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
                if (diffDays > 0) return diffDays;
            }
        }

        return 1;
    }, [checkInDate, checkOutDate]);

    const roomPrice = useMemo(
        () => Math.max(0, unitPrice) * Math.max(1, roomCount) * nights,
        [nights, roomCount, unitPrice],
    );

    const total = roomPrice;
    const canContinue = unitPrice > 0 && nights > 0;

    const handleDecrease = type => {
        if (type === 'adult') {
            setAdultCount(prev => Math.max(0, prev - 1));
        } else {
            setChildrenCount(prev => Math.max(0, prev - 1));
        }
    };

    const handleIncrease = type => {
        if (type === 'adult') {
            setAdultCount(prev => prev + 1);
        } else {
            setChildrenCount(prev => prev + 1);
        }
    };

    const handleContinue = () => {
        if (!canContinue) return;

        const bookingData = {
            customer: {
                fullName: '-',
                email: '-',
                phoneNumber: '-',
            },
            hotel: hotelName || '-',
            rooms: [
                {
                    name: selectedRoomName || '-',
                    quantity: Math.max(1, roomCount),
                },
            ],
            checkIn: formatDate(checkInDate),
            checkOut: formatDate(checkOutDate),
            numberOfGuests: adultCount + childrenCount,
            nights,
            roomPrice,
            taxAndFees: 0,
            total,
        };

        navigation.navigate('BookingConfirmScreen', {
            bookingData,
            bookingDraft,
        });
    };

    return (
        <View style={styles.container}>
            <Header
                title={t('booking.bookingDetailTitle')}
                showCrudText={false}
            />
            <View style={[commonStyles.main, styles.backgroundColor]}>
                <View style={[styles.card, styles.roomCard]}>
                    <View style={styles.roomImagePlaceholder} />
                    <View style={styles.roomInfo}>
                        <Text style={styles.roomName}>
                            {selectedRoomName || hotelName || '-'}
                        </Text>
                        <Text style={styles.roomPrice}>
                            {unitPrice > 0
                                ? `${formatCurrency(unitPrice)} / ${t(
                                      'customerRoomInfo.price.perNight',
                                      { defaultValue: 'night' },
                                  )}`
                                : t('common.priceNotAvailable', {
                                      defaultValue: 'N/A',
                                  })}
                        </Text>
                        <Text style={styles.hotelName}>{hotelName || '-'}</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        {t('booking.bookingDetailTitle')}
                    </Text>
                    <View style={styles.card}>
                        <BookingInfoRow
                            label={t('booking.checkIn')}
                            value={formatDate(checkInDate)}
                            showIcon
                            onPress={handleBumpCheckIn}
                        />
                        <BookingInfoRow
                            label={t('booking.checkOut')}
                            value={formatDate(checkOutDate)}
                            showIcon
                            onPress={handleBumpCheckOut}
                        />
                        <BookingInfoRow
                            label={t('booking.nights')}
                            value={String(nights)}
                            isLast
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        {t('booking.guestCountTitle')}
                    </Text>
                    <View style={styles.card}>
                        <GuestCounterRow
                            label={t('booking.adult')}
                            value={adultCount}
                            onDecrease={() => handleDecrease('adult')}
                            onIncrease={() => handleIncrease('adult')}
                        />
                        <GuestCounterRow
                            label={t('booking.children')}
                            value={childrenCount}
                            onDecrease={() => handleDecrease('children')}
                            onIncrease={() => handleIncrease('children')}
                            isLast
                        />
                    </View>
                </View>
            </View>

            <View style={styles.bottomBar}>
                <View style={styles.totalContainer}>
                    <Text style={styles.totalAmount}>
                        {unitPrice > 0
                            ? formatCurrency(total)
                            : t('common.priceNotAvailable', {
                                  defaultValue: 'N/A',
                              })}
                    </Text>
                    <Text style={styles.totalNights}>
                        {`${nights} ${t('booking.nights', {
                            defaultValue: 'nights',
                        })}`}
                    </Text>
                </View>
                <Button
                    title={t('common.next')}
                    onPress={handleContinue}
                    style={styles.nextButton}
                    disabled={!canContinue}
                />
            </View>
        </View>
    );
}

/**
 * BookingInfoRow component
 * @param {Object} props - The props for the component
 * @param {string} props.label - The label for the row
 * @param {string} props.value - The value for the row
 * @param {boolean} props.showIcon - Whether to show the icon
 * @param {boolean} props.isLast - Whether to show the last row
 */
function BookingInfoRow({ label, value, showIcon, isLast, onPress }) {
    const Container = onPress ? Pressable : View;
    return (
        <Container
            style={[styles.infoRow, !isLast && styles.infoRowBorder]}
            onPress={onPress}>
            <Text style={styles.infoLabel}>{label}</Text>
            <View style={styles.infoValueContainer}>
                <Text style={styles.infoValue}>{value}</Text>
                {showIcon && <Text style={styles.iconPlaceholder}>📅</Text>}
            </View>
        </Container>
    );
}

/**
 * GuestCounterRow component
 * @param {Object} props - The props for the component
 * @param {string} props.label - The label for the row
 * @param {number} props.value - The value for the row
 * @param {function} props.onDecrease - The function to decrease the value
 * @param {function} props.onIncrease - The function to increase the value
 * @param {boolean} props.isLast - Whether to show the last row
 */
function GuestCounterRow({ label, value, onDecrease, onIncrease, isLast }) {
    return (
        <View style={[styles.guestRow, !isLast && styles.infoRowBorder]}>
            <Text style={styles.infoLabel}>{label}</Text>
            <View style={styles.counterContainer}>
                <CounterButton label="-" onPress={onDecrease} />
                <Text style={styles.counterValue}>{value}</Text>
                <CounterButton label="+" onPress={onIncrease} />
            </View>
        </View>
    );
}

/**
 * CounterButton component
 * @param {Object} props - The props for the component
 * @param {string} props.label - The label for the button
 * @param {function} props.onPress - The function to press the button
 */
function CounterButton({ label, onPress }) {
    return (
        <Pressable
            style={({ pressed }) => [
                styles.counterButton,
                pressed && styles.counterButtonPressed,
            ]}
            onPress={onPress}>
            <Text style={styles.counterButtonText}>{label}</Text>
        </Pressable>
    );
}

// Define data types for props
BookingInfoRow.propTypes = BookingInfoRowTypes;

GuestCounterRow.propTypes = GuestCounterRowTypes;

CounterButton.propTypes = CounterButtonTypes;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flexGrow: 1,
        padding: moderateSize(16),
        marginTop: moderateSize(60),
        zIndex: 2,
    },
    card: {
        backgroundColor: colors.surface,
        borderRadius: moderateSize(12),
        padding: moderateSize(12),
        marginBottom: moderateSize(12),
    },
    roomCard: {
        flexDirection: 'row',
    },
    roomImagePlaceholder: {
        width: moderateSize(72),
        height: moderateSize(72),
        borderRadius: moderateSize(8),
        backgroundColor: colors.disabledBg,
        marginRight: moderateSize(12),
    },
    roomInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    roomName: {
        fontSize: moderateSize(16),
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: moderateSize(4),
    },
    roomPrice: {
        fontSize: moderateSize(16),
        fontWeight: '700',
        color: colors.primary,
        marginBottom: moderateSize(4),
    },
    hotelName: {
        fontSize: moderateSize(12),
        color: colors.textSecondary,
    },
    section: {
        marginTop: moderateSize(12),
    },
    sectionTitle: {
        fontSize: moderateSize(18),
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: moderateSize(8),
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: moderateSize(10),
    },
    infoRowBorder: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.border,
    },
    infoLabel: {
        fontSize: moderateSize(16),
        color: colors.textPrimary,
    },
    infoValueContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    infoValue: {
        fontSize: moderateSize(16),
        color: colors.primary,
        marginRight: moderateSize(8),
    },
    iconPlaceholder: {
        fontSize: moderateSize(14),
    },
    guestRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: moderateSize(10),
    },
    counterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    counterButton: {
        width: moderateSize(24),
        height: moderateSize(24),
        borderRadius: moderateSize(12),
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    counterButtonPressed: {
        opacity: 0.7,
    },
    counterButtonText: {
        color: colors.white,
        fontSize: moderateSize(16),
        fontWeight: '600',
    },
    counterValue: {
        marginHorizontal: moderateSize(16),
        fontSize: moderateSize(14),
        fontWeight: '600',
        color: colors.textPrimary,
    },
    bottomBar: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: moderateSize(16),
        paddingVertical: moderateSize(12),
        backgroundColor: colors.surface,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: colors.border,
        zIndex: 2,
        elevation: 8,
    },
    totalContainer: {
        flex: 1,
    },
    totalAmount: {
        fontSize: moderateSize(16),
        fontWeight: '700',
        color: colors.primary,
    },
    totalNights: {
        fontSize: moderateSize(12),
        color: colors.textSecondary,
        marginTop: moderateSize(2),
    },
    nextButton: {
        marginLeft: moderateSize(12),
        minWidth: moderateSize(120),
        width: 'auto',
    },
    backgroundColor: {
        backgroundColor: colors.background,
    },
});
