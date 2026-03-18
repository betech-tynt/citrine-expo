import PropTypes from 'prop-types';
import { BOOKING_STATUS } from '../constants/utils';

const StylePropType = PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.array,
    PropTypes.number, // StyleSheet.create(...)
]);

// Define data types for props
export const ButtonPropTypes = {
    title: PropTypes.string.isRequired, // 'title' is required and must be a string
    onPress: PropTypes.func.isRequired, // 'onPress' is required and must be a function
    style: StylePropType, // 'style' is optional and must be an object
    textStyle: StylePropType, // 'textStyle' is optional and must be an object
    disabled: PropTypes.bool, // 'disabled' is optional and must be a boolean
};

// Define prop types for the Header component
export const HeaderPropTypes = {
    title: PropTypes.string.isRequired, // 'title' is required and must be a string
    crudText: PropTypes.string, // 'crudText' is optional and must be a string
    onBackPress: PropTypes.func, // 'onBackPress' is optional and must be a function
    onCrudPress: PropTypes.func, // 'onCrudPress' is optional and must be a function
    onRightIconPress: PropTypes.func, // optional right icon press handler
    showBackIcon: PropTypes.bool, // 'showBackIcon' is optional and must be a boolean
    showCrudText: PropTypes.bool, // 'showCrudText' is optional and must be a boolean
    rightIcon: PropTypes.string, // optional right icon name
    rightIconType: PropTypes.string, // optional right icon type for CustomIcon
    backgroundHeight: PropTypes.number,
};

// Define prop types for the InputComponent
export const InputPropTypes = {
    placeholder: PropTypes.string, // 'placeholder' is optional and must be a string
    secureTextEntry: PropTypes.bool, // 'secureTextEntry' is optional and must be a boolean
    style: StylePropType, // 'style' is optional and must be an object
    startIcon: PropTypes.string, // 'startIcon' is optional and must be a string
    endIcon: PropTypes.string, // 'endIcon' is optional and must be a string
    onStartIconPress: PropTypes.func, // 'onStartIconPress' is optional and must be a function
    onEndIconPress: PropTypes.func, // 'onEndIconPress' is optional and must be a function
    iconSize: PropTypes.number, // 'iconSize' is optional and must be a number
    iconColor: PropTypes.string, // 'iconColor' is optional and must be a string
    value: PropTypes.string, // 'value' is optional and must be a string
    onChangeText: PropTypes.func, // 'onChangeText' is optional and must be a function
};

// Define prop types for the AppInput
export const AppInputPropTypes = {
    label: PropTypes.string,
    placeholder: PropTypes.string,
    required: PropTypes.bool,
    secureTextEntry: PropTypes.bool,
    containerStyle: PropTypes.object,
    inputContainerStyle: PropTypes.object,
    inputStyle: PropTypes.object,
    labelStyle: PropTypes.object,
    errorStyle: PropTypes.object,
    errorMessage: PropTypes.string,
    startIcon: PropTypes.string,
    endIcon: PropTypes.string,
    rightIcon: PropTypes.node,
    onStartIconPress: PropTypes.func,
    onEndIconPress: PropTypes.func,
    onRightIconPress: PropTypes.func,
    iconSize: PropTypes.number,
    iconColor: PropTypes.string,
    value: PropTypes.string,
    onChangeText: PropTypes.func,
    disabled: PropTypes.bool,
};

export const FormInputPropTypes = {
    label: PropTypes.string,
    width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    containerStyle: StylePropType,
    labelStyle: StylePropType,
    inputStyle: StylePropType,
    placeholder: PropTypes.string,
    secureTextEntry: PropTypes.bool,
    value: PropTypes.string,
    onChangeText: PropTypes.func,
};

// Define prop types for the MainHeaderComponent
export const MainHeaderPropTypes = {
    username: PropTypes.string.isRequired, // 'username' is must be a string
    notificationCount: PropTypes.number.isRequired, // 'notificationCount' is must be a number
};

export const TimeSheetPropTypes = {
    visible: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    title: PropTypes.string,
    children: PropTypes.node,
    closeText: PropTypes.string,
    customButtons: PropTypes.node,
    modalStyle: PropTypes.object,
    overlayStyle: PropTypes.object,
};

export const RadioButtonPropTypes = {
    checked: PropTypes.bool.isRequired,
    onPress: PropTypes.func.isRequired,
};

export const CheckboxPropTypes = {
    checked: PropTypes.bool.isRequired,
    onPress: PropTypes.func.isRequired,
    size: PropTypes.number,
    style: StylePropType,
};

