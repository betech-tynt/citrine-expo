/**
 * Template: API Screen (Loading / Error / Data)
 * Use: Call API and show data
 * Header: Header (back button + title)
 * Content: ScrollView (pull-to-refresh)
 */
import React, { useState, useCallback } from 'react';
import {
    StyleSheet,
    View,
    ScrollView,
    Text,
    ActivityIndicator,
    TouchableOpacity,
    RefreshControl,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import MasterPageLayout from '../../components/MasterPageLayout';
import CustomIcon from '../../components/CustomIcon';
import colors from '../../constants/colors';
import { moderateSize } from '../../styles';

export default function BlankApiScreen() {
    const { t } = useTranslation();
    const navigation = useNavigation(); // eslint-disable-line no-unused-vars

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    const headerProps = {
        title: 'Screen Title',
        showCrudText: false,
    };

    // ─── Fetch data from API ───
    const fetchData = useCallback(
        async (isRefresh = false) => {
            try {
                if (!isRefresh) {
                    setLoading(true);
                }
                setError(null);

                // TODO: Replace with actual API call
                // const result = await fetchSomeApi();
                // setData(result);

                // Simulating API call
                await new Promise(resolve => setTimeout(resolve, 1000));
                setData({ message: 'Data loaded successfully' });
            } catch (err) {
                setError(err.message || t('common.error'));
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        [t],
    );

    // Fetch on screen focus
    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [fetchData]),
    );

    const handleRefresh = () => {
        setRefreshing(true);
        fetchData(true);
    };

    // ─── Loading state ───
    if (loading && !data) {
        return (
            <MasterPageLayout headerType="header" headerProps={headerProps}>
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>
                        {t('common.loading')}
                    </Text>
                </View>
            </MasterPageLayout>
        );
    }

    // ─── Error state ───
    if (error && !data) {
        return (
            <MasterPageLayout headerType="header" headerProps={headerProps}>
                <View style={styles.centerContainer}>
                    <CustomIcon
                        type="FontAwesome5"
                        name="exclamation-circle"
                        size={60}
                        color={colors.error || '#FF6B6B'}
                    />
                    <Text style={styles.errorTitle}>{t('common.error')}</Text>
                    <Text style={styles.errorMessage}>{error}</Text>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={() => fetchData()}
                        activeOpacity={0.7}>
                        <CustomIcon
                            type="FontAwesome5"
                            name="redo"
                            size={16}
                            color={colors.white}
                            style={styles.retryIcon}
                        />
                        <Text style={styles.retryButtonText}>
                            {t('common.retry')}
                        </Text>
                    </TouchableOpacity>
                </View>
            </MasterPageLayout>
        );
    }

    // ─── Main content ───
    return (
        <MasterPageLayout headerType="header" headerProps={headerProps}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={[colors.primary]}
                        tintColor={colors.primary}
                    />
                }>
                {/* ─── Render data here ─── */}
                <Text style={styles.title}>{data?.message || 'No data'}</Text>
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

    // Center states (loading / error)
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: moderateSize(40),
    },
    loadingText: {
        marginTop: moderateSize(16),
        fontSize: moderateSize(16),
        color: colors.textSecondary,
    },
    errorTitle: {
        marginTop: moderateSize(16),
        fontSize: moderateSize(20),
        fontWeight: '700',
        color: colors.textPrimary,
    },
    errorMessage: {
        marginTop: moderateSize(8),
        fontSize: moderateSize(14),
        color: colors.textSecondary,
        textAlign: 'center',
    },
    retryButton: {
        marginTop: moderateSize(24),
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary,
        paddingVertical: moderateSize(12),
        paddingHorizontal: moderateSize(24),
        borderRadius: moderateSize(8),
    },
    retryIcon: {
        marginRight: moderateSize(8),
    },
    retryButtonText: {
        fontSize: moderateSize(16),
        fontWeight: '600',
        color: colors.white,
    },

    // Content
    title: {
        fontSize: moderateSize(20),
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: moderateSize(8),
    },
});
