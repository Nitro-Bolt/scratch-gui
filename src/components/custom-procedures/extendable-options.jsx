import PropTypes from 'prop-types';
import React, {useCallback, useState} from 'react';
import {defineMessages, intlShape} from 'react-intl';
import FancyDropdown from '../nb-fancy-dropdown/dropdown.jsx';
import Input from '../forms/input.jsx';
import styles from './custom-procedures.css';

const messages = defineMessages({
    s: {
        defaultMessage: 'Number or text',
        id: 'gui.customProcedures.extendable.text'
    },
    n: {
        defaultMessage: 'Number',
        id: 'gui.customProcedures.extendable.number'
    },
    m: {
        defaultMessage: 'Multiline text',
        id: 'gui.customProcedures.extendable.multiline'
    },
    b: {
        defaultMessage: 'Boolean',
        id: 'gui.customProcedures.extendable.boolean'
    },
    o: {
        defaultMessage: 'Object',
        id: 'gui.customProcedures.extendable.object'
    },
    a: {
        defaultMessage: 'Array',
        id: 'gui.customProcedures.extendable.array'
    },
    r: {
        defaultMessage: 'Color',
        id: 'gui.customProcedures.extendable.color'
    },
    type: {
        defaultMessage: 'Input type',
        id: 'gui.customProcedures.extendable.type'
    },
    min: {
        defaultMessage: 'Minimum',
        id: 'gui.customProcedures.extendable.min'
    },
    max: {
        defaultMessage: 'Maximum',
        id: 'gui.customProcedures.extendable.max'
    },
    unlimited: {
        defaultMessage: 'Unlimited',
        id: 'gui.customProcedures.extendable.unlimited'
    }
});
const types = ['s', 'n', 'm', 'b', 'o', 'a', 'r'];
const stopPropagation = event => event.stopPropagation();

const ExtendableOptions = ({intl, options, onChange}) => {
    const [value, setValue] = useState(options);
    const handleChange = useCallback(event => {
        const input = event.target;
        if (!input.validity.valid || (input.name === 'min' && input.value === '')) {
            return;
        }
        const next = {...value};
        if (input.name === 'type') {
            next.type = input.value;
        } else if (input.name === 'max' && input.value === '') {
            next.max = null;
        } else {
            next[input.name] = Number(input.value);
        }
        if (next.max !== null && next.min > next.max) {
            next.max = next.min;
        }
        setValue(next);
        onChange(next);
    }, [value, onChange]);

    return (
        <div
            className={styles.extendableOptions}
            onKeyDown={stopPropagation}
            onMouseDown={stopPropagation}
        >
            <div className={styles.extendableControls}>
                <label>
                    {intl.formatMessage(messages.type)}
                    <FancyDropdown
                        name="type"
                        value={value.type}
                        onChange={handleChange}
                    >
                        {types.map(type => (
                            <option
                                key={type}
                                value={type}
                            >
                                {intl.formatMessage(messages[type])}
                            </option>
                        ))}
                    </FancyDropdown>
                </label>
                <div className={styles.extendableLimits}>
                    <label>
                        {intl.formatMessage(messages.min)}
                        <Input
                            className={styles.extendableInput}
                            min="0"
                            name="min"
                            step="1"
                            type="number"
                            value={value.min}
                            onChange={handleChange}
                        />
                    </label>
                    <label>
                        {intl.formatMessage(messages.max)}
                        <Input
                            className={styles.extendableInput}
                            min={value.min}
                            name="max"
                            placeholder={intl.formatMessage(messages.unlimited)}
                            step="1"
                            type="number"
                            value={value.max === null ? '' : value.max}
                            onChange={handleChange}
                        />
                    </label>
                </div>
            </div>
        </div>
    );
};

ExtendableOptions.propTypes = {
    intl: intlShape.isRequired,
    onChange: PropTypes.func.isRequired,
    options: PropTypes.shape({
        type: PropTypes.string.isRequired,
        min: PropTypes.number.isRequired,
        max: PropTypes.number
    }).isRequired
};

export default ExtendableOptions;
