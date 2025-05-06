import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';
import styles from './load-extension.css';
import URL from './url.jsx';
import DataURL from './data-url.jsx';
import FancyCheckbox from '../tw-fancy-checkbox/checkbox.jsx';
import {APP_NAME} from '../../lib/brand';

const LoadExtensionModal = props => (
    <div>
        {props.url.startsWith('data:') ? (
            <React.Fragment>
                <FormattedMessage
                    defaultMessage="The project wants to load a custom extension with the code:"
                    description="Part of modal asking for permission to automatically load custom extension"
                    id="tw.loadExtension.embedded"
                />
                <DataURL url={props.url} />
            </React.Fragment>
        ) : (
            <React.Fragment>
                <FormattedMessage
                    defaultMessage="The project wants to load a custom extension from the URL:"
                    description="Part of modal asking for permission to automatically load custom extension"
                    id="tw.loadExtension.url"
                />
                <URL url={props.url} />
            </React.Fragment>
        )}

        {props.onChangeUnsandboxed && (
            <React.Fragment>
                <label className={styles.unsandboxedContainer}>
                    <FancyCheckbox
                        className={styles.unsandboxedCheckbox}
                        checked={props.unsandboxed}
                        onChange={props.onChangeUnsandboxed}
                    />
                    <FormattedMessage
                        defaultMessage="Run extension without sandbox"
                        description="Part of modal asking for permission to automatically load custom extension"
                        id="tw.loadExtension.unsandboxed"
                    />
                </label>
                {props.unsandboxed && (
                    <div className={styles.unsandboxedWarning}>
                        <FormattedMessage
                            // eslint-disable-next-line max-len
                            defaultMessage="Loading extensions without the sandbox is dangerous. It will be able to corrupt your project, delete your settings, phish for passwords, and other bad things. The {APP_NAME} developers are not responsible for any resulting issues."
                            description="Part of modal asking for permission to automatically load custom extension"
                            id="tw.loadExtension.unsandboxedWarning"
                            values={{
                                APP_NAME
                            }}
                        />
                    </div>
                )}
            </React.Fragment>
        )}
        {!props.unsandboxed && (
            <div className={styles.sandboxed}>
                <FormattedMessage
                    // eslint-disable-next-line max-len
                    defaultMessage="While the code will be sandboxed, it will still have access to information about your device such as your IP and general location. Make sure you trust the author of this extension before continuing."
                    description="Part of modal asking for permission to automatically load custom extension"
                    id="tw.loadExtension.sandboxed"
                />
            </div>
        )}


        <label className={styles.unsandboxedContainer}>
            <FancyCheckbox
                className={styles.unsandboxedCheckbox}
                checked={props.remember}
                onChange={props.onChangeRemember}
            />
            <FormattedMessage
                defaultMessage="Do this for every extension in the project"
                description="Message that appears in custom extension prompt"
                id="pm.customExtensionModal.rememberChoice"
            />
        </label>
    </div>
);

LoadExtensionModal.propTypes = {
    url: PropTypes.string.isRequired,
    unsandboxed: PropTypes.bool.isRequired,
    onChangeUnsandboxed: PropTypes.func,
    remember: PropTypes.bool.isRequired,
    onChangeRemember: PropTypes.func
};

export default LoadExtensionModal;
