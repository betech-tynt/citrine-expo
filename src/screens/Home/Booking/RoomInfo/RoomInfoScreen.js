import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MasterPageLayout from '../../../../components/MasterPageLayout';
import { moderateSize } from '../../../../styles';

const RoomInfoScreen = () => {
    return (
        <MasterPageLayout
            headerType="header"
            headerProps={{ title: 'Room Info', showCrudText: false }}>
            <View style={styles.content}>
                <Text>RoomInfoScreen</Text>
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

export default RoomInfoScreen;
