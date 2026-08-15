import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import styles from './debugger.css';

const TabButton = ({
    label,
    icon,
    onClick,
    selected
}) => (
    <div
        onClick={onClick}
        className={selected ? classNames(styles.tabButton, styles.selected) : styles.tabButton}
    >
        {icon &&
            <img
                src={icon}
                width={16}
                height={16}
            />
        }
        <span>{label}</span>
    </div>
);

TabButton.propTypes = {
    label: PropTypes.string.isRequired,
    icon: PropTypes.string,
    selected: PropTypes.bool.isRequired
};

export default TabButton;