import React, { useCallback, useEffect, useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { NavigationContainer, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import LoginScreen from '../screens/Auth/LoginScreen.js';
import CustomerRegisterScreen from '../screens/Auth/CustomerRegisterScreen.js';
import WorkRegisterMonthScreen from '../screens/Home/WorkRegister/WorkRegisterMonth';
import WorkRegisterWeekScreen from '../screens/Home/WorkRegister/WorkRegisterWeek';
import HomeScreen from '../screens/Home/HomeScreen';
// import SettingScreen from '../screens/Setting/SettingScreen.js';
import LanguageScreen from '../screens/Setting/Language/LanguageScreen.js';
// import SearchScreen from '../screens/Search/SearchScreen.js';
import MessageScreen from '../screens/Message/MessageScreen';
import { useTranslation } from 'react-i18next';
import SplashScreen from '../components/Splash';
import { ENV, ensureEnvLoaded } from '../config/env';
import ProfileScreen from '../screens/Setting/Profile/ProfileScreen.js';
import ChangePasswordScreen from '../screens/Setting/ChangePassword/ChangePasswordScreen.js';
import ResetPassword from '../screens/Setting/ResetPassword/ResetPassword.js';
import SuccessScreen from '../screens/Setting/ResetPassword/SuccessScreen.js';
import OtpCodeScreen from '../screens/Auth/ForgotPassword/OtpCodeScreen';
import OtpVerifyScreen from '../screens/Auth/ForgotPassword/OtpVerifyScreen';
import ForgotPasswordScreen from '../screens/Auth/ForgotPassword/ForgotPasswordScreen';
import ForgotPasswordErrorScreen from '../screens/Auth/ForgotPassword/ForgotPasswordErrorScreen';
import ChangeLogs from '../screens/ChangeLogs/ChangeLogs.js';
import CustomerRoomInfoScreen from '../screens/CustomerRoomInfo/CustomerRoomInfoScreen';
import CustomerSearchRoomScreen from '../screens/CustomerSearch/CustomerSearchRoomScreen';
import {
    ROLE_CUSTOMER,
    ROLE_STAFF,
    ROLE_STAFF_MANAGER,
} from '../constants/utils';
import PromotionScreen from '../screens/Home/Promotion/PromotionScreen.js';
import PaymentScreen from '../screens/Payment/PaymentScreen';
import PaymentHistoryScreen from '../screens/Payment/PaymentHistoryScreen';
import ActivityScreen from '../screens/Activity/ActivityScreen';
import CleaningScreen from '../screens/Activity/CleaningScreen';
import SearchRoomScreen from '../screens/Home/Booking/SearchRoom/SearchRoomScreen.js';
// import SearchScreen from './../screens/Search/SearchScreen';
import BookingCancelScreen from '../screens/Home/Booking/BookingCancel/BookingCancelScreen.js';
import BookingConfirmScreen from '../screens/Home/Booking/BookingConfirm/BookingConfirmScreen.js';
import BookingHistoryScreen from '../screens/Home/Booking/BookingHistory/BookingHistoryScreen.js';
import BookingPaymentScreen from '../screens/Home/Booking/BookingPayment/BookingPaymentScreen.js';
import BookingInfoScreen from '../screens/Home/Booking/BookingInfo/BookingInfoScreen.js';
import RoomInfoScreen from '../screens/Home/Booking/RoomInfo/RoomInfoScreen.js';
import SignUpScreen from '../screens/Auth/SignUp/SignUpScreen.js';
import AddProfileScreen from '../screens/Profile/AddProfileScreen';
import CustomerBookingScreen from '../screens/Home/Booking/CustomerBooking/CustomerBookingScreen.js';
import ConfirmProfileScreen from '../screens/Auth/SignUp/ConfirmProfile/ConfirmProfileScreen.js';
import CustomerHome from '../screens/CustomerHome/CustomerHome.js';
import Account from '../screens/Account/Account.js';
import { fetchCustomerHomeData } from '../services/apiCustomerHome';
import { moderateSize } from '../styles/moderateSize.js';

// Create navigator
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Navigator for tab screens
const normalizeRoleCode = roleCode => {
    const normalized = String(roleCode || '')
        .trim()
        .toUpperCase();

    if (normalized === ROLE_CUSTOMER || normalized === 'CUSTOMER') {
        return ROLE_CUSTOMER;
    }

    if (normalized === ROLE_STAFF || normalized === 'STAFF') {
        return ROLE_STAFF;
    }

    if (normalized === ROLE_STAFF_MANAGER || normalized === 'STAFF_MANAGER') {
        return ROLE_STAFF_MANAGER;
    }

    // Default to customer for safety
    return ROLE_CUSTOMER;
};

const TabNavigatorContent = () => {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const [userRole, setUserRole] = useState(ROLE_CUSTOMER);

    const loadRole = useCallback(async () => {
        try {
            const roleCode = await AsyncStorage.getItem('userRoleCode');
            if (roleCode) {
                setUserRole(normalizeRoleCode(roleCode));
                return;
            }

            const userInfo = await AsyncStorage.getItem('userInfo');
            if (userInfo) {
                const parsedUser = JSON.parse(userInfo);
                const fallbackRoleCode = parsedUser?.user?.role?.code;
                if (fallbackRoleCode) {
                    setUserRole(normalizeRoleCode(fallbackRoleCode));
                    return;
                }
            }

            // If role not in storage yet, fetch once from customer_home API
            // (API response will save userRoleCode in AsyncStorage)
            await fetchCustomerHomeData();
            const refreshedRoleCode = await AsyncStorage.getItem(
                'userRoleCode',
            );
            if (refreshedRoleCode) {
                setUserRole(normalizeRoleCode(refreshedRoleCode));
            }
        } catch (e) {
            console.error('[AppNavigator] Failed to load user role:', e);
        }
    }, []);

    useEffect(() => {
        loadRole();
    }, [loadRole]);

    useFocusEffect(
        useCallback(() => {
            loadRole();
            return undefined;
        }, [loadRole]),
    );

    const getTabIcon = (routeName, focused) => {
        let iconName;
        let label;

        if (routeName === 'Home') {
            iconName = 'home';
            label = t('navigation.home');
        } else if (routeName === 'Search') {
            iconName = 'search';
            label = t('navigation.search');
        } else if (routeName === 'Payment') {
            iconName = 'credit-card';
            label = 'Payment';
        } else if (routeName === 'Activity') {
            iconName = 'list';
            label = 'Activity';
        } else if (routeName === 'Cleaning') {
            iconName = 'trash';
            label = 'Cleaning';
        } else if (routeName === 'Message') {
            iconName = focused ? 'envelope' : 'envelope-o';
            label = t('navigation.message');
        } else if (routeName === 'Account') {
            iconName = 'user';
            label = t('navigation.account');
        }

        return { iconName, label };
    };

    // Calculate tab bar height with safe area insets
    const tabBarHeight = moderateSize(52);
    const tabBarPaddingTop = moderateSize(6);
    const tabBarPaddingBottom = moderateSize(6);
    const totalTabBarHeight = tabBarHeight + insets.bottom;
    const iconSize = moderateSize(18);

    // List of all tabs
    const ALL_TABS = [
        {
            key: 'home_customer',
            name: 'Home',
            component: CustomerHome,
        },
        {
            key: 'home_staff',
            name: 'Home',
            component: HomeScreen,
        },
        {
            key: 'payment',
            name: 'Payment',
            component: PaymentScreen,
        },
        {
            key: 'activity',
            name: 'Activity',
            component: BookingHistoryScreen,
        },
        {
            key: 'message',
            name: 'Message',
            component: MessageScreen,
        },
        {
            key: 'account',
            name: 'Account',
            component: Account,
        },
    ];

    // List of role → tab access
    const TAB_ACCESS_BY_ROLE = {
        [ROLE_CUSTOMER]: {
            home_customer: true,
            payment: true,
            activity: true,
            account: true,
        },
        [ROLE_STAFF]: {
            home_staff: true,
            activity: true,
            message: true,
            account: true,
        },
        [ROLE_STAFF_MANAGER]: {
            home_staff: true,
            activity: true,
            message: true,
            account: true,
        },
    };

    const currentAccess = TAB_ACCESS_BY_ROLE[userRole] || {};

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused }) => {
                    const { iconName, label } = getTabIcon(route.name, focused);

                    return (
                        <View
                            style={[
                                styles.iconContainer,
                                focused && styles.focusedContainer,
                            ]}>
                            <Icon
                                name={iconName}
                                size={iconSize}
                                color={focused ? '#FFFFFF' : '#9CA3AF'}
                            />
                            {focused && (
                                <Text style={styles.label}>{label}</Text>
                            )}
                        </View>
                    );
                },
                tabBarActiveTintColor: '#FFFFFF',
                tabBarInactiveTintColor: '#9CA3AF',
                tabBarStyle: {
                    backgroundColor: ENV.NAV_BAR_COLOR,
                    height: totalTabBarHeight,
                    paddingBottom: tabBarPaddingBottom + insets.bottom,
                    paddingTop: tabBarPaddingTop,
                    paddingHorizontal: moderateSize(2),
                    borderTopWidth: 0,
                    elevation: 4,
                    shadowColor: '#000000',
                    shadowOffset: {
                        width: 0,
                        height: -1,
                    },
                    shadowOpacity: 0.08,
                    shadowRadius: 4,
                },
                tabBarItemStyle: {
                    flex: 1,
                    maxWidth: '25%',
                    paddingVertical: moderateSize(2),
                },
                tabBarLabel: () => null, // Hide the tabBarLabel
                headerShown: false,
            })}>
            {/* Generate dynamic tabs based on current role */}
            {ALL_TABS.filter(tab => currentAccess[tab.key]).map(tab => {
                const ScreenComponent = tab.component;

                return (
                    <Tab.Screen
                        key={tab.key}
                        name={tab.name}
                        component={ScreenComponent}
                    />
                );
            })}
        </Tab.Navigator>
    );
};

