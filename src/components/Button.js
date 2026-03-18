import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import { ButtonPropTypes } from '../utils/propTypes';
import colors from '../constants/colors';
import { moderateSize } from '../styles/moderateSize';

// Button component with customizable props
const Button = ({
    title,
    onPress,
    style,
    textStyle,
    disabled = false,
    loading = false,
}) => {
    return (
        <TouchableOpacity
            style={[styles.button, disabled && styles.buttonDisabled, style]}
            onPress={disabled ? undefined : onPress}
            disabled={disabled || loading}>
            {loading ? (
                <ActivityIndicator color={colors.white} size="small" />
            ) : (
                <Text
                    style={[
                        styles.buttonText,
                        disabled && styles.buttonTextDisabled,
                        textStyle,
                    ]}>
                    {title}
                </Text>
            )}
        </TouchableOpacity>
    );
};

// Define data types for props
Button.propTypes = ButtonPropTypes;

const styles = StyleSheet.create({
    button: {
        backgroundColor: colors.primary,
        borderRadius: moderateSize(15),
        padding: moderateSize(16),
        width: '100%',
        alignItems: 'center',
    },
    buttonText: {
        color: colors.white,
        fontWeight: '500',
        fontSize: moderateSize(16),
    },
    buttonDisabled: {
        backgroundColor: colors.disabledBg,
        opacity: 0.6,
    },
    buttonTextDisabled: {
        color: colors.disabledText,
    },
});

export default Button;
