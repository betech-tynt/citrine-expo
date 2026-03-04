// Define the URL of the GraphQL API
export const API_URL = 'https://citrine.bisync.net/graphql';

// Role Constants
export const ROLE_CUSTOMER = 'ROLE_CUSTOMER';
export const ROLE_STAFF = 'ROLE_STAFF';
export const ROLE_STAFF_MANAGER = 'ROLE_STAFF_MANAGER';

// Sample items array
export const SAMPLE_ITEMS = [
    { title: 'Betech ABC', subtitle: 'Company' },
    { title: 'Betech XYZ', subtitle: 'Work Shift' },
    { title: 'Betech 123', subtitle: 'Work Register' },
    { title: 'Betech 456', subtitle: 'Cleaning' },
    { title: 'Betech 789', subtitle: 'Sitemap' },
];

// Sample rooms array for booking example screen
export const SAMPLE_ROOMS = [
    {
        id: '1',
        name: 'Standard Twin Room',
        price: 1800000,
        hotelName: 'Citrine Hotel Tokyo',
    },
    {
        id: '2',
        name: 'Deluxe Double Room',
        price: 2500000,
        hotelName: 'Citrine Hotel Osaka',
    },
];

// Sample messages array
export const SAMPLE_MESSAGE = [
    {
        id: '1',
        iconName: 'file-document',
        iconColor: '#fff',
        iconBackgroundColor: '#0890fe',
        title: 'Alert',
        message: 'Your statement is ready for you to...',
        date: '20/08',
    },
    {
        id: '2',
        iconName: 'account',
        iconColor: 'white',
        iconBackgroundColor: '#FF4267',
        title: 'Account',
        message: 'Your account is limited. Please folli...',
        date: '20/08',
    },
];

// Sample shifts array
export const SAMPLE_SHIFT = [
    {
        id: '1',
        title: '通勤勤務 (Regular Shift)',
        backgroundColor: '#3629B7',
        time: 'FULL TIME 8:00 - 17:00',
        date: '2024-08-21',
        shiftTime: '8:00 - 17:00',
        user: 'ANH, QUAN, NGUYEN',
    },
    {
        id: '2',
        title: '夜シフト (Night Shift)',
        backgroundColor: '#6800BA',
        time: 'FULL TIME 8:00 - 17:00',
        date: '2024-08-21',
        shiftTime: '8:00 - 17:00',
        user: 'ANH, QUAN, NGUYEN',
    },
    {
        id: '3',
        title: 'シフト 6 (Shift 6)',
        backgroundColor: '#ef4444',
        time: 'FULL TIME 8:00 - 17:00',
        date: '2024-08-21',
        shiftTime: '8:00 - 17:00',
        user: 'ANH, QUAN, NGUYEN',
    },
];

// Sample shift modal array
export const SAMPLE_SHIFT_MODAL = [
    { type: '通常勤務 (Regular Shift)', name: 'ANH' },
    { type: '通常勤務 (Regular Shift)', name: 'QUAN' },
    { type: '通常勤務 (Regular Shift)', name: 'NGUYEN' },
    { type: '夜シフト (Night Shift)', name: 'ANH' },
    { type: '夜シフト (Night Shift)', name: 'QUAN' },
    { type: '夜シフト (Night Shift)', name: 'NGUYEN' },
    { type: '通常勤務 (Regular Shift)', name: 'ANH' },
    { type: '通常勤務 (Regular Shift)', name: 'QUAN' },
    { type: '通常勤務 (Regular Shift)', name: 'NGUYEN' },
];

// Sample booking data
export const SAMPLE_BOOKING_DATA = {
    customer: {
        fullName: 'Nguyễn Văn A',
        email: 'nguyenvana@email.com',
        phoneNumber: '0987654321',
    },
    hotel: 'Grand Plaza',
    rooms: [
        { name: 'Deluxe King', quantity: 2 },
        { name: 'Superior Twin', quantity: 1 },
        { name: 'Single', quantity: 1 },
    ],
    checkIn: '12/08/2024',
    checkOut: '14/08/2024',
    numberOfGuests: 2,
    nights: 2,
    roomPrice: 5000000,
    taxAndFees: 500000,
    total: 5500000,
};

// Sample booking history data
export const SAMPLE_BOOKING_HISTORY = [
    {
        id: '1',
        hotelName: 'Grand Plaza Hotel',
        status: 'checked_out',
        checkIn: '12/08/2024',
        checkOut: '14/08/2024',
        roomName: 'Deluxe King',
        guests: '2 người lớn',
        totalAmount: 5500000,
    },
    {
        id: '2',
        hotelName: 'Lotte Hotel Hanoi',
        status: 'checked_out',
        checkIn: '01/09/2024',
        checkOut: '03/09/2024',
        roomName: 'Suite Deluxe',
        guests: '1 người lớn, 1 trẻ em',
        totalAmount: 7200000,
    },
    {
        id: '3',
        hotelName: 'Vinhomes Royal City',
        status: 'pending',
        checkIn: '15/02/2026',
        checkOut: '17/02/2026',
        roomName: 'Premium Room',
        guests: '3 người lớn',
        totalAmount: 4500000,
    },
    {
        id: '4',
        hotelName: 'InterContinental Hanoi',
        status: 'cancelled',
        checkIn: '05/10/2024',
        checkOut: '07/10/2024',
        roomName: 'Twin Room',
        guests: '2 người lớn',
        totalAmount: 3800000,
    },
];

