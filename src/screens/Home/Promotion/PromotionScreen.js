import React, { useMemo } from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Header from '../../../components/Header';
import { commonStyles } from '../../../theme/commonStyles';
import colors from '../../../constants/colors';
import ChildrenLayout from '../../../components/ChildrenLayout';
import { moderateSize } from '../../../styles';

const PromotionScreen = () => {
    const { t } = useTranslation();
    const navigation = useNavigation();
    const route = useRoute();
    const { selectedPromotion = null } = route.params || {};

    const selectedId = selectedPromotion?.id || 0;

    const promotions = useMemo(
        () => [
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
                discount: '-1.000đ',
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
        ],
        [t],
    );

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={[styles.item, item.id === selectedId && styles.selectedItem]}
            onPress={() => {
                navigation.navigate('CustomerBookingScreen', {
                    selectedPromotion: item,
                });
            }}>
            <Text style={styles.title}>{item.title}</Text>
            {item.description && (
                <Text style={styles.description}>{item.description}</Text>
            )}
            {item.discount && (
                <Text style={styles.discount}>{item.discount}</Text>
            )}
        </TouchableOpacity>
    );

    return (
        <ChildrenLayout
            headerType="header"
            headerProps={{ title: t('promotion.title') }}>
            <View style={commonStyles.main}>
                <FlatList
                    data={promotions}
                    renderItem={renderItem}
                    keyExtractor={item => `promo-${item.id}`}
                    showsVerticalScrollIndicator={false}
                />
            </View>
        </ChildrenLayout>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    item: {
        backgroundColor: colors.surface,
        padding: moderateSize(16),
        marginBottom: moderateSize(12),
        borderRadius: moderateSize(12),
        borderWidth: 1,
        borderColor: colors.border,
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
        fontSize: moderateSize(18),
        fontWeight: '700',
        color: colors.danger,
    },
    content: {
        flex: 1,
        padding: moderateSize(16),
    },
});

export default PromotionScreen;
