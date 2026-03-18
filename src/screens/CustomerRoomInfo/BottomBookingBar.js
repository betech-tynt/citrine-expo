import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Button from '../../components/Button';
import colors from '../../constants/colors';
import { moderateSize } from '../../styles/moderateSize';
import { BottomBookingBarPropTypes } from '../../utils/propTypes';

function BottomBookingBar({
    priceText,
    perNightText,
    roomsText,
    buttonText,
    onPress,
    disabled = false,
}) {
    return (
        <View style={styles.bookingBarContainer}>
            <View style={styles.bookingBarPriceCol}>
                <Text style={styles.bookingBarPrice}>{priceText}</Text>
                <Text style={styles.bookingBarPerNight}>{perNightText}</Text>
                {!!roomsText && (
                    <Text style={styles.bookingBarRooms}>{roomsText}</Text>
                )}
            </View>
            <View style={styles.bookingBarBtnCol}>
                <Button
                    title={buttonText}
                    onPress={onPress}
                    style={styles.bookingBarButton}
                    textStyle={styles.bookingBarButtonText}
                    disabled={disabled}
                />
            </View>
        </View>
    );
}

BottomBookingBar.propTypes = BottomBookingBarPropTypes;

const styles = StyleSheet.create({
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
});

export default BottomBookingBar;


