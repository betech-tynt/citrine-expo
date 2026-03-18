import React, { memo } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import CustomIcon from './CustomIcon';
import StarRating from './StarRating';
import colors from '../constants/colors';
import { RoomItemPropTypes } from '../utils/propTypes';
import { moderateSize } from '../styles/moderateSize';

/**
 * @typedef {Object} Room
 * @property {number|string} id
 * @property {string=} name
 * @property {string=} nameEn
 * @property {string=} nameJp
 * @property {string=} address
 * @property {string=} addressEn
 * @property {string=} addressJp
 * @property {string=} price
 * @property {string=} priceEn
 * @property {string=} priceJp
 * @property {number=} rating
 * @property {number|string=} reviews
 * @property {string|null|undefined=} image
 * @property {string=} category
 */

/**
 * @param {{ room: Room, language: string }} props
 */
const RoomItemComponent = ({ room, language }) => {
    const { t, i18n } = useTranslation();
    const currentLanguage = language || i18n.language;

    const getLocalizedField = (baseKey) => {
        if (currentLanguage === 'en')
            return room[`${baseKey}En`] || room[baseKey];
        if (currentLanguage === 'jp')
            return room[`${baseKey}Jp`] || room[baseKey];
        return room[baseKey];
    };

    const roomName = getLocalizedField('name');
    const address = getLocalizedField('address');
    const price = getLocalizedField('price');

    return (
        <View style={styles.roomCard}>
            <View style={styles.roomImageContainer}>
                {room.image ? (
                    <Image
                        source={{ uri: room.image }}
                        style={styles.roomImage}
                    />
                ) : (
                    <View style={styles.roomImagePlaceholder}>
                        <CustomIcon
                            type="FontAwesome"
                            name="image"
                            size={moderateSize(40)}
                            color={colors.grey}
                        />
                    </View>
                )}
            </View>
            <View style={styles.roomInfo}>
                <Text style={styles.roomName}>{roomName}</Text>
                <View style={styles.locationContainer}>
                    <CustomIcon
                        type="FontAwesome"
                        name="map-marker"
                        size={moderateSize(12)}
                        color={colors.textSecondary}
                    />
                    <Text style={styles.roomAddress}>{address}</Text>
                </View>
                <Text style={styles.roomPrice}>
                    {price}/{t('customerSearch.perNight')}
                </Text>
                <View style={styles.ratingContainer}>
                    <StarRating
                        rating={Number(room.rating || 0)}
                        countText={`(${room.reviews || 0})`}
                        size={moderateSize(12)}
                    />
                </View>
            </View>
        </View>
    );
};

const RoomItem = memo(RoomItemComponent);

RoomItemComponent.propTypes = RoomItemPropTypes;
RoomItem.propTypes = RoomItemPropTypes;

const styles = StyleSheet.create({
    roomCard: {
        backgroundColor: colors.white,
        borderRadius: moderateSize(15),
        marginBottom: moderateSize(15),
        flexDirection: 'row',
        shadowColor: colors.black,
        shadowOffset: {
            width: 0,
            height: moderateSize(2),
        },
        shadowOpacity: 0.1,
        shadowRadius: moderateSize(4),
        elevation: moderateSize(3),
        overflow: 'hidden',
    },
    roomImageContainer: {
        width: moderateSize(120),
        height: moderateSize(120),
    },
    roomImage: {
        width: '100%',
        height: '100%',
    },
    roomImagePlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: colors.grey,
        justifyContent: 'center',
        alignItems: 'center',
    },
    roomInfo: {
        flex: 1,
        padding: moderateSize(15),
        justifyContent: 'center',
    },
    roomName: {
        fontSize: moderateSize(16),
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: moderateSize(5),
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: moderateSize(5),
    },
    roomAddress: {
        fontSize: moderateSize(12),
        color: colors.textSecondary,
        marginLeft: moderateSize(4),
    },
    roomPrice: {
        fontSize: moderateSize(14),
        color: colors.primary,
        fontWeight: 'bold',
        marginBottom: moderateSize(5),
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    reviewsText: {
        fontSize: moderateSize(12),
        color: colors.textSecondary,
        marginLeft: moderateSize(4),
    },
});

export default RoomItem;
