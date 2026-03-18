// s300_payment
import React, { useState, useCallback, useRef } from 'react';
import {
    StyleSheet,
    Text,
    View,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import Icon from 'react-native-vector-icons/FontAwesome';
import { commonStyles } from '../../theme/commonStyles';
import Header from '../../components/Header';
import colors from '../../constants/colors';
import { moderateSize } from '../../styles';
import { fetchCustomerPaymentList } from '../../services/apiCustomerPaymentList';

/**
 * Map method_name from API to FontAwesome icon name.
 */
const getPaymentMethodIcon = methodName => {
    const normalizedName = (methodName || '').toLowerCase();
    const iconMap = {
        cash: 'money',
        'credit card': 'credit-card',
        'credit-card': 'credit-card',
        'bank transfer': 'university',
        'bank-transfer': 'university',
        'e-wallet': 'money',
        wallet: 'money',
        mobile: 'mobile',
        vnpay: 'money',
        paypal: 'paypal',
    };

    return iconMap[normalizedName] || 'credit-card';
};

/**
 * Map numeric status from API to status string key.
 * API returns: 1 = completed, 2 = pending, 3 = failed
 */
const getStatusKey = status => {
    switch (status) {
        case 1:
            return 'completed';
        case 2:
            return 'pending';
        case 3:
            return 'failed';
        default:
            return 'unknown';
    }
};

/**
 * Get color for payment status.
 */
const getStatusColor = status => {
    const statusKey =
        typeof status === 'number' ? getStatusKey(status) : status;
    switch (statusKey) {
        case 'completed':
            return '#2E7D32';
        case 'pending':
            return '#F57C00';
        case 'failed':
            return '#C62828';
        default:
            return colors.textSecondary;
    }
};

/**
 * Extract time part (HH:mm) from datetime string.
 * Input format: "2026-03-11 12:03:13"
 */
const extractTime = dateTimeStr => {
    if (!dateTimeStr) {
        return '';
    }
    const parts = dateTimeStr.split(' ');
    return parts[1] ? parts[1].substring(0, 5) : '';
};

const PaymentScreen = () => {
    const navigation = useNavigation();
    const { t } = useTranslation();
    const [payments, setPayments] = useState([]);
    const [paginatorInfo, setPaginatorInfo] = useState(null);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);

    // Ref to prevent duplicate requests during rapid scrolling
    const isLoadingRef = useRef(false);

    /**
     * Fetch payment list from API with pagination support.
     * @param {number} currentPage - The page number to load.
     * @param {boolean} isRefreshing - Whether this is a pull-to-refresh or initial load.
     */
    const loadPayments = useCallback(
        async (currentPage, isRefreshing) => {
            // Prevent duplicate requests
            if (isLoadingRef.current) {
                return;
            }
            isLoadingRef.current = true;

            if (isRefreshing) {
                setLoading(true);
            } else {
                setLoadingMore(true);
            }

            try {
                const result = await fetchCustomerPaymentList({
                    page: currentPage,
                });

                const newPayments = Array.isArray(result.payments)
                    ? result.payments
                    : [];

                if (isRefreshing) {
                    // Replace all data on refresh / initial load
                    setPayments(newPayments);
                } else {
                    // Append new data for infinite scroll, avoiding duplicates
                    setPayments(prev => {
                        const existingIds = new Set(prev.map(p => p.id));
                        const uniqueNew = newPayments.filter(
                            p => !existingIds.has(p.id),
                        );
                        return [...prev, ...uniqueNew];
                    });
                }

                setPaginatorInfo(result.paginatorInfo);
            } catch (error) {
                console.error('Error loading payments:', error.message);
                if (isRefreshing) {
                    Alert.alert(
                        t('common.error'),
                        error.message || t('citrine.msg000516'),
                    );
                    setPayments([]);
                }
            } finally {
                setLoading(false);
                setLoadingMore(false);
                isLoadingRef.current = false;
            }
        },
        [t],
    );

    /**
     * Reload payments when screen comes into focus.
     */
    useFocusEffect(
        useCallback(() => {
            setPage(1);
            loadPayments(1, true);
        }, [loadPayments]),
    );

    /**
     * Handle loading more data when user scrolls near end of list.
     */
    const handleLoadMore = useCallback(() => {
        if (
            !isLoadingRef.current &&
            !loadingMore &&
            paginatorInfo &&
            paginatorInfo.currentPage < paginatorInfo.lastPage
        ) {
            const nextPage = page + 1;
            setPage(nextPage);
            loadPayments(nextPage, false);
        }
    }, [loadingMore, paginatorInfo, page, loadPayments]);

    /**
     * Handle pull-to-refresh.
     */
    const handleRefresh = useCallback(() => {
        setPage(1);
        loadPayments(1, true);
    }, [loadPayments]);

    /**
     * Get translated status label.
     */
    const getStatusLabel = status => {
        const statusKey =
            typeof status === 'number' ? getStatusKey(status) : status;
        switch (statusKey) {
            case 'completed':
                return t('citrine.msg000503');
            case 'pending':
                return t('citrine.msg000504');
            case 'failed':
                return t('citrine.msg000505');
            default:
                return String(status);
        }
    };

    const handleSettingsPress = () => {
        navigation.navigate('PaymentSettingScreen');
    };

    const handlePaymentCardPress = useCallback(
        payment => {
            navigation.navigate('PaymentInfoScreen', { payment });
        },
        [navigation],
    );

    /**
     * Render a single payment card item for FlatList.
     */
    const renderPaymentCard = useCallback(
        ({ item: payment }) => {
            const formattedDate = formatDate(payment.created_at);
            const time = extractTime(payment.created_at);
            const bookingCode = payment.booking?.code || `#${payment.id}`;
            const txnId = payment.transaction_id || 'N/A';

            return (
                <TouchableOpacity
                    style={styles.paymentCard}
                    onPress={() => handlePaymentCardPress(payment)}>
                    {/* Header with Booking Code and Status */}
                    <View style={styles.paymentHeader}>
                        <Text style={styles.bookingId}>
                            {t('citrine.msg000502', { id: bookingCode })}
                        </Text>
                        <View
                            style={[
                                styles.statusBadge,
                                {
                                    backgroundColor: getStatusColor(
                                        payment.status,
                                    ),
                                },
                            ]}>
                            <Text style={styles.statusText}>
                                {getStatusLabel(payment.status)}
                            </Text>
                        </View>
                    </View>

                    {/* Amount */}
                    <Text style={styles.paymentAmount}>
                        {formatCurrency(payment.final)}
                    </Text>

                    {/* Payment Method */}
                    <View style={styles.paymentMethod}>
                        <Icon
                            name={getPaymentMethodIcon(payment.method_name)}
                            size={moderateSize(16)}
                            color={colors.primary}
                            style={styles.methodIcon}
                        />
                        <Text style={styles.methodText}>
                            {payment.method_name}
                        </Text>
                    </View>

                    {/* Footer with Date and Transaction ID */}
                    <View style={styles.paymentFooter}>
                        <Text style={styles.footerText}>
                            {formattedDate}, {time}
                        </Text>
                        <Text style={styles.footerText}>{txnId}</Text>
                    </View>
                </TouchableOpacity>
            );
        },
        [t, handlePaymentCardPress],
    );

    /**
     * Render empty state when no payments exist.
     */
    const renderEmptyState = useCallback(() => {
        if (loading) {
            return null;
        }
        return (
            <View style={styles.emptyState}>
                <Icon
                    name="file-text"
                    size={moderateSize(60)}
                    color={colors.borderColorGrey02}
                    style={styles.emptyIcon}
                />
                <Text style={styles.emptyText}>{t('citrine.msg000516')}</Text>
            </View>
        );
    }, [loading, t]);

    /**
     * Render footer loading indicator for infinite scroll.
     */
    const renderFooter = useCallback(() => {
        if (!loadingMore) {
            return null;
        }
        return (
            <View style={styles.loadingFooter}>
                <ActivityIndicator size="small" color={colors.primary} />
            </View>
        );
    }, [loadingMore]);

    /**
     * Key extractor for FlatList items.
     */
    const keyExtractor = useCallback(item => item.id.toString(), []);

    // Show full-screen loading only on initial load (page 1)
    if (loading && page === 1) {
        return (
            <View style={styles.container}>
                <Header
                    title={t('citrine.msg000500')}
                    showCrudText={false}
                    showHomeIcon={false}
                    showBackIcon={false}
                    onRightIconPress={handleSettingsPress}
                    rightIcon="gear"
                    rightIconType="FontAwesome"
                />
                <View style={[commonStyles.main, styles.loadingContainer]}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Header
                title={t('citrine.msg000500')}
                showCrudText={false}
                showHomeIcon={false}
                showBackIcon={false}
                onRightIconPress={handleSettingsPress}
                rightIcon="gear"
                rightIconType="FontAwesome"
            />
            <View style={commonStyles.main}>
                <FlatList
                    data={payments}
                    renderItem={renderPaymentCard}
                    keyExtractor={keyExtractor}
                    contentContainerStyle={[
                        styles.contentContainer,
                        payments.length === 0 && styles.emptyContainer,
                    ]}
                    ListEmptyComponent={renderEmptyState}
                    ListFooterComponent={renderFooter}
                    showsVerticalScrollIndicator={false}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    onRefresh={handleRefresh}
                    refreshing={loading && page === 1}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    contentContainer: {
        paddingHorizontal: moderateSize(16),
        paddingVertical: moderateSize(12),
    },
    emptyContainer: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingFooter: {
        paddingVertical: moderateSize(20),
        alignItems: 'center',
    },
    paymentCard: {
        backgroundColor: colors.white,
        borderRadius: moderateSize(15),
        padding: moderateSize(15),
        marginBottom: moderateSize(15),
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 3,
    },
    paymentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: moderateSize(10),
    },
    bookingId: {
        fontSize: moderateSize(16),
        fontWeight: '600',
        color: colors.textPrimary,
    },
    statusBadge: {
        paddingHorizontal: moderateSize(12),
        paddingVertical: moderateSize(5),
        borderRadius: moderateSize(20),
        minWidth: moderateSize(80),
        alignItems: 'center',
    },
    statusText: {
        fontSize: moderateSize(12),
        fontWeight: '700',
        color: colors.white,
    },
    paymentAmount: {
        fontSize: moderateSize(18),
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: moderateSize(8),
    },
    paymentMethod: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: moderateSize(8),
    },
    methodIcon: {
        marginRight: moderateSize(8),
    },
    methodText: {
        fontSize: moderateSize(14),
        color: colors.textSecondary,
    },
    paymentFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: moderateSize(10),
        borderTopWidth: 1,
        borderTopColor: colors.borderColorGrey01,
    },
    footerText: {
        fontSize: moderateSize(12),
        color: colors.textSecondary,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: moderateSize(60),
    },
    emptyIcon: {
        marginBottom: moderateSize(15),
    },
    emptyText: {
        fontSize: moderateSize(16),
        color: colors.textSecondary,
        textAlign: 'center',
    },
});

export default PaymentScreen;
