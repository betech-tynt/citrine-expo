import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { SuccessPropTypes } from '../utils/propTypes';
import { moderateSize } from '../styles';
import CustomIcon from './CustomIcon';
import Button from './Button';
import colors from '../constants/colors';

const Success = ({
    message,
    onDone,
    title = 'Success!',
    buttonTitle = 'Done',
    style,
}) => {
    return (
        <SafeAreaView style={[styles.container, style]}>
            <View style={styles.content}>
                <CustomIcon
                    type="Ionicons"
                    name="checkmark-circle-outline"
                    size={100}
                    color={colors.success}
                />

                <Text style={styles.title}>{title}</Text>

                <Text style={styles.message}>{message}</Text>

                <Button
                    title={buttonTitle}
                    onPress={onDone}
                    style={styles.button}
                />
            </View>
        </SafeAreaView>
    );
};

// Define data types for props
Success.propTypes = SuccessPropTypes;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: moderateSize(20),
    },
    title: {
        fontSize: moderateSize(24),
        fontWeight: 'bold',
        marginTop: moderateSize(20),
        color: colors.textPrimary,
    },
    message: {
        fontSize: moderateSize(16),
        textAlign: 'center',
        marginTop: moderateSize(10),
        color: colors.textPrimary,
        marginBottom: moderateSize(30),
    },
    button: {
        width: 'auto',
        paddingVertical: moderateSize(12),
        paddingHorizontal: moderateSize(30),
        borderRadius: 25,
    },
});

export default Success;
