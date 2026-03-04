import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { commonStyles } from '../../theme/commonStyles';
import Header from '../../components/Header';

const CleaningScreen = () => {
    return (
        <View style={styles.container}>
            <Header
                title="Cleaning"
                showCrudText={false}
                showHomeIcon={false}
            />
            <View style={commonStyles.main}>
                <Text>CleaningScreen</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default CleaningScreen;
