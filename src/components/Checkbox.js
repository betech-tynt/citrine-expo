import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import colors from '../constants/colors';
import { CheckboxPropTypes } from '../utils/propTypes';

const Checkbox = ({ checked, onPress, size = 20, style }) => {
    const iconSize = Math.max(12, Math.round(size * 0.7));

    return (
        <TouchableOpacity
            onPress={onPress}
            style={[styles.container, style]}
            accessibilityRole="checkbox"
            accessibilityState={{ checked }}>
            <View
                style={[
                    styles.box,
                    { width: size, height: size, borderRadius: 4 },
                    checked && styles.boxChecked,
                ]}>
                {checked ? (
                    <Icon name="check" size={iconSize} color={colors.white} />
                ) : null}
            </View>
        </TouchableOpacity>
    );
};

Checkbox.propTypes = CheckboxPropTypes;

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    box: {
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.white,
        justifyContent: 'center',
        alignItems: 'center',
    },
    boxChecked: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
});

export default Checkbox;
