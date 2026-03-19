import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Image,
    Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MasterPageLayout from '../../components/MasterPageLayout';
import userImage from '../../assets/images/user-default.png';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import colors from '../../constants/colors';
import { logout } from '../../services/auth';
import { getDisplayVersion } from '../../utils/versionUtils';
import { moderateSize } from '../../styles';

const SettingScreen = () => {
    const navigation = useNavigation();
    const displayVersion = getDisplayVersion();
    const { t } = useTranslation();
    // State to save user's photo
    const [userPhoto] = useState(null);

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
                            // logout() always clears local credentials in finally
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
        <MasterPageLayout
            headerType="header"
            headerProps={{
                title: 'Settings',
                showCrudText: false,
                showHomeIcon: false,
            }}>
            <View style={styles.main}>
                <View style={styles.usernameContainer}>
                    <Image
                        source={userPhoto ? { uri: userPhoto } : userImage}
                        style={styles.userImage}
                    />
                    <Text style={styles.usernameText}>Username</Text>
                </View>
                {/* Change password */}
                <TouchableOpacity
                    style={styles.option}
                    onPress={() => navigation.navigate('ChangePasswordScreen')}>
                    <Text style={styles.optionText}>
                        {t('setting.changePassword')}
                    </Text>
                    <Icon name="chevron-right" size={24} color="gray" />
                </TouchableOpacity>
                {/* User profile */}
                <TouchableOpacity
                    style={styles.option}
                    onPress={() => navigation.navigate('ProfileScreen')}>
                    <Text style={styles.optionText}>
                        {t('setting.userProfile')}
                    </Text>
                    <Icon name="chevron-right" size={24} color="gray" />
                </TouchableOpacity>
                {/* Languages */}
                <TouchableOpacity
                    style={styles.option}
                    onPress={() => navigation.navigate('LanguageScreen')}>
                    <Text style={styles.optionText}>
                        {t('setting.language')}
                    </Text>
                    <Icon name="chevron-right" size={24} color="gray" />
                </TouchableOpacity>
                {/* App information */}
                <TouchableOpacity
                    style={styles.option}
                    onPress={() => navigation.navigate('ChangeLogs')}>
                    <Text style={styles.optionText}>
                        {t('setting.appInformation')}
                    </Text>
                    <Text style={styles.versionText}>{displayVersion}</Text>
                </TouchableOpacity>
                {/* Logout */}
                <TouchableOpacity style={styles.option} onPress={handleLogout}>
                    <Text style={styles.optionText}>{t('setting.logout')}</Text>
                    <Icon name="chevron-right" size={24} color="gray" />
                </TouchableOpacity>
            </View>
        </MasterPageLayout>
    );
};

const styles = StyleSheet.create({
    main: {
        flex: 1,
        padding: moderateSize(16),
        alignItems: 'center',
    },
    usernameContainer: {
        alignItems: 'center',
        marginBottom: 10,
    },
    userImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 10,
    },
    usernameText: {
        fontSize: 18,
        color: colors.primary,
        fontWeight: '600',
    },
    option: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        width: '100%',
    },
    optionText: {
        fontSize: 16,
        fontWeight: '500',
        color: colors.textPrimary,
    },
    versionText: {
        fontSize: 16,
        marginLeft: 8,
        fontWeight: 'bold',
    },
});

export default SettingScreen;
