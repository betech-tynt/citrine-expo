import React, { useMemo, useState, useCallback } from 'react';
import {
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Calendar } from 'react-native-calendars';
import colors from '../../constants/colors';
import { moderateSize } from '../../styles';
import CustomIcon from '../CustomIcon';
import { CustomerSearchFilterModalPropTypes } from '../../utils/propTypes';
import { formatDate } from '../../utils/formatDate';

const pad2 = n => String(n).padStart(2, '0');

const toISO = d => {
    if (!(d instanceof Date)) return '';
    const yyyy = d.getFullYear();
    const mm = pad2(d.getMonth() + 1);
    const dd = pad2(d.getDate());
    return `${yyyy}-${mm}-${dd}`;
};

const todayISO = toISO(new Date());

const safeParseISODate = iso => {
    if (!iso || typeof iso !== 'string') return null;
    const d = new Date(`${iso}T00:00:00`);
    return Number.isNaN(d.getTime()) ? null : d;
};

const addDaysISO = (iso, days) => {
    const base = iso ? new Date(iso) : new Date();
    const d = new Date(base);
    d.setDate(d.getDate() + days);
    return toISO(d);
};

/**
 * Props:
 * - visible: boolean
 * - filter: { checkInISO: string, checkOutISO: string, adults: number, children: number }
 * - onChange: (nextFilter) => void
 * - onClose: () => void
 * - onApply: () => void
 */
