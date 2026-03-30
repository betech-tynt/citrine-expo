/**
 * Template: Tab Screen (MainHeader)
 * Header: MainHeader (logo, avatar, notification bell)
 * Content: ScrollView with padding
 */
import React from 'react';
import { StyleSheet, ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import ParentLayout from '../../components/ParentLayout';
import colors from '../../constants/colors';
import { moderateSize } from '../../styles';

export default function BlankTabScreen() {
    const { t } = useTranslation(); // eslint-disable-line no-unused-vars

    return (
        <ParentLayout
            headerType="mainHeader"
            headerProps={{
                username: 'User',
                notificationCount: 0,
            }}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}>
                {/* Content goes here */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Section 1</Text>
                    <Text style={styles.sectionContent}>
                        This is a tab screen template using MainHeader.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Section 2</Text>
                    <Text style={styles.sectionContent}>
                        Add your content here.
                    </Text>
                </View>
            </ScrollView>
        </ParentLayout>
    );
}

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
        // backgroundColor: colors.backgroundSecondary,
    },
    scrollContent: {
        padding: moderateSize(16),
        paddingBottom: moderateSize(30),
    },
    section: {
        marginBottom: moderateSize(20),
    },
    sectionTitle: {
        fontSize: moderateSize(18),
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: moderateSize(8),
    },
    sectionContent: {
        fontSize: moderateSize(14),
        color: colors.textSecondary,
        lineHeight: moderateSize(20),
    },
});
