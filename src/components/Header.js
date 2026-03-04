import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import CustomIcon from './CustomIcon';
import { HeaderPropTypes } from '../utils/propTypes';
import colors from '../constants/colors';
import { moderateSize } from '../styles';

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
                        style={styles.backButton}>
                        <Icon name="angle-left" size={26} color="white" />
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
        height: '20%',
        backgroundColor: colors.primary,
        zIndex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: moderateSize(20),
        paddingVertical: moderateSize(10),
        paddingBottom: moderateSize(6),
        paddingTop: moderateSize(12),
        backgroundColor: colors.primary,
        minHeight: moderateSize(56),
    },
    backButton: {
        marginRight: moderateSize(16),
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
        marginRight: moderateSize(16),
        padding: moderateSize(8),
    },
});

export default Header;
