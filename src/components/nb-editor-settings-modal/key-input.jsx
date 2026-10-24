import React from 'react';
import PropTypes from 'prop-types';
import bindAll from 'lodash.bindall';
import {FormattedMessage} from 'react-intl';
import styles from './key-input.css';
import deleteIcon from './delete.svg';

export class KeybindClass {
    ctrl;
    shift;
    alt;
    key;

    constructor (object) {
        this.ctrl = object.ctrl;
        this.shift = object.shift;
        this.alt = object.alt;
        this.key = object.key.toString().toLowerCase();
    }

    toString () {
        return [
            this.ctrl ? 'Ctrl' : false,
            this.shift ? 'Shift' : false,
            this.alt ? 'Alt' : false,
            this.key.toUpperCase()
                .replace('ENTER', 'Enter')
                .replace(' ', 'Space')
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
            'handleClick',
            'handleDelete'
        ]);
        this.state = {
            listening: false,
            shortcut: props.shortcut ? new KeybindClass(props.shortcut) : null
        };
    }

    handleChange (e) {
        let shortcut;
        if (e.key === 'Backspace') {
            shortcut = null;
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
        this.setState({
            shortcut: null
        });
        this.props.onChange(null);
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
                    /> : this.state.shortcut ? (
                        <span>{this.state.shortcut.toString()}</span>
                    ) : (
                        <FormattedMessage
                            defaultMessage="Not set"
                            id="nb.keyInput.none"
                        />
                    )}
                </button>
                <button
                    className={styles.deleteButton}
                    onClick={this.handleDelete}
                >
                    <img
                        src={deleteIcon}
                        alt="Delete"
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
