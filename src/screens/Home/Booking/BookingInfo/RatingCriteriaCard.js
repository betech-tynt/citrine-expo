import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import FaIcon from '../../../../components/FaIcon';
import { moderateSize } from '../../../../styles';
import colors from '../../../../constants/colors';
import StarRatingInput from './StarRatingInput';

const RatingCriteriaCard = ({ name, icon, value, onPress, readonly, valueLabel }) => (
    <View style={styles.card}>
        <View style={styles.header}>
            <FaIcon icon={icon} size={moderateSize(22)} color={colors.primary} />
            <Text style={styles.label}>{name}</Text>
        </View>
        <StarRatingInput value={value} onPress={onPress} readonly={readonly} />
        <Text style={styles.valueText}>{valueLabel}</Text>
    </View>
);

RatingCriteriaCard.propTypes = {
    name: PropTypes.string.isRequired,
    icon: PropTypes.string,
    value: PropTypes.number.isRequired,
    onPress: PropTypes.func,
    readonly: PropTypes.bool,
    valueLabel: PropTypes.string.isRequired,
};

const styles = StyleSheet.create({
    card: {
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: moderateSize(10),
        marginBottom: moderateSize(10),
    },
    label: {
        fontSize: moderateSize(16),
        fontWeight: '600',
        color: colors.textPrimary,
    },
    valueText: {
        fontSize: moderateSize(14),
        color: colors.textSecondary,
        marginTop: moderateSize(5),
    },
});

export default RatingCriteriaCard;
