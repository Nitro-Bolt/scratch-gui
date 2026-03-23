import PropTypes from 'prop-types';
import React, {useRef, useEffect} from 'react';

import styles from './color-picker.css';

import paletteIcon from './icon--palette.svg';

const ColorPicker = ({value, onChange, onClick, onCommit, label, showIcon, className, size, pickerDisabled}) => {
    const inputRef = useRef(null);

    useEffect(() => {
        const el = inputRef.current;
        if (!el || !onCommit) return;
        el.addEventListener('change', onCommit);
        return () => el.removeEventListener('change', onCommit);
    }, []);
    
    useEffect(() => {                          
        const el = inputRef.current;
        if (!el || !onClick) return;
        el.addEventListener('click', onClick);
        return () => el.removeEventListener('click', onClick);
    }, []);

    return (
        <div className={styles.colorPickerRoot}>
            {label !== false && (
                <div className={styles.label}>
                    {typeof label === 'string' ? label : 'Select a color'}
                </div>
            )}
            <div className={styles.colorRow}>
                <div className={styles.colorPickerWrapper}>
                    {pickerDisabled ? (
                        <div
                            ref={inputRef}
                            role="button"
                            tabIndex={0}
                            style={{backgroundColor: value, width: size, height: size}}
                            className={`${styles.colorPicker}${className ? ` ${className}` : ''}`}
                            aria-label="Custom color"
                            onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onClick && onClick(e)}
                        />
                    ) : (
                        <input
                            ref={inputRef}
                            type="color"
                            value={value}
                            draggable={false}
                            style={{backgroundColor: value, width: size, height: size}}
                            className={`${styles.colorPicker}${className ? ` ${className}` : ''}`}
                            onChange={e => onChange && onChange(e.target.value)}
                            aria-label="Custom color"
                        />
                    )}
                    {showIcon && (
                        <img
                            src={paletteIcon}
                            className={styles.paletteIcon}
                            draggable={false}
                            aria-hidden="true"
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

ColorPicker.propTypes = {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func,
    onCommit: PropTypes.func,
    onClick: PropTypes.func,
    label: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    showIcon: PropTypes.bool,
    className: PropTypes.string,
    size: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    pickerDisabled: PropTypes.bool
};

ColorPicker.defaultProps = {
    label: true,
    showIcon: true,
    size: 35,
    pickerDisabled: false
};

export default ColorPicker;
