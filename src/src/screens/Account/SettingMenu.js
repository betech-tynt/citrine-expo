import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Switch } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome6';
import colors from '../../constants/colors';
import { moderateSize } from '../../styles/moderateSize';
import { AccountSettingMenuPropTypes } from '../../utils/propTypes';

const SettingMenu = ({
    t,
    navigation,
    promotionEnabled,
    setPromotionEnabled,
    getCurrentLanguageName,
    displayVersion,
    onCheckUpdates,
    onLogout,
}) => {
    return (
        <>
            {/* Settings Card */}
            <View style={styles.contentCard}>
                <Text style={styles.sectionTitle}>{t('setting.title')}</Text>

                {/* Receive Promotion Info */}
                <View style={styles.settingRow}>
                    <View style={styles.settingLabelContainer}>
                        <Icon
                            name="tags"
                            size={20}
                            color={colors.primary}
                            style={styles.settingIcon}
                        />
                        <Text style={styles.settingLabel}>
                            {t('setting.receivePromotion')}
                        </Text>
                    </View>
                    <Switch
                        value={promotionEnabled}
                        onValueChange={setPromotionEnabled}
                        trackColor={{
                            false: '#ccc',
                            true: colors.primary,
                        }}
                        thumbColor="#fff"
                    />
                </View>

                {/* Policy and Privacy */}
                <TouchableOpacity
                    style={styles.settingRow}
                    onPress={() => console.log('Policy pressed')}>
                    <View style={styles.settingLabelContainer}>
                        <Icon
                            name="file-contract"
                            size={20}
                            color={colors.primary}
                            style={styles.settingIcon}
                        />
                        <Text style={styles.settingLabel}>
                            {t('setting.privacyPolicy')}
                        </Text>
                    </View>
                    <Icon name="chevron-right" size={20} color="#ccc" />
                </TouchableOpacity>

                {/* Contact Us */}
                <TouchableOpacity
                    style={styles.settingRow}
                    onPress={() => console.log('Contact pressed')}>
                    <View style={styles.settingLabelContainer}>
                        <Icon
                            name="headset"
                            size={20}
                            color={colors.primary}
                            style={styles.settingIcon}
                        />
                        <Text style={styles.settingLabel}>
                            {t('setting.contactUs')}
                        </Text>
                    </View>
                    <Icon name="chevron-right" size={20} color="#ccc" />
                </TouchableOpacity>

                {/* Change Password */}
                <TouchableOpacity
                    style={styles.settingRow}
                    onPress={() => navigation.navigate('ChangePasswordScreen')}>
                    <View style={styles.settingLabelContainer}>
                        <Icon
                            name="lock"
                            size={20}
                            color={colors.primary}
                            style={styles.settingIcon}
                        />
                        <Text style={styles.settingLabel}>
                            {t('setting.changePassword')}
                        </Text>
                    </View>
                    <Icon name="chevron-right" size={20} color="#ccc" />
                </TouchableOpacity>

                {/* Language */}
                <TouchableOpacity
                    style={styles.settingRow}
                    onPress={() => navigation.navigate('LanguageScreen')}>
                    <View style={styles.settingLabelContainer}>
                        <Icon
                            name="language"
                            size={20}
                            color={colors.primary}
                            style={styles.settingIcon}
                        />
                        <Text style={styles.settingLabel}>
                            {t('setting.language')}
                        </Text>
                    </View>
                    <View style={styles.settingValueContainer}>
                        <Text style={styles.settingValue}>
                            {getCurrentLanguageName()}
                        </Text>
                        <Icon
                            name="chevron-right"
                            size={20}
                            color="#ccc"
                            style={styles.chevronIcon}
                        />
                    </View>
                </TouchableOpacity>

                {/* Font Size */}
                <TouchableOpacity
                    style={styles.settingRow}
                    onPress={() => console.log('Font size pressed')}>
                    <View style={styles.settingLabelContainer}>
                        <Icon
                            name="font"
                            size={20}
                            color={colors.primary}
                            style={styles.settingIcon}
                        />
                        <Text style={styles.settingLabel}>
                            {t('setting.fontSize')}
                        </Text>
                    </View>
                    <Icon name="chevron-right" size={20} color="#ccc" />
                </TouchableOpacity>

                {/* Check Update */}
                <TouchableOpacity
                    style={styles.settingRow}
                    onPress={onCheckUpdates}>
                    <View style={styles.settingLabelContainer}>
                        <Icon
                            name="cloud-arrow-down"
                            size={20}
                            color={colors.primary}
                            style={styles.settingIcon}
                        />
                        <Text style={styles.settingLabel}>
                            {t('setting.checkForUpdates')}
                        </Text>
                    </View>
                    <Icon name="chevron-right" size={20} color="#ccc" />
                </TouchableOpacity>

                {/* Version Info */}
                <TouchableOpacity
                    style={[styles.settingRow, styles.lastSettingRow]}
                    onPress={() => navigation.navigate('ChangeLogs')}>
                    <View style={styles.settingLabelContainer}>
                        <Icon
                            name="circle-info"
                            size={20}
                            color={colors.primary}
                            style={styles.settingIcon}
                        />
                        <Text style={styles.settingLabel}>
                            {t('setting.version')} {displayVersion}
                        </Text>
                    </View>
                    <Icon name="chevron-right" size={20} color="#ccc" />
                </TouchableOpacity>
            </View>

            {/* Logout Button */}
            <View style={styles.logoutContainer}>
                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={onLogout}>
                    <Icon
                        name="arrow-right-from-bracket"
                        size={20}
                        color="#FF4D4D"
                        style={styles.logoutIcon}
                    />
                    <Text style={styles.logoutText}>{t('setting.logout')}</Text>
                </TouchableOpacity>
            </View>
        </>
    );
};

SettingMenu.propTypes = AccountSettingMenuPropTypes;

const styles = StyleSheet.create({
    contentCard: {
        width: '100%',
        backgroundColor: 'white',
        borderRadius: moderateSize(20),
        marginTop: moderateSize(20),
        marginHorizontal: moderateSize(2),
        marginVertical: moderateSize(5),
        paddingTop: moderateSize(10),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: moderateSize(18),
        fontWeight: 'bold',
        color: '#333',
        padding: moderateSize(10),
        paddingHorizontal: moderateSize(20),
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: moderateSize(15),
        paddingHorizontal: moderateSize(20),
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    lastSettingRow: {
        borderBottomWidth: 0,
    },
    settingLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    settingIcon: {
        marginRight: moderateSize(15),
        width: moderateSize(20),
        textAlign: 'center',
    },
    settingLabel: {
        color: '#333',
        fontWeight: '500',
        fontSize: moderateSize(14),
    },
    settingValueContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    settingValue: {
        color: '#333',
        fontWeight: '500',
        fontSize: moderateSize(14),
        marginRight: moderateSize(10),
    },
    chevronIcon: {
        marginRight: 0,
    },
    logoutContainer: {
        paddingTop: moderateSize(30),
        paddingBottom: moderateSize(30),
    },
    logoutButton: {
        backgroundColor: '#FFF0F0',
        width: '100%',
        padding: moderateSize(15),
        borderRadius: moderateSize(15),
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: moderateSize(10),
    },
    logoutIcon: {
        marginRight: 0,
    },
    logoutText: {
        color: '#FF4D4D',
        fontSize: moderateSize(15),
        fontWeight: 'bold',
    },
});

export default SettingMenu;
