import React from 'react';
import PropTypes from 'prop-types';
import MasterPageLayout from './MasterPageLayout';

/**
 * ChildrenLayout — wrapper around MasterPageLayout with headerPreset="child".
 */
const ChildrenLayout = ({ children, ...rest }) => (
    <MasterPageLayout {...rest} headerPreset="child">
        {children}
    </MasterPageLayout>
);

ChildrenLayout.propTypes = {
    headerType: PropTypes.oneOf(['header', 'mainHeader', 'none']),
    headerProps: PropTypes.object,
    contentStyle: PropTypes.oneOf(['main', 'booking', 'flat']),
    backgroundColor: PropTypes.string,
    contentContainerStyle: PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.array,
        PropTypes.number,
    ]),
    children: PropTypes.node,
};

export default React.memo(ChildrenLayout);
