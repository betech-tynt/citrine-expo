import React from 'react';
import PropTypes from 'prop-types';
import CustomIcon from './CustomIcon';

// FA5 icon names that were renamed in FA6 (only names used from API)
const FA6_NAME_ALIASES = {
    'concierge-bell': 'bell-concierge',
    'map-marker-alt': 'location-dot',
    'map-marker': 'location-dot',
    'external-link-alt': 'arrow-up-right-from-square',
    'trash-alt': 'trash-can',
    edit: 'pen-to-square',
    times: 'xmark',
    'times-circle': 'circle-xmark',
    'check-circle': 'circle-check',
    'info-circle': 'circle-info',
    'exclamation-circle': 'circle-exclamation',
    'arrow-circle-left': 'circle-arrow-left',
    'arrow-circle-right': 'circle-arrow-right',
};

// Map FA prefix class → FontAwesome6 boolean prop
const FA_STYLE_PROPS = {
    'fa-solid': { solid: true },
    'fa-regular': { regular: true },
    'fa-brands': { brand: true },
    'fa-light': { light: true },
    'fa-thin': { thin: true },
};

/**
 * Renders a FontAwesome 6 icon from a FA class string.
 * Wraps CustomIcon — supports all FA6 styles available in react-native-vector-icons.
 *
 * Usage:
 *   <FaIcon icon="fa-solid fa-star"   size={22} color="#4A44C4" />
 *   <FaIcon icon="fa-regular fa-bell" size={20} color="#333" />
 *   <FaIcon icon="fa-brands fa-github" size={18} />
 */
const FaIcon = ({ icon, size, color, style, onPress, ...rest }) => {
    if (!icon) return null;

    const parts = icon.trim().split(/\s+/);
    let iconName = '';
    let styleProps = { solid: true }; // default: solid
    // Parse parts to determine style props and icon name
    parts.forEach(part => {
        if (FA_STYLE_PROPS[part]) {
            styleProps = FA_STYLE_PROPS[part];
        } else if (part.startsWith('fa-')) {
            const parsed = part.slice(3);
            iconName = FA6_NAME_ALIASES[parsed] ?? parsed;
        }
    });

    if (!iconName) return null;

    return (
        <CustomIcon
            type="FontAwesome6"
            name={iconName}
            size={size}
            color={color}
            style={style}
            onPress={onPress}
            {...styleProps}
            {...rest}
        />
    );
};

FaIcon.propTypes = {
    icon: PropTypes.string.isRequired,
    size: PropTypes.number,
    color: PropTypes.string,
    style: PropTypes.object,
    onPress: PropTypes.func,
};

export default FaIcon;