export const TimesheetDetailsModalPropTypes = {
    visible: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    date: PropTypes.string,
    // shifts: PropTypes.array
    shifts: PropTypes.arrayOf(
        PropTypes.shape({
            type: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
        }),
    ).isRequired,
};

export const CustomerSearchFilterModalPropTypes = {
    visible: PropTypes.bool.isRequired,
    filter: PropTypes.shape({
        checkInISO: PropTypes.string,
        checkOutISO: PropTypes.string,
        adults: PropTypes.number,
        children: PropTypes.number,
    }).isRequired,
    onChange: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    onApply: PropTypes.func.isRequired,
};

// Booking calendar modal (CustomerBookingScreen)
export const BookingCalendarModalPropTypes = {
    visible: PropTypes.bool.isRequired,
    mode: PropTypes.oneOf(['checkIn', 'checkOut']).isRequired,
    tempISO: PropTypes.string,
    onChangeTempISO: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
};

// Define prop types
export const SearchBarPropTypes = {
    placeholder: PropTypes.string, // placeholder is a string
    value: PropTypes.string, // value for controlled input
    onChangeText: PropTypes.func, // onChangeText handler for controlled input
    onSubmitEditing: PropTypes.func, // onSubmitEditing handler for Enter key press
    onPress: PropTypes.func, // onPress handler for tapping the search bar
    inputRef: PropTypes.object, // ref for the TextInput element
};

// Define prop types
export const CustomIconPropTypes = {
    type: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    size: PropTypes.number,
    color: PropTypes.string,
    style: StylePropType,
    onPress: PropTypes.func,
    // used by FontAwesome5 / FontAwesome6 icon sets
    solid: PropTypes.bool,
    brand: PropTypes.bool,
};

// Define prop types for the MainHeaderComponent
export const MessageItemPropTypes = {
    iconName: PropTypes.string.isRequired,
    iconColor: PropTypes.string,
    iconBackgroundColor: PropTypes.string,
    title: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    style: StylePropType,
};

// Define prop types for the Success component
export const SuccessPropTypes = {
    message: PropTypes.string.isRequired,
    onDone: PropTypes.func.isRequired,
    title: PropTypes.string,
    buttonTitle: PropTypes.string,
    style: StylePropType,
};

// Define prop types for FilterTabs component
export const FilterTabsPropTypes = {
    filters: PropTypes.arrayOf(
        PropTypes.shape({
            key: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired,
        }),
    ).isRequired,
    selectedFilter: PropTypes.string.isRequired,
    onFilterPress: PropTypes.func.isRequired,
};

// Define prop types for RoomItem component
export const RoomItemPropTypes = {
    language: PropTypes.string,
    room: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
            .isRequired,
        name: PropTypes.string,
        nameEn: PropTypes.string,
        nameJp: PropTypes.string,
        address: PropTypes.string,
        addressEn: PropTypes.string,
        addressJp: PropTypes.string,
        price: PropTypes.string,
        priceEn: PropTypes.string,
        priceJp: PropTypes.string,
        rating: PropTypes.number,
        reviews: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        image: PropTypes.oneOfType([PropTypes.string, PropTypes.oneOf([null])]),
        category: PropTypes.string,
    }).isRequired,
};

// Define prop types for the BookingInfoRow component
export const BookingInfoRowTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    showIcon: PropTypes.bool,
    isLast: PropTypes.bool,
};

// Define prop types for the GuestCounterRow component
export const GuestCounterRowTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    onDecrease: PropTypes.func.isRequired,
    onIncrease: PropTypes.func.isRequired,
    isLast: PropTypes.bool,
};

// Define prop types for the CounterButton component
export const CounterButtonTypes = {
    label: PropTypes.string.isRequired,
    onPress: PropTypes.func.isRequired,
};

// Define prop types for the ProfileSummaryCard component
export const ProfileSummaryCardPropTypes = {
    data: PropTypes.array.isRequired,
    labelColor: PropTypes.string,
    valueColor: PropTypes.string,
    labelSize: PropTypes.number,
    valueSize: PropTypes.number,
    labelFontWeight: PropTypes.string,
    valueFontWeight: PropTypes.string,
};

// Define prop types for the ProfileInfoRow component
export const ProfileInfoRowPropTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    isLast: PropTypes.bool,
    labelColor: PropTypes.string,
    valueColor: PropTypes.string,
    labelSize: PropTypes.number,
    valueSize: PropTypes.number,
    labelFontWeight: PropTypes.string,
    valueFontWeight: PropTypes.string,
};

