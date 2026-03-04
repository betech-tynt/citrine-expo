import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
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
import { SAMPLE_ROOMS } from '../../../../constants/utils';
import { commonStyles } from '../../../../theme/commonStyles';

export default function CustomerBookingScreen() {
    const { t } = useTranslation();
    const navigation = useNavigation();

    const [adultCount, setAdultCount] = useState(2);
    const [childrenCount, setChildrenCount] = useState(0);

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
        navigation.navigate('BookingConfirmScreen', {
            adultCount,
            childrenCount,
        });
    };

    return (
        <View style={styles.container}>
            <Header title="Booking" showCrudText={false} />
            <View style={[commonStyles.main, styles.backgroundColor]}>
                {SAMPLE_ROOMS.map(room => (
                    <View key={room.id} style={[styles.card, styles.roomCard]}>
                        <View style={styles.roomImagePlaceholder} />
                        <View style={styles.roomInfo}>
                            <Text style={styles.roomName}>{room.name}</Text>
                            <Text style={styles.roomPrice}>
                                {`${room.price.toLocaleString(
                                    'vi-VN',
                                )}đ / night`}
                            </Text>
                            <Text style={styles.hotelName}>
                                {room.hotelName}
                            </Text>
                        </View>
                    </View>
                ))}

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        {t('booking.bookingDetailTitle')}
                    </Text>
                    <View style={styles.card}>
                        <BookingInfoRow
                            label={t('booking.checkIn')}
                            value={t('booking.checkInExample')}
                            showIcon
                        />
                        <BookingInfoRow
                            label={t('booking.checkOut')}
                            value={t('booking.checkOutExample')}
                            showIcon
                        />
                        <BookingInfoRow
                            label={t('booking.nights')}
                            value={t('booking.nightsExample')}
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
                        {t('booking.totalAmountExample')}
                    </Text>
                    <Text style={styles.totalNights}>
                        {t('booking.totalNightsExample')}
                    </Text>
                </View>
                <Button
                    title={t('common.next')}
                    onPress={handleContinue}
                    style={styles.nextButton}
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
function BookingInfoRow({ label, value, showIcon, isLast }) {
    return (
        <View style={[styles.infoRow, !isLast && styles.infoRowBorder]}>
            <Text style={styles.infoLabel}>{label}</Text>
            <View style={styles.infoValueContainer}>
                <Text style={styles.infoValue}>{value}</Text>
                {showIcon && <Text style={styles.iconPlaceholder}>📅</Text>}
            </View>
        </View>
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
