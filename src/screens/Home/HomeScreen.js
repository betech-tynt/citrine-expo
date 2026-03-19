import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import MasterPageLayout from '../../components/MasterPageLayout';
import GridMenu from '../../components/GridMenu';
import { useTranslation } from 'react-i18next';
import { moderateSize } from '../../styles';
import { getHomeMenuItems } from '../../constants/homeMenu';
import colors from '../../constants/colors';
import {
    ROLE_CUSTOMER,
    ROLE_STAFF,
    ROLE_STAFF_MANAGER,
} from '../../constants/utils';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomeScreen = () => {
    const navigation = useNavigation();
    const { t } = useTranslation();
    const [userRole, setUserRole] = useState(null);

    // Load role code from AsyncStorage (saved from customer_home API)
    useEffect(() => {
        const loadRole = async () => {
            try {
                const roleCode = await AsyncStorage.getItem('userRoleCode');
                if (roleCode) {
                    // Normalize to API-style code, e.g. "ROLE_STAFF"
                    setUserRole(String(roleCode).trim().toUpperCase());
                } else {
                    setUserRole(ROLE_CUSTOMER);
                }
            } catch (e) {
                console.error('[HomeScreen] Failed to load user role:', e);
                setUserRole(ROLE_CUSTOMER);
            }
        };

        loadRole();
    }, []);
    const handlePress = () => {
        navigation.navigate('WorkRegisterMonthScreen');
    };

    return (
        <MasterPageLayout
            headerType="mainHeader"
            headerProps={{ username: 'Snake', notificationCount: 3 }}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Customer Role: Booking and Promotion */}
                {userRole === ROLE_CUSTOMER && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            {t('navigation.home')}
                        </Text>
                        <GridMenu
                            items={getHomeMenuItems({
                                role: ROLE_CUSTOMER,
                                navigation,
                                onWorkRegisterPress: handlePress,
                            })}
                        />
                    </View>
                )}

                {/* Staff Role: Work Register */}
                {userRole === ROLE_STAFF && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            {t('navigation.home')}
                        </Text>
                        <GridMenu
                            items={getHomeMenuItems({
                                role: ROLE_STAFF,
                                navigation,
                                onWorkRegisterPress: handlePress,
                            })}
                        />
                    </View>
                )}

                {/* Staff Manager Role */}
                {userRole === ROLE_STAFF_MANAGER && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            {t('navigation.home')}
                        </Text>
                        <GridMenu
                            items={getHomeMenuItems({
                                role: ROLE_STAFF_MANAGER,
                                navigation,
                                onWorkRegisterPress: handlePress,
                            })}
                        />
                    </View>
                )}
            </ScrollView>
        </MasterPageLayout>
    );
};

const styles = StyleSheet.create({
    scrollContent: {
        padding: moderateSize(16),
    },
    section: {
        marginBottom: moderateSize(24),
    },
    sectionTitle: {
        fontSize: moderateSize(18),
        fontWeight: '600',
        color: colors.primary,
    },
});

export default HomeScreen;
