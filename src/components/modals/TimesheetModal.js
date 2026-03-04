import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { TimeSheetPropTypes } from '../../utils/propTypes';

const TimesheetModal = ({
    visible,
    onClose,
    title,
    children,
    closeText,
    customButtons = null,
    modalStyle = {},
    overlayStyle = {}
}) => {
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose} // Close modal when pressing back button on Android
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={[styles.modalOverlay, overlayStyle]}>
                    <TouchableWithoutFeedback>
                        <View style={[styles.modalContent, modalStyle]}>
                            {/* Title modal */}
                            {title && <Text style={styles.modalTitle}>{title}</Text>}

                            <View style={styles.modalBody}>
                                {children}
                            </View>

                            <View style={styles.modalFooter}>
                                {customButtons ? (
                                    customButtons
                                ) : (
                                    closeText && (
                                        <TouchableOpacity onPress={onClose}>
                                            <Text style={styles.closeText}>{closeText}</Text>
                                        </TouchableOpacity>
                                    )
                                )}
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

// Define data types for props
TimesheetModal.propTypes = TimeSheetPropTypes;

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Background modal
    },
    modalContent: {
        width: 300,
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
        alignSelf: 'center',
        // color: 'black',
    },
    modalBody: {
        marginBottom: 20,
    },
    modalFooter: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    closeText: {
        fontSize: 16,
        color: 'blue',
    },
});

export default TimesheetModal;
