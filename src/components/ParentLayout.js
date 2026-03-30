import React from 'react';
import PropTypes from 'prop-types';
import MasterPageLayout from './MasterPageLayout';

/**
 * ParentLayout — wrapper around MasterPageLayout with headerPreset="parent".
 */
const ParentLayout = ({ children, ...rest }) => (
    <MasterPageLayout {...rest} headerPreset="parent">
        {children}
    </MasterPageLayout>
);

ParentLayout.propTypes = {
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

export default React.memo(ParentLayout);
