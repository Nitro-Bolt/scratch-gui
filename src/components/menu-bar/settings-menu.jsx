import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import {connect} from 'react-redux';

import LanguageMenu from './language-menu.jsx';
import MenuBarMenu from './menu-bar-menu.jsx';
import {MenuItem, MenuSection} from '../menu/menu.jsx';
import MenuLabel from './tw-menu-label.jsx';
import TWAccentThemeMenu from './tw-theme-accent.jsx';
import TWGuiThemeMenu from './tw-theme-gui.jsx';
import TWBlocksThemeMenu from './tw-theme-blocks.jsx';
import TWDesktopSettings from './tw-desktop-settings.jsx';

import menuBarStyles from './menu-bar.css';
import styles from './settings-menu.css';

import dropdownCaret from './dropdown-caret.svg';
import settingsIcon from './icon--settings.svg';

import {closeSettingsMenu} from '../../reducers/menus.js';
import {openEditorSettingsModal} from '../../reducers/modals.js';

const SettingsMenu = ({
    canChangeLanguage,
    canChangeTheme,
    isRtl,
    onClickDesktopSettings,
    onClickSettings,
    onOpenCustomSettings,
    onRequestClose,
    onRequestOpen,
    settingsMenuOpen
}) => (
    <MenuLabel
        open={settingsMenuOpen}
        onOpen={onRequestOpen}
        onClose={onRequestClose}
    >
        <img
            src={settingsIcon}
            draggable={false}
            width={20}
            height={20}
        />
        <span className={styles.dropdownLabel}>
            <FormattedMessage
                defaultMessage="Settings"
                description="Settings menu"
                id="gui.menuBar.settings"
            />
        </span>
        <img
            src={dropdownCaret}
            draggable={false}
            width={8}
            height={5}
        />
        <MenuBarMenu
            className={menuBarStyles.menuBarMenu}
            open={settingsMenuOpen}
            place={isRtl ? 'left' : 'right'}
        >
            <MenuSection>
                {canChangeLanguage && <LanguageMenu onRequestCloseSettings={onRequestClose} />}
                {canChangeTheme && (
                    <React.Fragment>
                        <TWBlocksThemeMenu
                            onOpenCustomSettings={onOpenCustomSettings}
                        />
                        <TWGuiThemeMenu />
                        <TWAccentThemeMenu />
                    </React.Fragment>
                )}
                {onClickDesktopSettings && <TWDesktopSettings onClick={onClickDesktopSettings} />}
            </MenuSection>
            <MenuSection>
                <MenuItem>
                    <div
                        className={styles.option}
                        onClick={onClickSettings}
                    >
                        <img
                            src={settingsIcon}
                            draggable={false}
                            width={24}
                            height={24}
                        />
                        <FormattedMessage
                            defaultMessage="Editor Settings"
                            description="Settings menu"
                            id="gui.menuBar.editorSettings"
                        />
                    </div>
                </MenuItem>
            </MenuSection>
        </MenuBarMenu>
    </MenuLabel>
);

SettingsMenu.propTypes = {
    canChangeLanguage: PropTypes.bool,
    canChangeTheme: PropTypes.bool,
    isRtl: PropTypes.bool,
    onClickDesktopSettings: PropTypes.func,
    onClickSettings: PropTypes.func,
    onOpenCustomSettings: PropTypes.func,
    onRequestClose: PropTypes.func,
    onRequestOpen: PropTypes.func,
    settingsMenuOpen: PropTypes.bool
};

const mapStateToProps = () => ({});

const mapDispatchToProps = dispatch => ({
    onClickSettings: () => {
        dispatch(openEditorSettingsModal());
        dispatch(closeSettingsMenu());
    }
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(SettingsMenu);
