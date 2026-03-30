/**
 * Template: Form Screen (Input + Submit)
 * Header: Header (back button + title)
 * Content: KeyboardAwareWrapper + ScrollView
 */
import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    ScrollView,
    Text,
    Platform,
    Alert,
} from 'react-native';
import KeyboardAwareWrapper from '../../components/KeyboardAwareWrapper';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import ChildrenLayout from '../../components/ChildrenLayout';
import Input from '../../components/Input';
import Button from '../../components/Button';
import colors from '../../constants/colors';
import { moderateSize } from '../../styles';

export default function BlankFormScreen() {
    const { t } = useTranslation();
    const navigation = useNavigation();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [note, setNote] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    // Validation
    const validate = () => {
        const newErrors = {};
        if (!name.trim()) {
            newErrors.name = t('common.required', { defaultValue: 'Required' });
        }
        if (!email.trim()) {
            newErrors.email = t('common.required', {
                defaultValue: 'Required',
            });
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            newErrors.email = t('common.invalidEmail', {
                defaultValue: 'Invalid email',
            });
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Submit
    const handleSubmit = async () => {
        if (!validate()) {
            return;
        }

        try {
            setIsSubmitting(true);

            // TODO: Replace with actual API call
            // await submitFormApi({ name, email, note });
            await new Promise(resolve => setTimeout(resolve, 1000));

            Alert.alert(
                t('common.success', { defaultValue: 'Success' }),
                t('common.saveSuccess', { defaultValue: 'Saved successfully' }),
                [{ text: 'OK', onPress: () => navigation.goBack() }],
            );
        } catch (err) {
            Alert.alert(
                t('common.error'),
                err.message ||
                    t('common.saveFailed', { defaultValue: 'Save failed' }),
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <ChildrenLayout
            headerType="header"
            headerProps={{
                title: 'Form Title',
            }}>
            <KeyboardAwareWrapper
                style={styles.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <ScrollView
                    style={styles.flex}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled">
                    {/* Form Fields */}
                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>
                            {t('common.name', { defaultValue: 'Name' })} *
                        </Text>
                        <Input
                            value={name}
                            onChangeText={text => {
                                setName(text);
                                if (errors.name) {
                                    setErrors(prev => ({ ...prev, name: '' }));
                                }
                            }}
                            placeholder={t('common.enterName', {
                                defaultValue: 'Enter name',
                            })}
                        />
                        {errors.name ? (
                            <Text style={styles.errorText}>{errors.name}</Text>
                        ) : null}
                    </View>

                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>
                            {t('setting.email', { defaultValue: 'Email' })} *
                        </Text>
                        <Input
                            value={email}
                            onChangeText={text => {
                                setEmail(text);
                                if (errors.email) {
                                    setErrors(prev => ({ ...prev, email: '' }));
                                }
                            }}
                            placeholder={t('common.enterEmail', {
                                defaultValue: 'Enter email',
                            })}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                        {errors.email ? (
                            <Text style={styles.errorText}>{errors.email}</Text>
                        ) : null}
                    </View>

                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>
                            {t('common.note', { defaultValue: 'Note' })}
                        </Text>
                        <Input
                            value={note}
                            onChangeText={setNote}
                            placeholder={t('common.enterNote', {
                                defaultValue: 'Enter note',
                            })}
                            multiline
                            numberOfLines={4}
                            style={styles.textArea}
                        />
                    </View>

                    {/* Submit Button */}
                    <Button
                        title={t('common.save', { defaultValue: 'Save' })}
                        onPress={handleSubmit}
                        disabled={isSubmitting}
                        style={styles.submitButton}
                        textStyle={styles.submitButtonText}
                    />
                </ScrollView>
            </KeyboardAwareWrapper>
        </ChildrenLayout>
    );
}

const styles = StyleSheet.create({
    flex: {
        flex: 1,
        // backgroundColor: colors.backgroundSecondary,
    },
    scrollContent: {
        padding: moderateSize(16),
        paddingBottom: moderateSize(40),
    },
    fieldGroup: {
        marginBottom: moderateSize(16),
    },
    label: {
        fontSize: moderateSize(14),
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: moderateSize(6),
    },
    errorText: {
        color: colors.error,
        fontSize: moderateSize(12),
        marginTop: moderateSize(4),
    },
    textArea: {
        minHeight: moderateSize(100),
        textAlignVertical: 'top',
    },
    submitButton: {
        marginTop: moderateSize(16),
        borderRadius: moderateSize(12),
        paddingVertical: moderateSize(14),
    },
    submitButtonText: {
        fontSize: moderateSize(16),
        fontWeight: '600',
    },
});
