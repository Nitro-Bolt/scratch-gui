import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import stepIcon from './icon--step.svg';
import styles from './step.css';

const StepComponent = function (props) {
    const {
        className,
        onClick,
        title,
        ...componentProps
    } = props;
    return (
        <img
            className={classNames(className, styles.step)}
            draggable={false}
            src={stepIcon}
            title={title}
            onClick={onClick}
            // tw: also fire click when opening context menu (right click on all systems and alt+click on chromebooks)
            onContextMenu={onClick}
            {...componentProps}
        />
    );
};
StepComponent.propTypes = {
    className: PropTypes.string,
    onClick: PropTypes.func.isRequired,
    title: PropTypes.string
};
StepComponent.defaultProps = {
    title: 'Step'
};
export default StepComponent;
