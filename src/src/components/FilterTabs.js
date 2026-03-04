import React from 'react';
import { Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import colors from '../constants/colors';
import { FilterTabsPropTypes } from '../utils/propTypes';

const FilterTabs = ({ filters, selectedFilter, onFilterPress }) => {
    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.container}
            contentContainerStyle={styles.contentContainer}>
            {filters.map(filter => (
                <TouchableOpacity
                    key={filter.key}
                    style={[
                        styles.filterChip,
                        selectedFilter === filter.key && styles.filterChipActive,
                    ]}
                    onPress={() => onFilterPress(filter.key)}>
                    <Text
                        style={[
                            styles.filterChipText,
                            selectedFilter === filter.key && styles.filterChipTextActive,
                        ]}>
                        {filter.label}
                    </Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
};

FilterTabs.propTypes = FilterTabsPropTypes;

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
        flexGrow: 0,
    },
    contentContainer: {
        paddingRight: 16,
        alignItems: 'center',
    },
    filterChip: {
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.borderLight,
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 20,
        marginRight: 10,
        alignSelf: 'flex-start',
    },
    filterChipActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    filterChipText: {
        color: colors.primary,
        fontSize: 14,
        fontWeight: '500',
    },
    filterChipTextActive: {
        color: colors.white,
    },
});

export default FilterTabs;
