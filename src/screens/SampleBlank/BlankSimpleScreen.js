/**
 * Template: Simple Screen (ScrollView)
 * Header: Header (back button + title)
 * Content: ScrollView with padding
 */
import React from 'react';
import { StyleSheet, ScrollView, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import MasterPageLayout from '../../components/MasterPageLayout';
import colors from '../../constants/colors';
import { moderateSize } from '../../styles';

export default function BlankSimpleScreen() {
    const { t } = useTranslation(); // eslint-disable-line no-unused-vars
    const navigation = useNavigation(); // eslint-disable-line no-unused-vars

    return (
        <MasterPageLayout
            headerType="header"
            headerProps={{
                title: 'Screen Title',
                showCrudText: false,
            }}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}>
                {/* Content goes here */}
                <Text style={styles.title}>Hello World</Text>
                <Text style={styles.description}>
                    This is a simple screen template.
                </Text>
            </ScrollView>
        </MasterPageLayout>
    );
}

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: moderateSize(16),
        paddingBottom: moderateSize(30),
    },
    title: {
        fontSize: moderateSize(20),
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: moderateSize(8),
    },
    description: {
        fontSize: moderateSize(14),
        color: colors.textSecondary,
        lineHeight: moderateSize(20),
    },
});
