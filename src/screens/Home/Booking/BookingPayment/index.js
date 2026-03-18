import React, { useMemo, useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Header from '../../../../components/Header';
import { commonStyles } from '../../../../theme/commonStyles';
import colors from '../../../../constants/colors';
import { moderateSize } from '../../../../styles';
import { formatCurrency } from '../../../../utils/formatCurrency';
import { SAMPLE_BOOKING_DATA } from '../../../../constants/utils';
import {
    PaymentMethodRowPropTypes,
    TotalAmountDisplayPropTypes,
} from '../../../../utils/propTypes';
import { customerBookingPayment } from '../../../../services/apiBookingPayment';

/**
 * Resolve icon name for each payment method.
 */
const getPaymentIconName = iconName => {
    const iconMap = {
        'credit-card': 'credit-card',
        paypal: 'paypal',
        university: 'university',
        'e-wallet': 'money',
    };

    return iconMap[iconName] || 'credit-card';
};

/**
 * Reusable row for each payment method option.
 */
const PaymentMethodRow = ({ method, isSelected, onSelect }) => (
    <TouchableOpacity
        style={styles.paymentMethod}
        onPress={onSelect}
        activeOpacity={0.7}
        accessibilityLabel={`${method.name} payment method`}
        accessibilityRole="button"
        accessibilityState={{ selected: isSelected }}>
        <View style={styles.iconNameContainer}>
            <Icon
                name={getPaymentIconName(method.icon)}
                size={moderateSize(24)}
                color={colors.primary}
            />
            <Text style={styles.paymentMethodName}>{method.name}</Text>
        </View>
        <View
            style={[
                styles.radioButton,
                isSelected && styles.radioButtonSelected,
            ]}>
            {isSelected && <View style={styles.radioButtonInner} />}
        </View>
    </TouchableOpacity>
);

// Define data types for props
PaymentMethodRow.propTypes = PaymentMethodRowPropTypes;

/**
 * Display the final amount that customer needs to pay.
 */
const TotalAmountDisplay = ({ amount }) => {
    const { t } = useTranslation();

    return (
        <View style={styles.totalAmount}>
            <Text style={styles.totalAmountLabel}>
                {t('payment.totalPaymentAmount')}
            </Text>
            <Text style={styles.totalAmountValue}>
                {formatCurrency(amount)}
            </Text>
        </View>
    );
};

// Define data types for props
TotalAmountDisplay.propTypes = TotalAmountDisplayPropTypes;

const BookingPaymentScreen = () => {
    const { t } = useTranslation();
    const navigation = useNavigation();
    const route = useRoute();

    const [selectedPaymentMethod, setSelectedPaymentMethod] =
        useState('credit_card');
    const [bottomBarHeight, setBottomBarHeight] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    /**
     * Payment methods shown in the list.
     * Keep IDs stable because selection relies on them.
     */
    const paymentMethods = useMemo(
        () => [
            {
                id: 'credit_card',
                name: t('payment.creditDebitCard'),
                icon: 'credit-card',
            },
            {
                id: 'paypal',
                name: t('payment.paypal'),
                icon: 'paypal',
            },
            {
                id: 'bank_transfer',
                name: t('payment.bankTransfer'),
                icon: 'university',
            },
            {
                id: 'e_wallet',
                name: t('payment.eWallet'),
                icon: 'e-wallet',
            },
        ],
        [t],
    );

    /**
     * Booking context from previous screen.
     * `bookingId` is mandatory for P0104 API.
     */
    const bookingId = route?.params?.bookingId;
    const totalAmountFromParams = route?.params?.totalAmount;
    const bookingFromParams =
        route?.params?.bookingSummary || route?.params?.bookingData;

    /**
     * Fallback strategy for payment amount display:
     * route param -> booking summary -> sample data.
     */
    const totalAmount = useMemo(() => {
        if (typeof totalAmountFromParams === 'number') {
            return totalAmountFromParams;
        }

        return bookingFromParams?.total || SAMPLE_BOOKING_DATA.total;
    }, [totalAmountFromParams, bookingFromParams]);

    /**
     * Handle pay action:
     * 1) validate booking id
     * 2) call P0104 customer booking payment API
     * 3) show success/error feedback
     * 4) navigate to booking info after success
     */
    const handlePayNow = async () => {
        if (isSubmitting) return;

        if (!bookingId && bookingId !== 0) {
            Alert.alert(t('common.error'), t('payment.missingBookingId'));
            return;
        }

        setIsSubmitting(true);

        try {
            const paidBookingData = await customerBookingPayment(bookingId);
            const successMessage =
                paidBookingData?.message || t('payment.paymentSuccess');

            Alert.alert(t('common.success'), successMessage, [
                {
                    text: t('common.ok'),
                    onPress: () => {
                        navigation.replace('BookingInfoScreen', {
                            booking: paidBookingData,
                        });
                    },
                },
            ]);
        } catch (error) {
            Alert.alert(
                t('common.error'),
                error?.message || t('payment.paymentFailed'),
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <View style={styles.container}>
            <Header title={t('payment.payment')} showCrudText={false} />
            <ScrollView
                style={commonStyles.main}
                contentContainerStyle={[
                    commonStyles.bookingContentContainer,
                    styles.scrollContent,
                    { paddingBottom: bottomBarHeight || moderateSize(120) },
                ]}>
                <View style={styles.contentContainer}>
                    <TotalAmountDisplay amount={totalAmount} />

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            {t('payment.selectPaymentMethod')}
                        </Text>
                        {paymentMethods.map(method => (
                            <PaymentMethodRow
                                key={method.id}
                                method={method}
                                isSelected={selectedPaymentMethod === method.id}
                                onSelect={() =>
                                    setSelectedPaymentMethod(method.id)
                                }
                            />
                        ))}
                    </View>
                </View>
            </ScrollView>

            <View
                style={styles.bottomBar}
                onLayout={event => {
                    const { height } = event.nativeEvent.layout;
                    setBottomBarHeight(height);
                }}>
                <TouchableOpacity
                    style={[
                        styles.payButton,
                        isSubmitting && styles.payButtonDisabled,
                    ]}
                    onPress={handlePayNow}
                    disabled={isSubmitting}
                    accessibilityLabel={t('payment.payNow')}
                    accessibilityRole="button">
                    {isSubmitting ? (
                        <ActivityIndicator color={colors.textWhite} />
                    ) : (
                        <Text style={styles.payButtonText}>
                            {t('payment.payNow')}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.surfaceSoft,
    },
    scrollContent: {
        flexGrow: 1,
    },
    totalAmount: {
        alignItems: 'center',
        marginVertical: moderateSize(30),
    },
    totalAmountLabel: {
        fontSize: moderateSize(16),
        color: colors.textSecondary,
        marginBottom: moderateSize(8),
    },
    totalAmountValue: {
        fontSize: moderateSize(32),
        fontWeight: 'bold',
        color: colors.primary,
    },
    section: {
        marginBottom: moderateSize(20),
    },
    sectionTitle: {
        fontSize: moderateSize(18),
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: moderateSize(15),
    },
    paymentMethod: {
        backgroundColor: colors.surface,
        borderRadius: 10,
        padding: moderateSize(15),
        marginBottom: moderateSize(10),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: colors.black,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    iconNameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    paymentMethodName: {
        fontSize: moderateSize(16),
        color: colors.textPrimary,
        marginLeft: moderateSize(15),
    },
    radioButton: {
        width: moderateSize(20),
        height: moderateSize(20),
        borderRadius: moderateSize(10),
        borderWidth: 2,
        borderColor: colors.borderColorGrey01,
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioButtonSelected: {
        borderColor: colors.primary,
    },
    radioButtonInner: {
        width: moderateSize(10),
        height: moderateSize(10),
        borderRadius: moderateSize(5),
        backgroundColor: colors.primary,
    },
    bottomBar: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        padding: moderateSize(15),
        paddingHorizontal: moderateSize(20),
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.borderColorGrey01,
        zIndex: 10,
        elevation: 10,
    },
    payButton: {
        backgroundColor: colors.primary,
        padding: moderateSize(15),
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    payButtonDisabled: {
        opacity: 0.7,
    },
    payButtonText: {
        color: colors.textWhite,
        fontSize: moderateSize(16),
        fontWeight: 'bold',
    },
});

export default BookingPaymentScreen;
