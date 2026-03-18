import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BookingInfoRowTypes } from '../../../../utils/propTypes';
import { moderateSize } from '../../../../styles';
import colors from '../../../../constants/colors';

/**
 * BookingInfoRow component
 * @param {Object} props
 * @param {string} props.label
 * @param {string} props.value
 * @param {boolean} props.showIcon
 * @param {boolean} props.isLast
 * @param {function=} props.onPress
 */
function BookingInfoRow({ label, value, showIcon, isLast, onPress }) {
    const Container = onPress ? TouchableOpacity : View;
    const containerProps = onPress ? { activeOpacity: 0.7 } : {};
    return (
        <Container
            style={[styles.infoRow, !isLast && styles.infoRowBorder]}
            onPress={onPress}
            {...containerProps}>
            <Text style={styles.infoLabel}>{label}</Text>
            <View style={styles.infoValueContainer}>
                <Text style={styles.infoValue}>{value}</Text>
                {showIcon && <Text style={styles.iconPlaceholder}>📅</Text>}
            </View>
        </Container>
    );
}

BookingInfoRow.propTypes = BookingInfoRowTypes;

const styles = StyleSheet.create({
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
});

export default BookingInfoRow;