export default function CustomerSearchFilterModal({
    visible,
    filter,
    onChange,
    onClose,
    onApply,
}) {
    const { t } = useTranslation();

    const [calendarVisible, setCalendarVisible] = useState(false);
    const [calendarField, setCalendarField] = useState('checkIn');
    const [calendarTempISO, setCalendarTempISO] = useState('');

    // Default adults to 1 if invalid
    React.useEffect(() => {
        if ((filter.adults ?? 0) <= 0) {
            onChange({ ...filter, adults: 1 });
        }
    }, [filter.adults, filter, onChange]);

    const openCalendar = useCallback(
        field => {
            let initialISO =
                (field === 'checkIn'
                    ? filter.checkInISO
                    : filter.checkOutISO) || toISO(new Date());
            if (initialISO < todayISO) {
                initialISO = todayISO;
            }
            setCalendarTempISO(initialISO);
            setCalendarField(field);
            setCalendarVisible(true);
        },
        [filter.checkInISO, filter.checkOutISO],
    );

    const closeCalendar = useCallback(() => {
        setCalendarVisible(false);
    }, []);

    const confirmCalendar = useCallback(() => {
        if (!calendarTempISO || calendarTempISO < todayISO) {
            alert(
                'Cannot select past dates for check-in/out. Please choose today or future date.',
            );
            closeCalendar();
            return;
        }

        const next = { ...filter };
        if (calendarField === 'checkIn') {
            next.checkInISO = calendarTempISO;
            // Auto-set check-out = check-in +1 if empty or invalid
            const start = safeParseISODate(next.checkInISO);
            if (
                !next.checkOutISO ||
                !start ||
                safeParseISODate(next.checkOutISO) <= start
            ) {
                next.checkOutISO = addDaysISO(calendarTempISO, 1);
            }
        } else {
            next.checkOutISO = calendarTempISO;
            if (next.checkInISO) {
                const start = safeParseISODate(next.checkInISO);
                const end = safeParseISODate(next.checkOutISO);
                if (start && end && end < start) {
                    const tmp = next.checkInISO;
                    next.checkInISO = next.checkOutISO;
                    next.checkOutISO = tmp;
                }
            }
        }

        onChange(next);
        closeCalendar();
    }, [calendarTempISO, calendarField, filter, onChange, closeCalendar]);

    const dec = useCallback(
        key => {
            const current = Number(filter?.[key] ?? 0);
            const nextVal =
                key === 'adults'
                    ? Math.max(1, current - 1)
                    : Math.max(0, current - 1);
            onChange({ ...filter, [key]: nextVal });
        },
        [filter, onChange],
    );

    const inc = useCallback(
        key => {
            const current = Number(filter?.[key] ?? 0);
            onChange({ ...filter, [key]: current + 1 });
        },
        [filter, onChange],
    );

    const checkInDisplay = useMemo(
        () => formatDate(filter.checkInISO),
        [filter.checkInISO],
    );
    const checkOutDisplay = useMemo(
        () => formatDate(filter.checkOutISO),
        [filter.checkOutISO],
    );

    return (
        <>
            <Modal
                visible={visible}
                transparent
                animationType="fade"
                onRequestClose={onClose}>
                <Pressable style={styles.backdrop} onPress={onClose} />

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={styles.sheetWrap}>
                    <View style={styles.sheet}>
                        <View style={styles.sheetHeader}>
                            <Text style={styles.sheetTitle}>
                                {t('citrine.msg000323')}
                            </Text>
                            <TouchableOpacity
                                onPress={onClose}
                                style={styles.closeBtn}
                                activeOpacity={0.8}>
                                <CustomIcon
                                    type="AntDesign"
                                    name="close"
                                    size={18}
                                    color={colors.grey1}
                                />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.content}>
                            <Text style={styles.groupLabel}>
                                {t('citrine.msg000324')}
                            </Text>
                            <View style={styles.dateRow}>
                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    style={styles.dateInput}
                                    onPress={() => openCalendar('checkIn')}>
                                    <Text
                                        style={[
                                            styles.dateText,
                                            !checkInDisplay &&
                                                styles.placeholderText,
                                        ]}>
                                        {checkInDisplay || 'dd/mm/yyyy'}
                                    </Text>
                                    <CustomIcon
                                        type="FontAwesome5"
                                        name="calendar-alt"
                                        size={16}
                                        color={colors.textSecondary}
                                    />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    style={styles.dateInput}
                                    onPress={() => openCalendar('checkOut')}>
                                    <Text
                                        style={[
                                            styles.dateText,
                                            !checkOutDisplay &&
                                                styles.placeholderText,
                                        ]}>
                                        {checkOutDisplay || 'dd/mm/yyyy'}
                                    </Text>
                                    <CustomIcon
                                        type="FontAwesome5"
                                        name="calendar-alt"
                                        size={16}
                                        color={colors.textSecondary}
                                    />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.group}>
                                <Text style={styles.groupLabel}>
                                    {t('citrine.msg000325')}
                                </Text>
                                <View style={styles.counterRow}>
                                    <TouchableOpacity
                                        onPress={() => dec('adults')}
                                        style={styles.counterBtn}
                                        activeOpacity={0.8}>
                                        <Text style={styles.counterBtnText}>
                                            −
                                        </Text>
                                    </TouchableOpacity>
                                    <Text style={styles.counterValue}>
                                        {filter.adults ?? 1}
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => inc('adults')}
                                        style={styles.counterBtn}
                                        activeOpacity={0.8}>
                                        <Text style={styles.counterBtnText}>
                                            +
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={styles.group}>
                                <Text style={styles.groupLabel}>
                                    {t('citrine.msg000326')}
                                </Text>
                                <View style={styles.counterRow}>
                                    <TouchableOpacity
                                        onPress={() => dec('children')}
                                        style={styles.counterBtn}
                                        activeOpacity={0.8}>
                                        <Text style={styles.counterBtnText}>
                                            −
                                        </Text>
                                    </TouchableOpacity>
                                    <Text style={styles.counterValue}>
                                        {filter.children ?? 0}
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => inc('children')}
                                        style={styles.counterBtn}
                                        activeOpacity={0.8}>
                                        <Text style={styles.counterBtnText}>
                                            +
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={styles.actionsRow}>
                                <TouchableOpacity
                                    style={[
                                        styles.actionBtn,
                                        styles.actionBtnCancel,
                                    ]}
                                    onPress={onClose}
                                    activeOpacity={0.85}>
                                    <Text style={styles.actionCancelText}>
                                        {t('common.cancel')}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.actionBtn,
                                        styles.actionBtnApply,
                                    ]}
                                    onPress={onApply}
                                    activeOpacity={0.85}>
                                    <Text style={styles.actionApplyText}>
                                        {t('citrine.msg000327')}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </KeyboardAvoidingView>

                {calendarVisible && (
                    <View
                        style={[
                            StyleSheet.absoluteFill,
                            { zIndex: 1000, elevation: 10 },
                        ]}>
                        <Pressable
                            style={styles.calendarBackdrop}
                            onPress={closeCalendar}
                        />
                        <View
                            style={styles.calendarCardWrap}
                            pointerEvents="box-none">
                            <View style={styles.calendarCard}>
                                <Text style={styles.calendarTitle}>
                                    {
                                        calendarField === 'checkIn'
                                            ? t('citrine.msg000324')
                                            : t(
                                                  'citrine.msg000328',
                                              ) /* Check-out label */
                                    }
                                </Text>
                                <Calendar
                                    minDate={todayISO}
                                    markedDates={
                                        calendarTempISO
                                            ? {
                                                  [calendarTempISO]: {
                                                      selected: true,
                                                      selectedColor:
                                                          colors.primary,
                                                  },
                                              }
                                            : {}
                                    }
                                    onDayPress={day =>
                                        setCalendarTempISO(day.dateString)
                                    }
                                    theme={{
                                        selectedDayBackgroundColor:
                                            colors.primary,
                                        todayTextColor: colors.primary,
                                        arrowColor: colors.primary,
                                    }}
                                />
                                <View style={styles.calendarActions}>
                                    <TouchableOpacity
                                        style={[
                                            styles.calendarBtn,
                                            styles.calendarBtnSecondary,
                                        ]}
                                        onPress={closeCalendar}
                                        activeOpacity={0.85}>
                                        <Text
                                            style={
                                                styles.calendarBtnSecondaryText
                                            }>
                                            {t('common.cancel')}
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[
                                            styles.calendarBtn,
                                            styles.calendarBtnPrimary,
                                        ]}
                                        onPress={confirmCalendar}
                                        activeOpacity={0.85}>
                                        <Text
                                            style={
                                                styles.calendarBtnPrimaryText
                                            }>
                                            {t('common.ok')}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                )}
            </Modal>
        </>
    );
}

