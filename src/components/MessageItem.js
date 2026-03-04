import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MessageItemPropTypes } from '../utils/propTypes';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const MessageItem = ({ iconName, iconColor, iconBackgroundColor, title, message, date, style = {} }) => (
    <View style={[styles.messageContainer, style]}>
        <View style={[styles.iconContainer, { backgroundColor: iconBackgroundColor }]}>
            <Icon name={iconName} size={30} color={iconColor || 'black'} />
        </View>
        <View style={styles.textContainer}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
        </View>
        <Text style={styles.date}>{date}</Text>
    </View>
);

// Define data types for props
MessageItem.propTypes = MessageItemPropTypes;

const styles = StyleSheet.create({
    messageContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        marginVertical: 8,
        backgroundColor: '#fff',
        borderRadius: 15,
        shadowColor: '#000',
        borderBottomColor: '#ccc',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    textContainer: {
        flex: 1,
        marginLeft: 10,
    },
    title: {
        fontWeight: '500',
        fontSize: 16,
        lineHeight: 24,
        color: '#343434',
    },
    message: {
        color: '#555',
    },
    date: {
        color: '#999',
        bottom: 10,
    },
    iconContainer: {
        padding: 6,
        borderRadius: 10,
    },
});

export default MessageItem;
