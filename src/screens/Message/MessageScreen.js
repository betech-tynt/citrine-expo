import React from 'react';
import { StyleSheet, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import MainHeader from '../../components/MainHeader';
import MessageItem from '../../components/MessageItem';
import { SAMPLE_MESSAGE } from '../../constants/utils';
import { commonStyles } from '../../theme/commonStyles';

const MessageScreen = () => {
    return (
        <View style={styles.container}>
            <MainHeader username="Snake" notificationCount={3} />
            <View style={commonStyles.main}>
                <FlatList
                    data={SAMPLE_MESSAGE}
                    renderItem={({ item }) => (
                        <MessageItem
                            iconName={item.iconName}
                            iconColor={item.iconColor}
                            iconBackgroundColor={item.iconBackgroundColor}
                            title={item.title}
                            message={item.message}
                            date={item.date}
                        />
                    )}
                    keyExtractor={item => item.id}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default MessageScreen;
