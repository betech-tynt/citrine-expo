import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import {
    GuestCounterRowTypes,
    CounterButtonTypes,
} from '../../../../utils/propTypes';
import { moderateSize } from '../../../../styles';
import colors from '../../../../constants/colors';

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

CounterButton.propTypes = CounterButtonTypes;

/**
 * GuestCounterRow component
 * @param {Object} props
 * @param {string} props.label
 * @param {number} props.value
 * @param {function} props.onDecrease
 * @param {function} props.onIncrease
 * @param {boolean} props.isLast
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

GuestCounterRow.propTypes = GuestCounterRowTypes;

const styles = StyleSheet.create({
    infoRowBorder: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.border,
    },
    infoLabel: {
        fontSize: moderateSize(16),
        color: colors.textPrimary,
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
});

export default GuestCounterRow;


