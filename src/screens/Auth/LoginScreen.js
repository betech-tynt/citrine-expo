import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Image, Modal, StyleSheet, Text, View } from 'react-native';
import LoginImage from '../../assets/images/backgrounds/locker-login.png';
import Button from '../../components/Button';
import Header from '../../components/Header';
import Input from '../../components/Input';
import { ENV } from '../../config/env';
import { login } from '../../services/auth';
import { moderateSize } from '../../styles';
import { commonStyles } from '../../theme/commonStyles';
import { getDisplayVersion } from '../../utils/versionUtils';

const LAST_USERNAME_KEY = 'lastUsername';
const LAST_PASSWORD_KEY = 'lastPassword';

const LoginScreen = () => {
    const { t } = useTranslation();
    const navigation = useNavigation();
    const displayVersion = getDisplayVersion();
    const [isPasswordVisible, setPasswordVisible] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isDemoModalVisible, setDemoModalVisible] = useState(false);

    const isStagingEnv = ENV.ENV_NAME === 'staging';

    const performLogin = async (loginUsername, loginPassword) => {
        try {
            // Expo Go does not support react-native-device-info; use a simple fallback id
            const deviceToken = 'expo-go-device';
            await login(loginUsername, loginPassword, deviceToken);
            await AsyncStorage.setItem('isLogin', 'true');
            await AsyncStorage.setItem(LAST_USERNAME_KEY, loginUsername);
            await AsyncStorage.setItem(LAST_PASSWORD_KEY, loginPassword);
            navigation.replace('Main');
        } catch {
            Alert.alert(t('auth.loginFailed'), t('auth.enterBothFields'));
        }
    };

    const handleLogin = async () => {
        await performLogin(username, password);
    };

    const handleDemoLogin = (demoUsername, demoPassword) => {
        setDemoModalVisible(false);
        setUsername(demoUsername);
        setPassword(demoPassword);
    };

    useEffect(() => {
        const loadLastCredentials = async () => {
            try {
                const [savedUsername, savedPassword] = await Promise.all([
                    AsyncStorage.getItem(LAST_USERNAME_KEY),
                    AsyncStorage.getItem(LAST_PASSWORD_KEY),
                ]);

                if (savedUsername) {
                    setUsername(savedUsername);
                }
                if (savedPassword) {
                    setPassword(savedPassword);
                }
            } catch {
                // ignore load errors
            }
        };

        loadLastCredentials();
    }, []);

    const handleEndIconPress = () => {
        setPasswordVisible(prev => !prev);
    };
    // const handleBackPress = () => {
    //     navigation.navigate('Main');
    // };

    return (
        <View style={styles.container}>
            <Header
                title={t('auth.signIn')}
                // onBackPress={handleBackPress}
                showCrudText={false}
                showHomeIcon={false}
            />
            <View style={commonStyles.main}>
                <Text style={styles.welcomeBack}>{t('auth.welcomeBack')}</Text>
                <Text style={styles.signInPrompt}>
                    {t('auth.signInPrompt')}
                </Text>

                <Image source={LoginImage} style={styles.lockIcon} />
                <Input
                    placeholder={t('auth.username')}
                    value={username}
                    onChangeText={text => setUsername(text)}
                />
                <Input
                    placeholder={t('auth.password')}
                    secureTextEntry={!isPasswordVisible}
                    endIcon={isPasswordVisible ? 'eye-slash' : 'eye'}
                    onEndIconPress={handleEndIconPress}
                    iconSize={20}
                    iconColor="black"
                    value={password}
                    onChangeText={text => setPassword(text)}
                />
                <Button
                    title={t('auth.signIn')}
                    onPress={handleLogin}
                    style={styles.signInButton}
                />
                {isStagingEnv && (
                    <>
                        <Button
                            title="Demo Account"
                            onPress={() => setDemoModalVisible(true)}
                            style={styles.signInButton}
                        />
                        <Modal
                            visible={isDemoModalVisible}
                            transparent
                            animationType="slide"
                            onRequestClose={() => setDemoModalVisible(false)}>
                            <View style={styles.modalOverlay}>
                                <View style={styles.modalContent}>
                                    <Text style={styles.modalTitle}>
                                        {t('auth.selectDemoAccount')}
                                    </Text>
                                    <Button
                                        title="Customer 1"
                                        onPress={() =>
                                            handleDemoLogin(
                                                'customer_1',
                                                'Citrine@123',
                                            )
                                        }
                                        style={styles.modalButton}
                                    />
                                    <Button
                                        title="Customer 2"
                                        onPress={() =>
                                            handleDemoLogin(
                                                'customer_2',
                                                'Citrine@123',
                                            )
                                        }
                                        style={styles.modalButton}
                                    />
                                    <Button
                                        title="Manager"
                                        onPress={() =>
                                            handleDemoLogin(
                                                'staff_1',
                                                'Citrine@123',
                                            )
                                        }
                                        style={styles.modalButton}
                                    />
                                    <Button
                                        title="Staff 2"
                                        onPress={() =>
                                            handleDemoLogin(
                                                'staff_2',
                                                'Citrine@123',
                                            )
                                        }
                                        style={styles.modalButton}
                                    />
                                    <Button
                                        title="Staff 3"
                                        onPress={() =>
                                            handleDemoLogin(
                                                'staff_3',
                                                'Citrine@123',
                                            )
                                        }
                                        style={styles.modalButton}
                                    />
                                    <Button
                                        title={t('common.cancel') || 'Cancel'}
                                        onPress={() =>
                                            setDemoModalVisible(false)
                                        }
                                        style={styles.modalCancelButton}
                                    />
                                </View>
                            </View>
                        </Modal>
                    </>
                )}
                <Text style={styles.versionText}>{displayVersion}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    welcomeBack: {
        fontSize: moderateSize(24),
        fontWeight: 'bold',
        color: '#3629B7',
        marginBottom: moderateSize(2),
    },
    signInPrompt: {
        fontSize: moderateSize(12),
        fontWeight: '500',
        color: '#343434',
        marginBottom: moderateSize(20),
    },
    lockIcon: {
        width: moderateSize(140),
        height: moderateSize(140),
        marginVertical: moderateSize(20),
        borderRadius: moderateSize(50),
        alignSelf: 'center',
        marginTop: moderateSize(20),
        marginBottom: moderateSize(60),
    },
    signInButton: {
        marginTop: moderateSize(20),
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '80%',
        backgroundColor: '#FFFFFF',
        borderRadius: moderateSize(12),
        padding: moderateSize(20),
    },
    modalTitle: {
        fontSize: moderateSize(16),
        fontWeight: '600',
        marginBottom: moderateSize(16),
        textAlign: 'center',
    },
    modalButton: {
        marginTop: moderateSize(10),
    },
    modalCancelButton: {
        marginTop: moderateSize(20),
    },
    versionText: {
        position: 'absolute',
        bottom: moderateSize(16),
        left: moderateSize(0),
        right: moderateSize(0),
        textAlign: 'center',
        color: '#000000',
        fontSize: moderateSize(15),
        fontWeight: '600',
    },
});

export default LoginScreen;
