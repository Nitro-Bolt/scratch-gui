import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import dropdownCaret from '../nb-rich-dropdown/dropdown-caret.svg';
import styles from './dropdown.css';

const FancyDropdown = ({children, className, disabled, ...props}) => (
    <div className={classNames(styles.wrapper, className)}>
        <select
            {...props}
            className={styles.select}
            disabled={disabled}
        >
            {children}
        </select>
        <img
            alt=""
            className={styles.caret}
            draggable={false}
            height={5}
            src={dropdownCaret}
            width={8}
        />
    </div>
);

FancyDropdown.propTypes = {
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
    disabled: PropTypes.bool
};

export default FancyDropdown;
