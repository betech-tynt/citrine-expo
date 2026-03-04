import React from 'react';
import { StyleSheet, View, ActivityIndicator, Text } from 'react-native';

const SplashScreen = () => {
    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color="#0000ff" />
            <Text style={styles.text}>Loading...</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    text: {
        marginTop: 10,
        fontSize: 18,
        color: '#000',
    },
});

export default SplashScreen;
