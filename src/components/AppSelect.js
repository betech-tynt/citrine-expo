import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    FlatList,
    Pressable,
    TextInput,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import colors from '../constants/colors';
import { moderateSize } from '../styles';

const getOptionLabel = option => {
    44;
    if (!option) return '';
    if (typeof option === 'string') return option;
    return option.label || option.name || '';
};

const getOptionValue = option => {
    if (!option) return option;
    if (typeof option === 'string') return option;
    return option.value ?? option.id ?? option.code ?? option.label;
};

export const AppSelect = ({
    label,
    placeholder,
    required,
    value,
    options,
    onSelect,
    disabled,
    containerStyle,
    inputContainerStyle,
    labelStyle,
    errorStyle,
    errorMessage,
    rightIcon,
    onRightIconPress,
    searchable,
    searchPlaceholder,
    keyExtractor,
    renderOption,
}) => {
    const [visible, setVisible] = useState(false);
    const [query, setQuery] = useState('');

    const selectedLabel = useMemo(() => {
        if (value == null) return '';

        // If value is an option object
        if (typeof value === 'object') return getOptionLabel(value);

        // If value is primitive, try to resolve from options
        const found = (options || []).find(
            opt => getOptionValue(opt) === value,
        );
        return found ? getOptionLabel(found) : String(value);
    }, [options, value]);

    const finalPlaceholder = placeholder || label;

    const filteredOptions = useMemo(() => {
        if (!searchable) return options || [];
        const q = query.trim().toLowerCase();
        if (!q) return options || [];
        return (options || []).filter(opt =>
            getOptionLabel(opt).toLowerCase().includes(q),
        );
    }, [options, query, searchable]);

    const open = () => {
        if (disabled) return;
        setQuery('');
        setVisible(true);
    };

    const close = () => {
        setVisible(false);
        setQuery('');
    };

    const handleSelect = opt => {
        if (onSelect) onSelect(opt);
        close();
    };

    const renderItem = ({ item }) => {
        if (renderOption) {
            return renderOption({ item, onPress: () => handleSelect(item) });
        }

        const isSelected =
            getOptionValue(item) === getOptionValue(value) ||
            (typeof value === 'object' &&
                getOptionValue(item) === getOptionValue(value));

        return (
            <Pressable
                onPress={() => handleSelect(item)}
                style={[
                    styles.optionRow,
                    isSelected && styles.optionRowSelected,
                ]}>
                <Text style={styles.optionText}>{getOptionLabel(item)}</Text>
                {isSelected ? (
                    <Icon name="check" size={14} color={colors.primary} />
                ) : null}
            </Pressable>
        );
    };

    return (
        <View style={[styles.container, containerStyle]}>
            {!!label && (
                <View style={styles.labelRow}>
                    <Text style={[styles.label, labelStyle]}>{label}</Text>
                    {required ? <Text style={styles.required}>*</Text> : null}
                </View>
            )}

            <TouchableOpacity
                activeOpacity={0.8}
                onPress={open}
                style={[
                    styles.inputContainer,
                    inputContainerStyle,
                    disabled && styles.disabledContainer,
                ]}>
                <Text
                    numberOfLines={1}
                    style={[
                        styles.valueText,
                        !selectedLabel && styles.placeholderText,
                    ]}>
                    {selectedLabel || finalPlaceholder}
                </Text>

                {rightIcon ? (
                    onRightIconPress ? (
                        <TouchableOpacity
                            onPress={onRightIconPress}
                            style={styles.rightIcon}>
                            {rightIcon}
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.rightIcon}>{rightIcon}</View>
                    )
                ) : (
                    <Icon name="chevron-down" size={14} color={colors.grey1} />
                )}
            </TouchableOpacity>

            {errorMessage ? (
                <Text style={[styles.error, errorStyle]}>{errorMessage}</Text>
            ) : null}

            <Modal
                visible={visible}
                transparent
                animationType="fade"
                onRequestClose={close}>
                <Pressable style={styles.backdrop} onPress={close} />

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={styles.sheetWrap}>
                    <View style={styles.sheet}>
                        <View style={styles.sheetHeader}>
                            <Text style={styles.sheetTitle}>
                                {label || 'Select'}
                            </Text>
                            <TouchableOpacity
                                onPress={close}
                                style={styles.closeBtn}>
                                <Icon
                                    name="times"
                                    size={moderateSize(18)}
                                    color={colors.grey1}
                                />
                            </TouchableOpacity>
                        </View>

                        {searchable ? (
                            <View style={styles.searchWrap}>
                                <Icon
                                    name="search"
                                    size={moderateSize(14)}
                                    color={colors.grey1}
                                />
                                <TextInput
                                    value={query}
                                    onChangeText={setQuery}
                                    placeholder={searchPlaceholder || 'Search'}
                                    placeholderTextColor={colors.textSecondary}
                                    style={styles.searchInput}
                                    autoCorrect={false}
                                />
                            </View>
                        ) : null}

                        <FlatList
                            data={filteredOptions}
                            keyExtractor={(item, index) => {
                                if (keyExtractor)
                                    return keyExtractor(item, index);
                                const v = getOptionValue(item);
                                return v != null ? String(v) : String(index);
                            }}
                            renderItem={renderItem}
                            keyboardShouldPersistTaps="handled"
                            contentContainerStyle={styles.listContent}
                            ItemSeparatorComponent={() => (
                                <View style={styles.separator} />
                            )}
                            showsVerticalScrollIndicator={false}
                        />
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
};

