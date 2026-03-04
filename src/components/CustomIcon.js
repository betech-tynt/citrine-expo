import React from 'react';
import { CustomIconPropTypes } from '../utils/propTypes';
import { View, TouchableOpacity } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Entypo from 'react-native-vector-icons/Entypo';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import FontAwesome5Brands from 'react-native-vector-icons/FontAwesome5';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import FontAwesome6Brands from 'react-native-vector-icons/FontAwesome6';
import Fontisto from 'react-native-vector-icons/Fontisto';
import Foundation from 'react-native-vector-icons/Foundation';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Octicons from 'react-native-vector-icons/Octicons';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import Zocial from 'react-native-vector-icons/Zocial';

const CustomIcon = ({
    type,
    name,
    size = 24,
    color = 'black',
    style = {},
    onPress,
    ...rest
}) => {
    const IconComponent = {
        AntDesign,
        Entypo,
        EvilIcons,
        Feather,
        FontAwesome,
        FontAwesome5,
        FontAwesome5Brands,
        FontAwesome6,
        FontAwesome6Brands,
        Fontisto,
        Foundation,
        Ionicons,
        MaterialCommunityIcons,
        MaterialIcons,
        Octicons,
        SimpleLineIcons,
        Zocial,
    }[type];

    if (!IconComponent) return null; // If the icon type is invalid

    const IconElement = (
        <IconComponent
            name={name}
            size={size}
            color={color}
            style={style}
            {...rest}
        />
    );

    // Only wrap with TouchableOpacity if onPress is passed in
    return onPress ? (
        <TouchableOpacity onPress={onPress} style={style}>
            {IconElement}
        </TouchableOpacity>
    ) : (
        <View style={style}>
            {IconElement}
        </View>
    );
};

// Define data types for props
CustomIcon.propTypes = CustomIconPropTypes;

export default CustomIcon;
