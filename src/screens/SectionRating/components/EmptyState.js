import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import CustomIcon from '../../../components/CustomIcon';
import colors from '../../../constants/colors';
import { moderateSize } from '../../../styles/moderateSize';

const EmptyState = ({ loading, error, t }) => {
    if (loading) return null;

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <CustomIcon
                    type="FontAwesome"
                    name="exclamation-circle"
                    size={moderateSize(40)}
                    color={colors.borderColorGrey02}
                />
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    return (
        <View style={styles.emptyContainer}>
            <CustomIcon
                type="FontAwesome"
                name="comments-o"
                size={moderateSize(48)}
                color={colors.borderColorGrey02}
            />
            <Text style={styles.emptyText}>
                {t('sectionRating.noReviews')}
            </Text>
        </View>
    );
};

EmptyState.propTypes = {
    loading: PropTypes.bool.isRequired,
    error: PropTypes.string,
    t: PropTypes.func.isRequired,
};

const styles = StyleSheet.create({
    errorContainer: {
        paddingVertical: moderateSize(40),
        alignItems: 'center',
        gap: moderateSize(12),
        paddingHorizontal: moderateSize(24),
    },
    errorText: {
        fontSize: moderateSize(13),
        color: colors.textSecondary,
        textAlign: 'center',
    },
    emptyContainer: {
        paddingVertical: moderateSize(40),
        alignItems: 'center',
        gap: moderateSize(10),
    },
    emptyText: {
        fontSize: moderateSize(14),
        color: colors.textSecondary,
    },
});

export default React.memo(EmptyState);
