import React, { useMemo, useState, useEffect } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTranslation } from 'react-i18next';
import { useRoute, useNavigation } from '@react-navigation/native';
import Header from '../../components/Header';
import Button from '../../components/Button';
import FormInput from '../../components/FormInput';
import RadioButton from '../../components/RadioButton';
import { AppSelect } from '../../components/AppSelect';
import colors from '../../constants/colors';
import { commonStyles } from '../../theme/commonStyles';
import { moderateSize } from '../../styles/moderateSize';
import { updateProfile } from '../../services/auth';
import { log } from '../../utils/handleLog';
import { formatDate } from '../../utils/formatDate';

// Country list
const COUNTRIES = [
    { label: 'Japan', value: 'Japan' },
    { label: 'Vietnam', value: 'Vietnam' },
    { label: 'United States', value: 'United States' },
    { label: 'United Kingdom', value: 'United Kingdom' },
    { label: 'China', value: 'China' },
    { label: 'Korea', value: 'Korea' },
    { label: 'Thailand', value: 'Thailand' },
    { label: 'Singapore', value: 'Singapore' },
    { label: 'Malaysia', value: 'Malaysia' },
    { label: 'Philippines', value: 'Philippines' },
    { label: 'Indonesia', value: 'Indonesia' },
    { label: 'Taiwan', value: 'Taiwan' },
    { label: 'Hong Kong', value: 'Hong Kong' },
    { label: 'Australia', value: 'Australia' },
    { label: 'Canada', value: 'Canada' },
    { label: 'Germany', value: 'Germany' },
    { label: 'France', value: 'France' },
    { label: 'Italy', value: 'Italy' },
    { label: 'Spain', value: 'Spain' },
    { label: 'Other', value: 'Other' },
];

