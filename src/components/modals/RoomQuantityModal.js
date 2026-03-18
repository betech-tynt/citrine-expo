import React, { useEffect, useState } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    TouchableWithoutFeedback,
} from 'react-native';
import PropTypes from 'prop-types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../../constants/colors';
import { moderateSize } from '../../styles/moderateSize';

export default function RoomQuantityModal({
    visible,
    title,
    roomName,
    roomPriceText,
    quantityLabel,
    cancelText,
    confirmText,
    initialQuantity = 1,
    onClose,
    onConfirm,
}) {
    const insets = useSafeAreaInsets();
    const [count, setCount] = useState(
        Math.max(1, Number(initialQuantity || 1)),
    );

    useEffect(() => {
        if (visible) {
            setCount(Math.max(1, Number(initialQuantity || 1)));
        }
    }, [initialQuantity, visible]);

    const handleDecrease = () => setCount(c => Math.max(1, c - 1));
    const handleIncrease = () => setCount(c => c + 1);

    return (
        <Modal
            animationType="fade"
            transparent
            visible={!!visible}
            onRequestClose={onClose}>
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <View
                            style={[
                                styles.sheet,
                                {
                                    paddingBottom:
                                        moderateSize(18) + insets.bottom,
                                },
                            ]}>
                            <View style={styles.headerRow}>
                                <Text style={styles.title} numberOfLines={1}>
                                    {title}
                                </Text>
                                <TouchableOpacity
                                    onPress={onClose}
                                    hitSlop={{
                                        top: 10,
                                        bottom: 10,
                                        left: 10,
                                        right: 10,
                                    }}
                                    style={styles.closeBtn}>
                                    <Text style={styles.closeText}>×</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.roomInfoBox}>
                                <Text style={styles.roomName} numberOfLines={1}>
                                    {roomName}
                                </Text>
                                <Text
                                    style={styles.roomPrice}
                                    numberOfLines={1}>
                                    {roomPriceText}
                                </Text>
                            </View>

                            <View style={styles.group}>
                                <Text style={styles.label}>
                                    {quantityLabel}
                                </Text>
                                <View style={styles.counterRow}>
                                    <TouchableOpacity
                                        onPress={handleDecrease}
                                        style={styles.counterBtn}
                                        activeOpacity={0.8}>
                                        <Text style={styles.counterBtnText}>
                                            −
                                        </Text>
                                    </TouchableOpacity>
                                    <Text style={styles.counterValue}>
                                        {count}
                                    </Text>
                                    <TouchableOpacity
                                        onPress={handleIncrease}
                                        style={styles.counterBtn}
                                        activeOpacity={0.8}>
                                        <Text style={styles.counterBtnText}>
                                            +
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={styles.actionsRow}>
                                <TouchableOpacity
                                    onPress={onClose}
                                    style={[styles.actionBtn, styles.cancelBtn]}
                                    activeOpacity={0.85}>
                                    <Text
                                        style={[
                                            styles.actionText,
                                            styles.cancelText,
                                        ]}>
                                        {cancelText}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => onConfirm?.(count)}
                                    style={[
                                        styles.actionBtn,
                                        styles.confirmBtn,
                                    ]}
                                    activeOpacity={0.85}>
                                    <Text
                                        style={[
                                            styles.actionText,
                                            styles.confirmText,
                                        ]}>
                                        {confirmText}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

RoomQuantityModal.propTypes = {
    visible: PropTypes.bool,
    title: PropTypes.string,
    roomName: PropTypes.string,
    roomPriceText: PropTypes.string,
    quantityLabel: PropTypes.string,
    cancelText: PropTypes.string,
    confirmText: PropTypes.string,
    initialQuantity: PropTypes.number,
    onClose: PropTypes.func.isRequired,
    onConfirm: PropTypes.func,
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    sheet: {
        backgroundColor: colors.white,
        borderTopLeftRadius: moderateSize(22),
        borderTopRightRadius: moderateSize(22),
        paddingHorizontal: moderateSize(16),
        paddingTop: moderateSize(16),
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: moderateSize(12),
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#EAEAEA',
    },
    title: {
        flex: 1,
        color: colors.textPrimary,
        fontSize: moderateSize(18),
        fontWeight: '800',
        marginRight: moderateSize(10),
    },
    closeBtn: {
        width: moderateSize(32),
        height: moderateSize(32),
        borderRadius: moderateSize(16),
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeText: {
        fontSize: moderateSize(24),
        lineHeight: moderateSize(26),
        color: colors.textSecondary,
        fontWeight: '600',
    },
    roomInfoBox: {
        marginTop: moderateSize(14),
        backgroundColor: '#F4F7FF',
        borderRadius: moderateSize(12),
        padding: moderateSize(14),
    },
    roomName: {
        color: colors.textPrimary,
        fontSize: moderateSize(14),
        fontWeight: '800',
        marginBottom: moderateSize(4),
    },
    roomPrice: {
        color: colors.primary,
        fontSize: moderateSize(12),
        fontWeight: '800',
    },
    group: {
        marginTop: moderateSize(18),
    },
    label: {
        color: colors.textPrimary,
        fontSize: moderateSize(14),
        fontWeight: '800',
        marginBottom: moderateSize(12),
    },
    counterRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: moderateSize(14),
    },
    counterBtn: {
        width: moderateSize(36),
        height: moderateSize(36),
        borderRadius: moderateSize(18),
        backgroundColor: '#E8E7F9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    counterBtnText: {
        color: colors.primary,
        fontSize: moderateSize(18),
        fontWeight: '800',
    },
    counterValue: {
        minWidth: moderateSize(40),
        textAlign: 'center',
        color: colors.textPrimary,
        fontSize: moderateSize(18),
        fontWeight: '800',
    },
    actionsRow: {
        flexDirection: 'row',
        gap: moderateSize(12),
        marginTop: moderateSize(22),
    },
    actionBtn: {
        flex: 1,
        paddingVertical: moderateSize(14),
        borderRadius: moderateSize(12),
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelBtn: {
        backgroundColor: '#F0F0F0',
    },
    confirmBtn: {
        backgroundColor: colors.primary,
    },
    actionText: {
        fontSize: moderateSize(14),
        fontWeight: '800',
    },
    cancelText: {
        color: colors.textPrimary,
    },
    confirmText: {
        color: colors.white,
    },
});
