import React from 'react';
import { Platform, StatusBar, StyleSheet, View } from 'react-native';
import PropTypes from 'prop-types';
import Header from './Header';
import MainHeader from './MainHeader';
import colors from '../constants/colors';
import { moderateSize } from '../styles/moderateSize';
import { CONTENT_BORDER_RADIUS } from '../constants/layout';

const STATUS_BAR_HEIGHT =
    Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 44;

const MAIN_CONTENT_OFFSET = STATUS_BAR_HEIGHT + moderateSize(60);
const BOOKING_CONTENT_OFFSET = STATUS_BAR_HEIGHT + moderateSize(90);

// Header preset
const HEADER_PRESETS = {
    parent: {
        showBackIcon: false,
        showHomeIcon: false,
        showCrudText: false,
    },
    child: {
        showBackIcon: true,
        showHomeIcon: true,
        showCrudText: false,
    },
};

// Content area style map
const CONTENT_STYLE_MAP = {
    main: {
        flex: 1,
        borderTopLeftRadius: CONTENT_BORDER_RADIUS,
        borderTopRightRadius: CONTENT_BORDER_RADIUS,
        backgroundColor: colors.white,
        zIndex: 2,
        marginTop: MAIN_CONTENT_OFFSET,
        overflow: 'hidden',
    },
    booking: {
        flex: 1,
        borderTopLeftRadius: CONTENT_BORDER_RADIUS,
        borderTopRightRadius: CONTENT_BORDER_RADIUS,
        backgroundColor: colors.surfaceSoft,
        zIndex: 2,
        marginTop: BOOKING_CONTENT_OFFSET,
        padding: 0,
    },
    flat: {
        flex: 1,
        zIndex: 2,
        marginTop: MAIN_CONTENT_OFFSET,
        padding: 0,
    },
};

// Header component map
const HEADER_COMPONENTS = {
    header: Header,
    mainHeader: MainHeader,
    none: null,
};

/**
 * MasterPageLayout — reusable layout wrapper for all screens.
 * @note Prefer using ParentLayout / ChildrenLayout instead of this directly.
 */
const MasterPageLayout = ({
    headerType = 'header',
    headerPreset = 'child',
    headerProps = {},
    contentStyle = 'main',
    backgroundColor,
    contentContainerStyle,
    children,
}) => {
    // Merge: preset defaults -> headerProps overrides
    const mergedHeaderProps = {
        ...(HEADER_PRESETS[headerPreset] || HEADER_PRESETS.child),
        ...headerProps,
    };

    // Resolve header component
    const HeaderComponent = HEADER_COMPONENTS[headerType] ?? null;

    // Resolve content style
    const resolvedContentStyle =
        CONTENT_STYLE_MAP[contentStyle] || CONTENT_STYLE_MAP.main;

    return (
        <View
            style={[
                styles.container,
                backgroundColor ? { backgroundColor } : null,
            ]}>
            {HeaderComponent && <HeaderComponent {...mergedHeaderProps} />}
            <View style={[resolvedContentStyle, contentContainerStyle]}>
                {children}
            </View>
        </View>
    );
};

MasterPageLayout.propTypes = {
    headerType: PropTypes.oneOf(['header', 'mainHeader', 'none']),
    headerPreset: PropTypes.oneOf(['parent', 'child']),
    headerProps: PropTypes.object,
    contentStyle: PropTypes.oneOf(['main', 'booking', 'flat']),
    backgroundColor: PropTypes.string,
    contentContainerStyle: PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.array,
        PropTypes.number,
    ]),
    children: PropTypes.node,
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.primary,
    },
});

export default MasterPageLayout;
