import { View, Text, StyleSheet } from 'react-native';
import React from 'react';
import Header from '../../../components/Header';
import { useTranslation } from 'react-i18next';
import { commonStyles } from '../../../theme/commonStyles';
import { AppInput } from '../../../components/Input';
import Button from '../../../components/Button';
import { moderateSize } from '../../../styles';
import colors from '../../../constants/colors';
import { AppSelect } from '../../../components/AppSelect';

export default function SignUpScreen() {
    const { t } = useTranslation();

    const handleSignUp = () => {
        console.log('Sign up');
    };

    const countries = [
        { label: 'Vietnam', value: 'VN' },
        { label: 'Thailand', value: 'TH' },
        { label: 'Japan', value: 'JP' },
    ];

    return (
        <View style={styles.container}>
            <Header
                title={t('auth.signIn')}
                // onBackPress={handleBackPress}
                showCrudText={false}
            />
            <View style={commonStyles.main}>
                <Text style={styles.signUpPrompt}>
                    {t('auth.signUpAddress')}
                </Text>

                <AppSelect
                    label="Country"
                    placeholder="Choose country"
                    //   value={country}
                    options={countries}
                    // onSelect={opt => setCountry(opt)}
                />

                <AppInput
                    label="Address"
                    placeholder="Enter address"
                    // value={address}
                    // onChangeText={setAddress}
                />

                <Button title={t('auth.signIn')} onPress={handleSignUp} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    signUpPrompt: {
        fontSize: moderateSize(14),
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: moderateSize(20),
        marginTop: moderateSize(10),
    },
});
