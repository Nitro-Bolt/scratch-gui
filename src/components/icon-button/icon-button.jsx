import PropTypes from 'prop-types';
import React, {useState} from 'react';
import classNames from 'classnames';
import TWRenderRecoloredImage from '../../lib/tw-recolor/render.jsx';
import styles from './icon-button.css';
import dropdownCaretWhite from '../menu-bar/dropdown-caret.svg';
import dropdownCaretBlack from './dropdown-caret.svg';
import {connect} from 'react-redux';
import {GUI_DARK, Theme} from '../../lib/themes/index.js';

const IconButton = ({
    img,
    disabled,
    dropdown,
    className,
    title,
    onClick,
    theme
}) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const onClickDropdown = () => setDropdownOpen(!dropdownOpen);
    return (
        <div
            className={classNames(styles.buttonContainer, className)}
            onClick={disabled ? null : (dropdown ? onClickDropdown : onClick)}
            role="button"
        >
            <div
                className={classNames(
                    styles.container,
                    disabled ? styles.disabled : null
                )}
            >
                <TWRenderRecoloredImage
                    className={styles.icon}
                    draggable={false}
                    src={img}
                />
                <div className={styles.title}>
                    {title}
                </div>
            </div>
            {dropdown && (
                <>
                    <div
                        className={styles.dropdownContainer}
                        role="button"
                        onClick={disabled ? null : onClickDropdown}
                    >
                        <img
                            src={theme === GUI_DARK ? dropdownCaretWhite : dropdownCaretBlack}
                            draggable={false}
                            width={8}
                            height={5}
                        />
                    </div>
                    {dropdownOpen && (
                        <div
                            className={styles.dropdown}
                            // eslint-disable-next-line react/jsx-no-bind
                            onClick={event => event.stopPropagation()}
                        >
                            {dropdown}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

IconButton.propTypes = {
    className: PropTypes.string,
    disabled: PropTypes.bool,
    dropdown: PropTypes.node,
    img: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
    onClick: PropTypes.func.isRequired,
    title: PropTypes.node.isRequired,
    theme: PropTypes.string.isRequired
};

const mapStateToProps = state => ({
    theme: state.scratchGui.theme.theme.gui
});

export default connect(
    mapStateToProps
)(IconButton);
