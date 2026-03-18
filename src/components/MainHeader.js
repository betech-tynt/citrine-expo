import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Platform,
    StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { MainHeaderPropTypes } from '../utils/propTypes';
import { moderateSize } from '../styles';
import colors from '../constants/colors';

// Approximate header background height so it looks consistent across devices
const STATUS_BAR_HEIGHT =
    Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 44;
const HEADER_BACKGROUND_HEIGHT = (STATUS_BAR_HEIGHT || 0) + moderateSize(100);

// MainHeader component with username and notificationCount props
const MainHeader = ({ username, notificationCount }) => {
    const insets = useSafeAreaInsets();
    const paddingTop = insets.top + moderateSize(4);
    const paddingBottom = moderateSize(16);

    return (
        <View style={styles.background}>
            <View
                style={[styles.headerContainer, { paddingTop, paddingBottom }]}>
                <View style={styles.userInfoContainer}>
                    <Icon name="user-circle" size={30} color="#00B4D8" />
                    <Text style={styles.username}>Hi, {username}</Text>
                </View>
                <View style={styles.notificationContainer}>
                    <TouchableOpacity style={styles.notificationButton}>
                        <Icon name="bell" size={30} color="white" />
                    </TouchableOpacity>
                    {notificationCount > 0 && (
                        <View style={styles.notificationBadge}>
                            <Text style={styles.badgeText}>
                                {notificationCount}
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </View>
    );
};

// Define data types for props
MainHeader.propTypes = MainHeaderPropTypes;

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.primary,
    },
    background: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: HEADER_BACKGROUND_HEIGHT,
        backgroundColor: colors.primary,
        zIndex: 1,
    },
    userInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: moderateSize(10),
    },
    avatar: {
        width: moderateSize(40),
        height: moderateSize(40),
        borderRadius: moderateSize(20),
        marginRight: moderateSize(8),
    },
    username: {
        color: '#FFF',
        fontWeight: '500',
        paddingLeft: moderateSize(16),
        fontSize: moderateSize(18),
    },
    notificationContainer: {
        position: 'relative',
        marginRight: moderateSize(10),
    },
    notificationButton: {
        borderRadius: moderateSize(20),
        padding: moderateSize(8),
    },
    notificationIcon: {
        width: moderateSize(24),
        height: moderateSize(24),
    },
    notificationBadge: {
        position: 'absolute',
        top: 0,
        right: moderateSize(-4),
        backgroundColor: colors.danger,
        width: moderateSize(20),
        height: moderateSize(20),
        borderRadius: moderateSize(10),
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: {
        color: colors.white,
        fontSize: moderateSize(12),
    },
});

export default MainHeader;
