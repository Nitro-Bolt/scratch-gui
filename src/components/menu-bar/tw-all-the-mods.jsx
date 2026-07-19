import classNames from 'classnames';
import {FormattedMessage} from 'react-intl';
import PropTypes from 'prop-types';
import React from 'react';
import Button from '../button/button.jsx';

import styles from './tw-all-the-mods.css';
import backgroundImage from './tw-all-the-mods.png';

const AllTheModsButton = ({
    className,
    onClick
}) => (
    <a
        href="https://itch.io/jam/all-the-mods-game-jam"
        rel="noopener noreferrer"
        target="_blank"
    >
        <Button
            className={classNames(
                className,
                styles.allTheModsButton
            )}
            onClick={onClick}
            style={{
                '--image': `url(${backgroundImage})`
            }}
        >
            <FormattedMessage
                defaultMessage="All The Mods! Game Jam"
                description="Button to view information about the All The Mods Game Jam in the menu bar"
                id="tw.allTheModsButton"
            />
        </Button>
    </a>
);

AllTheModsButton.propTypes = {
    className: PropTypes.string,
    onClick: PropTypes.func
};

AllTheModsButton.defaultProps = {
    onClick: () => {}
};

export default AllTheModsButton;
