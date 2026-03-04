import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { commonStyles } from '../../theme/commonStyles';
import Header from '../../components/Header';

const ActivityScreen = () => {
    return (
        <View style={styles.container}>
            <Header
                title="Activity"
                showCrudText={false}
                showHomeIcon={false}
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
