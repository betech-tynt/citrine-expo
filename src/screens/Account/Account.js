import React, { useState, useCallback } from 'react';
import {
    StyleSheet,
    View,
    ScrollView,
    Alert,
    Linking,
    ActivityIndicator,
    Text,
    TouchableOpacity,
    Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MasterPageLayout from '../../components/MasterPageLayout';
import colors from '../../constants/colors';
import { moderateSize } from '../../styles/moderateSize';
import { logout, getUserData } from '../../services/auth';
import { getDisplayVersion } from '../../utils/versionUtils';
import { ENV } from '../../config/env';
import CustomIcon from '../../components/CustomIcon';
import Profile from './Profile';
import SettingMenu from './SettingMenu';
import { log } from '../../utils/handleLog';
import { isAuthError, handleAuthError } from '../../utils/authErrorHandler';

const Account = () => {
    const { t, i18n } = useTranslation();
    const navigation = useNavigation();
    const displayVersion = getDisplayVersion();

    // State management for API data
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userData, setUserData] = useState(null);

    const [userPhoto, setUserPhoto] = useState(null);
    const [backgroundImage, setBackgroundImage] = useState(null);
    const [promotionEnabled, setPromotionEnabled] = useState(true);

    /**
     * Fetch user data from API
     */
    const loadUserData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Double check token before calling API
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                handleAuthError(navigation);
                return;
            }

            const response = await getUserData();

            // Map API response to UI format
            const user = response?.user;
            const profile = user?.profile;
            log('[Account] API response profile:', profile);
            const mappedUserData = {
                // Name fields
                firstName: profile?.first_name || '',
                lastName: profile?.last_name || '',
                kanaFirstName: profile?.kana_first_name || '',
                kanaLastName: profile?.kana_last_name || '',
                name: profile?.fullname || user?.name || '',
                username: user?.username || '',
                email: profile?.email || user?.email || '',
                phone: profile?.phone_number || '',
                // Address fields
                postalCode: profile?.postal_code || '',
                ward: profile?.ward || '',
                fullAddress: profile?.full_address || '',
                address: profile?.address || '',
                // Personal info
                dob: profile?.birthday || '',
                gender: profile?.gender || '',
                code: profile?.code || '',
                companyId: profile?.company_id || '',
                // Role
                role: user?.role || null,
            };

            // Extract avatar from profile
            const avatarImage =
                profile?.avatar_url ||
                'https://picsum.photos/seed/avatar/150/150.jpg';

            setUserData(mappedUserData);
        } catch (err) {
            console.error('[Account] Error loading user data:', err);
            const errorMessage = err.message || '';

            // Check if error is authentication related
            if (isAuthError(errorMessage)) {
                handleAuthError(navigation);
                return;
            }

            setError(errorMessage || 'Failed to load user data');
        } finally {
            setLoading(false);
        }
    }, [navigation]);

    // Fetch user data when screen comes into focus (e.g., after editing profile)
    useFocusEffect(
        useCallback(() => {
            loadUserData();
        }, [loadUserData]),
    );

    const handleEditProfile = () =>
        navigation.navigate('EditProfile', { userData });

    const handleRetry = () => {
        loadUserData();
    };

    // Get current language name
    const getCurrentLanguageName = () => {
        const currentLang = i18n.language || 'en';
        const languageMap = {
            vi: t('profile.vietnamese'),
            en: t('profile.english'),
            jp: t('profile.japanese'),
        };
        return languageMap[currentLang] || languageMap.vi;
    };

    /**
     * Open update page depending on platform and environment
     * Android:
     *   - staging    -> Google Play Internal Testing
     *   - production -> Google Play Store
     * iOS:
     *   - staging    -> TestFlight
     *   - production -> Apple App Store
     */
    const handleCheckUpdates = async () => {
        const envName = (ENV.ENV_NAME || '').toLowerCase();
        const isStaging = envName.includes('staging');
        const isIOS = Platform.OS === 'ios';
        const ANDROID_STAGING_UPDATE_URL =
            'https://play.google.com/apps/internaltest/4701243539126893817';
        const ANDROID_PRODUCTION_UPDATE_URL =
            'https://play.google.com/store/apps/details?id=net.bisync.citrine';
        const IOS_STAGING_UPDATE_URL = 'itms-beta://';
        const IOS_PRODUCTION_UPDATE_URL = 'https://apps.apple.com/app/idxxxxx';

        try {
            if (isIOS && isStaging) {
                // Try to open TestFlight app first.
                const supported = await Linking.canOpenURL(
                    IOS_STAGING_UPDATE_URL,
                );
                // If TestFlight is not installed, fallback to the web page
                if (supported) {
                    await Linking.openURL(IOS_STAGING_UPDATE_URL);
                } else {
                    await Linking.openURL('https://testflight.apple.com/');
                }
                return;
            }
            // Select correct update URL for remaining cases
            const updateUrl = isIOS
                ? IOS_PRODUCTION_UPDATE_URL
                : isStaging
                ? ANDROID_STAGING_UPDATE_URL
                : ANDROID_PRODUCTION_UPDATE_URL;

            await Linking.openURL(updateUrl);
        } catch (error) {
            console.error('Failed to open update URL', error);
            Alert.alert(
                t('common.error'),
                error.message || 'Cannot open store',
            );
        }
    };

    const handleImagePicker = () => {
        console.log('Image picker pressed');
    };

    const handleBackgroundImagePicker = () => {
        console.log('Background image pressed');
    };

    // Logout function handling
    const handleLogout = () => {
        Alert.alert(
            t('setting.logout'),
            t('setting.logoutConfirm'),
            [
                {
                    text: t('common.cancel'),
                    style: 'cancel',
                },
                {
                    text: t('common.ok'),
                    onPress: async () => {
                        try {
                            const message = await logout();
                            console.log('Logout Message:', message);
                            navigation.replace('Login');
                        } catch (error) {
                            console.error('Error during logout:', error);
                            navigation.replace('Login');
                        }
                    },
                },
            ],
            { cancelable: false },
        );
    };

    // Common header props
    const headerProps = {
        title: t('setting.userProfile'),
        showCrudText: false,
        showHomeIcon: false,
        showBackIcon: false,
    };

    // Loading state
    if (loading) {
        return (
            <MasterPageLayout headerType="header" headerProps={headerProps}>
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>
                        {t('common.loading')}
                    </Text>
                </View>
            </MasterPageLayout>
        );
    }

    // Error state
    if (error) {
        return (
            <MasterPageLayout headerType="header" headerProps={headerProps}>
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
                        onPress={handleRetry}
                        activeOpacity={0.7}>
                        <CustomIcon
                            type="FontAwesome5"
                            name="redo"
                            size={16}
                            color={colors.white}
                            style={styles.retryIcon}
                        />
                        <Text style={styles.retryButtonText}>
                            {t('common.retry')}
                        </Text>
                    </TouchableOpacity>
                </View>
            </MasterPageLayout>
        );
    }

    return (
        <MasterPageLayout headerType="header" headerProps={headerProps}>
            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}>
                <View style={styles.contentContainer}>
                    <Profile
                        t={t}
                        userData={userData}
                        userPhoto={userPhoto}
                        backgroundImage={backgroundImage}
                        onPressAvatar={handleImagePicker}
                        onPressBackground={handleBackgroundImagePicker}
                        onPressEditProfile={handleEditProfile}
                    />
                    <SettingMenu
                        t={t}
                        navigation={navigation}
                        promotionEnabled={promotionEnabled}
                        setPromotionEnabled={setPromotionEnabled}
                        getCurrentLanguageName={getCurrentLanguageName}
                        displayVersion={displayVersion}
                        onCheckUpdates={handleCheckUpdates}
                        onLogout={handleLogout}
                        userId={userData?.code || userData?.email}
                    />
                </View>
            </ScrollView>
        </MasterPageLayout>
    );
};

const styles = StyleSheet.create({
    contentContainer: {
        flexGrow: 1,
        paddingBottom: moderateSize(80),
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: moderateSize(16),
        paddingBottom: moderateSize(30),
    },
    main: {
        flexGrow: 1,
        padding: moderateSize(16),
        borderTopLeftRadius: moderateSize(30),
        borderTopRightRadius: moderateSize(30),
        backgroundColor: colors.background,
        minHeight: '100%',
        zIndex: 2,
        marginTop: moderateSize(80),
        overflow: 'hidden',
    },
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
    },
    retryIcon: {
        marginRight: moderateSize(8),
    },
    retryButtonText: {
        fontSize: moderateSize(16),
        fontWeight: '600',
        color: colors.white,
    },
});

export default Account;
