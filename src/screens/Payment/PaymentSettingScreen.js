// s302_payment_setting
import React, { useState, useCallback } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import ChildrenLayout from '../../components/ChildrenLayout';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomIcon from '../../components/CustomIcon';
import Checkbox from '../../components/Checkbox';
import colors from '../../constants/colors';
import { moderateSize } from '../../styles';
import { log } from '../../utils/handleLog';
import { isAuthError } from '../../utils/authErrorHandler';
import {
    fetchPaymentMethodsList,
    updateUserSetting,
} from '../../services/apiPaymentSettings';

// Icon mapping for each payment method
// Maps payment method id to { icon, type } for CustomIcon component
const PAYMENT_METHOD_ICONS = {
    1: { name: 'money-bill-wave', type: 'FontAwesome6' }, // Cash
    2: { name: 'credit-card', type: 'FontAwesome6' }, // Credit Card
    3: { name: 'building-columns', type: 'FontAwesome6' }, // Bank Transfer
    4: { name: 'mobile-screen-button', type: 'FontAwesome6' }, // PayPay
    5: { name: 'comment-dots', type: 'FontAwesome6' }, // LINE Pay
    6: { name: 'bag-shopping', type: 'FontAwesome6' }, // Rakuten Pay
    7: { name: 'mobile', type: 'FontAwesome6' }, // au PAY
    8: { name: 'phone', type: 'FontAwesome6' }, // Docomo Payment
    9: { name: 'box', type: 'FontAwesome6' }, // Amazon Pay
    10: { name: 'apple', type: 'FontAwesome6' }, // Apple Pay
    11: { name: 'google', type: 'FontAwesome6' }, // Google Pay
    12: { name: 'qrcode', type: 'FontAwesome6' }, // QR Code Payment
    13: { name: 'store', type: 'FontAwesome6' }, // Convenience Store Payment
};

// Default icon for any unmapped payment method
const DEFAULT_ICON = { name: 'wallet', type: 'FontAwesome6' };

const ASYNC_KEY_DEFAULT_PAYMENT = 'paymentMethodDefault';
const ASYNC_KEY_SAVED_PAYMENT = 'paymentMethodSaved';

