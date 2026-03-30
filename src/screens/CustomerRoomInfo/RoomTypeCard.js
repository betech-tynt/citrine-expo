import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { moderateSize } from '../../styles/moderateSize';
import colors from '../../constants/colors';
import { formatCurrency } from '../../utils/formatCurrency';

function RoomTypeCard({ roomType, onChoose, chooseLabel }) {
    const imgUrl = roomType?.images?.[0]?.url;

    return (
        <View style={styles.roomTypeCard}>
            {imgUrl ? (
                <Image
                    source={{ uri: imgUrl }}
                    resizeMode="cover"
                    style={styles.roomTypeImage}
                />
            ) : (
                <View style={styles.roomTypeImagePlaceholder} />
            )}

            <View style={styles.roomTypeInfo}>
                <Text style={styles.roomTypeName} numberOfLines={1}>
                    {roomType?.name || ''}
                </Text>
                <Text style={styles.roomTypeDesc} numberOfLines={2}>
                    {roomType?.description || ''}
                </Text>

                <View style={styles.roomTypeFooter}>
                    <Text style={styles.roomTypePrice}>
                        {formatCurrency(roomType?.price)}
                    </Text>
                    {(() => {
                        const isDisabled = roomType?.available_rooms === 0;
                        return (
                            <TouchableOpacity
                                disabled={isDisabled}
                                onPress={onChoose}
                                activeOpacity={0.85}
                                style={[
                                    styles.roomTypeChooseBtn,
                                    isDisabled &&
                                        styles.roomTypeChooseBtnDisabled,
                                ]}>
                                <Text
                                    style={[
                                        styles.roomTypeChooseText,
                                        isDisabled &&
                                            styles.roomTypeChooseTextDisabled,
                                    ]}>
                                    {chooseLabel}
                                </Text>
                            </TouchableOpacity>
                        );
                    })()}
                </View>
            </View>
        </View>
    );
}

RoomTypeCard.propTypes = {
    roomType: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
            .isRequired,
        name: PropTypes.string,
        description: PropTypes.string,
        price: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        images: PropTypes.arrayOf(
            PropTypes.shape({
                url: PropTypes.string,
            }),
        ),
        available_rooms: PropTypes.number,
    }).isRequired,
    onChoose: PropTypes.func.isRequired,
    chooseLabel: PropTypes.string.isRequired,
};

const styles = StyleSheet.create({
    roomTypeCard: {
        backgroundColor: colors.white,
        borderRadius: moderateSize(14),
        overflow: 'hidden',
        shadowColor: colors.black,
        shadowOpacity: 0.06,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    roomTypeImage: {
        width: '100%',
        height: moderateSize(140),
        backgroundColor: colors.background,
    },
    roomTypeImagePlaceholder: {
        width: '100%',
        height: moderateSize(140),
        backgroundColor: colors.background,
    },
    roomTypeInfo: {
        padding: moderateSize(14),
    },
    roomTypeName: {
        color: colors.textPrimary,
        fontSize: moderateSize(14),
        fontWeight: '800',
        marginBottom: moderateSize(6),
    },
    roomTypeDesc: {
        color: colors.textSecondary,
        fontSize: moderateSize(12),
        fontWeight: '500',
        lineHeight: moderateSize(16),
        marginBottom: moderateSize(10),
    },
    roomTypeFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    roomTypePrice: {
        color: colors.primary,
        fontSize: moderateSize(14),
        fontWeight: '800',
    },
    roomTypeChooseBtn: {
        backgroundColor: '#E8E7F9',
        paddingVertical: moderateSize(8),
        paddingHorizontal: moderateSize(14),
        borderRadius: moderateSize(10),
    },
    roomTypeChooseBtnDisabled: {
        backgroundColor: '#F5F5F5',
        opacity: 0.6,
    },
    roomTypeChooseText: {
        color: colors.primary,
        fontSize: moderateSize(12),
        fontWeight: '700',
    },
    roomTypeChooseTextDisabled: {
        color: colors.textSecondary,
    },
});

export default RoomTypeCard;
