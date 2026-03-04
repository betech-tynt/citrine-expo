import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Header from '../../../../components/Header';
import { commonStyles } from '../../../../theme/commonStyles';

const RoomInfoScreen = () => {
    return (
        <View style={styles.container}>
            <Header title="Room Info" showCrudText={false} />
            <View style={commonStyles.main}>
                <Text>RoomInfoScreen</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default RoomInfoScreen;
