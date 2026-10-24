import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import dropdownCaret from '../dropdown-caret.svg';
import styles from './dropdown.css';

const FancyDropdown = ({children, className, disabled, selectClassName, ...props}) => (
    <div className={classNames(styles.wrapper, className)}>
        <select
            {...props}
            className={classNames(styles.select, selectClassName)}
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
    disabled: PropTypes.bool,
    selectClassName: PropTypes.string
};

export default FancyDropdown;
