import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Platform,
    StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import CustomIcon from './CustomIcon';
import { HeaderPropTypes } from '../utils/propTypes';
import colors from '../constants/colors';
import { moderateSize } from '../styles';

// Approximate header background height so it looks consistent across devices
const STATUS_BAR_HEIGHT =
    Platform.OS === 'android' ? StatusBar.currentHeight || 55 : 55;
const HEADER_BACKGROUND_HEIGHT = (STATUS_BAR_HEIGHT || 0) + moderateSize(80);

// Increase the touchable area for the back icon without affecting visual layout.
const BACK_BUTTON_HIT_SLOP = {
    top: moderateSize(15),
    right: moderateSize(15),
    bottom: moderateSize(15),
    left: moderateSize(15),
};

// Header component with customizable props
const Header = ({
    title,
    crudText,
    onBackPress,
    onCrudPress,
    onHomePress,
    onRightIconPress,
    showBackIcon = true,
    showCrudText = true,
    showHomeIcon = true,
    rightIcon,
    rightIconType = 'MaterialIcons',
}) => {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const canGoBack = navigation.canGoBack();

    const handleBackPress = () => {
        if (onBackPress) {
            onBackPress();
        } else if (canGoBack) {
            navigation.goBack();
        }
    };

    const handleHomePress = () => {
        if (onHomePress) {
            onHomePress();
        } else {
            navigation.navigate('Home');
        }
    };

    return (
        <View style={[styles.background, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                {showBackIcon && (
                    <TouchableOpacity
                        onPress={handleBackPress}
                        style={styles.backButton}
                        hitSlop={BACK_BUTTON_HIT_SLOP}
                        activeOpacity={0.7}
                        accessibilityRole="button"
                        accessibilityLabel="Go back">
                        <Icon name="angle-left" size={30} color="white" />
                    </TouchableOpacity>
                )}

                <Text style={styles.headerTitle}>{title}</Text>

                {showCrudText && crudText && (
                    <TouchableOpacity
                        onPress={onCrudPress}
                        style={styles.settingsButton}>
                        <Text style={styles.settingsText}>{crudText}</Text>
                    </TouchableOpacity>
                )}

                {rightIcon && (
                    <TouchableOpacity
                        onPress={onRightIconPress}
                        style={styles.rightIconButton}>
                        <CustomIcon
                            type={rightIconType}
                            name={rightIcon}
                            size={24}
                            color={colors.white}
                        />
                    </TouchableOpacity>
                )}

                {showHomeIcon && (
                    <TouchableOpacity
                        onPress={handleHomePress}
                        style={styles.homeButton}>
                        <Icon name="home" size={26} color="white" />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

Header.propTypes = HeaderPropTypes;

const styles = StyleSheet.create({
    background: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: HEADER_BACKGROUND_HEIGHT,
        backgroundColor: colors.primary,
        zIndex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        height: moderateSize(48),
        paddingHorizontal: moderateSize(20),
        backgroundColor: colors.primary,
    },
    backButton: {
        marginRight: moderateSize(10),
        minWidth: moderateSize(25),
        minHeight: moderateSize(25),
        alignItems: 'center',
        justifyContent: 'center',
    },
    homeButton: {
        marginRight: moderateSize(10),
    },
    headerTitle: {
        flex: 1,
        fontSize: moderateSize(20),
        fontWeight: 'bold',
        color: 'white',
    },
    settingsButton: {
        marginRight: moderateSize(16),
        backgroundColor: 'white',
        borderRadius: 25,
        paddingVertical: moderateSize(4),
        paddingHorizontal: moderateSize(12),
        width: moderateSize(75),
        height: moderateSize(28),
    },
    settingsText: {
        color: colors.primary,
        textAlign: 'center',
        fontWeight: '500',
    },
    rightIconButton: {
        width: moderateSize(40),
        height: moderateSize(40),
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default Header;
