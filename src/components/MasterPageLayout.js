import React from 'react';
import { Platform, StatusBar, StyleSheet, View } from 'react-native';
import PropTypes from 'prop-types';
import Header from './Header';
import MainHeader from './MainHeader';
import colors from '../constants/colors';
import { moderateSize } from '../styles/moderateSize';
import { CONTENT_BORDER_RADIUS } from '../constants/layout';

// ─────────────────────────────────────────────────────────────────────────────
// Use EXACTLY the same offset formula as commonStyles.js so the layout
// matches screens that have NOT been migrated yet.
//
// commonStyles.js:
//   STATUS_BAR_HEIGHT = Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 44
//   MAIN_CONTENT_OFFSET = STATUS_BAR_HEIGHT + moderateSize(60)
//   BOOKING_CONTENT_OFFSET = STATUS_BAR_HEIGHT + moderateSize(90)
// ─────────────────────────────────────────────────────────────────────────────
const STATUS_BAR_HEIGHT =
    Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 44;

const MAIN_CONTENT_OFFSET = STATUS_BAR_HEIGHT + moderateSize(60);
const BOOKING_CONTENT_OFFSET = STATUS_BAR_HEIGHT + moderateSize(90);

/**
 * MasterPageLayout — reusable layout wrapper for all screens.
 *
 * Provides a consistent structure:
 *   • Header (Header / MainHeader / none)
 *   • Content area with rounded top corners, proper marginTop offset
 *   • Safe area handling synchronised across Android & iOS
 */
const MasterPageLayout = ({
    headerType = 'header',
    headerProps = {},
    contentStyle = 'main',
    backgroundColor,
    contentContainerStyle,
    children,
}) => {
    // Render the appropriate header
    const renderHeader = () => {
        switch (headerType) {
            case 'header':
                return <Header {...headerProps} />;
            case 'mainHeader':
                return <MainHeader {...headerProps} />;
            case 'none':
            default:
                return null;
        }
    };

    // Resolve content area style based on contentStyle prop
    const resolveContentStyle = () => {
        switch (contentStyle) {
            case 'booking':
                return {
                    flex: 1,
                    borderTopLeftRadius: CONTENT_BORDER_RADIUS,
                    borderTopRightRadius: CONTENT_BORDER_RADIUS,
                    backgroundColor: colors.surfaceSoft,
                    zIndex: 2,
                    marginTop: BOOKING_CONTENT_OFFSET,
                    padding: 0,
                };
            case 'flat':
                return {
                    flex: 1,
                    zIndex: 2,
                    marginTop: MAIN_CONTENT_OFFSET,
                    padding: 0,
                };
            case 'main':
            default:
                return {
                    flex: 1,
                    borderTopLeftRadius: CONTENT_BORDER_RADIUS,
                    borderTopRightRadius: CONTENT_BORDER_RADIUS,
                    backgroundColor: colors.white,
                    zIndex: 2,
                    marginTop: MAIN_CONTENT_OFFSET,
                    overflow: 'hidden',
                };
        }
    };

    return (
        <View
            style={[
                styles.container,
                backgroundColor ? { backgroundColor } : null,
            ]}>
            {renderHeader()}
            <View style={[resolveContentStyle(), contentContainerStyle]}>
                {children}
            </View>
        </View>
    );
};

MasterPageLayout.propTypes = {
    headerType: PropTypes.oneOf(['header', 'mainHeader', 'none']),
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
