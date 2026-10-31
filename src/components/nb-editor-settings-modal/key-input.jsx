import React from 'react';
import PropTypes from 'prop-types';
import bindAll from 'lodash.bindall';
import {FormattedMessage} from 'react-intl';
import { defaultKeybinds } from '../../lib/nb-keybinds';
import deleteIcon from './delete.svg';
import resetIcon from './reset.svg';
import styles from './key-input.css';

export class KeybindClass {
    ctrl;
    shift;
    alt;
    key;

    constructor (object) {
        this.ctrl = object.ctrl;
        this.shift = object.shift;
        this.alt = object.alt;
        this.key = object.key?.toString().toLowerCase();
        this.disabled = object.disabled;
    }

    toString () {
        return [
            this.ctrl ? 'Ctrl' : false,
            this.shift ? 'Shift' : false,
            this.alt ? 'Alt' : false,
            this.key?.toUpperCase()
                .replace('ENTER', 'Enter')
                .replace(' ', 'Space')
        ].filter(v => v).join('+');
    }

    toJSON () {
        return {
            ctrl: this.ctrl,
            shift: this.shift,
            alt: this.alt,
            key: this.key,
            disabled: this.disabled
        };
    }
}

class KeyInput extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleChange',
            'handleClick',
            'handleDelete',
            'handleReset'
        ]);
        this.state = {
            listening: false,
            shortcut: props.shortcut ? new KeybindClass(props.shortcut) : {disabled: true}
        };
    }

    handleChange (e) {
        let shortcut;
        if (e.key === 'Backspace') {
            shortcut = {disabled: true};
        } else if (e.key !== 'Escape') {
            shortcut = new KeybindClass({
                ctrl: e.ctrlKey,
                shift: e.shiftKey,
                alt: e.altKey,
                key: e.key
            });
        }
        if (!['Backspace', 'Escape'].includes(e.key)) this.props.onChange(shortcut);
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

    handleDelete () {
        const shortcut = {disabled: true};
        this.setState({shortcut});
        this.props.onChange(shortcut);
    }

    handleReset () {
        const shortcut = new KeybindClass(defaultKeybinds[this.props.shortcutId]);
        this.setState({shortcut});
        this.props.onChange(shortcut);
    }

    render () {
        return (
            <div>
                <button
                    className={styles.container}
                    onClick={this.handleClick}
                >
                    {this.state.listening ? <FormattedMessage
                        defaultMessage="Listening..."
                        id="nb.keyInput.listening"
                    /> : !this.state.shortcut.disabled ? (
                        <span>{this.state.shortcut.toString()}</span>
                    ) : (
                        <span className={styles.notSet}>
                            <FormattedMessage
                                defaultMessage="Not set"
                                description="Indicates that no keybind has been set for a specific action"
                                id="nb.keyInput.none"
                            />
                        </span>
                    )}
                </button>
                <button
                    className={styles.actionButton}
                    onClick={this.handleDelete}
                >
                    <img
                        src={deleteIcon}
                        draggable={false}
                    />
                </button>
                <button
                    className={styles.actionButton}
                    onClick={this.handleReset}
                >
                    <img
                        src={resetIcon}
                        draggable={false}
                    />
                </button>
            </div>
        );
    }
}

KeyInput.propTypes = {
    shortcut: PropTypes.any,
    onChange: PropTypes.func
};

export default KeyInput;
