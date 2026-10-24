import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import styles from './slider.css';

const FancySlider = props => {
    const parsedMin = Number(typeof props.min === 'undefined' ? 0 : props.min);
    const parsedMax = Number(typeof props.max === 'undefined' ? 100 : props.max);
    const parsedValue = Number(typeof props.value === 'undefined' ? parsedMin : props.value);
    const min = Number.isFinite(parsedMin) ? parsedMin : 0;
    const max = Number.isFinite(parsedMax) ? parsedMax : 100;
    const value = Number.isFinite(parsedValue) ? parsedValue : min;
    const range = max - min;
    const progress = range > 0 ? Math.max(0, Math.min(100, ((value - min) / range) * 100)) : 0;
    const documentIsRtl = typeof document === 'object' && document.documentElement.dir === 'rtl';
    const direction = props.dir === 'rtl' || (!props.dir && documentIsRtl) ? 'left' : 'right';
    const style = Object.assign({}, props.style, {
        background: `linear-gradient(to ${direction}, var(--looks-secondary) 0%, ` +
            `var(--looks-secondary) ${progress}%, ` +
            `var(--ui-black-transparent) ${progress}%, var(--ui-black-transparent) 100%)`
    });

    return (
        <input
            {...props}
            type="range"
            className={classNames(props.className, styles.slider)}
            style={style}
        />
    );
};

FancySlider.propTypes = {
    className: PropTypes.string,
    dir: PropTypes.oneOf(['ltr', 'rtl']),
    disabled: PropTypes.bool,
    max: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    min: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    style: PropTypes.object,
    value: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
};

export default FancySlider;
