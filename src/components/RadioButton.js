// src/components/RadioButton.js
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { RadioButtonPropTypes } from '../utils/propTypes';
import colors from '../constants/colors';
import { moderateSize } from '../styles/moderateSize';

const RadioButton = ({ checked, onPress }) => {
    return (
        <TouchableOpacity onPress={onPress} style={styles.container}>
            <View style={[styles.outerCircle, checked && styles.checked]}>
                {checked && <View style={styles.innerCircle} />}
            </View>
        </TouchableOpacity>
    );
};

// Define data types for props
RadioButton.propTypes = RadioButtonPropTypes;

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    outerCircle: {
        height: moderateSize(20),
        width: moderateSize(20),
        borderRadius: moderateSize(10),
        borderWidth: moderateSize(2),
        borderColor: colors.grey,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: moderateSize(10),
    },
    innerCircle: {
        height: moderateSize(10),
        width: moderateSize(10),
        borderRadius: moderateSize(5),
        backgroundColor: colors.primary,
    },
    checked: {
        borderColor: colors.primary,
    },
});

export default RadioButton;
