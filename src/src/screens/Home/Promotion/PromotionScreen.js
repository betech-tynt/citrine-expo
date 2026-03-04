import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { commonStyles } from '../../../theme/commonStyles';
import Header from '../../../components/Header';

const PromotionScreen = () => {
    return (
        <View style={styles.container}>
            <Header title="Promotion" showCrudText={false} />
            <View style={commonStyles.main}>
                <Text>PromotionScreen</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default PromotionScreen;
