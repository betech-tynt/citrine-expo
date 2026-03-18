// s302_payment_setting
import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/FontAwesome';
import { commonStyles } from '../../theme/commonStyles';
import Header from '../../components/Header';
import colors from '../../constants/colors';
import { moderateSize } from '../../styles';

// Mock saved payment methods
const mockSavedMethods = [
    {
        id: 1,
        type: 'credit-card',
        icon: 'credit-card',
        cardType: 'Visa',
        last4: '4242',
        isDefault: true,
    },
    {
        id: 2,
        type: 'momo',
        icon: 'wallet',
        name: 'Momo',
        isDefault: false,
    },
];

// Available payment methods to add
const paymentMethods = [
    {
        id: 'credit-card',
        icon: 'credit-card',
        nameKey: 'msg000543',
        descKey: 'msg000550',
    },
    {
        id: 'momo',
        icon: 'wallet',
        nameKey: 'msg000544',
        descKey: 'msg000551',
    },
    {
        id: 'zalopay',
        icon: 'mobile',
        nameKey: 'msg000545',
        descKey: 'msg000552',
    },
    {
        id: 'vnpay',
        icon: 'money-bill',
        nameKey: 'msg000546',
        descKey: 'msg000553',
    },
    {
        id: 'bank-transfer',
        icon: 'building-columns',
        nameKey: 'msg000547',
        descKey: 'msg000554',
    },
    {
        id: 'internet-banking',
        icon: 'globe',
        nameKey: 'msg000548',
        descKey: 'msg000555',
    },
    {
        id: 'google-pay',
        icon: 'google',
        nameKey: 'msg000549',
        descKey: 'msg000556',
    },
];

