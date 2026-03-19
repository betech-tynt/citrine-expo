import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MasterPageLayout from '../../../../components/MasterPageLayout';
import { moderateSize } from '../../../../styles';
import colors from '../../../../constants/colors';
import { formatDate } from '../../../../utils/formatDate';
import { formatCurrency } from '../../../../utils/formatCurrency';
import BookingInfoRow from './BookingInfoRow';
import GuestCounterRow from './GuestCounterRow';
import BookingCalendarModal from './BookingCalendarModal';
import Button from '../../../../components/Button';

export default function CustomerBookingScreen() {
    const { t } = useTranslation();
    const navigation = useNavigation();
    const route = useRoute();

    // Persisted guest counts are stored per section to keep values across
    // navigation back to CustomerRoomInfo.
    const sectionKey = route?.params?.bookingDraft?.sectionId || 'default';
    const guestStorageKey = `booking_guests_${sectionKey}`;

    // Route params (booking context)
    const bookingDraft = route?.params?.bookingDraft || {};
    const selections = route?.params?.selections || {};
    const totalRoomsParam = Number(route?.params?.totalRooms || 0);

    // Basic hotel/room display fields (fallback-safe)
    const hotelName = bookingDraft?.hotelName || '';
    const selectedRoomName =
        bookingDraft?.selectedRoom?.name || bookingDraft?.roomName || '';

    // Base unit price fallback (single-room flow); multi-room flow uses selections pricing
    const unitPrice = Number(
        bookingDraft?.unitPrice || bookingDraft?.selectedRoom?.min_price || 0,
    );

    // Total rooms selected (can come from RoomInfo selections or bookingDraft)
    const roomCount = Number(totalRoomsParam || bookingDraft?.roomCount || 1);

    // Normalize selections object (RoomInfo passes { [roomTypeId]: { roomType, quantity } })
    const selectionList = useMemo(
        () => Object.values(selections || {}),
        [selections],
    );

    // Preview image for single-room fallback card
    const firstSelection = selectionList.length > 0 ? selectionList[0] : null;
    const cardImageUri =
        firstSelection?.roomType?.images?.[0]?.url ||
        bookingDraft?.images?.[0]?.url ||
        null;

    // Date helpers (ISO <-> Date)
    const today = useMemo(() => new Date(), []);

    // Convert Date -> YYYY-MM-DD (Calendar uses ISO date strings)
    const isoFromDate = date => {
        const d = date instanceof Date ? date : new Date();
        const yyyy = `${d.getFullYear()}`;
        const mm = `${d.getMonth() + 1}`.padStart(2, '0');
        const dd = `${d.getDate()}`.padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };

    // Add days to an ISO date string and return ISO (YYYY-MM-DD)
    const addDaysISO = (iso, days) => {
        const base = iso ? new Date(iso) : today;
        const d = new Date(base);
        d.setDate(d.getDate() + days);
        return isoFromDate(d);
    };

    // Guests state (initialize from Search filter if provided)
    const initialAdults =
        typeof bookingDraft?.adults === 'number' ? bookingDraft.adults : 2;
    const initialChildren =
        typeof bookingDraft?.children === 'number' ? bookingDraft.children : 0;

    const [adultCount, setAdultCount] = useState(initialAdults);
    const [childrenCount, setChildrenCount] = useState(initialChildren);

    // Guard flag: persist effect must not write until the initial load completes,
    // otherwise it overwrites the saved dates with today's defaults.
    const [hasLoadedCache, setHasLoadedCache] = useState(false);

    // Load persisted guest counts and booking dates when the screen mounts.
    useEffect(() => {
        let isMounted = true;

        const loadPersistedGuests = async () => {
            try {
                const raw = await AsyncStorage.getItem(guestStorageKey);
                if (!raw) return;
                const parsed = JSON.parse(raw);

                if (!isMounted || !parsed) return;

                if (typeof parsed.adults === 'number') {
                    setAdultCount(parsed.adults);
                }
                if (typeof parsed.children === 'number') {
                    setChildrenCount(parsed.children);
                }
                if (
                    typeof parsed.checkInISO === 'string' &&
                    parsed.checkInISO
                ) {
                    setCheckInISO(parsed.checkInISO);
                }
                if (
                    typeof parsed.checkOutISO === 'string' &&
                    parsed.checkOutISO
                ) {
                    setCheckOutISO(parsed.checkOutISO);
                }
            } catch (error) {
                console.warn(
                    '[CustomerBookingScreen] Failed to load guest cache:',
                    error,
                );
            } finally {
                if (isMounted) {
                    setHasLoadedCache(true);
                }
            }
        };

        loadPersistedGuests();

        return () => {
            isMounted = false;
        };
    }, [guestStorageKey]);

    // Persist guest counts and booking dates whenever they change.
    // Skip until the initial load is done so we don't overwrite saved values.
    useEffect(() => {
        if (!hasLoadedCache) return;

        const persistGuests = async () => {
            try {
                await AsyncStorage.setItem(
                    guestStorageKey,
                    JSON.stringify({
                        adults: adultCount,
                        children: childrenCount,
                        checkInISO: checkInISO,
                        checkOutISO: checkOutISO,
                    }),
                );
            } catch (error) {
                console.warn(
                    '[CustomerBookingScreen] Failed to persist guest cache:',
                    error,
                );
            }
        };

        persistGuests();
    }, [
        hasLoadedCache,
        adultCount,
        childrenCount,
        checkInISO,
        checkOutISO,
        guestStorageKey,
    ]);

    // Booking dates state (initialize from Search filter if provided)
    const [checkInISO, setCheckInISO] = useState(() => {
        if (bookingDraft?.checkInISO) return bookingDraft.checkInISO;
        return isoFromDate(today);
    });

    const [checkOutISO, setCheckOutISO] = useState(() => {
        if (bookingDraft?.checkOutISO) return bookingDraft.checkOutISO;
        return addDaysISO(bookingDraft?.checkInISO || isoFromDate(today), 1);
    });

    // Calendar modal state: single modal, two modes (check-in vs check-out)
    const [calendarVisible, setCalendarVisible] = useState(false);
    const [calendarMode, setCalendarMode] = useState('checkIn'); // 'checkIn' | 'checkOut'
    const [calendarTempISO, setCalendarTempISO] = useState('');

    // Derived Date objects (used for display + nights computation)
    const checkInDate = useMemo(() => new Date(checkInISO), [checkInISO]);
    const checkOutDate = useMemo(() => new Date(checkOutISO), [checkOutISO]);

    // Open calendar with a sensible initial date for the chosen mode
    const openCalendar = mode => {
        const fallback = isoFromDate(today);
        const initialISO =
            mode === 'checkOut'
                ? checkOutISO || addDaysISO(checkInISO || fallback, 1)
                : checkInISO || fallback;
        setCalendarMode(mode);
        setCalendarTempISO(initialISO);
        setCalendarVisible(true);
    };

    // Close calendar modal (no side effects)
    const closeCalendar = () => {
        setCalendarVisible(false);
    };

    // Confirm calendar selection, and enforce: checkOut must be > checkIn (at least 1 night)
    const confirmCalendar = () => {
        if (!calendarTempISO) {
            closeCalendar();
            return;
        }

        if (calendarMode === 'checkIn') {
            setCheckInISO(calendarTempISO);
            // Đảm bảo check-out luôn sau check-in ít nhất 1 ngày
            const tempDate = new Date(calendarTempISO);
            const currentOut = new Date(checkOutISO);
            if (!(currentOut > tempDate)) {
                const nextISO = addDaysISO(calendarTempISO, 1);
                setCheckOutISO(nextISO);
            }
        } else {
            // checkOut mode
            const tempOut = new Date(calendarTempISO);
            const inDate = new Date(checkInISO);
            if (!(tempOut > inDate)) {
                const nextISO = addDaysISO(checkInISO, 1);
                setCheckOutISO(nextISO);
            } else {
                setCheckOutISO(calendarTempISO);
            }
        }

        closeCalendar();
    };

    // Nights computation (diff in days, minimum 1)
    const nights = useMemo(() => {
        const startDate = checkInDate instanceof Date ? checkInDate : null;
        const endDate = checkOutDate instanceof Date ? checkOutDate : null;

        if (startDate && endDate) {
            if (
                !Number.isNaN(startDate.getTime()) &&
                !Number.isNaN(endDate.getTime())
            ) {
                const diffMs = endDate.getTime() - startDate.getTime();
                const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
                if (diffDays > 0) return diffDays;
            }
        }

        return 1;
    }, [checkInDate, checkOutDate]);

    // Parse a price value (number or string like "15,000") -> number
    const parsePriceToNumber = value => {
        if (typeof value === 'number' && Number.isFinite(value)) return value;
        if (!value) return 0;
        const digits = String(value).replace(/[^\d]/g, '');
        return digits ? Number(digits) : 0;
    };

    // Price per night should match CustomerRoomInfo:
    // - If selections exist: totalPerNight = Σ(roomType.price * qty)
    // - Else fallback: unitPrice * roomCount
    const totalPerNight = useMemo(() => {
        if (selectionList.length > 0) {
            return selectionList.reduce((sum, sel) => {
                const qty = Number(sel?.quantity || 0);
                if (qty <= 0) return sum;
                const price = parsePriceToNumber(sel?.roomType?.price);
                return sum + price * qty;
            }, 0);
        }

        return Math.max(0, unitPrice) * Math.max(1, roomCount);
    }, [roomCount, selectionList, unitPrice]);

    // Total for the stay (pre-tax for now): total = totalPerNight * nights
    const roomPrice = useMemo(
        () => totalPerNight * nights,
        [nights, totalPerNight],
    );

    const total = roomPrice;
    // Disable continue if we cannot compute a valid price or nights
    const canContinue = totalPerNight > 0 && nights > 0;

    // Guests handlers
    const handleDecrease = type => {
        if (type === 'adult') {
            setAdultCount(prev => Math.max(0, prev - 1));
        } else {
            setChildrenCount(prev => Math.max(0, prev - 1));
        }
    };

    const handleIncrease = type => {
        if (type === 'adult') {
            setAdultCount(prev => prev + 1);
        } else {
            setChildrenCount(prev => prev + 1);
        }
    };

    // -----------------------------
    // Continue -> BookingConfirmScreen
    // Build bookingData that matches BookingConfirmScreen expectations
    // -----------------------------
    const handleContinue = () => {
        if (!canContinue) return;

        // Rooms list for confirmation:
        // - Multi-room: one entry per selected room type with its quantity
        // - Single-room fallback: one entry with total quantity
        const rooms = selectionList.length
            ? selectionList
                  .map(sel => {
                      const rt = sel?.roomType || {};
                      const qty = Number(sel?.quantity || 0);
                      if (!rt?.name || qty <= 0) return null;
                      return { name: rt.name, quantity: qty };
                  })
                  .filter(Boolean)
            : [
                  {
                      name: selectedRoomName || '-',
                      quantity: Math.max(1, roomCount),
                  },
              ];

        // Payload consumed by BookingConfirmScreen (fallback-safe fields)
        const bookingData = {
            customer: {
                fullName: '-',
                email: '-',
                phoneNumber: '-',
            },
            hotel: hotelName || '-',
            rooms,
            checkIn: formatDate(checkInDate),
            checkOut: formatDate(checkOutDate),
            numberOfGuests: adultCount + childrenCount,
            guestCount: {
                adults: adultCount,
                children: childrenCount,
            },
            nights,
            roomPrice,
            taxAndFees: 0,
            total,
        };

        // Merge current state (dates, guests) into bookingDraft for API call
        const updatedBookingDraft = {
            ...bookingDraft,
            checkInISO: checkInISO,
            checkOutISO: checkOutISO,
            adults: adultCount,
            children: childrenCount,
        };

        navigation.navigate('BookingConfirmScreen', {
            bookingData,
            bookingDraft: updatedBookingDraft,
            selections,
            guestCount: {
                adults: adultCount,
                children: childrenCount,
            },
        });
    };

    return (
        <>
            <MasterPageLayout
                headerType="header"
                headerProps={{
                    title: t('booking.bookingDetailTitle'),
                    showCrudText: false,
                }}>
                <View style={[styles.mainContent, styles.backgroundColor]}>
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}>
                        {/* Selected rooms preview (multi-room list or single-room fallback) */}
                        {selectionList.length > 0 ? (
                            selectionList.map((sel, index) => {
                                const rt = sel?.roomType || {};
                                const qty = Number(sel?.quantity || 0);
                                const imgUri =
                                    rt?.images?.[0]?.url ||
                                    bookingDraft?.images?.[0]?.url ||
                                    null;
                                const name =
                                    rt?.name ||
                                    selectedRoomName ||
                                    hotelName ||
                                    '-';
                                const perRoomPrice =
                                    typeof rt?.price === 'number'
                                        ? rt.price
                                        : Number(rt?.price || 0) || unitPrice;

                                return (
                                    <View
                                        key={`sel-${rt?.id || index}`}
                                        style={[styles.card, styles.roomCard]}>
                                        {imgUri ? (
                                            <Image
                                                source={{ uri: imgUri }}
                                                style={styles.roomImage}
                                                resizeMode="cover"
                                            />
                                        ) : (
                                            <View
                                                style={
                                                    styles.roomImagePlaceholder
                                                }
                                            />
                                        )}
                                        <View style={styles.roomInfo}>
                                            <Text style={styles.roomName}>
                                                {name}
                                                {qty > 1 ? ` x${qty}` : ''}
                                            </Text>
                                            <Text style={styles.roomPrice}>
                                                {perRoomPrice > 0
                                                    ? `${formatCurrency(
                                                          perRoomPrice,
                                                      )} / ${t(
                                                          'customerRoomInfo.price.perNight',
                                                          {
                                                              defaultValue:
                                                                  'night',
                                                          },
                                                      )}`
                                                    : t(
                                                          'common.priceNotAvailable',
                                                          {
                                                              defaultValue:
                                                                  'N/A',
                                                          },
                                                      )}
                                            </Text>
                                            <Text style={styles.hotelName}>
                                                {hotelName || '-'}
                                            </Text>
                                        </View>
                                    </View>
                                );
                            })
                        ) : (
                            <View style={[styles.card, styles.roomCard]}>
                                {cardImageUri ? (
                                    <Image
                                        source={{ uri: cardImageUri }}
                                        style={styles.roomImage}
                                        resizeMode="cover"
                                    />
                                ) : (
                                    <View style={styles.roomImagePlaceholder} />
                                )}
                                <View style={styles.roomInfo}>
                                    <Text style={styles.roomName}>
                                        {selectedRoomName || hotelName || '-'}
                                        {roomCount > 1 ? ` x${roomCount}` : ''}
                                    </Text>
                                    <Text style={styles.roomPrice}>
                                        {unitPrice > 0
                                            ? `${formatCurrency(
                                                  unitPrice,
                                              )} / ${t(
                                                  'customerRoomInfo.price.perNight',
                                                  { defaultValue: 'night' },
                                              )}`
                                            : t('common.priceNotAvailable', {
                                                  defaultValue: 'N/A',
                                              })}
                                    </Text>
                                    <Text style={styles.hotelName}>
                                        {hotelName || '-'}
                                    </Text>
                                </View>
                            </View>
                        )}

                        {/* Booking details (dates + nights) */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>
                                {t('booking.bookingDetailTitle')}
                            </Text>
                            <View style={styles.card}>
                                <BookingInfoRow
                                    label={t('booking.checkIn')}
                                    value={formatDate(checkInDate)}
                                    showIcon
                                    onPress={() => openCalendar('checkIn')}
                                />
                                <BookingInfoRow
                                    label={t('booking.checkOut')}
                                    value={formatDate(checkOutDate)}
                                    showIcon
                                    onPress={() => openCalendar('checkOut')}
                                />
                                <BookingInfoRow
                                    label={t('booking.nights')}
                                    value={String(nights)}
                                    isLast
                                />
                            </View>
                        </View>

                        {/* Guests selector */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>
                                {t('booking.guestCountTitle')}
                            </Text>
                            <View style={styles.card}>
                                <GuestCounterRow
                                    label={t('booking.adult')}
                                    value={adultCount}
                                    onDecrease={() => handleDecrease('adult')}
                                    onIncrease={() => handleIncrease('adult')}
                                />
                                <GuestCounterRow
                                    label={t('booking.children')}
                                    value={childrenCount}
                                    onDecrease={() =>
                                        handleDecrease('children')
                                    }
                                    onIncrease={() =>
                                        handleIncrease('children')
                                    }
                                    isLast
                                />
                            </View>
                        </View>
                    </ScrollView>
                </View>

                {/* Sticky bottom bar: total + next */}
                <View style={styles.bottomBar}>
                    <View style={styles.totalContainer}>
                        <Text style={styles.totalAmount}>
                            {unitPrice > 0
                                ? formatCurrency(total)
                                : t('common.priceNotAvailable', {
                                      defaultValue: 'N/A',
                                  })}
                        </Text>
                        <Text style={styles.totalNights}>
                            {`${nights} ${t('booking.nights', {
                                defaultValue: 'nights',
                            })}`}
                        </Text>
                    </View>
                    <Button
                        title={t('common.next')}
                        onPress={handleContinue}
                        style={styles.nextButton}
                        disabled={!canContinue}
                    />
                </View>
            </MasterPageLayout>
            {/* Calendar modal for picking dates */}
            <BookingCalendarModal
                visible={calendarVisible}
                mode={calendarMode}
                tempISO={calendarTempISO}
                onChangeTempISO={setCalendarTempISO}
                onCancel={closeCalendar}
                onConfirm={confirmCalendar}
            />
        </>
    );
}

const styles = StyleSheet.create({
    mainContent: {
        flex: 1,
        padding: moderateSize(16),
    },
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: moderateSize(70),
    },
    card: {
        backgroundColor: colors.surface,
        borderRadius: moderateSize(12),
        padding: moderateSize(12),
        marginBottom: moderateSize(12),
    },
    roomCard: {
        flexDirection: 'row',
    },
    roomImage: {
        width: moderateSize(72),
        height: moderateSize(72),
        borderRadius: moderateSize(8),
        backgroundColor: colors.disabledBg,
        marginRight: moderateSize(12),
    },
    roomImagePlaceholder: {
        width: moderateSize(72),
        height: moderateSize(72),
        borderRadius: moderateSize(8),
        backgroundColor: colors.disabledBg,
        marginRight: moderateSize(12),
    },
    roomInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    roomName: {
        fontSize: moderateSize(16),
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: moderateSize(4),
    },
    roomPrice: {
        fontSize: moderateSize(16),
        fontWeight: '700',
        color: colors.primary,
        marginBottom: moderateSize(4),
    },
    hotelName: {
        fontSize: moderateSize(12),
        color: colors.textSecondary,
    },
    section: {
        marginTop: moderateSize(12),
    },
    sectionTitle: {
        fontSize: moderateSize(18),
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: moderateSize(8),
    },
    bottomBar: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: moderateSize(16),
        paddingVertical: moderateSize(12),
        backgroundColor: colors.surface,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: colors.border,
        zIndex: 2,
        elevation: 8,
    },
    totalContainer: {
        flex: 1,
    },
    totalAmount: {
        fontSize: moderateSize(16),
        fontWeight: '700',
        color: colors.primary,
    },
    totalNights: {
        fontSize: moderateSize(12),
        color: colors.textSecondary,
        marginTop: moderateSize(2),
    },
    nextButton: {
        marginLeft: moderateSize(12),
        minWidth: moderateSize(120),
        width: 'auto',
    },
    backgroundColor: {
        backgroundColor: colors.background,
    },
});
