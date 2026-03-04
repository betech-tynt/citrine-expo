import React from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import Header from '../../../../components/Header';
import confirmProfileImage from '../../../../assets/images/backgrounds/confirm-profile.jpg';
import ProfileSummaryCard from '../../../../components/ProfileSummaryCard';
import Button from '../../../../components/Button';
import { moderateSize } from '../../../../styles/moderateSize';
import colors from '../../../../constants/colors';
import { commonStyles } from '../../../../theme/commonStyles';

export default function ConfirmProfileScreen() {
    const profileData = [
        { label: 'Username', value: 'Test' },
        { label: 'Last Name (Kanji)', value: '山田' },
        { label: 'First Name (Kanji)', value: '伊之助' },
        { label: 'Last Name (Katakana)', value: 'ヤマダ' },
        { label: 'First Name (Katakana)', value: 'イノスケ' },
        { label: 'Phone', value: '0947930370' },
        { label: 'Gender', value: 'Male' },
        { label: 'Birthday', value: '30/07/1990' },
    ];

    const handleEdit = () => {
        // TODO: navigate to edit profile
        // placeholder handler
        console.log('Edit profile pressed');
    };

    const handleContinue = () => {
        // TODO: navigate to next signup step
        console.log('Continue pressed');
    };

    return (
        <View style={styles.container}>
            <Header title="Profile" showCrudText={false} />
            <View style={[commonStyles.main, styles.backgroundColor]}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}>
                    <View>
                        <Image
                            source={confirmProfileImage}
                            style={styles.confirmProfileImage}
                        />
                    </View>

                    {/* Profile Summary Card */}
                    <ProfileSummaryCard
                        data={profileData}
                        labelColor={colors.textPrimary}
                        labelFontWeight="bold"
                        valueColor={colors.primary}
                        isLast={true}
                    />

                    <View style={styles.buttonContainer}>
                        <Button
                            title="Edit"
                            onPress={handleEdit}
                            style={[styles.actionButton, styles.editButton]}
                        />
                        <Button
                            title="Continue"
                            onPress={handleContinue}
                            style={styles.actionButton}
                        />
                    </View>
                </ScrollView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    backgroundColor: {
        backgroundColor: colors.white,
    },
    scrollContent: {
        paddingTop: moderateSize(8),
        paddingBottom: moderateSize(16),
    },
    confirmProfileImage: {
        width: '100%',
        height: moderateSize(210),
    },
    buttonContainer: {
        marginTop: moderateSize(15),
        gap: moderateSize(10),
        paddingHorizontal: moderateSize(10),
    },
    editButton: {
        backgroundColor: colors.secondary,
    },
});
