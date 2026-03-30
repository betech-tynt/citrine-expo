import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import colors from '../../../constants/colors';
import { moderateSize } from '../../../styles/moderateSize';

export const FILTER_KEYS = ['all', '5', '4', '3', '2', '1', 'helpful'];

const FilterChips = ({ activeFilter, onFilterPress, t }) => {
    const filterLabel = key => {
        if (key === 'all') return t('sectionRating.filter.all');
        if (key === 'helpful') return t('sectionRating.filter.mostHelpful');
        return `${key} ★`;
    };

    return (
        <ScrollView
            horizontal
            nestedScrollEnabled={true}
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
            contentContainerStyle={styles.filterContent}>
            {FILTER_KEYS.map(key => (
                <TouchableOpacity
                    key={key}
                    style={[
                        styles.filterBtn,
                        activeFilter === key && styles.filterBtnActive,
                    ]}
                    onPress={() => onFilterPress(key)}
                    activeOpacity={0.7}>
                    <Text
                        style={[
                            styles.filterBtnText,
                            activeFilter === key && styles.filterBtnTextActive,
                        ]}>
                        {filterLabel(key)}
                    </Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
};

FilterChips.propTypes = {
    activeFilter: PropTypes.string.isRequired,
    onFilterPress: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
};

const styles = StyleSheet.create({
    filterScroll: {
        backgroundColor: colors.white,
        borderRadius: moderateSize(10),
        overflow: 'hidden',
        marginBottom: moderateSize(12),
    },
    filterContent: {
        paddingHorizontal: moderateSize(12),
        paddingVertical: moderateSize(12),
        gap: moderateSize(8),
    },
    filterBtn: {
        paddingVertical: moderateSize(8),
        paddingHorizontal: moderateSize(16),
        borderRadius: moderateSize(20),
        borderWidth: 1.5,
        borderColor: '#ddd',
        backgroundColor: colors.white,
    },
    filterBtnActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    filterBtnText: {
        fontSize: moderateSize(12),
        fontWeight: '500',
        color: '#333',
    },
    filterBtnTextActive: {
        color: colors.white,
    },
});

export default React.memo(FilterChips);
