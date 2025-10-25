import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import Button from '../button/button.jsx';

import styles from './tag-button.css';

const TagButtonComponent = ({
    active,
    iconClassName,
    className,
    useCustomClassName,
    deleteThisButton,
    tag, // eslint-disable-line no-unused-vars
    intlLabel,
    ...props
}) => (
    <Button
        className={classNames(
            {
                [styles.tagButton]: !useCustomClassName,
                [styles.hidden]: deleteThisButton,
            },
            className, {
                [styles.active]: active
            }
        )}
        iconClassName={classNames(
            styles.tagButtonIcon,
            iconClassName
        )}
        {...props}
    >
        {typeof intlLabel === 'string' ? intlLabel : (
            <FormattedMessage {...intlLabel} />
        )}
    </Button>
);

TagButtonComponent.propTypes = {
    ...Button.propTypes,
    active: PropTypes.bool,
    useCustomClassName: PropTypes.bool,
    deleteThisButton: PropTypes.bool,
    intlLabel: PropTypes.oneOfType([
        PropTypes.shape({
            defaultMessage: PropTypes.string,
            description: PropTypes.string,
            id: PropTypes.string
        }),
        PropTypes.string
    ]).isRequired,
    tag: PropTypes.string.isRequired
};

TagButtonComponent.defaultProps = {
    active: false
};

export default TagButtonComponent;
