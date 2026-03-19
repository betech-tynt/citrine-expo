import { StyleSheet, Text, View, SectionList } from 'react-native';
import React from 'react';
import MasterPageLayout from '../../components/MasterPageLayout';
import { moderateSize } from '../../styles';
import colors from '../../constants/colors';

const LIST_CHANGE_LOG = [
    {
        title: '0.1.51 - 18/03/2026',
        data: [
            '[588] Implement call API P0300_Customer_Payment_List_API',
            '[591] s301_payment_info - Integrate API',
            '[658] Add search by date range and guests',
            '[676] Fix keyboard overlaps email input',
            '[682] Fix bug version 0.1.1',
            '[696] Fix bug: Change log overlaps section header',
        ],
    },
    {
        title: '0.1.5 - 17/03/2026',
        data: [
            '[660] Fix initial data loading on search screen',
            '[670] Keyboard overlaps email input on Forgot Password screen (Samsung S24 Ultra)',
        ],
    },
    {
        title: '0.1.4 - 17/03/2026',
        data: [
            '[672] Room availability changed and UI in Booking flow',
            '[674] Fix bug version 0.1.0',
        ],
    },
    {
        title: '0.1.3 - 16/03/2026',
        data: [
            '[651] Display “Password changed successfully” message before Home redirect',
            '[652] Not redirecting to Login page when token expires on',
            '[653] Fix email validation in forgot password',
            '[654] Fix OTP and password in forgot password',
            '[659] Fix date picker on search room screen',
            '[670] Resend OTP UI and behavior issues',
        ],
    },
    {
        title: '0.1.2 - 12/03/2026',
        data: [
            '[646] Show success message and redirect to Home after registration',
            '[647] Incorrect validation messages for email and OTP',
        ],
    },
    {
        title: '0.1.1 - 12/03/2026',
        data: [
            '[630] Fix bug requirement 2026-03-10',
            '[637] Fix bug time out and Back button during booking',
        ],
    },
    {
        title: '0.0.36 - 09/03/2026',
        data: [
            '[376] s106_customer_booking_cancel - Integrate API',
            '[506] Replace Mock Profile Data with API Integration',
        ],
    },
    {
        title: '0.0.35 - 09/03/2026',
        data: [
            '[590] s301_payment_info - Coding',
            '[593] s302_payment_setting - Coding',
        ],
    },
    {
        title: '0.0.34 - 09/03/2026',
        data: [
            '[587] s300_payment - Coding',
        ],
    },
    {
        title: '0.0.33 - 08/03/2026',
        data: [
            '[341] Refactor forgot password',
            '[368] Update handle s104_customer_booking_confirm',
            '[372] s105_customer_booking_payment - Integrate API',
            '[466] s018_edit_profile - Integrate API',
            '[536] s018_edit_profile - Update Design',
        ],
    },
    {
        title: '0.0.32 - 05/03/2026',
        data: [
            '[463] s015_customer_register - Integrate API',
            '[464] s016_verify_OTP - Integrate API',
            '[536] s018_edit_profile - Update Design',
        ],
    },
    {
        title: '0.0.31 - 04/03/2026',
        data: [
            '[364] Update handle screen s103_customer_booking',
            '[544] Update design s102_customer_room_info',
            '[553] Fix bug version 0.0.30',
        ],
    },
    {
        title: '0.0.30 - 03/03/2026',
        data: [
            '[510] Fix bug version 0.0.17',
            '[534] Fix lỗi hiển thị icon & navigation bar trên iOS',
            '[543] Update design s101_customer_search_room',
        ],
    },
    {
        title: '0.0.13 - 14/02/2026',
        data: [
            '[306] Load data for Customer Home screen',
            '[388] UI for Customer Booking Info screen',
            '[309] Load data for Room Search screen',
            '[313] Load data for Room Info screen',
        ],
    },
    {
        title: '0.0.11 - 11/02/2026',
        data: [
            '[issue_454] Fix bug display navigation',
            '[issue_438] Fix bug version 0.0.10',
            '[issue_379] Customer booking history',
            '[issue_375] Customer booking cancel',
            '[issue_371] Customer booking payment',
            '[issue_312] Customer room info',
            '[issue_308] Customer search room',
        ],
    },
    {
        title: '0.0.10 - 06/02/2026',
        data: [
            '[issue_367] Add design s104 booking confirm',
            '[issue_363] Design screen s103 customer booking',
            '[issue_337] Confirm profile screen',
            '[issue_305] Customer home',
        ],
    },
    {
        title: '0.0.6 - 04/02/2026',
        data: ['Move version to package.json'],
    },
    {
        title: '0.0.2 - 02/02/2026',
        data: ['Deployment'],
    },
    {
        title: '0.0.1 - 02/02/2026',
        data: ['Init app'],
    },
];

export default function ChangeLogs() {
    return (
        <MasterPageLayout
            headerType="header"
            headerProps={{ title: 'Change Logs', showCrudText: false }}>
            <SectionList
                sections={LIST_CHANGE_LOG}
                keyExtractor={(item, index) => `${item}-${index}`}
                stickySectionHeadersEnabled={true}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                    <View style={styles.itemRow}>
                        <View style={styles.bullet} />
                        <Text style={styles.itemText}>{item}</Text>
                    </View>
                )}
                renderSectionHeader={({ section }) => (
                    <View style={styles.sectionCard}>
                        <View style={styles.sectionHeader}>
                            <View style={styles.versionDot} />
                            <Text style={styles.sectionTitle}>
                                {section.title}
                            </Text>
                        </View>
                    </View>
                )}
                contentContainerStyle={styles.listContent}
            />
        </MasterPageLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listContent: {
        padding: moderateSize(16),
        paddingTop: moderateSize(4),
    },
    sectionCard: {
        marginTop: moderateSize(0),
        marginBottom: moderateSize(6),
        backgroundColor: colors.white,
    },
    sectionHeader: {
        marginTop: moderateSize(10),
        flexDirection: 'row',
        alignItems: 'center',
        gap: moderateSize(8),
    },
    sectionTitle: {
        fontWeight: '700',
        fontSize: moderateSize(16),
        color: colors.textPrimary,
    },
    versionDot: {
        width: moderateSize(10),
        height: moderateSize(10),
        borderRadius: moderateSize(10),
        backgroundColor: colors.primary,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: moderateSize(6),
        paddingHorizontal: moderateSize(18),
    },
    bullet: {
        width: moderateSize(6),
        height: moderateSize(6),
        borderRadius: moderateSize(6),
        backgroundColor: colors.danger,
        marginRight: moderateSize(6),
    },
    itemText: {
        fontSize: moderateSize(14),
        lineHeight: moderateSize(20),
        color: colors.textPrimary,
    },
});
