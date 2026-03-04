import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import Header from '../../../components/Header';
import Button from '../../../components/Button';
import OtpInput from '../../../components/OtpInput';
import colors from '../../../constants/colors';
import { commonStyles } from '../../../theme/commonStyles';
import { moderateSize } from '../../../styles';

const COUNTDOWN_SECONDS = 10 * 60; // 10 minutes

const formatMMSS = (totalSeconds) => {
    const s = Math.max(0, Number(totalSeconds) || 0);
    const mm = String(Math.floor(s / 60)).padStart(2, '0');
    const ss = String(s % 60).padStart(2, '0');
    return `${mm}:${ss}`;
};

const OtpVerifyScreen = ({ email = 'betech@gmail.com' }) => {
    const { t } = useTranslation();
    const [otp, setOtp] = useState('');
    const [endAt, setEndAt] = useState(() => Date.now() + COUNTDOWN_SECONDS * 1000);
    const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);

    const timeLeftText = useMemo(() => formatMMSS(secondsLeft), [secondsLeft]);

    useEffect(() => {
        const tick = () => {
            const left = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
            setSecondsLeft(left);
        };

        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [endAt]);

    const handleResend = () => {
        setEndAt(Date.now() + COUNTDOWN_SECONDS * 1000);
    };

    return (
        <View style={styles.container}>
            <Header
                title={t('otp.verifyTitle')}
                showCrudText={false}
            />

            <View style={commonStyles.main}>
                <Text style={styles.title}>
                    {t('otp.verifyYourEmail')}
                </Text>
                <Text style={styles.subtitle}>
                    {t('otp.sentToEmail', { email })}
                </Text>

                <OtpInput
                    value={otp}
                    length={6}
                    onChangeText={setOtp}
                    containerStyle={styles.otpRow}
                />

                <Text style={styles.hintText}>
                    {t('otp.enterCodeHint')}
                </Text>

                <Button
                    title={t('otp.verify')}
                    style={styles.verifyButton}
                    onPress={() => {}}
                    disabled={otp.trim().length < 6}
                />

                <View style={styles.resendRow}>
                    <Text style={styles.resendText}>
                        {t('otp.codeResent')}{' '}
                    </Text>
                    {secondsLeft > 0 ? (
                        <Text style={styles.resendText}>
                            {t('otp.resendIn', { time: timeLeftText })}
                        </Text>
                    ) : (
                        <TouchableOpacity
                            onPress={handleResend}
                            activeOpacity={0.7}>
                            <Text style={styles.resendLink}>
                                {t('otp.resend')}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );
};

OtpVerifyScreen.propTypes = {
    email: PropTypes.string,
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.primary,
    },
    title: {
        fontSize: moderateSize(24),
        fontWeight: '800',
        color: colors.primary,
        marginBottom: moderateSize(6),
    },
    subtitle: {
        fontSize: moderateSize(12),
        fontWeight: '500',
        color: colors.textPrimary,
        marginBottom: moderateSize(18),
    },
    otpRow: {
        alignSelf: 'center',
        width: moderateSize(310),
        marginTop: moderateSize(10),
        marginBottom: moderateSize(12),
    },
    hintText: {
        textAlign: 'center',
        fontSize: moderateSize(12),
        color: colors.textSecondary,
        marginTop: moderateSize(8),
    },
    verifyButton: {
        marginTop: moderateSize(26),
        borderRadius: moderateSize(15),
        paddingVertical: moderateSize(14),
    },
    resendRow: {
        marginTop: moderateSize(14),
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    resendText: {
        fontSize: moderateSize(12),
        color: colors.textPrimary,
    },
    resendLink: {
        fontSize: moderateSize(12),
        fontWeight: '700',
        color: colors.primary,
    },
    bottomRow: {
        marginTop: 'auto',
        paddingTop: moderateSize(24),
        paddingBottom: moderateSize(10),
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
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

export default OtpVerifyScreen;
