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

    constructor (object) {
        this.ctrl = object.ctrl;
        this.shift = object.shift;
        this.alt = object.alt;
        this.key = object.key;
    }

    toString () {
        return [
            this.ctrl ? 'Ctrl' : false,
            this.shift ? 'Shift' : false,
            this.alt ? 'Alt' : false,
            this.key.toUpperCase()
        ].filter(v => v).join('+');
    }

    toJSON () {
        return {
            ctrl: this.ctrl,
            shift: this.shift,
            alt: this.alt,
            key: this.key
        };
    }
}

class KeyInput extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleChange',
            'handleClick'
        ]);
        console.log(props.shortcut);
        this.state = {
            listening: false,
            shortcut: props.shortcut ? new Shortcut(props.shortcut) : null
        };
    }

    handleChange (e) {
        let shortcut;
        if (e.key === 'Backspace') {
            shortcut = null;
        } else {
            shortcut = new Shortcut({
                ctrl: e.ctrlKey,
                shift: e.shiftKey,
                alt: e.altKey,
                key: e.key
            });
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
    shortcut: PropTypes.any,
    onChange: PropTypes.func
};

export default KeyInput;
