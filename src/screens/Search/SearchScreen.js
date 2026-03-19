import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import MasterPageLayout from '../../components/MasterPageLayout';
import { moderateSize } from '../../styles';
import SearchBar from '../../components/SearchBar';
import CustomIcon from '../../components/CustomIcon';
import { SAMPLE_ITEMS } from '../../constants/utils';

const SearchScreen = () => {
    return (
        <MasterPageLayout
            headerType="mainHeader"
            headerProps={{ username: 'Snake', notificationCount: 3 }}>
            <View style={styles.content}>
                <SearchBar placeholder="Search" />
                <View style={styles.resultsContainer}>
                    {SAMPLE_ITEMS.map((item, index) => (
                        <View key={index} style={styles.item}>
                            <CustomIcon type="FontAwesome" name="search" size={20} color="gray" style={styles.icon} />
                            <Text style={styles.title}>{item.title}</Text>
                            <Text style={styles.subtitle}>{item.subtitle}</Text>
                        </View>
                    ))}
                </View>
            </View>
        </MasterPageLayout>
    );
};

const styles = StyleSheet.create({
    content: {
        flex: 1,
        padding: moderateSize(16),
    },
    resultsContainer: {
        marginTop: moderateSize(16),
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    icon: {
        marginRight: 8,
    },
    title: {
        flex: 1,
        fontWeight: '500',
        fontSize: 16,
        lineHeight: 24,
        color: '#343434',
    },
    subtitle: {
        fontWeight: '600',
        fontSize: 12,
        color: '#979797',
    },
});

export default SearchScreen;
