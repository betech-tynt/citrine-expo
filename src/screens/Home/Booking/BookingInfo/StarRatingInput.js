import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { moderateSize } from '../../../../styles';
import colors from '../../../../constants/colors';
import CustomIcon from '../../../../components/CustomIcon';

const getStarName = (star, value) => {
    if (star <= Math.floor(value)) return 'star';
    if (star === Math.ceil(value) && value % 1 >= 0.5) return 'star-half-o';
    return 'star-o';
};

const StarRatingInput = ({ value = 0, onPress, readonly = false }) => (
    <View style={styles.starRow}>
        {[1, 2, 3, 4, 5].map(star => {
            const starName = getStarName(star, value);
            const filled = starName === 'star' || starName === 'star-half-o';
            return (
                <TouchableOpacity
                    key={star}
                    style={styles.starCell}
                    onPress={() => !readonly && onPress && onPress(star)}
                    activeOpacity={readonly ? 1 : 0.7}>
                    <CustomIcon
                        type="FontAwesome"
                        name={starName}
                        size={filled ? moderateSize(34) : moderateSize(28)}
                        color={filled ? colors.gold : colors.borderColorGrey02}
                    />
                </TouchableOpacity>
            );
        })}
    </View>
);

StarRatingInput.propTypes = {
    value: PropTypes.number,
    onPress: PropTypes.func,
    readonly: PropTypes.bool,
};

const styles = StyleSheet.create({
    starRow: {
        flexDirection: 'row',
        gap: moderateSize(8),
        marginTop: moderateSize(10),
    },
    starCell: {
        width: moderateSize(32),
        height: moderateSize(32),
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default StarRatingInput;
