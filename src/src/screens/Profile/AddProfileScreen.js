import React, { useMemo, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Modal,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Calendar } from 'react-native-calendars';
import Header from '../../components/Header';
import Button from '../../components/Button';
import FormInput from '../../components/FormInput';
import RadioButton from '../../components/RadioButton';
import colors from '../../constants/colors';
import { commonStyles } from '../../theme/commonStyles';
import { moderateSize } from '../../styles/moderateSize';

const AddProfileScreen = () => {
    const { t } = useTranslation();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [lastNameKanji, setLastNameKanji] = useState('');
    const [firstNameKanji, setFirstNameKanji] = useState('');
    const [lastNameKatakana, setLastNameKatakana] = useState('');
    const [firstNameKatakana, setFirstNameKatakana] = useState('');

    const [phoneNumber, setPhoneNumber] = useState('');
    const [gender, setGender] = useState('male'); // male | female
    const [birthdayISO, setBirthdayISO] = useState(''); // YYYY-MM-DD
    const [calendarVisible, setCalendarVisible] = useState(false);
    const [calendarTempISO, setCalendarTempISO] = useState('');

    const formatISOToDDMMYYYY = (iso) => {
        if (!iso) return '';
        const [yyyy, mm, dd] = iso.split('-');
        if (!yyyy || !mm || !dd) return '';
        return `${dd}/${mm}/${yyyy}`;
    };

    const birthdayDisplay = useMemo(() => {
        return birthdayISO ? formatISOToDDMMYYYY(birthdayISO) : '';
    }, [birthdayISO]);

    const canSubmit = useMemo(() => {
        return (
            Boolean(username.trim()) &&
            Boolean(password) &&
            password === confirmPassword &&
            Boolean(phoneNumber.trim())
        );
    }, [username, password, confirmPassword, phoneNumber]);

    const handleSubmit = () => {
        Alert.alert(t('common.confirm'), t('profile.save'));
    };

    const openCalendar = () => {
        const today = new Date();
        const yyyy = `${today.getFullYear()}`;
        const mm = `${today.getMonth() + 1}`.padStart(2, '0');
        const dd = `${today.getDate()}`.padStart(2, '0');
        const fallbackISO = `${yyyy}-${mm}-${dd}`;

        const initial = birthdayISO || fallbackISO;
        setCalendarTempISO(initial);
        setCalendarVisible(true);
    };

    const closeCalendar = () => {
        setCalendarVisible(false);
    };

    const confirmCalendar = () => {
        setBirthdayISO(calendarTempISO);
        closeCalendar();
    };

    return (
        <View style={styles.container}>
            <Header title={t('auth.signUp')} showCrudText={false} />

            <KeyboardAvoidingView
                style={[commonStyles.main, styles.card]}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}>
                    <FormInput
                        width="100%"
                        label={t('auth.username')}
                        placeholder={t('profile.placeholders.enterUsername')}
                        value={username}
                        onChangeText={setUsername}
                    />

                    <FormInput
                        width="100%"
                        label={t('auth.password')}
                        placeholder={t('profile.placeholders.enterPassword')}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />

                    <FormInput
                        width="100%"
                        label={t('profile.labels.confirmPassword')}
                        placeholder={t('profile.placeholders.enterConfirmPassword')}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                    />

                    <View style={styles.row}>
                        <FormInput
                            width="48%"
                            label={t('profile.labels.lastNameKanji')}
                            placeholder={t('profile.placeholders.enterLastName')}
                            value={lastNameKanji}
                            onChangeText={setLastNameKanji}
                        />
                        <FormInput
                            width="48%"
                            label={t('profile.labels.firstNameKanji')}
                            placeholder={t('profile.placeholders.enterFirstName')}
                            value={firstNameKanji}
                            onChangeText={setFirstNameKanji}
                        />
                    </View>

                    <View style={styles.row}>
                        <FormInput
                            width="48%"
                            label={t('profile.labels.lastNameKatakana')}
                            placeholder={t('profile.placeholders.enterLastName')}
                            value={lastNameKatakana}
                            onChangeText={setLastNameKatakana}
                        />
                        <FormInput
                            width="48%"
                            label={t('profile.labels.firstNameKatakana')}
                            placeholder={t('profile.placeholders.enterFirstName')}
                            value={firstNameKatakana}
                            onChangeText={setFirstNameKatakana}
                        />
                    </View>

                    <FormInput
                        width="100%"
                        label={t('profile.labels.phoneNumber')}
                        placeholder={t('profile.placeholders.enterPhoneNumber')}
                        keyboardType="phone-pad"
                        value={phoneNumber}
                        onChangeText={setPhoneNumber}
                    />

                    <Text style={styles.sectionLabel}>{t('profile.labels.gender')}</Text>
                    <View style={styles.genderRow}>
                        <TouchableOpacity
                            activeOpacity={0.8}
                            style={styles.genderOption}
                            onPress={() => setGender('male')}>
                            <RadioButton checked={gender === 'male'} onPress={() => setGender('male')} />
                            <Text style={styles.genderText}>{t('profile.gender.male')}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            activeOpacity={0.8}
                            style={styles.genderOption}
                            onPress={() => setGender('female')}>
                            <RadioButton checked={gender === 'female'} onPress={() => setGender('female')} />
                            <Text style={styles.genderText}>{t('profile.gender.female')}</Text>
                        </TouchableOpacity>
                    </View>

                    <FormInput
                        width="100%"
                        label={t('profile.labels.birthday')}
                        placeholder={t('profile.placeholders.birthday')}
                        value={birthdayDisplay}
                        editable={false}
                        endIcon="calendar-alt"
                        iconColor={colors.textSecondary}
                        onPress={openCalendar}
                        onEndIconPress={openCalendar}
                    />

                    <Button
                        title={t('profile.save')}
                        onPress={handleSubmit}
                        disabled={!canSubmit}
                        style={styles.saveButton}
                    />

                    <View style={styles.bottomSpacer} />
                </ScrollView>
            </KeyboardAvoidingView>

            <Modal
                visible={calendarVisible}
                transparent
                animationType="fade"
                onRequestClose={closeCalendar}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>{t('profile.labels.birthday')}</Text>

                        <Calendar
                            onDayPress={(day) => setCalendarTempISO(day.dateString)}
                            markedDates={{
                                [calendarTempISO]: {
                                    selected: true,
                                    selectedColor: colors.primary,
                                },
                            }}
                            theme={{
                                selectedDayBackgroundColor: colors.primary,
                                todayTextColor: colors.primary,
                                arrowColor: colors.primary,
                            }}
                        />

                        <View style={styles.modalActions}>
                            <Button
                                title={t('common.cancel')}
                                onPress={closeCalendar}
                                style={[styles.modalButton, styles.modalButtonSecondary]}
                                textStyle={styles.modalButtonSecondaryText}
                            />
                            <Button
                                title={t('common.ok')}
                                onPress={confirmCalendar}
                                style={styles.modalButton}
                                disabled={!calendarTempISO}
                            />
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.primary,
    },
    card: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: moderateSize(24),
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    sectionLabel: {
        fontSize: moderateSize(12),
        fontWeight: '600',
        color: colors.textSecondary,
        marginBottom: moderateSize(10),
    },
    genderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: moderateSize(12),
    },
    genderOption: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: moderateSize(24),
    },
    genderText: {
        fontSize: moderateSize(13),
        color: colors.textPrimary,
    },
    saveButton: {
        marginTop: moderateSize(6),
        borderRadius: moderateSize(999),
    },
    bottomSpacer: {
        height: moderateSize(10),
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center',
        padding: moderateSize(16),
    },
    modalCard: {
        backgroundColor: colors.white,
        borderRadius: moderateSize(16),
        padding: moderateSize(14),
    },
    modalTitle: {
        fontSize: moderateSize(14),
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: moderateSize(10),
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: moderateSize(12),
    },
    modalButton: {
        width: '48%',
        padding: moderateSize(12),
        borderRadius: moderateSize(14),
    },
    modalButtonSecondary: {
        backgroundColor: colors.surfaceSoft,
    },
    modalButtonSecondaryText: {
        color: colors.primary,
        fontWeight: '700',
    },
});

export default AddProfileScreen;
