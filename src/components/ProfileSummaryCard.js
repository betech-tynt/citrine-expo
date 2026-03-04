import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { moderateSize } from '../styles/moderateSize';
import colors from '../constants/colors';
import {
    ProfileSummaryCardPropTypes,
    ProfileInfoRowPropTypes,
} from '../utils/propTypes';

const ProfileInfoRow = ({
    label,
    value,
    isLast = false,
    labelColor,
    valueColor,
    labelSize,
    valueSize,
    labelFontWeight,
    valueFontWeight,
}) => (
    <View style={[styles.row, isLast && styles.rowLast]}>
        <Text
            style={[
                styles.label,
                labelColor && { color: labelColor },
                labelSize && { fontSize: labelSize },
                labelFontWeight && { fontWeight: labelFontWeight },
            ]}>
            {label}
        </Text>
        <Text
            style={[
                styles.value,
                valueColor && { color: valueColor },
                valueSize && { fontSize: valueSize },
                valueFontWeight && { fontWeight: valueFontWeight },
            ]}>
            {value}
        </Text>
    </View>
);

const ProfileSummaryCard = ({
    data,
    isLast = false,
    labelColor,
    valueColor,
    labelSize,
    valueSize,
    labelFontWeight,
    valueFontWeight,
}) => {
    return (
        <View style={[styles.card, isLast && styles.cardLast]}>
            {data.map((item, index) => (
                <ProfileInfoRow
                    key={`${item.label}-${index}`}
                    label={item.label}
                    value={item.value}
                    isLast={isLast}
                    labelColor={labelColor}
                    valueColor={valueColor}
                    labelSize={labelSize}
                    valueSize={valueSize}
                    labelFontWeight={labelFontWeight}
                    valueFontWeight={valueFontWeight}
                />
            ))}
        </View>
    );
};

// Define prop types for the ProfileInfoRow component
ProfileInfoRow.propTypes = ProfileInfoRowPropTypes;

// Define prop types for the ProfileSummaryCard component
ProfileSummaryCard.propTypes = ProfileSummaryCardPropTypes;

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.white,
        borderRadius: moderateSize(16),
        paddingHorizontal: moderateSize(10),
        paddingVertical: moderateSize(5),
        marginHorizontal: moderateSize(4),
        shadowColor: colors.shadowColorGrey03,
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 4,
        marginBottom: moderateSize(16),
    },
    row: {
        paddingVertical: moderateSize(12),
        borderBottomWidth: 1,
        borderBottomColor: colors.borderColorGrey01,
    },
    rowLast: {
        borderBottomWidth: 0,
    },
    label: {
        fontSize: moderateSize(13),
        color: colors.textSecondary,
        marginBottom: moderateSize(6),
    },
    value: {
        fontSize: moderateSize(15),
        color: colors.textPrimary,
        fontWeight: '600',
    },
});

export default ProfileSummaryCard;
