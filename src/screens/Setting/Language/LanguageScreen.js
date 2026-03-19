import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MasterPageLayout from '../../../components/MasterPageLayout';
import { moderateSize } from '../../../styles';

const LanguageScreen = () => {
    const { t, i18n } = useTranslation();
    const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);

    const handleLanguagePress = (lang) => {
        i18n.changeLanguage(lang);
        setSelectedLanguage(lang);
    };

    const languages = [
        { label: 'English', value: 'en' },
        { label: 'Vietnamese', value: 'vi' },
        { label: 'Japanese', value: 'jp' },
    ];

    return (
        <MasterPageLayout
            headerType="header"
            headerProps={{
                title: t('setting.language'),
                showCrudText: false,
                showHomeIcon: false,
            }}>
            <View style={styles.content}>
                {languages.map((language) => (
                    <TouchableOpacity
                        key={language.value}
                        onPress={() => handleLanguagePress(language.value)}
                        style={styles.languageOption}
                    >
                        <Text style={styles.languageText}>{language.label}</Text>
                        {selectedLanguage === language.value && (
                            <Icon name="check" size={24} color="#3572EF" />
                        )}
                    </TouchableOpacity>
                ))}
            </View>
        </MasterPageLayout>
    );
};

const styles = StyleSheet.create({
    content: {
        flex: 1,
        padding: moderateSize(16),
    },
    languageOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    languageText: {
        fontSize: 16,
    },
});

export default LanguageScreen;
