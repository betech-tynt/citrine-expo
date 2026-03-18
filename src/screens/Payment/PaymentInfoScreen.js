// s301_payment_info
import React, { useState, useEffect, useCallback } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { commonStyles } from '../../theme/commonStyles';
import Header from '../../components/Header';
import colors from '../../constants/colors';
import { moderateSize } from '../../styles';
import { fetchCustomerPaymentInfo } from '../../services/apiCustomerPaymentInfo';

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

const PaymentInfoScreen = () => {
    const route = useRoute();
    const { t } = useTranslation();
    const { payment: initialPayment } = route.params || {};

    // Use passed payment as initial data, update with API response
    const [payment, setPayment] = useState(initialPayment);
    const [refreshing, setRefreshing] = useState(false);

    /**
     * Fetch detailed payment info from API.
     * Uses the payment ID from initial params to load full data.
     */
    const loadPaymentInfo = useCallback(async () => {
        if (!initialPayment?.id) {
            return;
        }

        setRefreshing(true);
        try {
            const data = await fetchCustomerPaymentInfo(initialPayment.id);
            if (data) {
                setPayment(data);
            }
        } catch (error) {
            console.error('Error loading payment info:', error.message);
            // Keep displaying initial data on error
        } finally {
            setRefreshing(false);
        }
    }, [initialPayment?.id]);

    useEffect(() => {
        loadPaymentInfo();
    }, [loadPaymentInfo]);

    if (!payment) {
        return (
            <View style={styles.container}>
                <Header
                    title={t('citrine.msg000521')}
                    showCrudText={false}
                    showHomeIcon={false}
                />
                <View style={commonStyles.main}>
                    <Text>No payment data</Text>
                </View>
            </View>
        );
    }

    // Extract real data from payment object
    const booking = payment.booking || {};
    const section = payment.section || booking.section || {};
    const customer = payment.customer || booking.customer || {};
    const bookingDetails = booking.booking_details || [];
    const formattedDate = formatDate(payment.created_at);
    const time = extractTime(payment.created_at);

    // Calculate room cost from booking details
    const totalRoomCost = bookingDetails.reduce(
        (sum, detail) => sum + (detail.total_price || 0),
        0,
    );
    const totalNights =
        bookingDetails.length > 0
            ? Math.max(
                  1,
                  Math.round(
                      (new Date(booking.end) - new Date(booking.start)) /
                          (1000 * 60 * 60 * 24),
                  ),
              )
            : 0;

    const getStatusIcon = status => {
        const statusKey =
            typeof status === 'number' ? getStatusKey(status) : status;
        switch (statusKey) {
            case 'completed':
                return 'circle-check';
            case 'pending':
                return 'hourglass-half';
            case 'failed':
                return 'circle-xmark';
            default:
                return 'circle';
        }
    };

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

    const renderStatusSection = () => (
        <View style={styles.statusSection}>
            <Icon
                name={getStatusIcon(payment.status)}
                size={moderateSize(55)}
                color={getStatusColor(payment.status)}
                style={styles.statusIcon}
            />
            <Text style={styles.statusText}>
                {getStatusLabel(payment.status)}
            </Text>
            <Text style={styles.statusTime}>
                {formattedDate}, {time}
            </Text>
        </View>
    );

    const renderInfoSection = (title, icon, children) => (
        <View style={styles.infoSection}>
            <View style={styles.sectionTitle}>
                <Icon
                    name={icon}
                    size={moderateSize(18)}
                    color={colors.primary}
                    style={styles.sectionIcon}
                />
                <Text style={styles.titleText}>{title}</Text>
            </View>
            {children}
        </View>
    );

    const renderInfoRow = (label, value, isTotal = false) => (
        <View
            style={[
                styles.infoRow,
                isTotal && {
                    paddingVertical: moderateSize(15),
                    borderBottomWidth: 2,
                    borderBottomColor: colors.primary,
                },
            ]}>
            <Text
                style={[
                    styles.infoLabel,
                    isTotal && {
                        fontWeight: 'bold',
                        fontSize: moderateSize(16),
                    },
                ]}>
                {label}
            </Text>
            <Text
                style={[
                    styles.infoValue,
                    isTotal && {
                        color: colors.primary,
                        fontSize: moderateSize(18),
                    },
                ]}>
                {value}
            </Text>
        </View>
    );

    const renderBookingDetail = (label, value) => (
        <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>{label}</Text>
            <Text style={styles.detailValue}>{value}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <Header
                title={t('citrine.msg000521')}
                showCrudText={false}
                showHomeIcon={false}
            />
            <ScrollView style={commonStyles.main} scrollEnabled={true}>
                <View style={styles.contentContainer}>
                    {/* Subtle loading indicator while refreshing */}
                    {refreshing && (
                        <View style={styles.refreshingIndicator}>
                            <ActivityIndicator
                                size="small"
                                color={colors.primary}
                            />
                        </View>
                    )}

                    {/* Status Section */}
                    {renderStatusSection()}

                    {/* Order Information */}
                    {renderInfoSection(
                        t('citrine.msg000522'),
                        'file-invoice',
                        <>
                            {renderInfoRow(
                                t('citrine.msg000523'),
                                booking.code,
                            )}
                            {renderInfoRow(
                                t('citrine.msg000520'),
                                payment.transaction_id || 'N/A',
                            )}
                        </>,
                    )}

                    {/* Payment Details */}
                    {renderInfoSection(
                        t('citrine.msg000524'),
                        'money-bill',
                        <>
                            {renderInfoRow(
                                t('citrine.msg000525', {
                                    count: totalNights,
                                }),
                                formatCurrency(totalRoomCost),
                            )}
                            {renderInfoRow(
                                t('citrine.msg000526'),
                                formatCurrency(payment.tax || 0),
                            )}
                            {payment.discount > 0 &&
                                renderInfoRow(
                                    t('payment.discount'),
                                    formatCurrency(payment.discount),
                                )}
                            {renderInfoRow(
                                t('citrine.msg000527'),
                                formatCurrency(payment.final),
                                true,
                            )}
                        </>,
                    )}

                    {/* Payment Method */}
                    {renderInfoSection(
                        t('citrine.msg000528'),
                        'credit-card',
                        <>
                            {renderInfoRow(
                                t('citrine.msg000529'),
                                payment.method_name || '',
                            )}
                            {payment.notes &&
                                renderInfoRow(
                                    t('payment.notes') || 'Notes',
                                    payment.notes,
                                )}
                        </>,
                    )}

                    {/* Booking Information */}
                    {renderInfoSection(
                        t('citrine.msg000531'),
                        'hotel',
                        <View style={styles.bookingDetails}>
                            {renderBookingDetail(
                                t('citrine.msg000532'),
                                section.name || '',
                            )}
                            {bookingDetails.length > 0 &&
                                renderBookingDetail(
                                    t('citrine.msg000533'),
                                    bookingDetails
                                        .map(detail => {
                                            const name =
                                                detail?.room_type?.name ||
                                                detail?.notes ||
                                                '';
                                            const count =
                                                detail?.room_count || 1;
                                            if (!name) return '';
                                            return `${name} x ${count}`;
                                        })
                                        .filter(Boolean)
                                        .join('\n') || '-',
                                )}
                            {renderBookingDetail(
                                t('citrine.msg000534'),
                                booking.start ? formatDate(booking.start) : '',
                            )}
                            {renderBookingDetail(
                                t('citrine.msg000535'),
                                booking.end ? formatDate(booking.end) : '',
                            )}
                            {renderBookingDetail(
                                t('citrine.msg000536'),
                                customer.name || '',
                            )}
                        </View>,
                    )}

                    {/* Action Buttons */}
                    <View style={styles.actionButtons}>
                        <TouchableOpacity style={styles.receiptButton}>
                            <Icon
                                name="receipt"
                                size={moderateSize(16)}
                                color={colors.primary}
                                style={styles.buttonIcon}
                            />
                            <Text style={styles.receiptText}>
                                {t('citrine.msg000537')}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.supportButton}>
                            <Icon
                                name="headset"
                                size={moderateSize(16)}
                                color={colors.white}
                                style={styles.buttonIcon}
                            />
                            <Text style={styles.supportText}>
                                {t('citrine.msg000538')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
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
        paddingVertical: moderateSize(16),
    },
    refreshingIndicator: {
        alignItems: 'center',
        paddingVertical: moderateSize(8),
    },
    statusSection: {
        backgroundColor: colors.white,
        borderRadius: moderateSize(15),
        padding: moderateSize(20),
        alignItems: 'center',
        marginBottom: moderateSize(20),
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 3,
    },
    statusIcon: {
        marginBottom: moderateSize(10),
    },
    statusText: {
        fontSize: moderateSize(20),
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: moderateSize(5),
    },
    statusTime: {
        fontSize: moderateSize(14),
        color: colors.textSecondary,
    },
    infoSection: {
        backgroundColor: colors.white,
        borderRadius: moderateSize(15),
        padding: moderateSize(20),
        marginBottom: moderateSize(15),
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionTitle: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: moderateSize(15),
    },
    sectionIcon: {
        marginRight: moderateSize(8),
    },
    titleText: {
        fontSize: moderateSize(16),
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: moderateSize(10),
        borderBottomWidth: 1,
        borderBottomColor: colors.borderColorGrey01,
    },
    infoLabel: {
        fontSize: moderateSize(14),
        color: colors.textSecondary,
        flex: 1,
    },
    infoValue: {
        fontSize: moderateSize(15),
        fontWeight: '600',
        color: colors.textPrimary,
        textAlign: 'right',
    },
    bookingDetails: {
        backgroundColor: '#F4F7FF',
        padding: moderateSize(15),
        borderRadius: moderateSize(10),
        marginTop: moderateSize(15),
    },
    detailItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: moderateSize(8),
    },
    detailLabel: {
        fontSize: moderateSize(14),
        color: colors.textSecondary,
    },
    detailValue: {
        fontSize: moderateSize(14),
        fontWeight: '500',
        color: colors.textPrimary,
        textAlign: 'right',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: moderateSize(10),
        marginTop: moderateSize(20),
        marginBottom: moderateSize(20),
    },
    receiptButton: {
        flex: 1,
        paddingVertical: moderateSize(12),
        paddingHorizontal: moderateSize(16),
        borderRadius: moderateSize(10),
        backgroundColor: '#E8E7F9',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    receiptText: {
        fontSize: moderateSize(14),
        fontWeight: 'bold',
        color: colors.primary,
        marginLeft: moderateSize(8),
    },
    supportButton: {
        flex: 1,
        paddingVertical: moderateSize(12),
        paddingHorizontal: moderateSize(16),
        borderRadius: moderateSize(10),
        backgroundColor: colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    supportText: {
        fontSize: moderateSize(14),
        fontWeight: 'bold',
        color: colors.white,
        marginLeft: moderateSize(8),
    },
    buttonIcon: {
        marginRight: moderateSize(4),
    },
});

export default PaymentInfoScreen;
