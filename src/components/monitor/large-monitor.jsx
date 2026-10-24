import React from 'react';
import PropTypes from 'prop-types';
import styles from './monitor.css';

const LargeMonitor = ({categoryColor, monitorContent, value}) => (
    <div className={styles.largeMonitor}>
        <div
            className={styles.largeValue}
            style={{
                background: categoryColor.background,
                color: categoryColor.text
            }}
        >
            {monitorContent ? (
                <div dangerouslySetInnerHTML={{__html: monitorContent}} />
            ) : value}
        </div>
    </div>
);

LargeMonitor.propTypes = {
    categoryColor: PropTypes.shape({
        background: PropTypes.string.isRequired,
        text: PropTypes.string.isRequired
    }).isRequired,
    monitorContent: PropTypes.string,
    value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
    ])
};

export default LargeMonitor;
