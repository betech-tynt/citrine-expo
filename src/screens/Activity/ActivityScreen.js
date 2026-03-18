import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { commonStyles } from '../../theme/commonStyles';
import Header from '../../components/Header';

const ActivityScreen = () => {
    const { t } = useTranslation();

    return (
        <View style={styles.container}>
            <Header
                title={t('navigation.message')}
                showCrudText={false}
                showHomeIcon={false}
                showBackIcon={false}
            />
            <View style={commonStyles.main}>
                <Text>ActivityScreen</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default ActivityScreen;
