import { commonStyles } from '@/src/theme/commonStyles';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Linking, ScrollView, StyleSheet, View } from 'react-native';
import Header from '../../components/Header';
import { ENV } from '../../config/env';
import colors from '../../constants/colors';
import { logout } from '../../services/auth';
import { moderateSize } from '../../styles/moderateSize';
import { getDisplayVersion } from '../../utils/versionUtils';
import Profile from './Profile';
import SettingMenu from './SettingMenu';

const Account = () => {
    const { t, i18n } = useTranslation();
    const navigation = useNavigation();
    const displayVersion = getDisplayVersion();

    const userData = {
        name: 'Nguyễn Văn A',
        username: 'nguyenvana',
        email: 'a.nguyen@example.com',
        phone: '+84 90 123 4567',
        address: '123 Đường ABC, Q.1, TP.HCM',
        dob: '01/01/1990',
        role: 'Khách hàng',
        avatarImage: 'https://picsum.photos/seed/avatar/150/150.jpg',
    };

    const [userPhoto, setUserPhoto] = useState(null); // eslint-disable-line no-unused-vars
    const [backgroundImage, setBackgroundImage] = useState(null); // eslint-disable-line no-unused-vars
    const [promotionEnabled, setPromotionEnabled] = useState(true);

    const handleEditProfile = () => console.log('Edit profile pressed');

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

    // handle check updates (stg use internal test link, prd use store public)
    const handleCheckUpdates = () => {
        const envName = (ENV.ENV_NAME || '').toLowerCase();

        // URL internal test for env staging
        const STAGING_UPDATE_URL =
            'https://play.google.com/apps/internaltest/4701243539126893817';
        // URL public on Play Store for env production
        const PRODUCTION_UPDATE_URL =
            'https://play.google.com/store/apps/details?id=net.bisync.citrine';

        const UPDATE_URL = envName.includes('staging')
            ? STAGING_UPDATE_URL
            : PRODUCTION_UPDATE_URL;

        if (!UPDATE_URL) {
            return;
        }

        Linking.openURL(UPDATE_URL).catch(err => {
            console.error('Failed to open update URL', err);
            Alert.alert(t('common.error'), err.message || 'Cannot open store');
        });
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

    return (
        <>
            <Header
                title="User profile"
                showCrudText={false}
                showHomeIcon={false}
            />
            <View style={commonStyles.main}>
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
                        />
                    </View>
                </ScrollView>
            </View>
        </>
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
});

export default Account;
