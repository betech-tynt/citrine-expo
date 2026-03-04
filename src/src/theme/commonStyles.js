import { StyleSheet } from 'react-native';
import { moderateSize } from '../styles/moderateSize';
import colors from '../constants/colors';

export const commonStyles = StyleSheet.create({
    main: {
        flexGrow: 1,
        padding: moderateSize(16),
        borderTopLeftRadius: moderateSize(30),
        borderTopRightRadius: moderateSize(30),
        backgroundColor: 'white',
        zIndex: 2,
        marginTop: moderateSize(90),
    },
    // Common style for Booking screens with bottom bar (ScrollView content area)
    bookingMain: {
        flex: 1,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        backgroundColor: colors.surfaceSoft,
        zIndex: 2,
        marginTop: moderateSize(90),
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
