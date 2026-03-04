import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import Header from '../../../components/Header';
import { commonStyles } from '../../../theme/commonStyles';
import { useNavigation } from '@react-navigation/native';
import {
    getWeekdayNames,
    getTodayDate,
    getWeekDates,
    formatDay,
    getMonthName,
} from '../../../constants/datetime';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { moderateSize } from '../../../styles';
import { fetchWorkRegisterList } from '../../../services/apiWorkRegister';
import moment from 'moment';
import colors from '../../../constants/colors';
import SplashScreen from '../../../components/Splash';
import useRolePermission from '../../../utils/useRolePermission';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WorkRegisterWeekScreen = () => {
    const navigation = useNavigation();
    const { t } = useTranslation();

    // Initialize current date
    const [date, setDate] = useState(getTodayDate());
    const [weekDates, setWeekDates] = useState(getWeekDates(date));
    const [shifts, setShifts] = useState([]);
    const [loading, setLoading] = useState(false);
    const { isAdmin } = useRolePermission();
    const [username, setUsername] = useState(null);

    /** Fetch subscription list by date */
    const fetchShiftsForDate = useCallback(async (selectedDate, currentUsername) => {
        if (!currentUsername) return; // If there is no username, do not call the API.

        setLoading(true);
        try {
            // Convert selectedDate to DD/MM/YYYY format
            const rawDate = `${selectedDate.year}-${String(selectedDate.month).padStart(2, '0')}-${String(selectedDate.day).padStart(2, '0')}`;
            const formattedDate = moment(rawDate).format('DD/MM/YYYY'); // Format d/m/Y
            // Call API to fetch work register list
            const response = await fetchWorkRegisterList({ startDate: formattedDate, endDate: formattedDate });

            if (!response || !Array.isArray(response)) {
                console.error("Invalid response format:", response);
                setShifts([]); // If the response is invalid, set shifts to an empty array
                return;
            }
            // If the user is an admin, retrieve all data; otherwise, filter data for the current user only
            const filteredShifts = isAdmin
                ? response
                : response.filter(shift => shift.employee?.username === currentUsername);

            setShifts(filteredShifts || []);
        } catch (error) {
            console.error('Error fetching shifts:', error.message);
        } finally {
            // Stop the loading state after completion
            setLoading(false);
        }
    }, [isAdmin]);

    /** Get username from AsyncStorage when component mounts */
    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const userInfo = await AsyncStorage.getItem('userInfo');
                if (userInfo) {
                    const parsedUser = JSON.parse(userInfo);
                    const currentUsername = parsedUser.user?.username;

                    if (currentUsername) {
                        // Save username to state
                        setUsername(currentUsername);
                    }
                }
            } catch (error) {
                console.error('Error fetching user info:', error);
            }
        };

        fetchUserInfo();
    }, []);

    /** Update registration list when `date` or `username` changes */
    useEffect(() => {
        // Update the week corresponding to `date`
        setWeekDates(getWeekDates(date));

        if (username) {
            // Call data from API
            fetchShiftsForDate(date, username);
        }
    }, [date, username, fetchShiftsForDate]);

    const handlePress = () => {
        navigation.navigate('WorkRegisterMonthScreen');
    };

    // Function to handle the next day navigation
    const handleNextDay = () => {
        const nextDay = new Date(date.year, date.month - 1, date.day + 1);
        setDate({
            day: nextDay.getDate(),
            month: nextDay.getMonth() + 1,
            year: nextDay.getFullYear(),
        });
    };

    // Function to handle the previous day navigation
    const handlePreviousDay = () => {
        const previousDay = new Date(date.year, date.month - 1, date.day - 1);
        setDate({
            day: previousDay.getDate(),
            month: previousDay.getMonth() + 1,
            year: previousDay.getFullYear(),
        });
    };

    return (
        <View style={styles.container}>
            <Header
                title={t('workRegister.title')}
                crudText={t('workRegister.create')}
                showCrudText={true}
            />
            <ScrollView style={commonStyles.main}>
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <TouchableOpacity onPress={handlePreviousDay}>
                            <Text style={styles.headerButton}>&lt;&lt;</Text>
                        </TouchableOpacity>
                        <Text style={styles.dayText}>{formatDay(date.day)}</Text>
                        <Text style={styles.monthText}>{getMonthName(date.month)}</Text>
                        <Text style={styles.yearText}>{date.year}</Text>
                        <TouchableOpacity onPress={handleNextDay}>
                            <Text style={styles.headerButton}>&gt;&gt;</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.headerRight}>
                        <TouchableOpacity style={styles.monthViewButton} onPress={handlePress}>
                            <Text style={styles.monthViewButtonText}>{t('workRegister.monthView')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.daysContainer}>
                    {weekDates.map((weekDate, index) => (
                        <View
                            key={index}
                            style={weekDate.day === date.day ? styles.selectedDayContainer : styles.dayContainer}>
                            <Text style={weekDate.day === date.day ? styles.selectedWeekdayText : styles.weekdayText}>
                                {getWeekdayNames()[index]}
                            </Text>
                            <Text style={weekDate.day === date.day ? styles.selectedDateText : styles.dateText}>
                                {formatDay(weekDate.day)}
                            </Text>
                        </View>
                    ))}
                </View>
                {loading ? (
                    <SplashScreen />
                ) : (
                    Array.isArray(shifts) && shifts.length > 0 ? (
                        shifts.map((shift) => (
                            <View key={shift.id} style={[styles.shiftCard, { backgroundColor: `#${shift.workshift.color}` }]}>
                                <View style={[styles.titleRow, { justifyContent: 'space-between' }]}>
                                    <Text style={styles.shiftTitle}>{shift.workshift.name}</Text>
                                    <Icon name="ellipsis-v" size={18} color="#ffffff" />
                                </View>
                                <Text style={styles.sectionTitle}>
                                    {t('workRegister.fullTime')} {shift.workshift.start} - {shift.workshift.end}
                                </Text>
                                <View style={[styles.iconRow, { justifyContent: 'space-between' }]}>
                                    <View style={styles.iconText}>
                                        <Icon name="calendar-alt" size={18} color="#ffffff" />
                                        <Text style={styles.shiftDetails}>
                                            {moment(shift.date).format('DD/MM/YYYY')} {/* Formatting the date */}
                                        </Text>
                                    </View>
                                    <View style={styles.iconText}>
                                        <Icon name="clock" size={18} color="#ffffff" />
                                        <Text style={styles.shiftDetails}>
                                            {shift.workshift.start} - {shift.workshift.end} {/* Displaying start and end times */}
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.iconRow}>
                                    <Icon name="user-circle" size={18} color="#ffffff" />
                                    <Text style={styles.shiftDetails}>
                                        {shift.employee?.name || 'Unknown'} {/* Employee name */}
                                    </Text>
                                </View>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.errorText}>
                            No shifts available for the selected date.
                        </Text>
                    )
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    shiftCard: {
        borderRadius: moderateSize(12),
        padding: moderateSize(16),
        marginBottom: moderateSize(16),
    },
    sectionTitle: {
        fontSize: moderateSize(10),
        fontWeight: "500",
        color: colors.textWhite,
    },
    timeTitle: {
        fontSize: moderateSize(10),
        fontWeight: "500",
        color: colors.grey1,
        marginLeft: moderateSize(4),
        paddingTop: moderateSize(2),
        paddingBottom: moderateSize(2),
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    shiftTitle: {
        fontWeight: '600',
        fontSize: moderateSize(12),
        color: colors.textWhite,
        marginBottom: moderateSize(8),
    },
    shiftDetails: {
        fontSize: moderateSize(10),
        fontWeight: "500",
        color: colors.textWhite,
        marginLeft: moderateSize(8),
    },
    iconRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: moderateSize(6),
        paddingBottom: moderateSize(6),
    },
    iconText: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: moderateSize(8),
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: moderateSize(16),
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerButton: {
        color: colors.black,
        fontSize: moderateSize(20),
        fontWeight: 'bold',
        paddingHorizontal: moderateSize(8),
    },
    dayText: {
        fontSize: moderateSize(30),
        fontWeight: '500',
        color: colors.black,
        marginHorizontal: moderateSize(8),
        position: 'relative',
    },
    monthText: {
        fontSize: moderateSize(14),
        color: colors.grey,
        position: 'absolute',
        top: moderateSize(36),
        left: moderateSize(25),
        marginHorizontal: moderateSize(8),
        lineHeight: moderateSize(20),
    },
    yearText: {
        fontSize: moderateSize(14),
        color: colors.grey,
        position: 'absolute',
        top: moderateSize(36),
        left: moderateSize(54),
        marginHorizontal: moderateSize(8),
        lineHeight: moderateSize(20),
    },
    monthViewButton: {
        backgroundColor: colors.primary,
        paddingVertical: moderateSize(10),
        paddingHorizontal: moderateSize(24),
        borderRadius: moderateSize(8),
        marginHorizontal: moderateSize(8),
    },
    monthViewButtonText: {
        color: colors.white,
        fontSize: moderateSize(16),
        fontWeight: "600",
    },
    daysContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: moderateSize(5),
        borderBottomWidth: moderateSize(1),
        borderBottomColor: colors.grey,
        marginBottom: moderateSize(15),
    },
    dayContainer: {
        alignItems: 'center',
        paddingVertical: moderateSize(10),
    },
    selectedDayContainer: {
        alignItems: 'center',
        paddingVertical: moderateSize(10),
        backgroundColor: colors.primary,
        borderRadius: moderateSize(10),
        width: moderateSize(45),
        height: moderateSize(60),
    },
    weekdayText: {
        color: colors.grey,
        fontSize: moderateSize(16),
    },
    selectedWeekdayText: {
        color: colors.white,
        fontWeight: 'bold',
        fontSize: moderateSize(16),
    },
    dateText: {
        color: colors.black,
        fontWeight: 'bold',
        fontSize: moderateSize(16),
    },
    selectedDateText: {
        color: colors.white,
        fontWeight: 'bold',
        fontSize: moderateSize(16),
    },
    errorText: {
        color: colors.black,
        marginVertical: moderateSize(10),
        textAlign: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        fontWeight: 'bold',
    },
});

export default WorkRegisterWeekScreen;
