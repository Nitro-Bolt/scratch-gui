import PropTypes from 'prop-types';
import React, {useRef, useEffect} from 'react';

import styles from './color-picker.css';

import paletteIcon from './icon--palette.svg';

const FancyColorPicker = ({
    value,
    onChange,
    onCommit,
    showIcon,
    className,
    rootClassName,
    size
}) => {
    const inputRef = useRef(null);

    useEffect(() => {
        const el = inputRef.current;
        if (!el || !onCommit) return;
        el.addEventListener('change', onCommit);
        return () => el.removeEventListener('change', onCommit);
    }, [onCommit]);

    const handleChange = event => {
        onChange(event.target.value);
    };

    return (
        <span className={`${styles.colorPickerWrapper}${rootClassName ? ` ${rootClassName}` : ''}`}>
            <input
                ref={inputRef}
                type="color"
                value={value}
                draggable={false}
                style={{backgroundColor: value, width: size, height: size}}
                className={`${styles.colorPicker}${className ? ` ${className}` : ''}`}
                // eslint-disable-next-line react/jsx-no-bind
                onChange={handleChange}
                aria-label="Custom color"
            />
            {showIcon && (
                <img
                    src={paletteIcon}
                    className={styles.paletteIcon}
                    draggable={false}
                    aria-hidden="true"
                />
            )}
        </span>
    );
};

FancyColorPicker.propTypes = {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    onCommit: PropTypes.func,
    showIcon: PropTypes.bool,
    className: PropTypes.string,
    rootClassName: PropTypes.string,
    size: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

FancyColorPicker.defaultProps = {
    showIcon: true,
    size: 35
};

export default FancyColorPicker;
