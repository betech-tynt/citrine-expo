import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MasterPageLayout from '../../../../components/MasterPageLayout';
import { moderateSize } from '../../../../styles';

const SearchRoomScreen = () => {
    return (
        <MasterPageLayout
            headerType="header"
            headerProps={{ title: 'Search Room', showCrudText: false }}>
            <View style={styles.content}>
                <Text>SearchRoomScreen</Text>
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

export default SearchRoomScreen;