CustomerSearchFilterModal.propTypes = CustomerSearchFilterModalPropTypes;

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
    },
    sheetWrap: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        maxHeight: '80%',
    },
    sheet: {
        backgroundColor: colors.white,
        borderTopLeftRadius: moderateSize(20),
        borderTopRightRadius: moderateSize(20),
        overflow: 'hidden',
        paddingBottom: Platform.OS === 'ios' ? moderateSize(16) : 0,
    },
    sheetHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: moderateSize(16),
        paddingVertical: moderateSize(12),
        borderBottomWidth: 1,
        borderBottomColor: colors.surfaceSoft,
    },
    sheetTitle: {
        fontSize: moderateSize(18),
        fontWeight: '700',
        color: colors.textPrimary,
    },
    closeBtn: {
        padding: moderateSize(6),
    },
    content: {
        padding: moderateSize(16),
    },
    group: {
        marginTop: moderateSize(18),
    },
    groupLabel: {
        fontSize: moderateSize(14),
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: moderateSize(10),
    },
    dateRow: {
        flexDirection: 'row',
        columnGap: moderateSize(10),
    },
    dateInput: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: moderateSize(10),
        paddingHorizontal: moderateSize(12),
        paddingVertical: moderateSize(12),
        backgroundColor: colors.white,
    },
    dateText: {
        fontSize: moderateSize(14),
        color: colors.textPrimary,
        fontWeight: '600',
    },
    placeholderText: {
        color: colors.textSecondary,
        fontWeight: '500',
    },
    counterRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        columnGap: moderateSize(14),
    },
    counterBtn: {
        width: moderateSize(38),
        height: moderateSize(38),
        borderRadius: moderateSize(19),
        backgroundColor: '#E8E7F9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    counterBtnText: {
        fontSize: moderateSize(18),
        fontWeight: '800',
        color: colors.primary,
        marginTop: -1,
    },
    counterValue: {
        minWidth: moderateSize(30),
        textAlign: 'center',
        fontSize: moderateSize(16),
        fontWeight: '800',
        color: colors.textPrimary,
    },
    actionsRow: {
        flexDirection: 'row',
        columnGap: moderateSize(12),
        marginTop: moderateSize(26),
    },
    actionBtn: {
        flex: 1,
        paddingVertical: moderateSize(14),
        borderRadius: moderateSize(10),
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionBtnCancel: {
        backgroundColor: colors.surfaceSoft,
    },
    actionBtnApply: {
        backgroundColor: colors.primary,
    },
    actionCancelText: {
        fontSize: moderateSize(16),
        fontWeight: '700',
        color: colors.textPrimary,
    },
    actionApplyText: {
        fontSize: moderateSize(16),
        fontWeight: '700',
        color: colors.white,
    },

    calendarBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
    },
    calendarCardWrap: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        justifyContent: 'center',
        padding: moderateSize(16),
    },
    calendarCard: {
        backgroundColor: colors.white,
        borderRadius: moderateSize(16),
        padding: moderateSize(14),
    },
    calendarTitle: {
        fontSize: moderateSize(14),
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: moderateSize(10),
    },
    calendarActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: moderateSize(12),
        columnGap: moderateSize(12),
    },
    calendarBtn: {
        flex: 1,
        paddingVertical: moderateSize(12),
        borderRadius: moderateSize(14),
        alignItems: 'center',
        justifyContent: 'center',
    },
    calendarBtnSecondary: {
        backgroundColor: colors.surfaceSoft,
    },
    calendarBtnPrimary: {
        backgroundColor: colors.primary,
    },
    calendarBtnSecondaryText: {
        fontSize: moderateSize(14),
        fontWeight: '700',
        color: colors.textPrimary,
    },
    calendarBtnPrimaryText: {
        fontSize: moderateSize(14),
        fontWeight: '700',
        color: colors.white,
    },
});
