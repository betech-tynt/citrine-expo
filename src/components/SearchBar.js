import React, { useState } from 'react';
import { TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import CustomIcon from '../components/CustomIcon';
import { SearchBarPropTypes } from '../utils/propTypes';

const SearchBar = ({
    placeholder,
    value,
    onChangeText,
    onSubmitEditing,
    onPress,
    inputRef,
}) => {
    // Use controlled mode if value and onChangeText are provided, otherwise use uncontrolled mode
    const isControlled = value !== undefined && onChangeText !== undefined;
    const [internalSearchText, setInternalSearchText] = useState('');

    const searchText = isControlled ? value : internalSearchText;
    const setSearchText = isControlled ? onChangeText : setInternalSearchText;

    const handleClearSearch = () => {
        setSearchText(''); // Reset the search box value to an empty string
    };

    const handleTextChange = text => {
        setSearchText(text);
    };

    const handleInputFocus = () => {
        if (onPress) {
            onPress();
        }
    };

    const handleContainerPress = () => {
        if (onPress) {
            onPress();
        }
    };

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={handleContainerPress}
            activeOpacity={onPress ? 0.7 : 1}>
            <CustomIcon
                type="EvilIcons"
                name="search"
                size={24}
                color="gray"
                style={styles.leftIcon}
            />
            <TextInput
                ref={inputRef}
                style={styles.input}
                placeholder={placeholder || 'Search'}
                value={searchText}
                onChangeText={handleTextChange}
                onSubmitEditing={onSubmitEditing}
                onFocus={handleInputFocus}
                editable={true}
            />
            {searchText.length > 0 && (
                <CustomIcon
                    type="AntDesign"
                    name="close"
                    size={24}
                    color="gray"
                    style={styles.rightIcon}
                    onPress={handleClearSearch}
                />
            )}
        </TouchableOpacity>
    );
};

// Define data types for props
SearchBar.propTypes = SearchBarPropTypes;

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#BFBFBF',
        borderRadius: 15,
        height: 48,
        paddingHorizontal: 5,
    },
    input: {
        flex: 1,
        borderWidth: 0,
        outline: 'none',
    },
    leftIcon: {
        color: '#444444',
        bottom: 2,
    },
    rightIcon: {
        color: 'gray',
    },
});

export default SearchBar;
