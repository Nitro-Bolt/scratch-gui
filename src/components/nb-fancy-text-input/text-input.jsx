import PropTypes from 'prop-types';
import React, {useRef, useEffect} from 'react';

import styles from './text-input.css';

const FancyTextInput = ({
    value,
    onChange,
    onCommit,
    className,
    ...props
}) => {
    const inputRef = useRef(null);

    useEffect(() => {
        const el = inputRef.current;
        if (!el || !onCommit) return;
        el.addEventListener('change', onCommit);
        return () => el.removeEventListener('change', onCommit);
    }, [onCommit]);

    const handleChange = event => {
        event.target = inputRef.current;
        onChange(event);
    };

    return (
        <input
            ref={inputRef}
            type="text"
            value={value}
            draggable={false}
            className={`${styles.input}${className ? ` ${className}` : ''}`}
            // eslint-disable-next-line react/jsx-no-bind
            onChange={handleChange}
            {...props}
        />
    );
};

FancyTextInput.propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    onCommit: PropTypes.func,
    className: PropTypes.string,
};

export default FancyTextInput;