// Booking status constants (numeric codes from API)
export const BOOKING_STATUS = Object.freeze({
    CONFIRMED: 1,
    PENDING: 2,
    CHECKED_IN: 3,
    CHECKED_OUT: 4,
    CANCELLED: 5,
    REFUNDED: 6,
});

// Map legacy / string statuses to canonical numeric codes
export const BOOKING_STATUS_ALIASES = Object.freeze({
    // completed is effectively checked_out
    completed: BOOKING_STATUS.CHECKED_OUT,
    pending: BOOKING_STATUS.PENDING,
    confirmed: BOOKING_STATUS.CONFIRMED,
    checked_in: BOOKING_STATUS.CHECKED_IN,
    checked_out: BOOKING_STATUS.CHECKED_OUT,
    cancelled: BOOKING_STATUS.CANCELLED,
    canceled: BOOKING_STATUS.CANCELLED,
    refunded: BOOKING_STATUS.REFUNDED,
});

export function normalizeBookingStatus(status) {
    if (status === null || status === undefined || status === '') return '';

    // If already a known numeric status, return as‑is
    if (Object.values(BOOKING_STATUS).includes(status)) {
        return status;
    }

    const s = String(status).toLowerCase();
    return BOOKING_STATUS_ALIASES[s] || '';
}

export const BOOKING_STATUS_I18N_KEY = Object.freeze({
    [BOOKING_STATUS.PENDING]: 'bookingHistory.statusPending',
    [BOOKING_STATUS.CONFIRMED]: 'bookingHistory.statusConfirmed',
    [BOOKING_STATUS.CHECKED_IN]: 'bookingHistory.statusCheckedIn',
    [BOOKING_STATUS.CHECKED_OUT]: 'bookingHistory.statusCheckedOut',
    [BOOKING_STATUS.CANCELLED]: 'bookingHistory.statusCancelled',
    [BOOKING_STATUS.REFUNDED]: 'bookingHistory.statusRefunded',
});

// Status color constants for consistent styling across components
export const BOOKING_STATUS_COLORS = Object.freeze({
    [BOOKING_STATUS.CHECKED_OUT]: {
        backgroundColor: '#D4EDDA',
        textColor: '#155724',
    },
    [BOOKING_STATUS.PENDING]: {
        backgroundColor: '#FFF3CD',
        textColor: '#856404',
    },
    [BOOKING_STATUS.CONFIRMED]: {
        backgroundColor: '#DDEBFF',
        textColor: '#0B4FB3',
    },
    [BOOKING_STATUS.CHECKED_IN]: {
        backgroundColor: '#D1FAE5',
        textColor: '#065F46',
    },
    [BOOKING_STATUS.CANCELLED]: {
        backgroundColor: '#F8D7DA',
        textColor: '#721C24',
    },
    [BOOKING_STATUS.REFUNDED]: {
        backgroundColor: '#EDE9FE',
        textColor: '#5B21B6',
    },
});

/**
 * Get status style for booking status
 * @param {string} status - The booking status
 * @param {Object} styles - The styles object from StyleSheet
 * @param {boolean} enableWarning - Whether to log warning for invalid status (default: false)
 * @returns {Object} Object with container and text style references
 */
export function getBookingStatusStyle(status, styles) {
    switch (status) {
        case BOOKING_STATUS.CHECKED_OUT:
            return {
                container: styles.statusCompleted,
                text: styles.statusCompletedText,
            };
        case BOOKING_STATUS.PENDING:
            return {
                container: styles.statusPending,
                text: styles.statusPendingText,
            };
        case BOOKING_STATUS.CONFIRMED:
            return {
                container: styles.statusConfirmed,
                text: styles.statusConfirmedText,
            };
        case BOOKING_STATUS.CHECKED_IN:
            return {
                container: styles.statusCheckedIn,
                text: styles.statusCheckedInText,
            };
        case BOOKING_STATUS.CANCELLED:
            return {
                container: styles.statusCancelled,
                text: styles.statusCancelledText,
            };
        case BOOKING_STATUS.REFUNDED:
            return {
                container: styles.statusRefunded,
                text: styles.statusRefundedText,
            };
        default:
            return {
                container: styles.statusCancelled,
                text: styles.statusCancelledText,
            };
    }
}
