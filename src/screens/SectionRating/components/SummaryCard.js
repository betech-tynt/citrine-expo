import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import PropTypes from 'prop-types';
import StarRating from '../../../components/StarRating';
import FaIcon from '../../../components/FaIcon';
import colors from '../../../constants/colors';
import { moderateSize } from '../../../styles/moderateSize';

const SummaryCard = ({ loading, error, summary, t }) => {
    if (loading) {
        return (
            <View style={[styles.summaryCard, styles.loadingContainer]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (!summary) return null;

    return (
        <View>
            <View style={styles.summaryCard}>
                <Text style={styles.overallRating}>
                    {summary.overallRating.toFixed(1)}
                </Text>
                <Text style={styles.allRatingsText}>
                    {t('sectionRating.allRatingsPublic')}
                </Text>
                <View style={styles.starsRow}>
                    <StarRating
                        rating={Number(summary.overallRating.toFixed(1))}
                        size={moderateSize(16)}
                    />
                </View>
                <Text style={styles.reviewCount}>
                    {t('sectionRating.basedOn', { count: summary.reviewCount })}
                </Text>

                {/* Breakdown */}
                <View style={styles.breakdown}>
                    {summary.breakdown.map(breakdownItem => (
                        <View
                            key={breakdownItem.id}
                            style={styles.breakdownItem}>
                            <View style={styles.breakdownLabel}>
                                <FaIcon
                                    icon={
                                        breakdownItem.icon || 'fa-solid fa-star'
                                    }
                                    size={moderateSize(13)}
                                    color={colors.primary}
                                    style={styles.breakdownIcon}
                                />
                                <Text style={styles.breakdownLabelText}>
                                    {breakdownItem.name}
                                </Text>
                            </View>
                            <View style={styles.breakdownBar}>
                                <View
                                    style={[
                                        styles.breakdownBarFill,
                                        {
                                            width: `${
                                                (breakdownItem.score / 5) * 100
                                            }%`,
                                        },
                                    ]}
                                />
                            </View>
                            <Text style={styles.breakdownValue}>
                                {breakdownItem.score.toFixed(1)}
                            </Text>
                        </View>
                    ))}
                </View>
            </View>
            {error && (
                <View style={styles.summaryErrorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            )}
        </View>
    );
};

SummaryCard.propTypes = {
    loading: PropTypes.bool.isRequired,
    error: PropTypes.string,
    summary: PropTypes.shape({
        overallRating: PropTypes.number,
        reviewCount: PropTypes.number,
        breakdown: PropTypes.arrayOf(
            PropTypes.shape({
                id: PropTypes.number,
                name: PropTypes.string,
                icon: PropTypes.string,
                score: PropTypes.number,
            }),
        ),
    }),
    t: PropTypes.func.isRequired,
};

const styles = StyleSheet.create({
    summaryCard: {
        backgroundColor: colors.white,
        borderRadius: moderateSize(15),
        padding: moderateSize(20),
        marginBottom: moderateSize(20),
        alignItems: 'center',
        shadowColor: colors.black,
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    loadingContainer: {
        paddingVertical: moderateSize(40),
        alignItems: 'center',
    },
    summaryErrorContainer: {
        marginBottom: moderateSize(12),
        alignItems: 'center',
    },
    overallRating: {
        fontSize: moderateSize(48),
        fontWeight: 'bold',
        color: '#FFB800',
        marginBottom: moderateSize(4),
    },
    allRatingsText: {
        fontSize: moderateSize(13),
        color: colors.textPrimary,
        marginBottom: moderateSize(8),
    },
    starsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: moderateSize(6),
    },
    reviewCount: {
        fontSize: moderateSize(12),
        color: colors.textSecondary,
        marginBottom: moderateSize(14),
    },
    breakdown: {
        width: '100%',
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: moderateSize(14),
    },
    breakdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        height: moderateSize(32),
    },
    breakdownLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        width: moderateSize(120),
    },
    breakdownIcon: {
        marginRight: moderateSize(6),
        width: moderateSize(16),
    },
    breakdownLabelText: {
        fontSize: moderateSize(12),
        color: '#333',
        flexShrink: 1,
    },
    breakdownBar: {
        flex: 1,
        height: moderateSize(6),
        backgroundColor: '#eee',
        borderRadius: moderateSize(3),
        marginHorizontal: moderateSize(10),
        overflow: 'hidden',
    },
    breakdownBarFill: {
        height: '100%',
        backgroundColor: '#FFB800',
        borderRadius: moderateSize(3),
    },
    breakdownValue: {
        fontWeight: 'bold',
        color: '#333',
        fontSize: moderateSize(12),
        minWidth: moderateSize(28),
        textAlign: 'right',
    },
    errorText: {
        fontSize: moderateSize(13),
        color: colors.textSecondary,
        textAlign: 'center',
    },
});

export default React.memo(SummaryCard);
