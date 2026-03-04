import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { commonStyles } from '../../theme/commonStyles';
import MainHeader from '../../components/MainHeader';
import SearchBar from '../../components/SearchBar';
import CustomIcon from '../../components/CustomIcon';
import { SAMPLE_ITEMS } from '../../constants/utils';

const SearchScreen = () => {
    return (
        <View style={styles.container}>
            <MainHeader username="Snake" notificationCount={3} />
            <View style={commonStyles.main}>
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
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    resultsContainer: {
        marginTop: 16,
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
        color: "#343434",
    },
    subtitle: {
        fontWeight: '600',
        fontSize: 12,
        color: '#979797',
    },
});

export default SearchScreen;
