import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';

import styles from './delete-button.css';
import deleteIcon from './icon--delete.svg';
import undoIcon from './icon--undo.svg';

const DeleteButton = props => (
    <div
        aria-label={props.useUndoIcon ? 'Undo' : 'Delete'}
        className={classNames(
            styles.deleteButton,
            props.className
        )}
        role="button"
        tabIndex={props.tabIndex}
        onClick={props.onClick}
    >
        <div className={styles.deleteButtonVisible}>
            <img
                className={styles.deleteIcon}
                src={props.useUndoIcon ? undoIcon : deleteIcon}
                draggable={false}
            />
        </div>
    </div>

);

DeleteButton.propTypes = {
    className: PropTypes.string,
    onClick: PropTypes.func.isRequired,
    tabIndex: PropTypes.number,
    useUndoIcon: PropTypes.bool
};

DeleteButton.defaultProps = {
    tabIndex: 0,
    useUndoIcon: false
};

export default DeleteButton;
