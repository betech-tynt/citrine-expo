import React from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Platform } from 'react-native';
import PropTypes from 'prop-types';

const KeyboardAwareWrapper = ({
    children,
    style,
    contentContainerStyle,
    ...props
}) => {
    return (
        <KeyboardAwareScrollView
            style={style}
            contentContainerStyle={[{ flexGrow: 1 }, contentContainerStyle]}
            enableOnAndroid={true}
            keyboardShouldPersistTaps="handled"
            extraScrollHeight={Platform.OS === 'ios' ? 20 : 80}
            showsVerticalScrollIndicator={false}
            {...props}>
            {children}
        </KeyboardAwareScrollView>
    );
};

export default KeyboardAwareWrapper;

KeyboardAwareWrapper.propTypes = {
    children: PropTypes.node.isRequired,
    style: PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.array,
        PropTypes.number,
    ]),
    contentContainerStyle: PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.array,
        PropTypes.number,
    ]),
};
