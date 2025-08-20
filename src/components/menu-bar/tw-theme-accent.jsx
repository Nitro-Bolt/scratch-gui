import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage, defineMessages} from 'react-intl';
import {connect} from 'react-redux';

import check from './check.svg';
import dropdownCaret from './dropdown-caret.svg';
import {MenuItem, Submenu} from '../menu/menu.jsx';
import {ACCENT_LIGHTBLUE, ACCENT_MAP, ACCENT_RED, ACCENT_LIME, Theme} from '../../lib/themes/index.js';
import {openAccentMenu, accentMenuOpen, closeSettingsMenu} from '../../reducers/menus.js';
import {setTheme} from '../../reducers/theme.js';
import {persistTheme} from '../../lib/themes/themePersistance.js';
import styles from './settings-menu.css';

const options = defineMessages({
    [ACCENT_RED]: {
        defaultMessage: 'Red',
        description: 'Name of the red color scheme. Matches TurboWarp.',
        id: 'tw.accent.red'
    },
    [ACCENT_LIME]: {
        defaultMessage: 'Lime Green',
        description: 'Name of the lime green color scheme. Used by DinosaurMod by default.',
        id: 'dm.accent.limegreen'
    },
    [ACCENT_LIGHTBLUE]: {
        defaultMessage: 'Light Blue',
        description: 'Name of the light blue color scheme. Matches Penguinmod\'s colors.',
        id: 'dm.accent.lightblue'
    }
});

const ColorIcon = props => (
    <div
        className={styles.accentIconOuter}
        style={{
            backgroundColor: ACCENT_MAP[props.id]['motion-primary']
        }}
    />
);

ColorIcon.propTypes = {
    id: PropTypes.string
};

const AccentMenuItem = props => (
    <MenuItem onClick={props.onClick}>
        <div className={styles.option}>
            <img
                className={classNames(styles.check, {[styles.selected]: props.isSelected})}
                width={15}
                height={12}
                src={check}
                draggable={false}
            />
            <ColorIcon id={props.id} />
            <FormattedMessage {...options[props.id]} />
        </div>
    </MenuItem>
);

AccentMenuItem.propTypes = {
    id: PropTypes.string,
    isSelected: PropTypes.bool,
    onClick: PropTypes.func
};

const AccentThemeMenu = ({
    isOpen,
    isRtl,
    onChangeTheme,
    onOpen,
    theme
}) => (
    <MenuItem expanded={isOpen}>
        <div
            className={styles.option}
            onClick={onOpen}
        >
            <ColorIcon id={theme.accent} />
            <span className={styles.submenuLabel}>
                <FormattedMessage
                    defaultMessage="Accent"
                    description="Label for menu to choose accent color (eg. TurboWarp's red, Penguinmod's blue)"
                    id="tw.menuBar.accent"
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
                <AccentMenuItem
                    key={item}
                    id={item}
                    isSelected={theme.accent === item}
                    // eslint-disable-next-line react/jsx-no-bind
                    onClick={() => {console.log(item); onChangeTheme(theme.set(item))}}
                />
            ))}
        </Submenu>
    </MenuItem>
);

AccentThemeMenu.propTypes = {
    isOpen: PropTypes.bool,
    isRtl: PropTypes.bool,
    onChangeTheme: PropTypes.func,
    onOpen: PropTypes.func,
    theme: PropTypes.instanceOf(Theme)
};

const mapStateToProps = state => ({
    isOpen: accentMenuOpen(state),
    isRtl: state.locales.isRtl,
    theme: state.scratchGui.theme.theme
});

const mapDispatchToProps = dispatch => ({
    onChangeTheme: theme => {
        dispatch(setTheme(theme));
        dispatch(closeSettingsMenu());
        persistTheme(theme);
    },
    onOpen: () => dispatch(openAccentMenu())
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AccentThemeMenu);