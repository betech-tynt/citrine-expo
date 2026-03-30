import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import ParentLayout from '../../components/ParentLayout';
import { moderateSize } from '../../styles';

const ActivityScreen = () => {
    const { t } = useTranslation();

    return (
        <ParentLayout
            headerType="header"
            headerProps={{
                title: t('navigation.message'),
            }}>
            <View style={styles.content}>
                <Text>ActivityScreen</Text>
            </View>
        </ParentLayout>
    );
};

const styles = StyleSheet.create({
    content: {
        flex: 1,
        padding: moderateSize(16),
    },
});

export default ActivityScreen;
