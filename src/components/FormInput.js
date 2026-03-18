import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import Input from './Input';
import colors from '../constants/colors';
import { moderateSize } from '../styles/moderateSize';

const FormInput = ({
    label,
    width = '100%',
    containerStyle,
    labelStyle,
    inputStyle,
    textColor,
    placeholder,
    onPress,
    errorMessage,
    ...inputProps
}) => {
    const inputNode = (
        <Input
            placeholder={placeholder}
            style={[styles.input, inputStyle]}
            textColor={textColor}
            {...inputProps}
        />
    );

    return (
        <View style={[styles.container, { width }, containerStyle]}>
            {!!label && <Text style={[styles.label, labelStyle]}>{label}</Text>}
            {onPress ? (
                <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
                    <View pointerEvents="none">{inputNode}</View>
                </TouchableOpacity>
            ) : (
                inputNode
            )}
            {errorMessage ? (
                <Text style={styles.errorMessage}>{errorMessage}</Text>
            ) : null}
        </View>
    );
};

FormInput.propTypes = {
    label: PropTypes.string,
    width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    containerStyle: PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.array,
        PropTypes.number,
    ]),
    labelStyle: PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.array,
        PropTypes.number,
    ]),
    inputStyle: PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.array,
        PropTypes.number,
    ]),
    placeholder: PropTypes.string,
    onPress: PropTypes.func,
    errorMessage: PropTypes.string,
};

const styles = StyleSheet.create({
    container: {
        marginBottom: moderateSize(12),
    },
    label: {
        fontSize: moderateSize(12),
        fontWeight: '600',
        color: colors.textSecondary,
        marginBottom: moderateSize(6),
    },
    input: {
        marginBottom: 0,
    },
    errorMessage: {
        marginTop: moderateSize(4),
        color: colors.error,
        fontSize: moderateSize(12),
    },
});

export default FormInput;
