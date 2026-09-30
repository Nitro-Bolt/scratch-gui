import bindAll from 'lodash.bindall';
import PropTypes from 'prop-types';
import React from 'react';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import FancyCheckbox from '../tw-fancy-checkbox/checkbox.jsx';
import Input from '../forms/input.jsx';
import BufferedInputHOC from '../forms/buffered-input-hoc.jsx';

import Modal from '../../containers/modal.jsx';
import styles from './effect-params-modal.css';

const BufferedInput = BufferedInputHOC(Input);

const messages = defineMessages({
    ok: {
        defaultMessage: 'Apply',
        description: 'Button that applies an effect in the paint editor',
        id: 'nb.effectParams.apply'
    },
    cancel: {
        defaultMessage: 'Cancel',
        description: 'Button that cancels an effect in the paint editor',
        id: 'nb.effectParams.cancel'
    }
});

const getDefaults = params => {
    const values = {};
    for (const param of params) {
        values[param.id] = param.default;
    }
    return values;
};

const normalize = (params, values) => {
    const result = {};
    for (const param of params) {
        const raw = values[param.id];
        if (param.type === 'number') {
            let number = Number(raw);
            if (`${raw}`.trim() === '' || Number.isNaN(number)) {
                number = Number(param.default) || 0;
            }
            if (typeof param.min === 'number') {
                number = Math.max(param.min, number);
            }
            if (typeof param.max === 'number') {
                number = Math.min(param.max, number);
            }
            result[param.id] = number;
        } else if (param.type === 'boolean') {
            result[param.id] = !!raw;
        } else {
            result[param.id] = raw;
        }
    }
    return result;
};

class EffectParamsModal extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, ['handleSubmit', 'handleKeyDown']);
        this.state = {values: getDefaults(props.request.params)};
    }
    setValue (id, value) {
        this.setState(state => ({
            values: {...state.values, [id]: value}
        }));
    }
    handleSubmit () {
        this.props.onSubmit(
            normalize(this.props.request.params, this.state.values)
        );
    }
    handleKeyDown (e) {
        if (e.key === 'Enter' && e.target.tagName !== 'SELECT') {
            e.preventDefault();
            this.handleSubmit();
        }
    }
    renderControl (param) {
        const value = this.state.values[param.id];
        const setVal = v => this.setValue(param.id, v);

        switch (param.type) {
        case 'boolean':
            return (
                <FancyCheckbox
                    type="checkbox"
                    checked={!!value}
                    onChange={setVal} // eslint-disable-line react/jsx-no-bind
                />
            );
        case 'select':
            return (
                <select
                    className={styles.input}
                    value={value}
                    onChange={e => setVal(e.target.value)} // eslint-disable-line react/jsx-no-bind
                >
                    {(param.options || []).map(option => (
                        <option
                            key={option.value}
                            value={option.value}
                        >
                            {option.label}
                        </option>
                    ))}
                </select>
            );
        case 'color':
            return (
                <BufferedInput
                    type="color"
                    value={value}
                    onSubmit={setVal} // eslint-disable-line react/jsx-no-bind
                    style={{width: '100%'}}
                />
            );
        case 'number':
            return (
                <BufferedInput
                    type="number"
                    min={param.min}
                    max={param.max}
                    step={param.step || 'any'}
                    value={value}
                    onSubmit={setVal} // eslint-disable-line react/jsx-no-bind
                    style={{width: '100%'}}
                />
            );
        default:
            return (
                <BufferedInput
                    type="text"
                    value={value}
                    onSubmit={setVal} // eslint-disable-line react/jsx-no-bind
                    style={{width: '100%'}}
                />
            );
        }
    }
    render () {
        const {request, intl, onCancel} = this.props;
        return (
            <Modal
                className={styles.modalContent}
                contentLabel={request.label}
                id="effectParamsModal"
                onRequestClose={onCancel}
            >
                <div
                    className={styles.body}
                    onKeyDown={this.handleKeyDown}
                >
                    {request.params.map((param, index) => (
                        <label
                            className={styles.row}
                            key={param.id}
                        >
                            <span className={styles.label}>{param.label}</span>
                            {this.renderControl(param, index)}
                        </label>
                    ))}
                    <div className={styles.buttonRow}>
                        <button
                            className={styles.cancelButton}
                            type="button"
                            onClick={onCancel}
                        >
                            {intl.formatMessage(messages.cancel)}
                        </button>
                        <button
                            className={styles.okButton}
                            type="button"
                            onClick={this.handleSubmit}
                        >
                            {intl.formatMessage(messages.ok)}
                        </button>
                    </div>
                </div>
            </Modal>
        );
    }
}

EffectParamsModal.propTypes = {
    intl: intlShape.isRequired,
    onCancel: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    request: PropTypes.shape({
        id: PropTypes.string,
        label: PropTypes.string,
        params: PropTypes.arrayOf(
            PropTypes.shape({
                id: PropTypes.string.isRequired,
                label: PropTypes.string,
                type: PropTypes.string,
                default: PropTypes.oneOfType([
                    PropTypes.number,
                    PropTypes.string,
                    PropTypes.bool
                ]),
                min: PropTypes.number,
                max: PropTypes.number,
                step: PropTypes.number,
                options: PropTypes.arrayOf(
                    PropTypes.shape({
                        value: PropTypes.string,
                        label: PropTypes.string
                    })
                )
            })
        ).isRequired
    }).isRequired
};

export default injectIntl(EffectParamsModal);
