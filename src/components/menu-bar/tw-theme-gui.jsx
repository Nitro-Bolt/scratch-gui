import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import {connect} from 'react-redux';

import {MenuItem} from '../menu/menu.jsx';
import {closeSettingsMenu} from '../../reducers/menus.js';
import lightModeIcon from './tw-sun.svg';
import darkModeIcon from './tw-moon.svg';
import styles from './settings-menu.css';

const GuiThemeMenu = ({
    onChangeTheme
}) => (
    <MenuItem>
        <div
            className={styles.option}
            // eslint-disable-next-line react/jsx-no-bind
            onClick={() => {
                onChangeTheme()
                closeSettingsMenu()
            }}
        >
            <img
                src={localStorage.getItem("tw:theme") === 'dark' ? lightModeIcon : darkModeIcon}
                draggable={false}
                width={24}
                height={24}
            />
            <span className={styles.submenuLabel}>
                {localStorage.getItem("tw:theme") === 'dark' ? (
                    <FormattedMessage
                        defaultMessage="Switch To Light Mode"
                        description="Menu item to change color scheme to light (it is currently dark)"
                        id="tw.darkMode"
                    />
                ) : (
                    <FormattedMessage
                        defaultMessage="Switch To Dark Mode"
                        description="Menu item to change color scheme to dark (it is currently light)"
                        id="tw.lightMode"
                    />
                )}
            </span>
        </div>
    </MenuItem>
);

GuiThemeMenu.propTypes = {
    onChangeTheme: PropTypes.func
};

export default GuiThemeMenu;