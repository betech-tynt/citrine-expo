import React, { useState, useMemo } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
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

// PaymentMethodRow component
const PaymentMethodRow = ({ method, isSelected, onSelect }) => {
    const getIconName = iconName => {
        // Map icon names to FontAwesome icons
        if (iconName === 'credit-card') return 'credit-card';
        if (iconName === 'paypal') return 'paypal';
        if (iconName === 'university') return 'university';
        if (iconName === 'e-wallet') return 'money';
        return 'credit-card';
    };

    return (
        <TouchableOpacity
            style={styles.paymentMethod}
            onPress={onSelect}
            activeOpacity={0.7}
            accessibilityLabel={`${method.name} payment method`}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}>
            <View style={styles.iconNameContainer}>
                <Icon
                    name={getIconName(method.icon)}
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
};

// Define data types for props
PaymentMethodRow.propTypes = PaymentMethodRowPropTypes;

// TotalAmountDisplay component
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
    const [selectedPaymentMethod, setSelectedPaymentMethod] =
        useState('credit_card');
    const [bottomBarHeight, setBottomBarHeight] = useState(0);

    // Payment methods data - memoized to avoid recreating on every render
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

    // Get total amount from sample data
    const totalAmount = SAMPLE_BOOKING_DATA.total;

    // Handle payment method selection
    const handlePaymentMethodSelect = methodId => {
        setSelectedPaymentMethod(methodId);
    };

    // Handle pay now button press
    const handlePayNow = () => {
        // TODO: Implement payment logic
        // For now, just log the selected payment method
        // eslint-disable-next-line no-console
        console.log('Pay with:', selectedPaymentMethod);
    };

    return (
        <View style={styles.container}>
            <Header title={t('payment.payment')} showCrudText={false} />
            <ScrollView
                style={commonStyles.bookingMain}
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
                                    handlePaymentMethodSelect(method.id)
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
                    style={styles.payButton}
                    onPress={handlePayNow}
                    accessibilityLabel={t('payment.payNow')}
                    accessibilityRole="button">
                    <Text style={styles.payButtonText}>
                        {t('payment.payNow')}
                    </Text>
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
    payButtonText: {
        color: colors.textWhite,
        fontSize: moderateSize(16),
        fontWeight: 'bold',
    },
});

export default BookingPaymentScreen;
