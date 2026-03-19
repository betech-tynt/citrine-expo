import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import MasterPageLayout from '../../components/MasterPageLayout';
import { moderateSize } from '../../styles';

const CleaningScreen = () => {
    return (
        <MasterPageLayout
            headerType="header"
            headerProps={{
                title: 'Cleaning',
                showCrudText: false,
                showHomeIcon: false,
            }}>
            <View style={styles.content}>
                <Text>CleaningScreen</Text>
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

export default CleaningScreen;