const EditProfileScreen = () => {
    const { t } = useTranslation();
    const route = useRoute();
    const navigation = useNavigation();
    const { userData } = route.params || {};

    // Loading state
    const [loading, setLoading] = useState(false);

    // Name fields (Kanji and Katakana)
    const [lastNameKanji, setLastNameKanji] = useState('');
    const [firstNameKanji, setFirstNameKanji] = useState('');
    const [lastNameKatakana, setLastNameKatakana] = useState('');
    const [firstNameKatakana, setFirstNameKatakana] = useState('');

    // Contact fields
    const [phoneNumber, setPhoneNumber] = useState('');
    const [gender, setGender] = useState('male'); // male | female
    const [birthdayDate, setBirthdayDate] = useState(null); // Date object for DatePicker

    // Address fields
    const [country, setCountry] = useState(null);
    const [postalCode, setPostalCode] = useState('');
    const [prefecture, setPrefecture] = useState('');
    const [municipality, setMunicipality] = useState('');
    const [town, setTown] = useState('');
    const [address, setAddress] = useState('');
    const [addressError, setAddressError] = useState('');

    // DatePicker modal state
    const [datePickerVisible, setDatePickerVisible] = useState(false);

    // Initialize form fields with userData from route params
    useEffect(() => {
        if (userData) {
            log('Initializing EditProfileScreen with userData:', userData);

            // Set name fields - prefer separate first/last name, fallback to splitting full name
            const firstName =
                userData.firstName ||
                userData.name?.split(' ').slice(1).join(' ') ||
                '';
            const lastName =
                userData.lastName || userData.name?.split(' ')[0] || '';
            const kanaFirstName = userData.kanaFirstName || '';
            const kanaLastName = userData.kanaLastName || '';

            setFirstNameKanji(firstName);
            setLastNameKanji(lastName);
            setFirstNameKatakana(kanaFirstName || firstName);
            setLastNameKatakana(kanaLastName || lastName);

            // Set phone number
            if (userData.phone) {
                setPhoneNumber(userData.phone);
            }

            // Set gender (API returns: 1=male, 2=female)
            if (userData.gender) {
                const genderValue = userData.gender;
                if (genderValue === 1) {
                    setGender('male');
                } else if (genderValue === 2) {
                    setGender('female');
                }
            }

            // Set country (if available)
            if (userData.country) {
                const countryOption = COUNTRIES.find(
                    c =>
                        c.value === userData.country ||
                        c.label === userData.country,
                );
                if (countryOption) {
                    setCountry(countryOption);
                } else {
                    setCountry({
                        label: userData.country,
                        value: userData.country,
                    });
                }
            }

            // Set address - prefer fullAddress, fallback to address
            const fullAddr = userData.fullAddress || userData.address || '';
            setAddress(fullAddr);

            // Set Japan-specific fields
            if (userData.postalCode) {
                setPostalCode(userData.postalCode);
            }
            if (userData.ward) {
                setTown(userData.ward);
            }

            // Parse birthday (format: YYYY-MM-DD or DD/MM/YYYY) and convert to Date object
            if (userData.dob) {
                let parsedDate = null;
                // Check if already ISO format (YYYY-MM-DD)
                if (
                    userData.dob.includes('-') &&
                    userData.dob.split('-')[0].length === 4
                ) {
                    const [yyyy, mm, dd] = userData.dob.split('-');
                    parsedDate = new Date(
                        parseInt(yyyy),
                        parseInt(mm) - 1,
                        parseInt(dd),
                    );
                } else {
                    // Convert from DD/MM/YYYY to Date object
                    const dobParts = userData.dob.split('/');
                    if (dobParts.length === 3) {
                        parsedDate = new Date(
                            parseInt(dobParts[2]),
                            parseInt(dobParts[1]) - 1,
                            parseInt(dobParts[0]),
                        );
                    }
                }
                if (parsedDate && !isNaN(parsedDate.getTime())) {
                    setBirthdayDate(parsedDate);
                }
            }

            log('User Data in EditProfileScreen:', userData);
        }
    }, [userData]);

    // Convert Date object to ISO string for API
    const dateToISOString = date => {
        if (!date) return '';
        const yyyy = date.getFullYear();
        const mm = `${date.getMonth() + 1}`.padStart(2, '0');
        const dd = `${date.getDate()}`.padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };

    const birthdayDisplay = useMemo(() => {
        return birthdayDate ? formatDate(birthdayDate) : '';
    }, [birthdayDate]);

    // Check if selected country is Japan
    const isJapan = useMemo(() => {
        if (!country) return false;
        const countryValue =
            typeof country === 'object' ? country.value : country;
        return countryValue === 'Japan';
    }, [country]);

    const canSubmit = useMemo(() => {
        // Basic validation - at least phone number is required
        // Additional validation can be added as needed
        // Check address max length validation
        const isAddressValid = address.length <= 255;
        return Boolean(phoneNumber.trim()) && !loading && isAddressValid;
    }, [phoneNumber, loading, address]);

    // Handle address change with validation
    const handleAddressChange = text => {
        setAddress(text);
        if (text.length > 255) {
            setAddressError(t('profile.validation.addressMaxLength'));
        } else {
            setAddressError('');
        }
    };

    const handleSubmit = async () => {
        // Show confirmation alert
        Alert.alert(t('common.confirm'), t('profile.confirmSave'), [
            {
                text: t('common.cancel'),
                style: 'cancel',
            },
            {
                text: t('common.ok'),
                onPress: async () => {
                    try {
                        setLoading(true);

                        // Convert gender: male=1, female=2
                        const genderValue = gender === 'male' ? 1 : 2;

                        // Build profile data object
                        const profileData = {
                            first_name: firstNameKanji,
                            last_name: lastNameKanji,
                            kana_first_name: firstNameKatakana,
                            kana_last_name: lastNameKatakana,
                            phone_number: phoneNumber,
                            gender: genderValue,
                            birthday: birthdayDate
                                ? dateToISOString(birthdayDate)
                                : undefined,
                            address: address,
                        };

                        // Add Japan-specific fields if country is Japan
                        if (isJapan) {
                            profileData.postal_code = postalCode;
                            profileData.ward = town; // town maps to ward
                            // For Japanese address, combine prefecture + municipality + town
                            const fullAddress = [
                                prefecture,
                                municipality,
                                town,
                                address,
                            ]
                                .filter(Boolean)
                                .join(', ');
                            if (fullAddress) {
                                profileData.address = fullAddress;
                            }
                        }

                        // Call API to update profile
                        const result = await updateProfile(profileData);

                        if (result.status === 1) {
                            Alert.alert(
                                t('common.success'),
                                result.message || t('profile.updateSuccess'),
                                [
                                    {
                                        text: t('common.ok'),
                                        onPress: () => {
                                            // Navigate back to Profile screen
                                            navigation.goBack();
                                        },
                                    },
                                ],
                            );
                        } else {
                            Alert.alert(
                                t('common.error'),
                                result.message || t('profile.updateFailed'),
                            );
                        }
                    } catch (error) {
                        console.error('Update Profile Error:', error);
                        Alert.alert(
                            t('common.error'),
                            error.message || t('profile.updateFailed'),
                        );
                    } finally {
                        setLoading(false);
                    }
                },
            },
        ]);
    };

    const openDatePicker = () => {
        // If no birthday is set, default to today's date
        const initialDate = birthdayDate || new Date();
        setBirthdayDate(initialDate);
        setDatePickerVisible(true);
    };

    const closeDatePicker = () => {
        setDatePickerVisible(false);
    };

    const handleDateChange = (event, selectedDate) => {
        if (Platform.OS === 'android') {
            setDatePickerVisible(false);
        }
        if (selectedDate) {
            setBirthdayDate(selectedDate);
        }
    };

    const confirmDatePicker = () => {
        closeDatePicker();
    };

    const handleCountrySelect = option => {
        setCountry(option);
        // Clear Japan-specific fields when country changes
        if (option.value !== 'Japan') {
            setPostalCode('');
            setPrefecture('');
            setMunicipality('');
            setTown('');
        }
    };

    return (
        <View style={styles.container}>
            <Header title={t('profile.editProfile')} showCrudText={false} />

            <KeyboardAvoidingView
                style={[commonStyles.main, styles.card]}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}>
                    {/* Kanji Name - Two columns */}
                    <View style={styles.row}>
                        <FormInput
                            width="48%"
                            label={t('profile.labels.lastNameKanji')}
                            placeholder={t(
                                'profile.placeholders.enterLastName',
                            )}
                            value={lastNameKanji}
                            onChangeText={setLastNameKanji}
                        />
                        <FormInput
                            width="48%"
                            label={t('profile.labels.firstNameKanji')}
                            placeholder={t(
                                'profile.placeholders.enterFirstName',
                            )}
                            value={firstNameKanji}
                            onChangeText={setFirstNameKanji}
                        />
                    </View>

                    {/* Katakana Name - Two columns */}
                    <View style={styles.row}>
                        <FormInput
                            width="48%"
                            label={t('profile.labels.lastNameKatakana')}
                            placeholder={t(
                                'profile.placeholders.enterLastName',
                            )}
                            value={lastNameKatakana}
                            onChangeText={setLastNameKatakana}
                        />
                        <FormInput
                            width="48%"
                            label={t('profile.labels.firstNameKatakana')}
                            placeholder={t(
                                'profile.placeholders.enterFirstName',
                            )}
                            value={firstNameKatakana}
                            onChangeText={setFirstNameKatakana}
                        />
                    </View>

                    {/* Phone Number */}
                    <FormInput
                        width="100%"
                        label={t('profile.labels.phoneNumber')}
                        placeholder={t('profile.placeholders.enterPhoneNumber')}
                        keyboardType="phone-pad"
                        value={phoneNumber}
                        onChangeText={setPhoneNumber}
                    />

                    {/* Gender */}
                    <Text style={styles.sectionLabel}>
                        {t('profile.labels.gender')}
                    </Text>
                    <View style={styles.genderRow}>
                        <TouchableOpacity
                            activeOpacity={0.8}
                            style={styles.genderOption}
                            onPress={() => setGender('male')}>
                            <RadioButton
                                checked={gender === 'male'}
                                onPress={() => setGender('male')}
                            />
                            <Text style={styles.genderText}>
                                {t('profile.gender.male')}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            activeOpacity={0.8}
                            style={styles.genderOption}
                            onPress={() => setGender('female')}>
                            <RadioButton
                                checked={gender === 'female'}
                                onPress={() => setGender('female')}
                            />
                            <Text style={styles.genderText}>
                                {t('profile.gender.female')}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Birthday */}
                    <FormInput
                        width="100%"
                        label={t('profile.labels.birthday')}
                        placeholder={t('profile.placeholders.birthday')}
                        value={birthdayDisplay}
                        editable={false}
                        textColor={colors.textPrimary}
                        endIcon="calendar-alt"
                        iconColor={colors.textSecondary}
                        onPress={openDatePicker}
                        onEndIconPress={openDatePicker}
                    />

                    {/* Country */}
                    <AppSelect
                        label={t('profile.labels.country')}
                        placeholder={t('profile.placeholders.chooseCountry')}
                        value={country}
                        options={COUNTRIES}
                        onSelect={handleCountrySelect}
                        inputContainerStyle={styles.countryInput}
                    />

                    {/* Japan-specific fields - Conditional rendering */}
                    {isJapan && (
                        <>
                            <FormInput
                                width="100%"
                                label={t('profile.labels.postalCode')}
                                placeholder={t(
                                    'profile.placeholders.enterPostalCode',
                                )}
                                value={postalCode}
                                onChangeText={setPostalCode}
                                keyboardType="default"
                            />

                            <FormInput
                                width="100%"
                                label={t('profile.labels.prefecture')}
                                placeholder={t(
                                    'profile.placeholders.enterPrefecture',
                                )}
                                value={prefecture}
                                onChangeText={setPrefecture}
                            />

                            <FormInput
                                width="100%"
                                label={t('profile.labels.municipality')}
                                placeholder={t(
                                    'profile.placeholders.enterMunicipality',
                                )}
                                value={municipality}
                                onChangeText={setMunicipality}
                            />

                            <FormInput
                                width="100%"
                                label={t('profile.labels.town')}
                                placeholder={t(
                                    'profile.placeholders.enterTownName',
                                )}
                                value={town}
                                onChangeText={setTown}
                            />
                        </>
                    )}

                    {/* Address - Always visible */}
                    <FormInput
                        width="100%"
                        label={t('profile.labels.address')}
                        placeholder={t('profile.placeholders.enterAddress')}
                        value={address}
                        onChangeText={handleAddressChange}
                        errorMessage={addressError}
                        multiline
                    />

                    {/* Save Button */}
                    <Button
                        title={t('profile.save')}
                        onPress={handleSubmit}
                        disabled={!canSubmit}
                        loading={loading}
                        style={styles.saveButton}
                    />

                    <View style={styles.bottomSpacer} />
                </ScrollView>
            </KeyboardAvoidingView>

            {/* DatePicker Modal */}
            {Platform.OS === 'ios' ? (
                <Modal
                    visible={datePickerVisible}
                    transparent
                    animationType="fade"
                    onRequestClose={closeDatePicker}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalCard}>
                            <Text style={styles.modalTitle}>
                                {t('profile.labels.birthday')}
                            </Text>

                            <DateTimePicker
                                value={birthdayDate || new Date()}
                                mode="date"
                                display="spinner"
                                onChange={handleDateChange}
                                style={styles.datePicker}
                            />

                            <View style={styles.modalActions}>
                                <Button
                                    title={t('common.cancel')}
                                    onPress={closeDatePicker}
                                    style={[
                                        styles.modalButton,
                                        styles.modalButtonSecondary,
                                    ]}
                                    textStyle={styles.modalButtonSecondaryText}
                                />
                                <Button
                                    title={t('common.ok')}
                                    onPress={confirmDatePicker}
                                    style={styles.modalButton}
                                />
                            </View>
                        </View>
                    </View>
                </Modal>
            ) : (
                datePickerVisible && (
                    <DateTimePicker
                        value={birthdayDate || new Date()}
                        mode="date"
                        display="default"
                        onChange={handleDateChange}
                    />
                )
            )}
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
    countryInput: {
        minHeight: moderateSize(50),
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

export default EditProfileScreen;
