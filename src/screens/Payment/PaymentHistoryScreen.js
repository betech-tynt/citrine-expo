import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { commonStyles } from '../../theme/commonStyles';
import Header from '../../components/Header';

const PaymentHistoryScreen = () => {
    return (
        <View style={styles.container}>
            <Header title="Payment History" showCrudText={false} />
            <View style={commonStyles.main}>
                <Text>PaymentHistoryScreen</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default PaymentHistoryScreen;
