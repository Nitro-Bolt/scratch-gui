import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage, defineMessages} from 'react-intl';
import {connect} from 'react-redux';

import check from './check.svg';
import dropdownCaret from './dropdown-caret.svg';
import {MenuItem, Submenu} from '../menu/menu.jsx';
import {ACCENT_LIGHTBLUE, ACCENT_MAP, ACCENT_RED, ACCENT_LIME, ACCENT_BLUE, ACCENT_SCRATCH, ACCENT_MAGENTA, ACCENT_RAINBOW, Theme} from '../../lib/themes/index.js';
import {openAccentMenu, accentMenuOpen, closeSettingsMenu} from '../../reducers/menus.js';
import {setTheme} from '../../reducers/theme.js';
import {persistTheme} from '../../lib/themes/themePersistance.js';
import rainbowIcon from './tw-accent-rainbow.svg';
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
    },
    [ACCENT_SCRATCH]: {
        defaultMessage: 'Scratch',
        description: 'Name of the Scratch\'s color scheme. Matches Scratch-GUI\'s colors.',
        id: 'dm.accent.scratch'
    },
    [ACCENT_MAGENTA]: {
        defaultMessage: 'Magenta',
        description: 'Name of the magenta (sort of) color scheme. Matches Snail-IDE\'s colors.',
        id: 'dm.accent.magenta'
    },
    [ACCENT_BLUE]: {
        defaultMessage: 'Blue',
        description: 'Name of the blue color scheme. Matches Scratch before the high contrast update.',
        id: 'tw.accent.blue'
    },
    [ACCENT_RAINBOW]: {
        defaultMessage: 'Rainbow',
        description: 'Name of color scheme that uses a rainbow.',
        id: 'tw.accent.rainbow'
    }
});

const icons = {
    [ACCENT_RAINBOW]: rainbowIcon
};

const ColorIcon = props => (
    icons[props.id] ? (
        <img
            className={styles.accentIconOuter}
            src={icons[props.id]}
            draggable={false}
            // Image is decorative
            alt=""
        />
    ) : (
        <div
            className={styles.accentIconOuter}
            style={{
                // menu-bar-background is var(...), don't want to evaluate with the current values
                backgroundColor: ACCENT_MAP[props.id]['motion-primary']
            }}
        />
    )
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
                    onClick={() => onChangeTheme(theme.set(item))}
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