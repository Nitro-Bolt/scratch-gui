import React from 'react';
import styles from './styles.css';
import dropdownCaret from './dropdown-caret.svg';
import classNames from 'classnames';
import PropTypes from 'prop-types';

const RichDropdown = function ({label, children}) {
    const [isCollapsed, setIsCollapsed] = React.useState(false);
    const toggleCollapsed = React.useCallback(() => {
        setIsCollapsed(collapsed => !collapsed);
    }, []);

    return (
        <div
            className={classNames(styles.wrapper, {
                [styles.collapsed]: isCollapsed
            })}
        >
            <div
                className={styles.header}
                onClick={toggleCollapsed}
            >
                <img
                    className={styles.caret}
                    src={dropdownCaret}
                    draggable={false}
                    width={8}
                    height={5}
                    style={{
                        transform: `rotate(${isCollapsed ? -90 : 0}deg)`,
                        filter: 'var(--filter-icon-black)',
                        verticalAlign: 'middle'
                    }}
                />
                <span>{label}</span>
            </div>
            <div className={styles.body}>{children}</div>
        </div>
    );
};

RichDropdown.propTypes = {
    label: PropTypes.string,
    children: PropTypes.node
};

export default RichDropdown;
