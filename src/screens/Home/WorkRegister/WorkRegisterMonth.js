import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Calendar } from 'react-native-calendars';
import moment from 'moment';
import MonthYearPicker from 'react-native-month-year-picker';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Header from '../../../components/Header';
import colors from '../../../constants/colors';
import TimesheetDetailsModal from '../../../components/modals/TimesheetDetailsModal';
import { fetchWorkRegisterList } from '../../../services/apiWorkRegister';
import { commonStyles } from '../../../theme/commonStyles';
import { SAMPLE_SHIFT_MODAL } from '../../../constants/utils';
import { getMonthName } from '../../../constants/datetime';
import { moderateSize } from '../../../styles';

const WorkRegisterMonthScreen = () => {
    const navigation = useNavigation();
    const { t } = useTranslation();
    const [showPicker, setShowPicker] = useState(false); // Show MonthYearPicker
    const handlePress = () => {
        navigation.navigate('WorkRegisterWeekScreen');
    };
    // Hooks for managing state
    const today = new Date(); // Get current date
    const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1);
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [selectedDate, setSelectedDate] = useState(null);
    const [modalDetailVisible, setModalDetailVisible] = useState(false);
    const [shifts, setShifts] = useState([]);
    const formattedDate = selectedDate ? moment(selectedDate).format('DD/MM/YYYY') : '';

    // Function to get current date as string for Calendar
    const getCurrentDate = useCallback(() => `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`, [currentMonth, currentYear]);

    // Function to handle when user presses month change button
    const handleMonthChange = (direction) => {
        let newMonth = currentMonth + direction;
        let newYear = currentYear;

        if (newMonth > 12) {
            newMonth = 1;
            newYear += 1;
        } else if (newMonth < 1) {
            newMonth = 12;
            newYear -= 1;
        }

        // Update month and year
        setCurrentMonth(newMonth);
        setCurrentYear(newYear);
    };

    // Function to get the first and last day of the current month
    const getMonthStartAndEndDates = () => {
        const startDate = new Date(currentYear, currentMonth - 1, 2);
        const endDate = new Date(currentYear, currentMonth, 1);

        return { startDate, endDate };
    };

    // Function to generate marked dates for the Calendar
    const generateMarkedDates = (startDate, endDate) => {
        const markedDates = {};
        let currentDate = new Date(startDate);
        const daysWithData = getDaysWithData(); // Get the days with data

        while (currentDate <= endDate) {
            const formattedDate = currentDate.toISOString().split('T')[0]; // Format YYYY-MM-DD
            // Check if this day has data
            const isDayWithData = daysWithData.includes(formattedDate);

            markedDates[formattedDate] = {
                periods: [
                    {
                        startingDay: currentDate.getDate() === startDate.getDate(),
                        endingDay: currentDate.getDate() === endDate.getDate(),
                        color: isDayWithData ? 'red' : 'black'
                    }
                ],
                text: ' '
            };
            currentDate.setDate(currentDate.getDate() + 1); // Increment day
        }
        return markedDates;
    };

    // The getDaysWithData function returns a list of days with work data from workData.
    const getDaysWithData = () => {
        if (!workData || workData.length === 0) {
            return [];
        }

        return workData.map(item => moment(item.date).format('YYYY-MM-DD'));
    };

    const handleDayPress = (day) => {
        setSelectedDate(day.dateString);
        setShifts(SAMPLE_SHIFT_MODAL); // Replace with actual shifts data
        setModalDetailVisible(true); // Open modal when selecting date
    };

    // Change value month and year
    const onValueChange = (event, date) => {
        if (date) {
            setCurrentMonth(date.getMonth() + 1);
            setCurrentYear(date.getFullYear());
        }
        setShowPicker(false);
    };

    // Custom header rendering
    const renderHeader = () => (
        <>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity onPress={() => handleMonthChange(-1)}>
                        <Text style={styles.headerButton}>&lt;&lt;</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => setShowPicker(true)}>
                        <Text style={styles.monthText}>{getMonthName(currentMonth)}</Text>
                        <Text style={styles.yearText}>{currentYear}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => handleMonthChange(1)}>
                        <Text style={styles.headerButton}>&gt;&gt;</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.headerRight}>
                    <TouchableOpacity style={styles.weekViewButton} onPress={handlePress}>
                        <Text style={styles.weekViewButtonText}>{t('workRegister.weekView')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
            {showPicker && (
                <MonthYearPicker
                    onChange={onValueChange}
                    value={new Date(currentYear, currentMonth - 1)}
                    minimumDate={new Date(2000, 0)}
                    maximumDate={new Date(2100, 11)}
                    locale="en"
                />
            )}
        </>
    );

    // Component to render individual day items in the calendar
    const dayComponent = ({ date, state }) => {
        // Check if the current date is today
        const isToday = date.dateString === currentDate;
        // Get color from data, if not available then default to grey
        const color = workData[date.dateString] || colors.grey;

        return (
            <TouchableOpacity
                style={{ alignItems: 'center' }}
                onPress={() => handleDayPress(date)} // Handle day press event
            >
                <Text
                    style={{
                        // Set text color based on state and whether it's today
                        color: state === 'disabled' ? 'gray' : isToday ? 'white' : 'black',
                        // Highlight background if it's today
                        backgroundColor: isToday ? '#F57676' : 'transparent',
                        borderRadius: moderateSize(50),
                        paddingLeft: moderateSize(10),
                        paddingRight: moderateSize(10),
                        padding: moderateSize(4),
                        fontSize: moderateSize(15),
                        fontWeight: "800",
                    }}
                >
                    {date.day}
                </Text>
                <View
                    style={{
                        // Set background color for workshift
                        backgroundColor: color,
                        width: moderateSize(10),
                        height: moderateSize(6),
                        marginTop: moderateSize(5),
                        fontSize: moderateSize(5),
                        paddingLeft: moderateSize(12),
                        paddingRight: moderateSize(20),
                        fontWeight: "800",
                    }}
                />
            </TouchableOpacity>
        );
    };

    // Generate new key when month or year changes to force Calendar to regenerate
    const calendarKey = `${currentYear}-${currentMonth}`;
    const { startDate, endDate } = getMonthStartAndEndDates();
    const markedDates = generateMarkedDates(startDate, endDate, '#FF0000');
    const currentDate = moment().format('YYYY-MM-DD'); // Get current date as string
    const [workData, setWorkData] = useState([]); // Work data for the month

    useEffect(() => {
        // Get startDate and endDate for current month
        const { startDate, endDate } = getMonthStartAndEndDates();
        const formattedStartDate = moment(startDate).format('DD/MM/YYYY');
        const formattedEndDate = moment(endDate).format('DD/MM/YYYY');

        // Call API to get job data
        fetchWorkRegisterList({ startDate: formattedStartDate, endDate: formattedEndDate })
            .then((data) => {
                const colorMap = {};

                // Create day map with color
                data.forEach((item) => {
                    const formattedDate = moment(item.date).format('YYYY-MM-DD');
                    // Get color from data, if not available then default to grey
                    colorMap[formattedDate] = `#${item.workshift?.color || colors.grey}`;
                });

                setWorkData(colorMap);
                console.log('Fetched Work Register Data:', data);
            })
            .catch((error) => {
                console.error('Error fetching work register data:', error.message);
            });
    }, [currentMonth, currentYear]);

    return (
        <View style={styles.container}>
            <Header
                title={t('workRegister.title')}
                crudText={t('workRegister.create')}
                showCrudText={true}
            />

            <View style={commonStyles.main}>
                {renderHeader()}
                <Calendar
                    key={calendarKey}
                    firstDay={1} // 1 = Monday
                    hideArrows={true} // Hide arrows
                    renderHeader={() => null} // Hide default calendar header
                    onDayPress={handleDayPress}
                    markedDates={{
                        [selectedDate]: { selected: true, selectedColor: '#FF0000' },
                        ...markedDates,
                    }}
                    current={getCurrentDate()}
                    dayComponent={dayComponent}
                />
            </View>
            <TimesheetDetailsModal
                visible={modalDetailVisible}
                onClose={() => setModalDetailVisible(false)}
                date={formattedDate}
                // shifts={[]}
                shifts={shifts}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
        color: '#000000',
        fontSize: moderateSize(20),
        fontWeight: 'bold',
        paddingHorizontal: moderateSize(8),
    },
    monthText: {
        fontSize: moderateSize(35),
        fontWeight: '500',
        color: '#212525',
        marginHorizontal: moderateSize(8),
        position: 'relative',
    },
    yearText: {
        fontSize: moderateSize(14),
        fontWeight: '500',
        color: '#BCC1CD',
        position: 'absolute',
        top: moderateSize(40),
        left: moderateSize(20),
        marginHorizontal: moderateSize(8),
    },
    weekViewButton: {
        backgroundColor: '#3629B7',
        paddingVertical: moderateSize(10),
        paddingHorizontal: moderateSize(24),
        borderRadius: moderateSize(8),
        marginHorizontal: moderateSize(8),
    },
    weekViewButtonText: {
        color: '#FFFFFF',
        fontSize: moderateSize(16),
        fontWeight: "600",
    },
});

export default WorkRegisterMonthScreen;
