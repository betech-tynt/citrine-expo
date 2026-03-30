import React, { useMemo } from 'react';
import {
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View,
    FlatList,
    TouchableOpacity,
    Platform,
    KeyboardAvoidingView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import colors from '../../constants/colors';
import { moderateSize } from '../../styles';
import CustomIcon from '../CustomIcon';
import Button from '../../components/Button';

export default function PromotionSelectModal({
    visible,
    selectedPromotions = [],
    onClose,
    onConfirm,
}) {
    const { t } = useTranslation();

    const [localSelectedIds, setLocalSelectedIds] = React.useState([]);

    React.useEffect(() => {
        setLocalSelectedIds(selectedPromotions.map(p => p.id));
    }, [selectedPromotions]);

    const promotions = useMemo(
        () =>
            [
                { id: 0, title: t('promotion.none'), discount: '' },
                {
                    id: 1,
                    title: t('promotion.welcome2025'),
                    description: t('promotion.welcome2025Desc'),
                    discount: '-15%',
                },
                {
                    id: 2,
                    title: t('promotion.discount30'),
                    description: t('promotion.discount30Desc'),
                    discount: '-30%',
                },
                {
                    id: 3,
                    title: t('promotion.vip'),
                    description: t('promotion.vipDesc'),
                    discount: '-40%',
                },
                {
                    id: 4,
                    title: t('promotion.stay7'),
                    description: t('promotion.stay7Desc'),
                    discount: '-25%',
                },
                {
                    id: 5,
                    title: t('promotion.tet'),
                    description: t('promotion.tetDesc'),
                    discount: '-25%',
                },
            ].filter(p => p.id !== 0),
        [t],
    );

    const renderItem = ({ item }) => {
        const isSelected = localSelectedIds.includes(item.id);
        const toggleSelect = () => {
            setLocalSelectedIds(prev =>
                isSelected
                    ? prev.filter(id => id !== item.id)
                    : [...prev, item.id],
            );
        };

        return (
            <TouchableOpacity
                style={[styles.item, isSelected && styles.selectedItem]}
                onPress={toggleSelect}
                activeOpacity={0.7}>
                <View style={styles.itemHeader}>
                    <Text style={styles.title}>{item.title}</Text>

                    {item.discount && (
                        <Text style={styles.discount}>{item.discount}</Text>
                    )}
                </View>

                {item.description && (
                    <Text style={styles.description}>{item.description}</Text>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}>
            <Pressable style={styles.backdrop} onPress={onClose} />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.sheetWrap}>
                <View style={styles.sheet}>
                    <View style={styles.sheetHeader}>
                        <Text style={styles.sheetTitle}>
                            {t('promotion.screenTitle')}
                        </Text>

                        <TouchableOpacity
                            onPress={onClose}
                            style={styles.closeBtn}
                            activeOpacity={0.8}>
                            <CustomIcon
                                type="AntDesign"
                                name="close"
                                size={18}
                                color={colors.grey1}
                            />
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        data={promotions}
                        renderItem={renderItem}
                        keyExtractor={item => `promo-${item.id}`}
                        style={styles.list}
                        contentContainerStyle={{
                            paddingBottom: moderateSize(100), // Space for buttons
                        }}
                        showsVerticalScrollIndicator={false}
                    />
                    <View style={styles.buttonRow}>
                        <Button
                            title={t('common.cancel')}
                            variant="outline"
                            onPress={onClose}
                            style={styles.cancelButton}
                        />
                        <Button
                            title={t('common.ok')}
                            onPress={() => {
                                const selectedPromos = localSelectedIds
                                    .map(id =>
                                        promotions.find(p => p.id === id),
                                    )
                                    .filter(Boolean);
                                onConfirm(selectedPromos);
                                onClose();
                            }}
                            style={styles.doneButton}
                        />
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
    },
    itemHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    buttonRow: {
        flexDirection: 'row',
        paddingHorizontal: moderateSize(16),
        paddingVertical: moderateSize(12),
        borderTopWidth: 1,
        borderTopColor: colors.border,
        backgroundColor: colors.white,
    },
    cancelButton: {
        flex: 1,
        marginRight: moderateSize(8),
        paddingVertical: moderateSize(10),
    },
    doneButton: {
        flex: 1,
        marginLeft: moderateSize(8),
        paddingVertical: moderateSize(10),
    },
    sheetWrap: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        maxHeight: '50%',
    },
    sheet: {
        backgroundColor: colors.white,
        borderTopLeftRadius: moderateSize(20),
        borderTopRightRadius: moderateSize(20),
        overflow: 'hidden',
        maxHeight: '100%', // 👈 đảm bảo scroll full
        paddingBottom: Platform.OS === 'ios' ? moderateSize(16) : 0,
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
        fontSize: moderateSize(18),
        fontWeight: '700',
        color: colors.textPrimary,
    },
    closeBtn: {
        padding: moderateSize(6),
    },
    list: {
        padding: moderateSize(16),
    },
    item: {
        backgroundColor: colors.surface,
        padding: moderateSize(16),
        marginBottom: moderateSize(12),
        borderRadius: moderateSize(12),
        borderWidth: 1,
        borderColor: colors.border,
        minHeight: moderateSize(80),
    },
    selectedItem: {
        backgroundColor: colors.primary + '22',
        borderColor: colors.primary,
        borderWidth: 2,
    },
    title: {
        fontSize: moderateSize(16),
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: moderateSize(4),
    },
    description: {
        fontSize: moderateSize(14),
        color: colors.textSecondary,
        marginBottom: moderateSize(8),
    },
    discount: {
        fontSize: moderateSize(16),
        fontWeight: '700',
        color: colors.primary,
        marginLeft: 'auto',
    },
});
