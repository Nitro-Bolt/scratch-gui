import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage, defineMessages} from 'react-intl';
import {connect} from 'react-redux';

import check from './check.svg';
import {MenuItem, Submenu} from '../menu/menu.jsx';
import {GUI_DARK, GUI_LIGHT, Theme} from '../../lib/themes/index.js';
import {closeSettingsMenu, openThemeMenu, themeMenuOpen} from '../../reducers/menus.js';
import dropdownCaret from './dropdown-caret.svg';
import {setTheme} from '../../reducers/theme.js';
import {persistTheme} from '../../lib/themes/themePersistance.js';
import themeIcon from './tw-sun.svg';
import styles from './settings-menu.css';

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

const GuiThemeMenu = ({
    isOpen,
    isRtl,
    onChangeTheme,
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
                src={themeIcon}
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
                        <FormattedMessage {...options[item]} />
                    </div>
                </MenuItem>
            ))}
        </Submenu>
    </MenuItem>
);

GuiThemeMenu.propTypes = {
    isOpen: PropTypes.bool,
    isRtl: PropTypes.bool,
    onChangeTheme: PropTypes.func,
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
    onOpen: () => dispatch(openThemeMenu())
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(GuiThemeMenu);
