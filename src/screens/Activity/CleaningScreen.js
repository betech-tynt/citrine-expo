import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { moderateSize } from '../../styles';
import ParentLayout from '../../components/ParentLayout';

const CleaningScreen = () => {
    return (
        <ParentLayout headerType="header" headerProps={{ title: 'Cleaning' }}>
            <View style={styles.content}>
                <Text>CleaningScreen</Text>
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

export default CleaningScreen;
