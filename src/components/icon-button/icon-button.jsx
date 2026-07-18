import PropTypes from 'prop-types';
import React, {useState} from 'react';
import classNames from 'classnames';
import TWRenderRecoloredImage from '../../lib/tw-recolor/render.jsx';
import styles from './icon-button.css';
import dropdownCaret from '../menu-bar/dropdown-caret.svg';

const IconButton = ({
    img,
    disabled,
    dropdown,
    className,
    title,
    onClick
}) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const onClickDropdown = () => setDropdownOpen(!dropdownOpen);
    return (
        <div
            className={classNames(styles.buttonContainer, className)}
            onClick={disabled ? null : (dropdown ? onClickDropdown : onClick)}
        >
            <div
                className={classNames(
                    styles.container,
                    disabled ? styles.disabled : null
                )}
                role="button"
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
                            src={dropdownCaret}
                            draggable={false}
                            width={8}
                            height={5}
                        />
                    </div>
                    {dropdownOpen && (
                        <div className={styles.dropdown}>
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
    title: PropTypes.node.isRequired
};

export default IconButton;
