import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { commonStyles } from '../../../../theme/commonStyles';
import Header from '../../../../components/Header';

const SearchRoomScreen = () => {
    return (
        <View style={styles.container}>
            <Header title="Search Room" showCrudText={false} />
            <View style={commonStyles.main}>
                <Text>SearchRoomScreen</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default SearchRoomScreen;