const styles = StyleSheet.create({
    iconContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 1,
        minWidth: 0,
        paddingVertical: moderateSize(4),
        paddingHorizontal: moderateSize(4),
        borderRadius: moderateSize(18),
    },
    focusedContainer: {
        backgroundColor: '#3629B7',
        borderRadius: moderateSize(20),
        paddingHorizontal: moderateSize(10),
        paddingVertical: moderateSize(4),
        minWidth: moderateSize(60),
        shadowColor: '#3629B7',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
    },
    label: {
        color: '#FFFFFF',
        marginLeft: moderateSize(4),
        fontSize: moderateSize(10),
        fontWeight: '600',
        letterSpacing: 0.1,
    },
});

const TabNavigator = () => <TabNavigatorContent />;

// Main Navigator to manage navigation
const AppNavigatorContent = () => {
    const { t } = useTranslation();
    const [isLogin, setIsLogin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            await ensureEnvLoaded();
            const token = await AsyncStorage.getItem('token');
            setIsLogin(!!token);
            setLoading(false);
        };
        init();
    }, []);

    if (loading) {
        // Loading screen or spinner can be displayed here
        return <SplashScreen />;
    }

    return (
        <Stack.Navigator
            initialRouteName={isLogin ? 'Main' : 'Login'}
            screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
            <Stack.Screen name="Account" component={Account} />
            <Stack.Screen name="AddProfile" component={AddProfileScreen} />
            <Stack.Screen
                name="CustomerRegister"
                component={CustomerRegisterScreen}
            />
            <Stack.Screen
                name="ForgotPassword"
                component={ForgotPasswordScreen}
            />
            <Stack.Screen
                name="ForgotPasswordError"
                component={ForgotPasswordErrorScreen}
            />
            <Stack.Screen name="CheckOTPScreen" component={OtpCodeScreen} />
            <Stack.Screen name="OtpVerify" component={OtpVerifyScreen} />
            <Stack.Screen name="Main" component={TabNavigator} />
            <Stack.Screen
                name="LanguageScreen"
                component={LanguageScreen}
                options={{ headerShown: true, title: t('setting.language') }} // Language
            />
            <Stack.Screen
                name="ProfileScreen"
                component={ProfileScreen}
                options={{ title: 'Profile' }}
            />
            <Stack.Screen
                name="ConfirmProfile"
                component={ConfirmProfileScreen}
            />
            <Stack.Screen
                name="ChangePasswordScreen"
                component={ChangePasswordScreen}
                options={{ title: 'ChangePassword' }}
            />
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen
                name="WorkRegisterMonthScreen"
                component={WorkRegisterMonthScreen}
            />
            <Stack.Screen
                name="WorkRegisterWeekScreen"
                component={WorkRegisterWeekScreen}
            />
            <Stack.Screen name="ResetPassword" component={ResetPassword} />
            <Stack.Screen
                name="SuccessScreen"
                component={SuccessScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen name="ChangeLogs" component={ChangeLogs} />
            <Stack.Screen
                name="CustomerRoomInfo"
                component={CustomerRoomInfoScreen}
            />
            <Stack.Screen
                name="CustomerSearchRoom"
                component={CustomerSearchRoomScreen}
            />

            <Stack.Screen
                name="CustomerBookingScreen"
                component={CustomerBookingScreen}
            />
            <Stack.Screen name="PromotionScreen" component={PromotionScreen} />
            <Stack.Screen name="PaymentScreen" component={PaymentScreen} />
            <Stack.Screen
                name="PaymentHistoryScreen"
                component={PaymentHistoryScreen}
            />
            <Stack.Screen name="ActivityScreen" component={ActivityScreen} />
            <Stack.Screen name="CleaningScreen" component={CleaningScreen} />
            <Stack.Screen
                name="SearchRoomScreen"
                component={SearchRoomScreen}
            />
            <Stack.Screen name="RoomInfoScreen" component={RoomInfoScreen} />
            <Stack.Screen
                name="BookingCancelScreen"
                component={BookingCancelScreen}
            />
            <Stack.Screen
                name="BookingConfirmScreen"
                component={BookingConfirmScreen}
            />
            <Stack.Screen
                name="BookingHistoryScreen"
                component={BookingHistoryScreen}
            />
            <Stack.Screen
                name="BookingInfoScreen"
                component={BookingInfoScreen}
            />
            <Stack.Screen
                name="BookingPaymentScreen"
                component={BookingPaymentScreen}
            />
            <Stack.Screen name="CustomerHome" component={CustomerHome} />
        </Stack.Navigator>
    );
};

const AppNavigator = () => (
    <NavigationContainer>
        <AppNavigatorContent />
    </NavigationContainer>
);

export default AppNavigator;
