import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import MasterPageLayout from '../../components/MasterPageLayout';
import { moderateSize } from '../../styles';

const ActivityScreen = () => {
    const { t } = useTranslation();

    return (
        <MasterPageLayout
            headerType="header"
            headerProps={{
                title: t('navigation.message'),
                showCrudText: false,
                showHomeIcon: false,
                showBackIcon: false,
            }}>
            <View style={styles.content}>
                <Text>ActivityScreen</Text>
            </View>
        </MasterPageLayout>
    );
};

const styles = StyleSheet.create({
    content: {
        flex: 1,
        padding: moderateSize(16),
    },
});

export default ActivityScreen;
