import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MasterPageLayout from '../../../components/MasterPageLayout';
import { moderateSize } from '../../../styles';

const PromotionScreen = () => {
    return (
        <MasterPageLayout
            headerType="header"
            headerProps={{ title: 'Promotion', showCrudText: false }}>
            <View style={styles.content}>
                <Text>PromotionScreen</Text>
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

export default PromotionScreen;