const PaymentSettingScreen = () => {
    const { t } = useTranslation();
    const [selectedMethods, setSelectedMethods] = useState(['credit-card']);
    const [savedMethods, setSavedMethods] = useState(mockSavedMethods);

    const togglePaymentMethod = (id) => {
        setSelectedMethods((prev) => {
            if (prev.includes(id)) {
                return prev.filter((method) => method !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    const handleDeleteSavedMethod = (id) => {
        setSavedMethods((prev) =>
            prev.filter((method) => method.id !== id)
        );
    };

    const handleCancel = () => {
        // Reset changes
        setSelectedMethods(['credit-card']);
    };

    const handleSave = () => {
        // Save settings
        console.log('Saving payment settings:', selectedMethods);
    };

    const getPaymentIcon = (iconName) => {
        // Handle icon mapping
        const iconMap = {
            'building-columns': 'hospital',
            'money-bill': 'money-bill',
            'google': 'google',
        };
        return iconMap[iconName] || iconName;
    };

    const renderSavedMethodItem = (method) => {
        const displayName =
            method.type === 'credit-card'
                ? `${method.cardType} ****${method.last4}`
                : method.name;

        return (
            <View key={method.id} style={styles.savedMethodItem}>
                <View style={styles.savedMethodInfo}>
                    <Icon
                        name={method.icon}
                        size={moderateSize(20)}
                        color={colors.primary}
                        style={styles.savedMethodIcon}
                    />
                    <Text style={styles.savedMethodText}>{displayName}</Text>
                </View>
                {method.isDefault ? (
                    <Text style={styles.defaultLabel}>
                        {t('citrine.msg000542')}
                    </Text>
                ) : (
                    <TouchableOpacity
                        onPress={() => handleDeleteSavedMethod(method.id)}>
                        <Icon
                            name="trash"
                            size={moderateSize(16)}
                            color={colors.textSecondary}
                        />
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    const renderPaymentOption = (method) => {
        const isSelected = selectedMethods.includes(method.id);

        return (
            <TouchableOpacity
                key={method.id}
                style={styles.paymentOption}
                onPress={() => togglePaymentMethod(method.id)}>
                <View style={styles.paymentInfo}>
                    <Icon
                        name={getPaymentIcon(method.icon)}
                        size={moderateSize(28)}
                        color={colors.primary}
                        style={styles.paymentIcon}
                    />
                    <View style={styles.paymentDetails}>
                        <Text style={styles.paymentName}>
                            {t(`citrine.${method.nameKey}`)}
                        </Text>
                        <Text style={styles.paymentDesc}>
                            {t(`citrine.${method.descKey}`)}
                        </Text>
                    </View>
                </View>
                <View
                    style={[
                        styles.checkbox,
                        isSelected && styles.checkboxChecked,
                    ]}>
                    {isSelected && (
                        <Icon
                            name="check"
                            size={moderateSize(16)}
                            color={colors.white}
                        />
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <Header
                title={t('citrine.msg000501')}
                showCrudText={false}
                showHomeIcon={false}
            />
            <ScrollView style={commonStyles.main} scrollEnabled={true}>
                <View style={styles.contentContainer}>
                    {/* Saved Methods Section */}
                    {savedMethods.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>
                                {t('citrine.msg000540')}
                            </Text>
                            <View style={styles.savedMethodsSection}>
                                {savedMethods.map((method) =>
                                    renderSavedMethodItem(method)
                                )}
                            </View>
                        </View>
                    )}

                    {/* Add Payment Method Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            {t('citrine.msg000541')}
                        </Text>
                        {paymentMethods.map((method) =>
                            renderPaymentOption(method)
                        )}
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.actionButtons}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={handleCancel}>
                            <Text style={styles.cancelText}>
                                {t('citrine.msg000557')}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.saveButton}
                            onPress={handleSave}>
                            <Text style={styles.saveText}>
                                {t('citrine.msg000558')}
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
    section: {
        marginBottom: moderateSize(20),
    },
    sectionTitle: {
        fontSize: moderateSize(16),
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: moderateSize(15),
        paddingLeft: moderateSize(10),
        borderLeftWidth: 3,
        borderLeftColor: colors.primary,
    },
    savedMethodsSection: {
        backgroundColor: colors.white,
        borderRadius: moderateSize(12),
        padding: moderateSize(15),
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 3,
        marginBottom: moderateSize(20),
    },
    savedMethodItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: moderateSize(12),
        paddingHorizontal: moderateSize(12),
        backgroundColor: '#F4F7FF',
        borderRadius: moderateSize(8),
        marginBottom: moderateSize(10),
    },
    savedMethodInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    savedMethodIcon: {
        marginRight: moderateSize(10),
    },
    savedMethodText: {
        fontSize: moderateSize(14),
        color: colors.textPrimary,
        fontWeight: '500',
    },
    defaultLabel: {
        fontSize: moderateSize(14),
        color: colors.textSecondary,
    },
    paymentOption: {
        backgroundColor: colors.white,
        borderRadius: moderateSize(12),
        padding: moderateSize(15),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: moderateSize(10),
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 3,
    },
    paymentInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    paymentIcon: {
        marginRight: moderateSize(15),
        width: moderateSize(40),
        textAlign: 'center',
    },
    paymentDetails: {
        flex: 1,
    },
    paymentName: {
        fontSize: moderateSize(16),
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: moderateSize(5),
    },
    paymentDesc: {
        fontSize: moderateSize(12),
        color: colors.textSecondary,
    },
    checkbox: {
        width: moderateSize(24),
        height: moderateSize(24),
        borderRadius: moderateSize(6),
        borderWidth: 2,
        borderColor: colors.borderColorGrey02,
        justifyContent: 'center',
        alignItems: 'center',
        flexShrink: 0,
    },
    checkboxChecked: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: moderateSize(10),
        marginTop: moderateSize(20),
        marginBottom: moderateSize(20),
    },
    cancelButton: {
        flex: 1,
        paddingVertical: moderateSize(15),
        borderRadius: moderateSize(10),
        backgroundColor: '#F0F0F0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelText: {
        fontSize: moderateSize(16),
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    saveButton: {
        flex: 1,
        paddingVertical: moderateSize(15),
        borderRadius: moderateSize(10),
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveText: {
        fontSize: moderateSize(16),
        fontWeight: 'bold',
        color: colors.white,
    },
});

export default PaymentSettingScreen;