AppSelect.propTypes = {
    label: PropTypes.string,
    placeholder: PropTypes.string,
    required: PropTypes.bool,

    value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
        PropTypes.object,
    ]),
    options: PropTypes.arrayOf(
        PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.shape({
                label: PropTypes.string,
                value: PropTypes.oneOfType([
                    PropTypes.string,
                    PropTypes.number,
                ]),
                id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
                code: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
                name: PropTypes.string,
            }),
        ]),
    ),
    onSelect: PropTypes.func,
    disabled: PropTypes.bool,

    containerStyle: PropTypes.object,
    inputContainerStyle: PropTypes.object,
    labelStyle: PropTypes.object,
    errorStyle: PropTypes.object,
    errorMessage: PropTypes.string,

    rightIcon: PropTypes.node,
    onRightIconPress: PropTypes.func,

    searchable: PropTypes.bool,
    searchPlaceholder: PropTypes.string,

    keyExtractor: PropTypes.func,
    renderOption: PropTypes.func,
};

const styles = StyleSheet.create({
    // --- Main Component Styles ---
    container: {
        marginBottom: moderateSize(26),
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: moderateSize(8),
    },
    label: {
        fontSize: moderateSize(14),
        fontWeight: '600',
        color: colors.textPrimary,
    },
    required: {
        marginLeft: moderateSize(4),
        color: colors.error,
        fontSize: moderateSize(14),
        fontWeight: '600',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: moderateSize(15),
        paddingHorizontal: moderateSize(12),
        paddingVertical: moderateSize(12),
        backgroundColor: colors.white,
    },
    disabledContainer: {
        opacity: 0.6,
    },
    valueText: {
        flex: 1,
        fontSize: moderateSize(14),
        color: colors.textPrimary,
    },
    placeholderText: {
        fontSize: moderateSize(14),
        color: colors.textSecondary,
    },
    rightIcon: {
        marginLeft: moderateSize(8),
        alignItems: 'center',
        justifyContent: 'center',
    },
    error: {
        marginTop: moderateSize(6),
        color: colors.error,
        fontSize: moderateSize(12),
    },

    // --- Modal Styles ---
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
    },
    sheetWrap: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        maxHeight: '75%',
    },
    sheet: {
        backgroundColor: colors.white,
        borderTopLeftRadius: moderateSize(20),
        borderTopRightRadius: moderateSize(20),
        overflow: 'hidden',
        paddingBottom: Platform.OS === 'ios' ? moderateSize(20) : 0,
    },
    sheetHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: moderateSize(16),
        paddingVertical: moderateSize(12),
        borderBottomWidth: 1,
        borderBottomColor: colors.surfaceSoft,
    },
    sheetTitle: {
        fontSize: moderateSize(16),
        fontWeight: '700',
        color: colors.textPrimary,
    },
    closeBtn: {
        padding: moderateSize(6),
    },
    searchWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: moderateSize(12),
        paddingHorizontal: moderateSize(12),
        margin: moderateSize(16),
        backgroundColor: colors.surfaceSoft,
    },
    searchInput: {
        flex: 1,
        paddingVertical: moderateSize(10),
        paddingHorizontal: moderateSize(10),
        fontSize: moderateSize(14),
        color: colors.textPrimary,
    },
    listContent: {
        paddingHorizontal: moderateSize(8),
        paddingBottom: moderateSize(12),
    },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: moderateSize(16),
        paddingVertical: moderateSize(14),
        borderRadius: moderateSize(8),
    },
    optionRowSelected: {
        backgroundColor: colors.white,
    },
    optionText: {
        fontSize: moderateSize(14),
        color: colors.textPrimary,
    },
    separator: {
        height: 1,
        backgroundColor: colors.surfaceSoft,
        marginHorizontal: moderateSize(16),
    },
});
