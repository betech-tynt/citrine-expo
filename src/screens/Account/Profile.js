import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import colors from '../../constants/colors';
import { moderateSize } from '../../styles/moderateSize';
import userImage from '../../assets/images/user-default.png';
import { AccountProfilePropTypes } from '../../utils/propTypes';
import { formatDate } from '../../utils/formatDate';

const Profile = ({
    t,
    userData,
    userPhoto,
    backgroundImage,
    onPressAvatar,
    onPressBackground,
    onPressEditProfile,
}) => {
    return (
        <>
            {/* Background Image */}
            <TouchableOpacity
                onPress={onPressBackground}
                style={styles.backgroundImageContainer}>
                {backgroundImage ? (
                    <Image
                        source={{ uri: backgroundImage }}
                        style={styles.backgroundImage}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={styles.backgroundImagePlaceholder}>
                        <Icon name="image" size={40} color={colors.primary} />
                    </View>
                )}
                <View style={styles.backgroundImageEditButton}>
                    <Icon name="camera" size={16} color="white" />
                </View>
            </TouchableOpacity>

            {/* Avatar Container */}
            <View style={styles.usernameContainer}>
                <TouchableOpacity
                    onPress={onPressAvatar}
                    style={styles.avatarTouchable}>
                    <Image
                        source={userPhoto ? { uri: userPhoto } : userImage}
                        style={styles.userImage}
                    />
                    <View style={styles.cameraIconContainer}>
                        <Icon
                            name="camera"
                            size={16}
                            color="white"
                            style={styles.cameraIcon}
                        />
                    </View>
                </TouchableOpacity>
            </View>

            <View style={styles.userInfoSection}>
                <Text style={styles.userName}>{userData.name}</Text>

                <View style={styles.badgeActionRow}>
                    <View style={styles.roleBadge}>
                        <Text style={styles.roleText}>
                            {userData.role?.name}
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={onPressEditProfile}>
                        <Text style={styles.editButtonText}>
                            {t('profile.editProfile')}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Personal Information Card */}
            <View style={styles.contentCard}>
                <Text style={styles.sectionTitle}>
                    {t('profile.personalInfo')}
                </Text>

                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>{t('profile.name')}</Text>
                    <Text style={styles.infoValue}>{userData.name}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>
                        {t('profile.username')}
                    </Text>
                    <Text style={styles.infoValue}>{userData.username}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>{t('profile.email')}</Text>
                    <Text style={styles.infoValue}>{userData.email}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>{t('profile.address')}</Text>
                    <Text style={styles.infoValue}>{userData.address}</Text>
                </View>

                <View style={[styles.infoRow, styles.lastInfoRow]}>
                    <Text style={styles.infoLabel}>{t('profile.dob')}</Text>
                    <Text style={styles.infoValue}>
                        {formatDate(userData.dob)}
                    </Text>
                </View>
            </View>
        </>
    );
};

Profile.propTypes = AccountProfilePropTypes;

const styles = StyleSheet.create({
    backgroundImageContainer: {
        width: '100%',
        height: moderateSize(150),
        position: 'relative',
        backgroundColor: colors.primary,
        borderRadius: moderateSize(20),
        overflow: 'hidden',
        marginBottom: moderateSize(70),
    },
    backgroundImage: {
        width: '100%',
        height: '100%',
    },
    backgroundImagePlaceholder: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.borderColorGrey02,
    },
    backgroundImageEditButton: {
        position: 'absolute',
        top: moderateSize(10),
        right: moderateSize(10),
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: moderateSize(15),
        width: moderateSize(30),
        height: moderateSize(30),
        justifyContent: 'center',
        alignItems: 'center',
    },
    usernameContainer: {
        alignItems: 'center',
        marginBottom: moderateSize(10),
        marginTop: -moderateSize(120),
        position: 'relative',
        zIndex: 10,
    },
    avatarTouchable: {
        position: 'relative',
    },
    userImage: {
        width: moderateSize(100),
        height: moderateSize(100),
        borderRadius: moderateSize(50),
        borderWidth: moderateSize(4),
        borderColor: 'white',
    },
    cameraIconContainer: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: colors.primary,
        borderRadius: moderateSize(15),
        width: moderateSize(30),
        height: moderateSize(30),
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'white',
    },
    cameraIcon: {
        margin: 0,
    },
    userInfoSection: {
        width: '100%',
        alignItems: 'center',
    },
    userName: {
        fontSize: moderateSize(22),
        fontWeight: 'bold',
        color: '#333',
        marginBottom: moderateSize(15),
    },
    badgeActionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: moderateSize(10),
    },
    roleBadge: {
        backgroundColor: '#F0F0F0',
        paddingHorizontal: moderateSize(15),
        paddingVertical: moderateSize(8),
        borderRadius: moderateSize(20),
    },
    roleText: {
        color: '#888',
        fontSize: moderateSize(14),
    },
    editButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: moderateSize(25),
        paddingVertical: moderateSize(10),
        borderRadius: moderateSize(20),
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    editButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: moderateSize(15),
    },
    contentCard: {
        width: '100%',
        backgroundColor: 'white',
        borderRadius: moderateSize(20),
        marginTop: moderateSize(20),
        marginHorizontal: moderateSize(2),
        marginVertical: moderateSize(5),
        paddingTop: moderateSize(10),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: moderateSize(18),
        fontWeight: 'bold',
        color: '#333',
        padding: moderateSize(10),
        paddingHorizontal: moderateSize(20),
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    infoRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: moderateSize(15),
        paddingHorizontal: moderateSize(20),
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    lastInfoRow: {
        borderBottomWidth: 0,
    },
    infoLabel: {
        color: '#666',
        fontSize: moderateSize(14),
        flexBasis: '35%',
    },
    infoValue: {
        color: '#333',
        fontWeight: '500',
        fontSize: moderateSize(14),
        textAlign: 'right',
        flex: 1,
        flexWrap: 'wrap',
    },
});

export default Profile;
