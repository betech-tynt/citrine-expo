import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import CustomIcon from './CustomIcon';
import colors from '../constants/colors';
import { CustomerRoomInfoStarRatingPropTypes } from '../utils/propTypes';
import { moderateSize } from '../styles/moderateSize';

/**
 * Reusable star rating component used across customer screens.
 *
 * Props:
 * - rating: number (0..max, supports halves)
 * - max: total number of stars (default 5)
 * - countText: optional text displayed next to stars, e.g. "(120)"
 * - size: icon size
 */
const StarRating = ({ rating = 0, max = 5, countText, size = moderateSize(13) }) => {
    const fullStars = Math.floor(rating);
    const hasHalf = rating - fullStars >= 0.5;

    return (
        <View style={styles.ratingRow}>
            <View style={styles.ratingStars}>
                {Array.from({ length: max }).map((_, index) => {
                    const idx = index + 1;
                    const name =
                        idx <= fullStars
                            ? 'star'
                            : hasHalf && idx === fullStars + 1
                              ? 'star-half-o'
                              : 'star-o';

                    return (
                        <CustomIcon
                            key={idx}
                            type="FontAwesome"
                            name={name}
                            size={size}
                            color={colors.warning}
                            style={styles.ratingStar}
                        />
                    );
                })}
            </View>
            {countText ? <Text style={styles.ratingCount}>{countText}</Text> : null}
        </View>
    );
};

StarRating.propTypes = CustomerRoomInfoStarRatingPropTypes;

const styles = StyleSheet.create({
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingStars: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingStar: {
        marginRight: moderateSize(2),
    },
    ratingCount: {
        marginLeft: moderateSize(4),
        fontSize: moderateSize(12),
        color: colors.textSecondary,
    },
});

export default StarRating;


