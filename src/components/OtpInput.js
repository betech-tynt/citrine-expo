import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import PropTypes from 'prop-types';
import colors from '../constants/colors';
import { moderateSize } from '../styles/moderateSize';

const DEFAULT_LENGTH = 6;

const sanitizeDigits = value => String(value || '').replace(/[^0-9]/g, '');

const OtpInput = ({
    value,
    length = DEFAULT_LENGTH,
    onChangeText,
    containerStyle,
    cellStyle,
    cellFocusedStyle,
}) => {
    const refs = useRef([]);
    const [focusedIndex, setFocusedIndex] = useState(-1);

    const digits = useMemo(() => {
        const v = sanitizeDigits(value);
        const arr = Array.from({ length }, (_, i) => v[i] || '');
        return arr;
    }, [value, length]);

    useEffect(() => {
        refs.current = refs.current.slice(0, length);
    }, [length]);

    const focusIndex = index => {
        const ref = refs.current[index];
        if (ref && typeof ref.focus === 'function') {
            ref.focus();
        }
    };

    const setAt = (index, char) => {
        const current = sanitizeDigits(value);
        const nextArr = Array.from({ length }, (_, i) => current[i] || '');
        nextArr[index] = char;
        const next = nextArr.join('');
        onChangeText?.(next);
    };

    const handleChange = (index, text) => {
        const cleaned = sanitizeDigits(text);
        if (!cleaned) {
            setAt(index, '');
            // Fallback for Android Backspace on empty field
            if (index > 0) {
                focusIndex(index - 1);
            }
            return;
        }

        // Paste
        const chars = cleaned.split('');
        const current = sanitizeDigits(value);
        const nextArr = Array.from({ length }, (_, i) => current[i] || '');

        let writeAt = index;
        for (const c of chars) {
            if (writeAt >= length) break;
            nextArr[writeAt] = c;
            writeAt += 1;
        }
        const nextValue = nextArr.join('');
        onChangeText?.(nextValue);

        // Derive updated digits after change
        const updatedDigits = Array.from(
            { length },
            (_, i) => nextValue[i] || '',
        );

        // Fallback: if current field now empty after change, move to previous
        if (!updatedDigits[index] && index > 0) {
            focusIndex(index - 1);
        } else {
            const nextFocus = Math.min(writeAt, length - 1);
            focusIndex(nextFocus);
        }
    };

    const handleKeyPress = (index, e) => {
        if (e?.nativeEvent?.key !== 'Backspace') return;
        if (digits[index]) {
            setAt(index, '');
            return;
        }
        if (index > 0) {
            setAt(index - 1, '');
            focusIndex(index - 1);
        }
    };

    return (
        <View style={[styles.container, containerStyle]}>
            {digits.map((d, idx) => {
                const isFocused = idx === focusedIndex;
                return (
                    <TextInput
                        key={idx}
                        ref={r => {
                            refs.current[idx] = r;
                        }}
                        value={d}
                        onChangeText={t => handleChange(idx, t)}
                        onKeyPress={e => handleKeyPress(idx, e)}
                        keyboardType="number-pad"
                        textContentType="oneTimeCode"
                        maxLength={idx === 0 ? length : 1}
                        style={[
                            styles.cell,
                            cellStyle,
                            isFocused && styles.cellFocused,
                            isFocused && cellFocusedStyle,
                        ]}
                        placeholder=""
                        selectionColor={colors.primary}
                        returnKeyType="done"
                        onFocus={() => {
                            setFocusedIndex(idx);
                        }}
                        onBlur={() => {
                            setFocusedIndex(v => (v === idx ? -1 : v));
                        }}
                    />
                );
            })}
        </View>
    );
};

OtpInput.propTypes = {
    value: PropTypes.string,
    length: PropTypes.number,
    onChangeText: PropTypes.func,
    containerStyle: PropTypes.any,
    cellStyle: PropTypes.any,
    cellFocusedStyle: PropTypes.any,
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    cell: {
        width: moderateSize(44),
        height: moderateSize(50),
        borderRadius: moderateSize(10),
        borderWidth: moderateSize(1),
        borderColor: colors.primary,
        backgroundColor: colors.surfaceSoft || colors.white,
        textAlign: 'center',
        fontSize: moderateSize(18),
        fontWeight: '700',
        color: colors.textPrimary,
    },
    cellFocused: {
        borderWidth: moderateSize(2),
    },
});

export default OtpInput;
