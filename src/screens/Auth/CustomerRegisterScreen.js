import React, { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import MasterPageLayout from '../../components/MasterPageLayout';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Checkbox from '../../components/Checkbox';
import SignUpIllustration from '../../components/SignUpIllustration';
import colors from '../../constants/colors';
import { moderateSize } from '../../styles/moderateSize';

const CustomerRegisterScreen = () => {
    const navigation = useNavigation();
    const { t } = useTranslation();

    const [email, setEmail] = useState('');
    const [agreed, setAgreed] = useState(false);

    const canSubmit = useMemo(() => {
        return Boolean(email.trim()) && agreed;
    }, [email, agreed]);

    const handleBackPress = () => {
        if (navigation.canGoBack()) {
            navigation.goBack();
        } else {
            navigation.navigate('Login');
        }
    };

    const handleSubmit = () => {
        Alert.alert(t('common.confirm'), t('auth.signUp'));
    };

    return (
        <MasterPageLayout headerType="header" headerProps={{ title: t('auth.signUp'), showCrudText: false, onBackPress: handleBackPress }}>
            <View style={[styles.mainContent, styles.card]}>
                <Text style={styles.title}>{t('auth.welcomeToUs')}</Text>
                <Text style={styles.subtitle}>{t('auth.signUpPrompt')}</Text>

                <SignUpIllustration />

                <Input
                    placeholder={t('setting.email')}
                    value={email}
                    onChangeText={setEmail}
                    style={styles.emailInput}
                />

                <View style={styles.termsRow}>
                    <Checkbox
                        checked={agreed}
                        onPress={() => setAgreed(v => !v)}
                        size={moderateSize(20)}
                        style={styles.checkbox}
                    />
                    <TouchableOpacity
                        style={styles.termsTouchable}
                        activeOpacity={0.7}
                        onPress={() => setAgreed(v => !v)}>
                        <Text style={styles.termsText}>
                            {t('auth.byCreatingAccountYouAgree')}{' '}
                            <Text style={styles.termsLink}>
                                {t('auth.termsAndConditions')}
                            </Text>
                        </Text>
                    </TouchableOpacity>
                </View>

                <Button
                    title={t('auth.signUp')}
                    onPress={handleSubmit}
                    disabled={!canSubmit}
                    style={styles.signUpButton}
                />

                <View style={styles.bottomRow}>
                    <Text style={styles.bottomText}>
                        {t('auth.haveAccount')}{' '}
                    </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                        <Text style={styles.bottomLink}>{t('auth.signIn')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </MasterPageLayout>
    );
};

const styles = StyleSheet.create({
    mainContent: {
        flex: 1,
        padding: moderateSize(16),
    },
    container: {
        flex: 1,
        backgroundColor: colors.primary,
    },
    card: {
        flex: 1,
    },
    title: {
        fontSize: moderateSize(26),
        fontWeight: '800',
        color: colors.primary,
        marginBottom: moderateSize(4),
    },
    subtitle: {
        fontSize: moderateSize(12),
        fontWeight: '500',
        color: colors.textPrimary,
        marginBottom: moderateSize(8),
    },
    emailInput: {
        marginBottom: moderateSize(14),
    },
    termsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: moderateSize(22),
    },
    checkbox: {
        marginRight: moderateSize(10),
    },
    termsText: {
        flex: 1,
        fontSize: moderateSize(12),
        color: colors.textPrimary,
    },
    termsTouchable: {
        flex: 1,
    },
    termsLink: {
        fontWeight: '700',
        color: colors.primary,
    },
    signUpButton: {
        marginTop: moderateSize(6),
    },
    bottomRow: {
        marginTop: 'auto',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: moderateSize(18),
        paddingBottom: moderateSize(6),
    },
    bottomText: {
        fontSize: moderateSize(12),
        color: colors.textPrimary,
    },
    bottomLink: {
        fontSize: moderateSize(12),
        fontWeight: '700',
        color: colors.primary,
    },
});

export default CustomerRegisterScreen;
