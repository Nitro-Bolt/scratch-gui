import React from 'react';
import PropTypes from 'prop-types';
import bindAll from 'lodash.bindall';
import {FormattedMessage} from 'react-intl';
import styles from './file-input.css';

class Shortcut {
    ctrl;
    shift;
    alt;
    key;

    constructor (ctrl, shift, alt, key) {
        this.ctrl = ctrl;
        this.shift = shift;
        this.alt = alt;
        this.key = key;
    }

    toString () {
        return [
            this.ctrl ? 'Ctrl' : false,
            this.shift ? 'Shift' : false,
            this.alt ? 'Alt' : false,
            this.key.toUpperCase()
        ].filter(v => v).join('+');
    }
}

class KeyInput extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleChange',
            'handleClick'
        ]);
        this.state = {
            listening: false,
            shortcut: props.shortcut
        };
    }

    handleChange (e) {
        let shortcut;
        if (e.key === 'Backspace') {
            shortcut = null;
        } else {
            shortcut = new Shortcut(e.ctrlKey, e.shiftKey, e.altKey, e.key);
        }
        this.props.onChange(shortcut);
        this.setState({listening: false, shortcut});
    }

    handleClick () {
        const listener = e => {
            e.preventDefault();
            if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) return;
            document.removeEventListener('keydown', listener);
            this.handleChange(e);
        };

        this.setState({listening: true});
        document.addEventListener('keydown', listener);
    }

    render () {
        return (
            <button
                className={styles.container}
                onClick={this.handleClick}
            >
                {this.state.listening ? <FormattedMessage
                    defaultMessage="Listening..."
                    id="nb.keyInput.listening"
                /> : this.state.shortcut ? (
                    <span>{this.state.shortcut.toString()}</span>
                ) : (
                    <FormattedMessage
                        defaultMessage="N/A"
                        id="nb.keyInput.none"
                    />
                )}
            </button>
        );
    }
}

KeyInput.propTypes = {
    shortcut: PropTypes.instanceOf(Shortcut),
    onChange: PropTypes.func
};

export default KeyInput;
