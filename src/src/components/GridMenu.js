import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import colors from '../constants/colors';

export default function GridMenu({ items }) {
    const [gridWidth, setGridWidth] = useState(0);
    const GAP = 16;
    const EDGE_PADDING = 2;

    const getColsByCount = count => {
        if (count <= 1) return 1;
        if (count === 2) return 2;
        return 3;
    };

    const getItemWidth = cols => {
        if (!gridWidth) return undefined;
        const totalGaps = GAP * (cols - 1);
        const availableWidth = gridWidth - EDGE_PADDING * 2;
        return (availableWidth - totalGaps) / cols;
    };

    const getCardStyle = (index, count) => {
        const cols = getColsByCount(count);
        const width = getItemWidth(cols);
        const isLastInRow = cols > 1 && (index + 1) % cols === 0;

        return {
            width,
            marginRight: isLastInRow ? 0 : GAP,
            marginBottom: GAP,
        };
    };

    const count = items.length;

    return (
        <View
            style={styles.grid}
            onLayout={e => setGridWidth(e.nativeEvent.layout.width)}>
            {items.map((item, index) => {
                const cardStyle = [styles.card, getCardStyle(index, count)];

                const content = (
                    <>
                        {item.icon}
                        <Text style={styles.text}>{item.title}</Text>
                    </>
                );

                if (item.onPress) {
                    return (
                        <TouchableOpacity
                            key={`${item.key}-${index}`}
                            style={cardStyle}
                            onPress={item.onPress}>
                            {content}
                        </TouchableOpacity>
                    );
                }

                return (
                    <View key={`${item.key}-${index}`} style={cardStyle}>
                        {content}
                    </View>
                );
            })}
        </View>
    );
}

GridMenu.propTypes = {
    items: PropTypes.arrayOf(
        PropTypes.shape({
            key: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
                .isRequired,
            title: PropTypes.string.isRequired,
            icon: PropTypes.node,
            onPress: PropTypes.func,
        }),
    ).isRequired,
};

const styles = StyleSheet.create({
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 16,
        paddingHorizontal: 2,
        paddingBottom: 8,
        overflow: 'visible',
    },
    card: {
        backgroundColor: colors.white,
        padding: 16,
        borderRadius: 12,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 5,
        alignItems: 'center',
    },
    text: {
        textAlign: 'center',
        paddingTop: 10,
    },
});
