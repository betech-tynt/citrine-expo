import { StyleSheet, Text, View, SectionList } from 'react-native';
import React from 'react';
import { commonStyles } from '../../theme/commonStyles';
import Header from '../../components/Header';
import { moderateSize } from '../../styles';
import colors from '../../constants/colors';

const LIST_CHANGE_LOG = [
    {
        title: '0.0.17 - 26/02/2026',
        data: [
            '[issue_389] API P0107 Customer Booking Info',
            '[issue_380] API P0106 Customer Booking History',
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
        <View style={styles.container}>
            <Header title="Change Logs" showCrudText={false} />
            <View style={commonStyles.main}>
                <SectionList
                    sections={LIST_CHANGE_LOG}
                    keyExtractor={(item, index) => `${item}-${index}`}
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
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listContent: {
        paddingBottom: moderateSize(16),
        paddingTop: moderateSize(4),
    },
    sectionCard: {
        marginTop: moderateSize(10),
        marginBottom: moderateSize(6),
    },
    sectionHeader: {
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
