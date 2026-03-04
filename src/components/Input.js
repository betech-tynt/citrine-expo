import React from 'react';
import {
    View,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    Text,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { InputPropTypes, AppInputPropTypes } from '../utils/propTypes';
import colors from '../constants/colors';
import { moderateSize } from '../styles';

const InputComponent = ({
    placeholder,
    secureTextEntry = false,
    style,
    startIcon,
    endIcon,
    onStartIconPress,
    onEndIconPress,
    iconSize = 20, // default size
    iconColor = '#000', // default color
    value,
    onChangeText,
    ...textInputProps
}) => {
    return (
        <View style={[styles.inputContainer, style]}>
            {startIcon && (
                <TouchableOpacity
                    onPress={onStartIconPress}
                    style={styles.iconContainer}>
                    <Icon name={startIcon} size={iconSize} color={iconColor} />
                </TouchableOpacity>
            )}
            <TextInput
                placeholder={placeholder}
                secureTextEntry={secureTextEntry}
                style={[
                    styles.input,
                    startIcon && styles.inputWithStartIcon,
                    endIcon && styles.inputWithEndIcon,
                ]}
                value={value}
                onChangeText={onChangeText}
                {...textInputProps}
            />
            {endIcon && (
                <TouchableOpacity
                    onPress={onEndIconPress}
                    style={styles.iconContainerEnd}>
                    <Icon name={endIcon} size={iconSize} color={iconColor} />
                </TouchableOpacity>
            )}
        </View>
    );
};

// Define data types for props
InputComponent.propTypes = InputPropTypes;

/**
 * AppInput component
 */
export const AppInput = ({
    label,
    placeholder,
    required,
    secureTextEntry = false,
    containerStyle,
    inputContainerStyle,
    inputStyle,
    labelStyle,
    errorStyle,
    errorMessage,
    startIcon,
    endIcon,
    rightIcon,
    onStartIconPress,
    onEndIconPress,
    onRightIconPress,
    iconSize = 20,
    iconColor = '#000',
    value,
    onChangeText,
    disabled,
    ...rest
}) => {
    const finalPlaceholder = placeholder || label;

    return (
        <View style={[styles.appContainer, containerStyle]}>
            {!!label && (
                <View style={styles.appLabelRow}>
                    <Text style={[styles.appLabel, labelStyle]}>{label}</Text>
                    {required ? (
                        <Text style={styles.appRequired}>*</Text>
                    ) : null}
                </View>
            )}

            <View
                style={[
                    styles.appInputContainer,
                    inputContainerStyle,
                    disabled && styles.appDisabledContainer,
                ]}>
                {startIcon ? (
                    <TouchableOpacity
                        onPress={onStartIconPress}
                        style={styles.appIconLeft}>
                        <Icon
                            name={startIcon}
                            size={iconSize}
                            color={iconColor}
                        />
                    </TouchableOpacity>
                ) : null}

                <TextInput
                    placeholder={finalPlaceholder}
                    placeholderTextColor={colors.textSecondary}
                    secureTextEntry={secureTextEntry}
                    style={[styles.appInput, inputStyle]}
                    value={value}
                    onChangeText={onChangeText}
                    editable={!disabled}
                    autoCorrect={false}
                    {...rest}
                />

                {rightIcon ? (
                    onRightIconPress ? (
                        <TouchableOpacity
                            onPress={onRightIconPress}
                            style={styles.appIconRight}>
                            {rightIcon}
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.appIconRight}>{rightIcon}</View>
                    )
                ) : endIcon ? (
                    <TouchableOpacity
                        onPress={onEndIconPress}
                        style={styles.appIconRight}>
                        <Icon
                            name={endIcon}
                            size={iconSize}
                            color={iconColor}
                        />
                    </TouchableOpacity>
                ) : null}
            </View>

            {errorMessage ? (
                <Text style={[styles.appError, errorStyle]}>
                    {errorMessage}
                </Text>
            ) : null}
        </View>
    );
};

// Define data types for props
AppInput.propTypes = AppInputPropTypes;

const styles = StyleSheet.create({
    appContainer: {
        marginBottom: moderateSize(26),
    },
    appLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: moderateSize(8),
    },
    appLabel: {
        fontSize: moderateSize(14),
        fontWeight: '600',
        color: colors.textPrimary,
    },
    appRequired: {
        marginLeft: moderateSize(4),
        color: colors.error,
        fontSize: moderateSize(14),
        fontWeight: '600',
    },
    appInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: moderateSize(15),
        paddingHorizontal: moderateSize(12),
        paddingVertical: moderateSize(10),
        backgroundColor: colors.white,
    },
    appDisabledContainer: {
        opacity: 0.6,
    },
    appIconLeft: {
        marginRight: moderateSize(8),
    },
    appIconRight: {
        marginLeft: moderateSize(8),
        alignItems: 'center',
        justifyContent: 'center',
    },
    appInput: {
        flex: 1,
        paddingVertical: moderateSize(0),
        paddingHorizontal: moderateSize(0),
        color: colors.textPrimary,
    },
    appError: {
        marginTop: moderateSize(6),
        color: colors.error,
        fontSize: moderateSize(12),
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: moderateSize(1),
        borderColor: colors.border,
        borderRadius: moderateSize(15),
        padding: moderateSize(4),
        marginBottom: moderateSize(26),
    },
    input: {
        flex: 1,
        padding: moderateSize(8),
    },
    inputWithStartIcon: {
        paddingLeft: moderateSize(40), // Space for start icon
    },
    inputWithEndIcon: {
        paddingRight: moderateSize(40), // Space for end icon
    },
    iconContainer: {
        position: 'absolute',
        left: moderateSize(8),
    },
    iconContainerEnd: {
        position: 'absolute',
        right: moderateSize(8),
    },
});

export default InputComponent;
