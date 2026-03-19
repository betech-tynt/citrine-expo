import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Alert,
    Image,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import LoginImage from '../../assets/images/backgrounds/locker-login.png';
import Button from '../../components/Button';
import Input from '../../components/Input';
import MasterPageLayout from '../../components/MasterPageLayout';
import { ENV } from '../../config/env';
import colors from '../../constants/colors';
import { login } from '../../services/auth';
import { getUniqueId } from '../../services/deviceInfo';
import { moderateSize } from '../../styles';
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
            const deviceToken = await getUniqueId();
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

    const handleSignUpPress = () => {
        navigation.navigate('SignUp');
    };

    const handleForgotPasswordPress = () => {
        navigation.navigate('ForgotPassword');
    };

    return (
        <MasterPageLayout
            headerType="header"
            headerProps={{
                title: t('auth.signIn'),
                showCrudText: false,
                showHomeIcon: false,
                showBackIcon: false,
            }}>
            <View style={styles.mainContent}>
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
                <TouchableOpacity
                    onPress={handleForgotPasswordPress}
                    style={styles.forgotPasswordButton}
                    activeOpacity={0.7}>
                    <Text style={styles.forgotPasswordText}>
                        {t('citrine.msg000334', {
                            defaultValue: t('citrine.msg000334'),
                        })}
                    </Text>
                </TouchableOpacity>
                <Button
                    title={t('auth.signIn')}
                    onPress={handleLogin}
                    style={styles.signInButton}
                />

                <View style={styles.signUpContainer}>
                    <Text style={styles.signUpText}>{t('auth.noAccount')}</Text>
                    <TouchableOpacity onPress={handleSignUpPress}>
                        <Text style={styles.signUpLink}>
                            {t('auth.signUp')}
                        </Text>
                    </TouchableOpacity>
                </View>

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
        </MasterPageLayout>
    );
};

const styles = StyleSheet.create({
    mainContent: {
        flex: 1,
        padding: moderateSize(16),
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
        marginBottom: moderateSize(12),
    },
    lockIcon: {
        width: moderateSize(140),
        height: moderateSize(140),
        marginVertical: moderateSize(10),
        borderRadius: moderateSize(50),
        alignSelf: 'center',
        marginTop: moderateSize(8),
        marginBottom: moderateSize(28),
    },
    signInButton: {
        marginTop: moderateSize(10),
    },
    forgotPasswordButton: {
        alignSelf: 'flex-end',
        marginTop: moderateSize(2),
        marginBottom: moderateSize(2),
    },
    forgotPasswordText: {
        color: colors.primary,
        fontSize: moderateSize(12),
        fontWeight: '600',
    },
    signUpContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: moderateSize(16),
    },
    signUpText: {
        color: colors.textSecondary,
    },
    signUpLink: {
        color: colors.primary,
        marginLeft: moderateSize(4),
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
