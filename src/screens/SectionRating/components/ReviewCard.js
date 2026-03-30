import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import PropTypes from 'prop-types';
import CustomIcon from '../../../components/CustomIcon';
import FaIcon from '../../../components/FaIcon';
import StarRating from '../../../components/StarRating';
import colors from '../../../constants/colors';
import { moderateSize } from '../../../styles/moderateSize';
import { customerReviewVote } from '../../../services/apiCustomerReviewVote';

const ReviewCard = React.memo(function ReviewCardComponent({ item, t }) {
    const [voted, setVoted] = useState(item.voted);
    const [helpfulCount, setHelpfulCount] = useState(item.helpfulCount);
    const [isVoting, setIsVoting] = useState(false);
    const mountedRef = useRef(true);

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);

    // Sync from parent if list reloads
    useEffect(() => {
        setVoted(item.voted);
        setHelpfulCount(item.helpfulCount);
    }, [item.voted, item.helpfulCount]);

    const handleLikePress = async () => {
        if (isVoting) return;

        const prevVoted = voted;
        const prevCount = helpfulCount;

        // Optimistic update
        const newVoted = !voted;
        setVoted(newVoted);
        setHelpfulCount(Math.max(0, prevCount + (newVoted ? 1 : -1)));
        setIsVoting(true);

        try {
            const result = await customerReviewVote(item.id);
            if (mountedRef.current) {
                setVoted(result.voted);
                setHelpfulCount(result.count);
            }
        } catch (error) {
            if (mountedRef.current) {
                setVoted(prevVoted);
                setHelpfulCount(prevCount);
                Alert.alert(
                    t('common.error'),
                    error?.message || t('common.error'),
                );
            }
        } finally {
            if (mountedRef.current) {
                setIsVoting(false);
            }
        }
    };

    return (
        <View style={styles.reviewCard}>
            {/* Header row */}
            <View style={styles.reviewHeader}>
                <View style={styles.reviewerInfo}>
                    <Text style={styles.reviewerName}>{item.reviewerName}</Text>
                    {item.roomTypes && item.roomTypes.length > 0 && (
                        <Text style={styles.roomType}>
                            {item.roomTypes.map(rt => rt.name).join(', ')}
                        </Text>
                    )}
                    <View style={styles.starsRow}>
                        <StarRating rating={item.averageRating} />
                    </View>
                </View>
                <Text style={styles.reviewDate}>{item.date}</Text>
            </View>

            {/* Criteria grid */}
            <View style={styles.criteriaGrid}>
                {item.criteria && item.criteria.map(criterion => (
                    <View key={criterion.id} style={styles.criteriaItem}>
                        <FaIcon
                            icon={criterion.icon || 'fa-solid fa-star'}
                            size={moderateSize(13)}
                            color={colors.primary}
                        />
                        <Text style={styles.criteriaLabel}>
                            {criterion.name}
                        </Text>
                        <Text style={styles.criteriaValue}>
                            {criterion.value}
                        </Text>
                    </View>
                ))}
            </View>

            {/* Comment */}
            <Text style={styles.reviewComment}>{item.comment}</Text>

            {/* Like button + helpful count */}
            <View style={styles.reviewFooter}>
                <TouchableOpacity
                    style={styles.likeBtn}
                    onPress={handleLikePress}
                    disabled={isVoting}
                    activeOpacity={0.7}>
                    <CustomIcon
                        type="FontAwesome"
                        name="thumbs-up"
                        size={moderateSize(15)}
                        color={voted ? '#2E7D32' : '#aaa'}
                    />
                </TouchableOpacity>
                {helpfulCount > 0 && (
                    <Text style={styles.helpfulCount}>
                        {t('sectionRating.helpful', { count: helpfulCount })}
                    </Text>
                )}
            </View>
        </View>
    );
});

ReviewCard.propTypes = {
    item: PropTypes.shape({
        id: PropTypes.string.isRequired,
        reviewerName: PropTypes.string,
        roomTypes: PropTypes.arrayOf(
            PropTypes.shape({
                id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
                name: PropTypes.string,
            }),
        ),
        averageRating: PropTypes.number,
        criteria: PropTypes.arrayOf(
            PropTypes.shape({
                id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
                name: PropTypes.string,
                icon: PropTypes.string,
                value: PropTypes.number,
            }),
        ),
        comment: PropTypes.string,
        helpfulCount: PropTypes.number,
        voted: PropTypes.bool,
        date: PropTypes.string,
    }).isRequired,
    t: PropTypes.func.isRequired,
};

const styles = StyleSheet.create({
    reviewCard: {
        backgroundColor: colors.white,
        borderRadius: moderateSize(12),
        padding: moderateSize(15),
        shadowColor: colors.black,
        shadowOpacity: 0.05,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 1 },
        elevation: 1,
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: moderateSize(8),
    },
    reviewerInfo: {
        flex: 1,
    },
    reviewerName: {
        fontWeight: '600',
        color: '#333',
        fontSize: moderateSize(13),
        marginBottom: moderateSize(2),
    },
    roomType: {
        fontSize: moderateSize(11),
        color: colors.textSecondary,
        marginBottom: moderateSize(4),
    },
    starsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: moderateSize(6),
    },
    reviewDate: {
        fontSize: moderateSize(11),
        color: colors.textSecondary,
        marginLeft: moderateSize(8),
    },
    criteriaGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: moderateSize(8),
        paddingVertical: moderateSize(10),
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#f0f0f0',
        marginBottom: moderateSize(10),
    },
    criteriaItem: {
        width: '47%',
        flexDirection: 'row',
        alignItems: 'center',
        gap: moderateSize(5),
    },
    criteriaLabel: {
        flex: 1,
        fontSize: moderateSize(11),
        color: '#666',
    },
    criteriaValue: {
        fontWeight: '600',
        color: '#FFB800',
        fontSize: moderateSize(12),
    },
    reviewComment: {
        color: '#333',
        fontSize: moderateSize(12),
        lineHeight: moderateSize(18),
        marginBottom: moderateSize(8),
    },
    reviewFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: moderateSize(8),
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    likeBtn: {
        padding: moderateSize(4),
    },
    helpfulCount: {
        color: '#2E7D32',
        fontSize: moderateSize(12),
        fontWeight: '500',
        marginLeft: moderateSize(6),
    },
});

export default ReviewCard;
