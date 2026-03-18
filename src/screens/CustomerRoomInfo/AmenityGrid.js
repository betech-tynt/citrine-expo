import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import CustomIcon from '../../components/CustomIcon';
import { moderateSize } from '../../styles/moderateSize';
import colors from '../../constants/colors';
import { AmenityGridPropTypes } from '../../utils/propTypes';

function AmenityGrid({ items = [] }) {
    return (
        <View style={styles.amenityGrid}>
            {items.map(item => (
                <View key={item.key} style={styles.amenityItem}>
                    <CustomIcon
                        type={item.iconType}
                        name={item.iconName}
                        size={moderateSize(18)}
                        color={colors.primary}
                        style={styles.amenityIcon}
                    />
                    <Text style={styles.amenityLabel} numberOfLines={1}>
                        {item.label}
                    </Text>
                </View>
            ))}
        </View>
    );
}

AmenityGrid.propTypes = AmenityGridPropTypes;

const styles = StyleSheet.create({
    amenityGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        rowGap: moderateSize(10),
        columnGap: moderateSize(12),
    },
    amenityItem: {
        width: '47%',
        flexDirection: 'row',
        alignItems: 'center',
    },
    amenityIcon: {
        width: moderateSize(26),
        alignItems: 'center',
        justifyContent: 'center',
    },
    amenityLabel: {
        marginLeft: moderateSize(8),
        color: colors.textPrimary,
        fontSize: moderateSize(13),
        fontWeight: '500',
        flex: 1,
    },
});

export default AmenityGrid;
