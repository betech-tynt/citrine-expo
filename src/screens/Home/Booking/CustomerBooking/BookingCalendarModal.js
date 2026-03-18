import React from 'react';
import { Modal, View, Text, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';
import Button from '../../../../components/Button';
import { moderateSize } from '../../../../styles';
import colors from '../../../../constants/colors';
import { useTranslation } from 'react-i18next';
import { BookingCalendarModalPropTypes } from '../../../../utils/propTypes';

/**
 * Generic calendar modal for selecting a single date
 * @param {Object} props
 * @param {boolean} props.visible
 * @param {'checkIn'|'checkOut'} props.mode
 * @param {string} props.tempISO
 * @param {function(string)} props.onChangeTempISO
 * @param {function} props.onCancel
 * @param {function} props.onConfirm
 */
function BookingCalendarModal({
    visible,
    mode,
    tempISO,
    onChangeTempISO,
    onCancel,
    onConfirm,
}) {
    const { t } = useTranslation();

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onCancel}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalCard}>
                    <Text style={styles.modalTitle}>
                        {mode === 'checkIn'
                            ? t('booking.checkIn')
                            : t('booking.checkOut')}
                    </Text>

                    <Calendar
                        onDayPress={day => onChangeTempISO(day.dateString)}
                        markedDates={
                            tempISO
                                ? {
                                      [tempISO]: {
                                          selected: true,
                                          selectedColor: colors.primary,
                                      },
                                  }
                                : {}
                        }
                        theme={{
                            selectedDayBackgroundColor: colors.primary,
                            todayTextColor: colors.primary,
                            arrowColor: colors.primary,
                        }}
                    />

                    <View style={styles.modalActions}>
                        <Button
                            title={t('common.cancel')}
                            onPress={onCancel}
                            style={[
                                styles.modalButton,
                                styles.modalButtonSecondary,
                            ]}
                            textStyle={styles.modalButtonSecondaryText}
                        />
                        <Button
                            title={t('common.ok')}
                            onPress={onConfirm}
                            style={styles.modalButton}
                            disabled={!tempISO}
                        />
                    </View>
                </View>
            </View>
        </Modal>
    );
}

BookingCalendarModal.propTypes = BookingCalendarModalPropTypes;

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center',
        padding: moderateSize(16),
    },
    modalCard: {
        backgroundColor: colors.white,
        borderRadius: moderateSize(16),
        padding: moderateSize(14),
    },
    modalTitle: {
        fontSize: moderateSize(14),
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: moderateSize(10),
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: moderateSize(12),
    },
    modalButton: {
        width: '48%',
        padding: moderateSize(12),
        borderRadius: moderateSize(14),
    },
    modalButtonSecondary: {
        backgroundColor: colors.surfaceSoft,
    },
    modalButtonSecondaryText: {
        color: colors.primary,
        fontWeight: '700',
    },
});

export default BookingCalendarModal;