const PaymentSettingScreen = () => {
    const { t } = useTranslation();
    const navigation = useNavigation();

    // State
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [defaultMethodId, setDefaultMethodId] = useState(null);
    const [savedMethodIds, setSavedMethodIds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    // Load data on focus
    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Check token
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                return;
            }

            // Fetch payment methods from API
            const methods = await fetchPaymentMethodsList();
            setPaymentMethods(methods || []);

            // Load saved default from AsyncStorage
            const savedDefault = await AsyncStorage.getItem(
                ASYNC_KEY_DEFAULT_PAYMENT,
            );
            if (savedDefault) {
                setDefaultMethodId(Number(savedDefault));
            } else if (methods && methods.length > 0) {
                // Fallback to first method if no default saved
                setDefaultMethodId(methods[0].id);
            }

            // Load saved methods from AsyncStorage
            const savedMethodsStr = await AsyncStorage.getItem(
                ASYNC_KEY_SAVED_PAYMENT,
            );
            if (savedMethodsStr) {
                setSavedMethodIds(savedMethodsStr.split(',').map(Number));
            } else if (savedDefault) {
                setSavedMethodIds([Number(savedDefault)]);
            } else if (methods && methods.length > 0) {
                setSavedMethodIds([methods[0].id]);
            }
        } catch (err) {
            console.error('[PaymentSetting] Error loading data:', err);
            const errorMessage = err.message || '';

            if (isAuthError(errorMessage)) {
                return;
            }

            setError(errorMessage || 'Failed to load payment methods');
        } finally {
            setLoading(false);
        }
    }, [navigation]);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [loadData]),
    );

    // Handle selecting a default payment method
    const handleSelectDefault = useCallback(
        async methodId => {
            // Skip if already default
            if (methodId === defaultMethodId) {
                return;
            }

            try {
                setSaving(true);

                // Call API to update the default payment method
                const updatedSettings = await updateUserSetting(
                    'payment_method_default',
                    String(methodId),
                );

                log('[PaymentSetting] Updated settings:', updatedSettings);

                // Update local state
                const newDefault =
                    updatedSettings?.payment_method_default ?? methodId;
                setDefaultMethodId(Number(newDefault));

                // Persist to AsyncStorage
                await AsyncStorage.setItem(
                    ASYNC_KEY_DEFAULT_PAYMENT,
                    String(newDefault),
                );
            } catch (err) {
                console.error('[PaymentSetting] Error updating setting:', err);

                if (isAuthError(err.message)) {
                    return;
                }

                Alert.alert(
                    t('common.error'),
                    err.message || 'Failed to update payment method',
                );
            } finally {
                setSaving(false);
            }
        },
        [defaultMethodId, navigation, t],
    );

    // Handle toggling a saved payment method
    const handleToggleMethod = useCallback(
        async methodId => {
            try {
                setSaving(true);

                // Toggle logic
                let newSavedIds = [...savedMethodIds];
                if (newSavedIds.includes(methodId)) {
                    newSavedIds = newSavedIds.filter(id => id !== methodId);
                } else {
                    newSavedIds.push(methodId);
                }

                // Call API to update the saved payment methods
                const csvString = newSavedIds.join(',');
                const updatedSettings = await updateUserSetting(
                    'payment_method_saved',
                    csvString,
                );

                log('[PaymentSetting] Updated settings:', updatedSettings);

                // Update local state
                const serverVal = updatedSettings?.payment_method_saved;
                const finalIds = serverVal
                    ? serverVal.split(',').map(Number)
                    : newSavedIds;

                setSavedMethodIds(finalIds);

                // Persist to AsyncStorage
                await AsyncStorage.setItem(
                    ASYNC_KEY_SAVED_PAYMENT,
                    finalIds.join(','),
                );
            } catch (err) {
                console.error('[PaymentSetting] Error updating setting:', err);

                if (isAuthError(err.message)) {
                    return;
                }

                Alert.alert(
                    t('common.error'),
                    err.message || 'Failed to update payment method',
                );
            } finally {
                setSaving(false);
            }
        },
        [savedMethodIds, navigation, t],
    );

    // Get icon config for a payment method
    const getMethodIcon = methodId => {
        return PAYMENT_METHOD_ICONS[methodId] || DEFAULT_ICON;
    };

    const headerProps = {
        title: t('citrine.msg000501'),
    };

    // Loading state
    if (loading) {
        return (
            <ChildrenLayout headerType="header" headerProps={headerProps}>
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>
                        {t('common.loading')}
                    </Text>
                </View>
            </ChildrenLayout>
        );
    }

    // Error state
    if (error) {
        return (
            <ChildrenLayout headerType="header" headerProps={headerProps}>
                <View style={styles.centerContainer}>
                    <CustomIcon
                        type="FontAwesome5"
                        name="exclamation-circle"
                        size={60}
                        color={colors.error || '#FF6B6B'}
                    />
                    <Text style={styles.errorText}>{t('common.error')}</Text>
                    <Text style={styles.errorMessage}>{error}</Text>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={loadData}
                        activeOpacity={0.7}>
                        <CustomIcon
                            type="FontAwesome5"
                            name="redo"
                            size={16}
                            color={colors.white}
                        />
                        <Text style={styles.retryButtonText}>
                            {t('common.retry')}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ChildrenLayout>
        );
    }

    // Calculate unsaved methods
    const unsavedMethods = paymentMethods.filter(
        m => !savedMethodIds.includes(m.id),
    );

    // Main content
    return (
        <ChildrenLayout headerType="header" headerProps={headerProps}>
            <ScrollView scrollEnabled={true}>
                <View style={styles.contentContainer}>
                    {/* Saved Payment Methods Section */}
                    {savedMethodIds.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>
                                {t('citrine.msg000540')}{' '}
                                {/* You might want to update this translation key to "Saved Methods" */}
                            </Text>
                            <View style={{ gap: moderateSize(12) }}>
                                {[...savedMethodIds]
                                    .sort((a, b) =>
                                        a === defaultMethodId
                                            ? -1
                                            : b === defaultMethodId
                                            ? 1
                                            : 0,
                                    )
                                    .map(savedId => {
                                        const method = paymentMethods.find(
                                            m => m.id === savedId,
                                        );
                                        if (!method) return null;

                                        return (
                                            <View
                                                key={'saved-' + method.id}
                                                style={styles.defaultCard}>
                                                <View
                                                    style={
                                                        styles.defaultMethodRow
                                                    }>
                                                    <View
                                                        style={
                                                            styles.iconCircle
                                                        }>
                                                        <CustomIcon
                                                            type={
                                                                getMethodIcon(
                                                                    method.id,
                                                                ).type
                                                            }
                                                            name={
                                                                getMethodIcon(
                                                                    method.id,
                                                                ).name
                                                            }
                                                            size={moderateSize(
                                                                22,
                                                            )}
                                                            color={
                                                                colors.primary
                                                            }
                                                        />
                                                    </View>
                                                    <Text
                                                        style={
                                                            styles.defaultMethodName
                                                        }>
                                                        {method.name}
                                                    </Text>
                                                    <View
                                                        style={{
                                                            flexDirection:
                                                                'row',
                                                            alignItems:
                                                                'center',
                                                        }}>
                                                        {method.id !==
                                                            defaultMethodId && (
                                                            <TouchableOpacity
                                                                style={{
                                                                    marginRight:
                                                                        moderateSize(
                                                                            12,
                                                                        ),
                                                                    padding:
                                                                        moderateSize(
                                                                            4,
                                                                        ),
                                                                }}
                                                                onPress={() =>
                                                                    handleToggleMethod(
                                                                        method.id,
                                                                    )
                                                                }
                                                                activeOpacity={
                                                                    0.7
                                                                }>
                                                                <CustomIcon
                                                                    type="FontAwesome6"
                                                                    name="trash-can"
                                                                    size={moderateSize(
                                                                        18,
                                                                    )}
                                                                    color="#FF6B6B"
                                                                />
                                                            </TouchableOpacity>
                                                        )}
                                                        <TouchableOpacity
                                                            style={{
                                                                padding:
                                                                    moderateSize(
                                                                        2,
                                                                    ),
                                                            }}
                                                            onPress={() =>
                                                                handleSelectDefault(
                                                                    method.id,
                                                                )
                                                            }
                                                            activeOpacity={0.7}>
                                                            <CustomIcon
                                                                type="FontAwesome6"
                                                                name={
                                                                    method.id ===
                                                                    defaultMethodId
                                                                        ? 'circle-check'
                                                                        : 'circle'
                                                                }
                                                                size={moderateSize(
                                                                    22,
                                                                )}
                                                                color={
                                                                    method.id ===
                                                                    defaultMethodId
                                                                        ? colors.success
                                                                        : '#ccc'
                                                                }
                                                                solid={
                                                                    method.id ===
                                                                    defaultMethodId
                                                                }
                                                            />
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>
                                            </View>
                                        );
                                    })}
                            </View>
                        </View>
                    )}
                    {/* Add Payment Methods Section */}
                    {unsavedMethods.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>
                                {t('citrine.msg000541')}
                            </Text>
                            <View style={styles.methodsListCard}>
                                {unsavedMethods.map((method, index) => {
                                    const isLast =
                                        index === unsavedMethods.length - 1;
                                    const iconConfig = getMethodIcon(method.id);

                                    return (
                                        <TouchableOpacity
                                            key={method.id}
                                            style={[
                                                styles.methodRow,
                                                !isLast &&
                                                    styles.methodRowBorder,
                                            ]}
                                            onPress={() =>
                                                handleToggleMethod(method.id)
                                            }
                                            activeOpacity={0.6}
                                            disabled={saving}>
                                            <View
                                                style={styles.iconCircleSmall}>
                                                <CustomIcon
                                                    type={iconConfig.type}
                                                    name={iconConfig.name}
                                                    size={moderateSize(18)}
                                                    color={colors.textSecondary}
                                                />
                                            </View>
                                            <Text style={styles.methodName}>
                                                {method.name}
                                            </Text>
                                            <Checkbox
                                                checked={false}
                                                onPress={() =>
                                                    handleToggleMethod(
                                                        method.id,
                                                    )
                                                }
                                                size={moderateSize(22)}
                                            />
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Saving overlay */}
            {saving && (
                <View style={styles.savingOverlay}>
                    <View style={styles.savingContainer}>
                        <ActivityIndicator
                            size="small"
                            color={colors.primary}
                        />
                        <Text style={styles.savingText}>
                            {t('common.loading')}
                        </Text>
                    </View>
                </View>
            )}
        </ChildrenLayout>
    );
};

const styles = StyleSheet.create({
    contentContainer: {
        paddingHorizontal: moderateSize(16),
        paddingVertical: moderateSize(16),
    },

    // Center states (loading / error)
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: moderateSize(40),
    },
    loadingText: {
        marginTop: moderateSize(16),
        fontSize: moderateSize(16),
        color: colors.textSecondary,
    },
    errorText: {
        marginTop: moderateSize(16),
        fontSize: moderateSize(20),
        fontWeight: '700',
        color: colors.textPrimary,
    },
    errorMessage: {
        marginTop: moderateSize(8),
        fontSize: moderateSize(14),
        color: colors.textSecondary,
        textAlign: 'center',
    },
    retryButton: {
        marginTop: moderateSize(24),
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary,
        paddingVertical: moderateSize(12),
        paddingHorizontal: moderateSize(24),
        borderRadius: moderateSize(8),
        gap: moderateSize(8),
    },
    retryButtonText: {
        fontSize: moderateSize(16),
        fontWeight: '600',
        color: colors.white,
    },

    // Section
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

    // Default Payment Method Card
    defaultCard: {
        backgroundColor: '#F0F4FF',
        borderRadius: moderateSize(14),
        padding: moderateSize(16),
        borderWidth: 1,
        borderColor: colors.primary + '30', // 30 = ~19% opacity
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3,
    },
    defaultMethodRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconCircle: {
        width: moderateSize(44),
        height: moderateSize(44),
        borderRadius: moderateSize(22),
        backgroundColor: colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: moderateSize(14),
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    defaultMethodName: {
        flex: 1,
        fontSize: moderateSize(16),
        fontWeight: '600',
        color: colors.textPrimary,
    },
    checkBadge: {
        marginLeft: moderateSize(10),
    },

    // All Payment Methods List
    methodsListCard: {
        backgroundColor: colors.white,
        borderRadius: moderateSize(16),
        overflow: 'hidden',
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
    },
    methodRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: moderateSize(14),
        paddingHorizontal: moderateSize(16),
    },
    methodRowSelected: {
        backgroundColor: '#F0F4FF',
    },
    methodRowBorder: {
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    selectedIndicator: {
        position: 'absolute',
        left: 0,
        top: moderateSize(8),
        bottom: moderateSize(8),
        width: 3,
        backgroundColor: colors.primary,
        borderTopRightRadius: 3,
        borderBottomRightRadius: 3,
    },
    iconCircleSmall: {
        width: moderateSize(36),
        height: moderateSize(36),
        borderRadius: moderateSize(18),
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: moderateSize(14),
    },
    iconCircleSmallSelected: {
        backgroundColor: colors.primary + '15', // ~8% opacity
    },
    methodName: {
        flex: 1,
        fontSize: moderateSize(14),
        fontWeight: '500',
        color: colors.textPrimary,
    },
    methodNameSelected: {
        fontWeight: '600',
        color: colors.primary,
    },

    // Saving overlay
    savingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    savingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        paddingVertical: moderateSize(14),
        paddingHorizontal: moderateSize(24),
        borderRadius: moderateSize(12),
        gap: moderateSize(10),
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 8,
    },
    savingText: {
        fontSize: moderateSize(14),
        fontWeight: '500',
        color: colors.textPrimary,
    },
});

export default PaymentSettingScreen;
