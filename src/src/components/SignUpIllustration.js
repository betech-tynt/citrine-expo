import React from 'react';
import { View, StyleSheet } from 'react-native';
import colors from '../constants/colors';
import CustomIcon from './CustomIcon';
import { moderateSize } from '../styles/moderateSize';

const SignUpIllustration = () => {
    return (
        <View style={styles.wrapper}>
            {/* Dots around the circle: 2 big + 3 small (match iOS design) */}
            <View style={[styles.dot, styles.dotTopPurple]} />
            <View style={[styles.dot, styles.dotLeftTeal]} />
            <View style={[styles.dot, styles.dotRightRed]} />
            <View style={[styles.dot, styles.dotBottomLeftOrange]} />
            <View style={[styles.dot, styles.dotBottomRightBlue]} />

            <View style={styles.bigCircle}>
                <View style={styles.phone}>
                    <View style={styles.notch} />
                    <View style={styles.phoneInner}>
                        <View style={styles.iconRow}>
                            <View style={styles.userCircle}>
                                <CustomIcon
                                    type="FontAwesome5"
                                    name="user"
                                    size={moderateSize(20)}
                                    color={colors.white}
                                    style={styles.icon}
                                    solid={false}
                                />
                            </View>
                             
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        alignSelf: 'center',
        width: moderateSize(180),
        height: moderateSize(180),
        marginTop: moderateSize(18),
        marginBottom: moderateSize(26),
        justifyContent: 'center',
        alignItems: 'center',
    },
    bigCircle: {
        width: moderateSize(150),
        height: moderateSize(150),
        borderRadius: moderateSize(75),
        backgroundColor: colors.surfaceSoft,
        justifyContent: 'center',
        alignItems: 'center',
    },
    phone: {
        width: moderateSize(55),
        height: moderateSize(100),
        borderRadius: moderateSize(12),
        backgroundColor: colors.primary,
        borderWidth: moderateSize(2),
        borderColor: colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colors.black,
        shadowOpacity: 0.12,
        shadowRadius: moderateSize(10),
        shadowOffset: { width: 0, height: moderateSize(6) },
        elevation: 2,
    },
    notch: {
        position: 'absolute',
        top: moderateSize(8),
        width: moderateSize(18),
        height: moderateSize(4),
        borderRadius: moderateSize(2),
        backgroundColor: colors.white,
        opacity: 0.9,
    },
    phoneInner: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    userCircle: {
        width: moderateSize(27),
        height: moderateSize(27),

        justifyContent: 'center',
        alignItems: 'center',
    },
    icon: {
        opacity: 0.98,
    },
    dot: {
        position: 'absolute',
    },
    dotTopPurple: {
        top: moderateSize(1),
        width: moderateSize(10),
        height: moderateSize(10),
        left: moderateSize(50),
        borderRadius: moderateSize(5),
        backgroundColor: colors.dotPurple,
    },
    dotLeftTeal: {
        left: moderateSize(-20),
        top: moderateSize(55),
        width: moderateSize(11),
        height: moderateSize(11),
        borderRadius: moderateSize(7),
        backgroundColor: colors.dotTeal,
    },
    dotRightRed: {
        right: moderateSize(-30),
        top: moderateSize(30),
        width: moderateSize(28),
        height: moderateSize(28),
        borderRadius: moderateSize(13),
        backgroundColor: colors.dotRed,
    },
    dotBottomLeftOrange: {
        left: moderateSize(24),
        bottom: moderateSize(30),
        width: moderateSize(22),
        height: moderateSize(22),
        borderRadius: moderateSize(11),
        backgroundColor: colors.dotOrange,
        zIndex: 9999,
    },
    dotBottomRightBlue: {
        right: moderateSize(10),
        bottom: moderateSize(36),
        width: moderateSize(11),
        height: moderateSize(11),
        borderRadius: moderateSize(6),
        backgroundColor: colors.dotBlue,
    },
});

export default SignUpIllustration;
