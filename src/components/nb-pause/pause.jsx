import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import pauseIcon from './icon--pause.svg';
import playIcon from './icon--play.svg';
import styles from './pause.css';

const PauseComponent = function (props) {
    const {
        paused,
        className,
        onClick,
        title,
        ...componentProps
    } = props;
    return (
        <img
            className={classNames(className, styles.pause)}
            draggable={false}
            src={paused ? playIcon : pauseIcon}
            title={title}
            onClick={onClick}
            // tw: also fire click when opening context menu (right click on all systems and alt+click on chromebooks)
            onContextMenu={onClick}
            {...componentProps}
        />
    );
};
PauseComponent.propTypes = {
    paused: PropTypes.bool,
    className: PropTypes.string,
    onClick: PropTypes.func.isRequired,
    title: PropTypes.string
};
PauseComponent.defaultProps = {
    paused: false,
    title: 'Pause'
};
export default PauseComponent;