// Define prop types for the InfoRow component
export const InfoRowPropTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    isTotal: PropTypes.bool,
    isFirst: PropTypes.bool,
    valueNumberOfLines: PropTypes.number,
};

// Define prop types for the StarRating component
export const StarRatingPropTypes = {
    rating: PropTypes.number,
};

// CustomerRoomInfoScreen helpers
export const AmenityGridPropTypes = {
    items: PropTypes.arrayOf(
        PropTypes.shape({
            key: PropTypes.string.isRequired,
            iconType: PropTypes.string.isRequired,
            iconName: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired,
        }),
    ),
};

export const BottomBookingBarPropTypes = {
    priceText: PropTypes.string.isRequired,
    perNightText: PropTypes.string.isRequired,
    roomsText: PropTypes.string,
    buttonText: PropTypes.string.isRequired,
    onPress: PropTypes.func.isRequired,
};

// Extends the basic StarRatingPropTypes for this screen implementation
export const CustomerRoomInfoStarRatingPropTypes = {
    rating: PropTypes.number,
    max: PropTypes.number,
    countText: PropTypes.string,
    size: PropTypes.number,
};

// Define prop types for the LodgingCard component
export const LodgingCardPropTypes = {
    name: PropTypes.string,
    price: PropTypes.string,
    priceLabel: PropTypes.string,
    rating: PropTypes.number,
    coverImage: PropTypes.string,
};

// Define prop types for the PromotionCard component
export const PromotionCardPropTypes = {
    badge: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    conditions: PropTypes.arrayOf(PropTypes.string).isRequired,
    type: PropTypes.string.isRequired,
    t: PropTypes.func.isRequired,
};

// Define prop types for the Account Profile component
export const AccountProfilePropTypes = {
    t: PropTypes.func.isRequired,
    userData: PropTypes.shape({
        name: PropTypes.string,
        username: PropTypes.string,
        email: PropTypes.string,
        phone: PropTypes.string,
        address: PropTypes.string,
        dob: PropTypes.string,
        role: PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
            name: PropTypes.string,
            code: PropTypes.string,
        }),
        avatarImage: PropTypes.string,
    }).isRequired,
    userPhoto: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object,
        PropTypes.oneOf([null]),
    ]),
    backgroundImage: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object,
        PropTypes.oneOf([null]),
    ]),
    onPressAvatar: PropTypes.func.isRequired,
    onPressBackground: PropTypes.func.isRequired,
    onPressEditProfile: PropTypes.func.isRequired,
};

// Define prop types for the Account SettingMenu component
export const AccountSettingMenuPropTypes = {
    t: PropTypes.func.isRequired,
    navigation: PropTypes.shape({
        navigate: PropTypes.func.isRequired,
        replace: PropTypes.func,
        goBack: PropTypes.func,
    }).isRequired,
    promotionEnabled: PropTypes.bool.isRequired,
    setPromotionEnabled: PropTypes.func.isRequired,
    getCurrentLanguageName: PropTypes.func.isRequired,
    displayVersion: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
        .isRequired,
    onCheckUpdates: PropTypes.func.isRequired,
    onLogout: PropTypes.func.isRequired,
};

// Define prop types for the PaymentMethodRow component
export const PaymentMethodRowPropTypes = {
    method: PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        icon: PropTypes.string.isRequired,
    }).isRequired,
    isSelected: PropTypes.bool.isRequired,
    onSelect: PropTypes.func.isRequired,
};

// Define prop types for the TotalAmountDisplay component
export const TotalAmountDisplayPropTypes = {
    amount: PropTypes.number.isRequired,
};

// Define prop types for the BookingHistoryCard component
export const BookingHistoryCardPropTypes = {
    booking: PropTypes.shape({
        // From API: src/services/apiBookingHistory.js
        id: PropTypes.number,
        code: PropTypes.string,
        section_name: PropTypes.string,
        // status can be a value from BOOKING_STATUS or a raw string/number from API
        status: PropTypes.oneOfType([
            PropTypes.oneOf(Object.values(BOOKING_STATUS)),
            PropTypes.number,
            PropTypes.string,
        ]),
        check_in_at: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.instanceOf(Date),
        ]),
        check_out_at: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.instanceOf(Date),
        ]),
        guest_count: PropTypes.shape({
            adults: PropTypes.number,
            children: PropTypes.number,
        }),
        room_details: PropTypes.string,
        total_price: PropTypes.number,
    }),
    t: PropTypes.func,
};
