import React from 'react';
import { FlatList } from 'react-native-gesture-handler';
import MessageItem from '../../components/MessageItem';
import ParentLayout from '../../components/ParentLayout';
import { SAMPLE_MESSAGE } from '../../constants/utils';
import { moderateSize } from '../../styles';

const MessageScreen = () => {
    return (
        <ParentLayout
            headerType="mainHeader"
            headerProps={{ username: 'Snake', notificationCount: 3 }}>
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
                contentContainerStyle={{ padding: moderateSize(16) }}
            />
        </ParentLayout>
    );
};

export default MessageScreen;
