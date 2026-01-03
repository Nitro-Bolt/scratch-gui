import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage, defineMessages} from 'react-intl';
import {connect} from 'react-redux';

import check from './check.svg';
import dropdownCaret from './dropdown-caret.svg';
import {gradientDataToCSS} from '../../lib/nb-gradient-to-css.js';
import {MenuItem, MenuSection, Submenu} from '../menu/menu.jsx';
import {
    ACCENT_ORANGE,
    ACCENT_RED,
    ACCENT_PURPLE,
    ACCENT_BLUE,
    ACCENT_RAINBOW,
    ACCENT_CUSTOM,
    ACCENT_MAP,
    Theme
} from '../../lib/themes/index.js';
import {openAccentMenu, accentMenuOpen, closeSettingsMenu} from '../../reducers/menus.js';
import {setTheme} from '../../reducers/theme.js';
import {persistTheme} from '../../lib/themes/themePersistance.js';
import rainbowIcon from './tw-accent-rainbow.svg';
import styles from './settings-menu.css';
import settingsIcon from '../menu-bar/icon--settings.svg';

const options = defineMessages({
    [ACCENT_ORANGE]: {
        defaultMessage: 'Orange',
        description: 'Name of the orange color scheme, used by NitroBolt by default.',
        id: 'tw.accent.orange'
    },
    [ACCENT_RED]: {
        defaultMessage: 'Red',
        description: 'Name of the red color scheme, used by TurboWarp.',
        id: 'tw.accent.red'
    },
    [ACCENT_PURPLE]: {
        defaultMessage: 'Purple',
        description: 'Name of the purple color scheme. Matches modern Scratch.',
        id: 'tw.accent.purple'
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
                backgroundColor: props.id === ACCENT_CUSTOM ? 'var(--looks-secondary)' :
                    ACCENT_MAP[props.id].guiColors['looks-secondary'],
                backgroundImage: props.id === ACCENT_CUSTOM ? props.isGradient && props.gradient ?
                    gradientDataToCSS(props.gradient.colors, props.gradient.direction) :
                    'none' :
                    ACCENT_MAP[props.id].guiColors['menu-bar-background-image']
            }}
        />
    )
);

ColorIcon.propTypes = {
    id: PropTypes.string,
    isGradient: PropTypes.bool,
    gradient: PropTypes.any
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
}) => {
    if (!localStorage.getItem('nb:custom-accents')) localStorage.setItem('nb:custom-accents', '[]');
    /**
     * @type {any[]}
     */
    const themes = JSON.parse(localStorage.getItem('nb:custom-accents'));

    return (
        <MenuItem expanded={isOpen}>
            <div
                className={styles.option}
                onClick={onOpen}
            >
                <ColorIcon
                    id={Object.hasOwn(theme.accent, 'primaryColor') ? ACCENT_CUSTOM : theme.accent}
                    isGradient={theme.accent?.isGradient}
                    gradient={theme.accent?.gradient}
                />
                <span className={styles.submenuLabel}>
                    <FormattedMessage
                        defaultMessage="Accent"
                        description="Label for menu to choose accent color (eg. TurboWarp's red, Scratch's purple)"
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
                        onClick={() => onChangeTheme(theme.set('accent', item))}
                    />
                ))}
                <MenuSection>
                    {themes.sort((a, b) => a.name.toLowerCase() > b.name.toLowerCase()).map((value, index) => (
                        <MenuItem
                            className={styles.menuSection}
                            // eslint-disable-next-line react/jsx-no-bind
                            onClick={() => onChangeTheme(theme.set('accent', value))}
                            key={index}
                        >
                            <div
                                className={styles.option}
                            >
                                <img
                                    className={classNames(styles.check,
                                        {[styles.selected]: theme.accent.name === value.name})}
                                    width={15}
                                    height={12}
                                    src={check}
                                    draggable={false}
                                />
                                <div
                                    className={styles.accentIconOuter}
                                    style={{
                                        backgroundColor: value.primaryColor,
                                        backgroundImage: value.isGradient && value.gradient ?
                                            gradientDataToCSS(value.gradient.colors, value.gradient.direction) :
                                            'none'
                                    }}
                                />
                                {value.name}
                            </div>
                        </MenuItem>
                    ))}
                </MenuSection>
            </Submenu>
        </MenuItem>
    );
};

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
