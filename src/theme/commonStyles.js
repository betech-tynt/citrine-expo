import { Platform, StatusBar, StyleSheet } from 'react-native';
import colors from '../constants/colors';
import { moderateSize } from '../styles/moderateSize';

// Approximate safe area top across devices to align content under headers
const STATUS_BAR_HEIGHT =
    Platform.OS === 'android'
        ? StatusBar.currentHeight || 24
        : 44; // typical notch height; non‑notch devices will just have a bit more space

const MAIN_CONTENT_OFFSET = (STATUS_BAR_HEIGHT || 0) + moderateSize(60);
const BOOKING_CONTENT_OFFSET = (STATUS_BAR_HEIGHT || 0) + moderateSize(90);

export const commonStyles = StyleSheet.create({
    main: {
        flexGrow: 1,
        padding: moderateSize(16),
        borderTopLeftRadius: moderateSize(30),
        borderTopRightRadius: moderateSize(30),
        backgroundColor: 'white',
        zIndex: 2,
        // Align with Header / MainHeader across Android & iOS
        marginTop: MAIN_CONTENT_OFFSET,
    },
    // Common style for Booking screens with bottom bar (ScrollView content area)
    bookingMain: {
        flex: 1,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        backgroundColor: colors.surfaceSoft,
        zIndex: 2,
        marginTop: BOOKING_CONTENT_OFFSET,
        padding: 0,
    },
    bookingScrollContent: {
        flexGrow: 1,
    },
    bookingContentContainer: {
        paddingHorizontal: moderateSize(16),
        paddingTop: moderateSize(16),
        paddingBottom: moderateSize(16),
    },
});
