import React from 'react';
import { Modal, StyleSheet, Text, View, TouchableWithoutFeedback } from 'react-native';
import { TimesheetDetailsModalPropTypes } from '../../utils/propTypes';
import { TouchableOpacity } from 'react-native-gesture-handler';
// import Icon from 'react-native-vector-icons/MaterialIcons';

const TimesheetDetailsModal = ({ visible, onClose, date, shifts }) => {
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.centeredView}>
                    <TouchableWithoutFeedback onPress={() => {}}>
                        <View style={styles.modalView}>
                            <View style={styles.header}>
                                <Text style={styles.dateText}>{date}</Text>
                                {/* <TouchableOpacity onPress={onClose} style={styles.closeIcon}>
                                    <Icon name="close" size={24} color="black" />
                                </TouchableOpacity> */}
                            </View>
                            {shifts.map((shift, index) => (
                                <View key={index} style={styles.shiftRow}>
                                    <Text style={styles.dot}></Text>
                                    <Text style={styles.shiftText}>{shift.type}</Text>
                                    <Text style={styles.nameText}>{shift.name}</Text>
                                </View>
                            ))}
                            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                                <Text style={styles.closeButtonText}>View Details</Text>
                            </TouchableOpacity>
                        </View>
                        
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

// Define data types for props
TimesheetDetailsModal.propTypes = TimesheetDetailsModalPropTypes;

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 15,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    shiftRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
        paddingTop: 10,
    },
    shiftText: {
        fontSize: 16,
        flex: 1,
    },
    nameText: {
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'right',
        color: "#A4A4A5",
    },
    closeButton: {
        marginTop: 20,
        padding: 10,
        backgroundColor: '#3629B7',
        borderRadius: 15,
        alignItems: 'center',
        paddingHorizontal: 106,
    },
    closeButtonText: {
        color: 'white',
        fontSize: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 4,
        borderBottomWidth: 1,
        borderBottomColor: '#BCC1CD',
    },
    dateText: {
        flex: 1,
        textAlign: 'center',
        fontSize: 20,
        fontWeight: '600',
        color: '#343434',
        marginBottom: 10,
    },
    closeIcon: {
        padding: 10,
        zIndex: 1,
        backgroundColor: 'rgba(255, 0, 0, 0.1)',
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: 'blue',
        marginRight: 10,
        alignSelf: 'center',
        marginTop: 5,
    },
});

export default TimesheetDetailsModal;
