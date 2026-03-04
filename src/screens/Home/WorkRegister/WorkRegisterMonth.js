import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal } from 'react-native';
import { Calendar } from 'react-native-calendars';
import moment from 'moment';
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
    const [showPicker, setShowPicker] = useState(false); // Show custom Month/Year picker
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
                <MonthYearPickerModal
                    visible={showPicker}
                    onClose={() => setShowPicker(false)}
                    currentMonth={currentMonth}
                    currentYear={currentYear}
                    onConfirm={onValueChange}
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        padding: moderateSize(20),
        borderRadius: moderateSize(12),
        width: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: moderateSize(16),
    },
    modalYearText: {
        fontSize: moderateSize(20),
        fontWeight: '600',
        marginHorizontal: moderateSize(16),
    },
    monthGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    monthItem: {
        width: '30%',
        paddingVertical: moderateSize(8),
        marginBottom: moderateSize(8),
        borderRadius: moderateSize(6),
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    monthItemSelected: {
        backgroundColor: '#3629B7',
        borderColor: '#3629B7',
    },
    monthItemText: {
        fontSize: moderateSize(14),
        color: '#333333',
    },
    monthItemTextSelected: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: moderateSize(16),
    },
    modalButton: {
        paddingVertical: moderateSize(8),
        paddingHorizontal: moderateSize(16),
        marginLeft: moderateSize(8),
    },
    modalButtonText: {
        fontSize: moderateSize(14),
        color: '#3629B7',
        fontWeight: '600',
    },
});

// Simple JS-only Month/Year picker to replace `react-native-month-year-picker`
const MonthYearPickerModal = ({ visible, onClose, currentMonth, currentYear, onConfirm }) => {
    const [tempMonth, setTempMonth] = useState(currentMonth);
    const [tempYear, setTempYear] = useState(currentYear);

    const changeYear = (delta) => {
        setTempYear((prev) => prev + delta);
    };

    const handleSelectMonth = (month) => {
        setTempMonth(month);
    };

    const handleConfirm = () => {
        const selectedDate = new Date(tempYear, tempMonth - 1, 1);
        // mimic `onChange(event, date)` signature from native picker
        onConfirm(null, selectedDate);
    };

    const months = [
        { value: 1, label: 'Jan' },
        { value: 2, label: 'Feb' },
        { value: 3, label: 'Mar' },
        { value: 4, label: 'Apr' },
        { value: 5, label: 'May' },
        { value: 6, label: 'Jun' },
        { value: 7, label: 'Jul' },
        { value: 8, label: 'Aug' },
        { value: 9, label: 'Sep' },
        { value: 10, label: 'Oct' },
        { value: 11, label: 'Nov' },
        { value: 12, label: 'Dec' },
    ];

    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => changeYear(-1)}>
                            <Text style={styles.headerButton}>&lt;</Text>
                        </TouchableOpacity>
                        <Text style={styles.modalYearText}>{tempYear}</Text>
                        <TouchableOpacity onPress={() => changeYear(1)}>
                            <Text style={styles.headerButton}>&gt;</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.monthGrid}>
                        {months.map((m) => {
                            const isSelected = m.value === tempMonth;
                            return (
                                <TouchableOpacity
                                    key={m.value}
                                    style={[
                                        styles.monthItem,
                                        isSelected && styles.monthItemSelected,
                                    ]}
                                    onPress={() => handleSelectMonth(m.value)}
                                >
                                    <Text
                                        style={[
                                            styles.monthItemText,
                                            isSelected && styles.monthItemTextSelected,
                                        ]}
                                    >
                                        {m.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    <View style={styles.modalActions}>
                        <TouchableOpacity style={styles.modalButton} onPress={onClose}>
                            <Text style={styles.modalButtonText}>Hủy</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.modalButton} onPress={handleConfirm}>
                            <Text style={styles.modalButtonText}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};


export default WorkRegisterMonthScreen;
