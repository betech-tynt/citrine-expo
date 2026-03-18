import React from 'react';
import { StyleSheet, View } from 'react-native';
import { commonStyles } from '../../theme/commonStyles';
import MessageItem from '../../components/MessageItem';
import { FlatList } from 'react-native-gesture-handler';
import { SAMPLE_MESSAGE } from '../../constants/utils';
import MainHeader from '../../components/MainHeader';

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
                    keyExtractor={item => item?.id?.toString() || ''}
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
