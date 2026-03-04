import React from 'react';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { ROLE_CUSTOMER, ROLE_STAFF, ROLE_STAFF_MANAGER } from './utils';

export function getHomeMenuItems({ role, navigation, onWorkRegisterPress }) {
    if (!navigation) return [];

    if (role === ROLE_CUSTOMER) {
        return [
            {
                key: 'booking',
                title: 'Booking',
                icon: <Icon name="calendar-check" size={30} color="#00B4D8" />,
                onPress: () => navigation.navigate('BookingScreen'),
            },
            {
                key: 'promotion',
                title: 'Promotion',
                icon: <Icon name="gift" size={30} color="#0A9396" />,
                onPress: () => navigation.navigate('PromotionScreen'),
            },
            {
                key: 'searchRoom',
                title: 'Search Room',
                icon: <Icon name="search" size={30} color="#0A9396" />,
                onPress: () => navigation.navigate('SearchRoomScreen'),
            },
            {
                key: 'roomInfo',
                title: 'Room Info',
                icon: <Icon name="info-circle" size={30} color="#0A9396" />,
                onPress: () => navigation.navigate('RoomInfoScreen'),
            },
            {
                key: 'bookingCancel',
                title: 'Booking Cancel',
                icon: <Icon name="calendar-times" size={30} color="#0A9396" />,
                onPress: () => navigation.navigate('BookingCancelScreen'),
            },
            {
                key: 'bookingConfirm',
                title: 'Booking Confirm',
                icon: <Icon name="calendar-check" size={30} color="#0A9396" />,
                onPress: () => navigation.navigate('BookingConfirmScreen'),
            },
            {
                key: 'bookingHistory',
                title: 'Booking History',
                icon: <Icon name="history" size={30} color="#0A9396" />,
                onPress: () => navigation.navigate('BookingHistoryScreen'),
            },
            {
                key: 'bookingPayment',
                title: 'Booking Payment',
                icon: <Icon name="credit-card" size={30} color="#0A9396" />,
                onPress: () => navigation.navigate('BookingPaymentScreen'),
            },
        ];
    }

    if (role === ROLE_STAFF) {
        return [
            {
                key: 'current_schedule',
                title: 'Lịch làm việc hiện tại',
                icon: <Icon name="calendar-alt" size={30} color="#00B4D8" />,
            },
            {
                key: 'register_shift',
                title: 'Đăng ký ca làm việc',
                icon: <Icon name="user-tag" size={30} color="#BB3E03" />,
                onPress: onWorkRegisterPress,
            },
        ];
    }

    if (role === ROLE_STAFF_MANAGER) {
        return [
            {
                key: 'team_schedule',
                title: 'Lịch làm việc hiện tại của nhóm',
                icon: <Icon name="calendar-alt" size={30} color="#00B4D8" />,
            },
            {
                key: 'shift_register_list',
                title: 'Danh sách Đăng ký ca làm việc',
                icon: <Icon name="list-alt" size={30} color="#BB3E03" />,
                onPress: onWorkRegisterPress,
            },
        ];
    }

    return [];
}
