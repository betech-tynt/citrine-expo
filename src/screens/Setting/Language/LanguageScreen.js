import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialIcons';

const LanguageScreen = () => {
    const { i18n } = useTranslation();
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
        <View style={{ flex: 1, padding: 20 }}>
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
    );
};

const styles = {
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
};

export default LanguageScreen;
