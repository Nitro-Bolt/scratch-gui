import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage, defineMessages} from 'react-intl';
import {connect} from 'react-redux';

import check from './check.svg';
import {MenuItem, MenuSection, Submenu} from '../menu/menu.jsx';
import {GUI_DARK, GUI_LIGHT, Theme} from '../../lib/themes/index.js';
import {closeSettingsMenu, openThemeMenu, themeMenuOpen} from '../../reducers/menus.js';
import dropdownCaret from './dropdown-caret.svg';
import {setTheme} from '../../reducers/theme.js';
import {persistTheme} from '../../lib/themes/themePersistance.js';
import sunIcon from './tw-sun.svg';
import moonIcon from './tw-moon.svg';
import styles from './settings-menu.css';
import settingsIcon from '../menu-bar/icon--settings.svg';
import {openCustomThemeModal} from '../../reducers/modals.js';

const options = defineMessages({
    [GUI_LIGHT]: {
        defaultMessage: 'Light',
        description: 'Name of the light color scheme.',
        id: 'nb.theme.light'
    },
    [GUI_DARK]: {
        defaultMessage: 'Dark',
        description: 'Name of the dark color scheme.',
        id: 'bn.theme.dark'
    }
});

const icons = {
    [GUI_LIGHT]: sunIcon,
    [GUI_DARK]: moonIcon
};

const GuiThemeMenu = ({
    isOpen,
    isRtl,
    onChangeTheme,
    onClickCustomTheme,
    onOpen,
    theme
}) => (
    <MenuItem expanded={isOpen}>
        <div
            className={styles.option}
            // eslint-disable-next-line react/jsx-no-bind
            onClick={onOpen}
        >
            <img
                src={sunIcon}
                draggable={false}
                width={24}
                height={24}
            />
            <span className={styles.submenuLabel}>
                <FormattedMessage
                    defaultMessage="Theme"
                    description="Menu item to change color scheme"
                    id="tw.menuBar.theme"
                />
            </span>
            <img
                className={styles.expandCaret}
                src={dropdownCaret}
                draggable={false}
            />
        </div>
        <Submenu place={isRtl ? 'left' : 'right'}>
            {Object.keys(options).map(item => (
                <MenuItem
                    key={item}
                    id={item}
                    isSelected={theme.gui === item}
                    // eslint-disable-next-line react/jsx-no-bind
                    onClick={() => onChangeTheme(theme.set('gui', item))}
                >
                    <div className={styles.option}>
                        <img
                            className={classNames(styles.check, {[styles.selected]: theme.gui === item})}
                            width={15}
                            height={12}
                            src={check}
                            draggable={false}
                        />
                        {icons[item] ? <img
                            src={icons[item]}
                            draggable={false}
                            width={24}
                            height={24}
                        /> : <div
                            style={{
                                width: 24,
                                height: 24
                            }}
                        />}
                        <FormattedMessage {...options[item]} />
                    </div>
                </MenuItem>
            ))}
            <MenuSection>
                <MenuItem
                    className={styles.menuSection}
                    onClick={onClickCustomTheme}
                >
                    <div
                        className={styles.option}
                    >
                        <img
                            className={styles.check}
                            width={15}
                            height={12}
                            src={check}
                            draggable={false}
                        />
                        <img
                            src={settingsIcon}
                            draggable={false}
                            width={24}
                            height={24}
                        />
                        <FormattedMessage
                            defaultMessage="Theme Manager"
                            description="Menu item to open the custom theme manager"
                            id="nb.customTheme"
                        />
                    </div>
                </MenuItem>
            </MenuSection>
        </Submenu>
    </MenuItem>
);

GuiThemeMenu.propTypes = {
    isOpen: PropTypes.bool,
    isRtl: PropTypes.bool,
    onChangeTheme: PropTypes.func,
    onClickCustomTheme: PropTypes.func,
    onOpen: PropTypes.func,
    theme: PropTypes.instanceOf(Theme)
};

const mapStateToProps = state => ({
    isOpen: themeMenuOpen(state),
    isRtl: state.locales.isRtl,
    theme: state.scratchGui.theme.theme
});

const mapDispatchToProps = dispatch => ({
    onChangeTheme: theme => {
        dispatch(setTheme(theme));
        dispatch(closeSettingsMenu());
        persistTheme(theme);
    },
    onClickCustomTheme: () => {
        dispatch(openCustomThemeModal());
        dispatch(closeSettingsMenu());
    },
    onOpen: () => dispatch(openThemeMenu())
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(GuiThemeMenu);
